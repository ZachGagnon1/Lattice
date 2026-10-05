import React, { useCallback, useState } from "react";
import Handlebars from "handlebars";

import {
  defaultCategories,
  downloadFile,
  exportToHtml,
  exportToJson,
  exportToMjml,
  IEmailTemplate,
  LatticeEditor,
  unlayerToLattice,
} from "lattice";
import { COUPON_TYPE, registerDemoBlocks } from "@demo/blocks";
import { DEFAULT_TEMPLATE } from "@demo/pages/Editor/defaultTemplate";

registerDemoBlocks();

// The Coupon block joins the Content category, after the built-in blocks.
const CATEGORIES = defaultCategories.map((category) =>
  category.label === "Content"
    ? ({
        ...category,
        blocks: [...category.blocks, { type: COUPON_TYPE }],
      } as typeof category)
    : category,
);

/**
 * The seven helpers that the Lattice Condition compiler emits.
 *
 * The demo registers them by hand on purpose. The `handlebars-helpers`
 * package is CommonJS, and its `lazy-cache` dependency calls `require()` at
 * module scope. A browser has no `require`, so the module throws
 * `ReferenceError: require is not defined` as soon as the page loads. A
 * narrow import of `lib/comparison` does not help, because that file still
 * pulls in `lib/utils/utils.js`.
 *
 * `and` and `or` are variadic. Handlebars appends an `options` object as the
 * last argument, so each one removes that argument before it tests the rest.
 *
 * The compiler emits no `ne` helper. `Not Equals` compiles to
 * `(not (eq a b))`.
 */
const LOGIC_HELPERS = {
  eq: (a: unknown, b: unknown) => a === b,
  gt: (a: any, b: any) => a > b,
  lt: (a: any, b: any) => a < b,
  not: (v: unknown) => !v,
  contains: (haystack: unknown, needle: any) =>
    Array.isArray(haystack) || typeof haystack === "string"
      ? (haystack as any).includes(needle)
      : false,
  and: (...args: unknown[]) => {
    args.pop();
    return args.every(Boolean);
  },
  or: (...args: unknown[]) => {
    args.pop();
    return args.some(Boolean);
  },
};

// Register the helpers once, at module scope. A call on each render registers
// the same helpers again, and that wastes work.
Handlebars.registerHelper(LOGIC_HELPERS);

/**
 * The variable data. One object serves both jobs.
 *
 * The picker reads the keys to build its tree. It wraps a picked path with
 * `mergeTagGenerate`, so a value never has to be a `"{{firstName}}"`
 * placeholder. Real values work, and they also let the preview render.
 *
 * An array holds sample entries. The picker uses an array as a loop source.
 * It reads the first entry to learn the item fields.
 */
const VARIABLE_DATA = {
  firstName: "John",
  lastName: "Reed",
  age: 34,
  email: "john.reed@example.com",
  products: [
    { name: "Polybrute 12", price: "3499.00", imageUrl: "" },
    { name: "MiniFreak V", price: "199.00", imageUrl: "" },
    { name: "AudioFuse 16Rig", price: "1299.00", imageUrl: "" },
  ],
  orders: [
    { id: "A-1001", total: "3499.00", date: "2026-01-14" },
    { id: "A-1002", total: "199.00", date: "2026-02-03" },
  ],
};

/*
 * The schema alternative.
 *
 * `variableData` also accepts a zod schema. The editor duck-types the schema
 * and never imports zod, so a consumer without zod still builds.
 *
 * The demo keeps the plain object above as the primary example, because a
 * schema carries no values. Every generated leaf is a string placeholder, so
 * the preview shows `"firstName"` instead of `"John"`, and a numeric
 * Condition compares against a string. Pass `previewOverride` to put real
 * values back.
 *
 * import { z } from "zod";
 *
 * const VARIABLE_SCHEMA = z.object({
 *   firstName: z.string(),
 *   lastName: z.string(),
 *   age: z.number(),
 *   email: z.string(),
 *   products: z.array(
 *     z.object({
 *       name: z.string(),
 *       price: z.string(),
 *       imageUrl: z.string(),
 *     }),
 *   ),
 *   orders: z.array(
 *     z.object({ id: z.string(), total: z.string(), date: z.string() }),
 *   ),
 * });
 *
 * <LatticeEditor
 *   data={template}
 *   variableData={VARIABLE_SCHEMA}
 *   previewOverride={{ firstName: "John", age: 34 }}
 * />
 */

type ImportMode = "design" | "unlayer";

type JsonObject = Record<string, unknown>;

function isJsonObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

const IMPORT_COPY: Record<
  ImportMode,
  { title: string; description: string; placeholder: string }
> = {
  design: {
    title: "Import Design",
    description:
      "Paste a Lattice or easy-email JSON design below to load it into Lattice.",
    placeholder:
      '{"subject": "", "subTitle": "", "content": {"type": "page", ...}}',
  },
  unlayer: {
    title: "Import Unlayer Template",
    description:
      "Paste your Unlayer JSON payload below to convert and load it into Lattice.",
    placeholder: '{"counters": {...}, "body": {...}}',
  },
};

export default function Editor() {
  const [importMode, setImportMode] = useState<ImportMode | null>(null);
  const [importJson, setImportJson] = useState("");

  const [template, setTemplate] = useState<IEmailTemplate>(DEFAULT_TEMPLATE);

  /**
   * Expands Handlebars logic before mjml() compiles the markup.
   *
   * `PreviewEmailProvider` lists `onBeforeMjmlCompile` in the dependencies of
   * its preview effect. An inline arrow would rebuild the preview on each render.
   *
   * @param mjmlString - The MJML string that JsonToMjml() produced.
   * @param data - The preview data. It is the `variableData` prop with the
   *   `previewOverride` prop merged over it.
   * @returns The expanded MJML, or the original string when the template
   *   fails to compile.
   */
  const handleBeforeMjmlCompile = useCallback(
    (mjmlString: string, data: Record<string, any>) => {
      try {
        return Handlebars.compile(mjmlString)(data);
      } catch (error) {
        // A partial rule must not blank the preview. Show the unexpanded
        // template.
        console.error("Handlebars failed to compile the MJML preview:", error);
        return mjmlString;
      }
    },
    [],
  );

  const handleExportHTML = async () => {
    const html = await exportToHtml(template, {
      transformMjml: (mjmlString) => {
        try {
          return Handlebars.compile(mjmlString)(VARIABLE_DATA);
        } catch (error) {
          console.error("Handlebars failed to compile the MJML export:", error);
          return mjmlString;
        }
      },
    });
    downloadFile(html, "lattice-email.html", "text/html");
  };

  const mockImageUpload = (file: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onloadend = () => {
        const result = reader.result;
        if (typeof result === "string") {
          resolve(result); // Returns the Base64 Data URI
        } else {
          reject(
            new Error(
              "File reader failed to output a valid string representation.",
            ),
          );
        }
      };

      reader.onerror = () => {
        reject(
          new Error(
            "Encountered a critical error while reading the file into memory.",
          ),
        );
      };

      reader.readAsDataURL(file);
    });
  };

  const closeImport = () => {
    setImportMode(null);
    setImportJson("");
  };

  const handleImportUnlayer = (parsed: JsonObject) => {
    if (
      !parsed.schemaVersion ||
      !isJsonObject(parsed.body) ||
      !Array.isArray(parsed.body.rows)
    ) {
      alert(
        "This doesn't look like a valid Unlayer JSON template. Make sure it contains 'schemaVersion' and 'body'.",
      );
      return;
    }
    setTemplate((prev) => ({ ...prev, content: unlayerToLattice(parsed) }));
    closeImport();
  };

  // The editor wraps legacy page-level blocks on load, so an old easy-email design works as it is.
  const handleImportDesign = (parsed: JsonObject) => {
    const content = isJsonObject(parsed.content) ? parsed.content : parsed;
    if (content.type !== "page" || !Array.isArray(content.children)) {
      alert(
        "This doesn't look like a valid Lattice design. Paste a template with a 'content' page block, or the page block itself.",
      );
      return;
    }
    setTemplate((prev) => ({
      subject:
        typeof parsed.subject === "string" ? parsed.subject : prev.subject,
      subTitle:
        typeof parsed.subTitle === "string" ? parsed.subTitle : prev.subTitle,
      content: content as unknown as IEmailTemplate["content"],
    }));
    closeImport();
  };

  const handleImport = () => {
    let parsed: unknown;
    try {
      parsed = JSON.parse(importJson);
    } catch (e) {
      alert("Failed to parse JSON. Please check your syntax.");
      console.error(e);
      return;
    }
    if (!isJsonObject(parsed)) {
      alert("Paste a JSON object.");
      return;
    }
    if (importMode === "unlayer") handleImportUnlayer(parsed);
    else handleImportDesign(parsed);
  };

  const importCopy = importMode ? IMPORT_COPY[importMode] : null;

  if (!template) return null;

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          padding: "10px",
          height: "30px",
          alignItems: "center",
        }}
      >
        <h1>Lattice Editor</h1>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            style={{
              height: "30px",
              fontWeight: "bold",
              cursor: "pointer",
            }}
            onClick={() => setImportMode("design")}
          >
            Import Design
          </button>
          <button
            style={{
              height: "30px",
              fontWeight: "bold",
              cursor: "pointer",
            }}
            onClick={() => setImportMode("unlayer")}
          >
            Import Unlayer
          </button>

          {/* Existing Export Buttons */}
          <button
            style={{ height: "30px" }}
            onClick={() =>
              downloadFile(exportToMjml(template), "email.mjml", "text/mjml")
            }
          >
            Export MJML
          </button>
          <button style={{ height: "30px" }} onClick={handleExportHTML}>
            Export HTML
          </button>
          <button
            style={{ height: "30px" }}
            onClick={() =>
              downloadFile(
                exportToJson(template),
                "email.json",
                "application/json",
              )
            }
          >
            Export JSON
          </button>
        </div>
      </div>

      <LatticeEditor
        data={template}
        onChange={setTemplate}
        onUploadImage={mockImageUpload}
        components={CATEGORIES}
        config={{
          showSourceCode: true,
        }}
        allowCondition
        allowForLoop
        variableData={VARIABLE_DATA}
        onBeforeMjmlCompile={handleBeforeMjmlCompile}
      />

      {importCopy && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              background: "white",
              padding: "20px",
              borderRadius: "8px",
              width: "600px",
              maxWidth: "90%",
              display: "flex",
              flexDirection: "column",
              gap: "15px",
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
            }}
          >
            <h2 style={{ margin: 0 }}>{importCopy.title}</h2>
            <p style={{ margin: 0, fontSize: "14px", color: "#666" }}>
              {importCopy.description}
            </p>

            <textarea
              rows={15}
              value={importJson}
              onChange={(e) => setImportJson(e.target.value)}
              placeholder={importCopy.placeholder}
              style={{
                width: "100%",
                fontFamily: "monospace",
                padding: "10px",
                boxSizing: "border-box",
                resize: "vertical",
              }}
            />

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
              }}
            >
              <button
                style={{ padding: "8px 16px", cursor: "pointer" }}
                onClick={closeImport}
              >
                Cancel
              </button>
              <button
                style={{
                  padding: "8px 16px",
                  cursor: "pointer",
                  backgroundColor: "#000",
                  color: "#fff",
                  border: "none",
                  borderRadius: "4px",
                }}
                onClick={handleImport}
              >
                Import
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
