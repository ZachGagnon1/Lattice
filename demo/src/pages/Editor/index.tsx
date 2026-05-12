import React, { useState } from "react";
import { cloneDeep } from "lodash";
import { useWindowSize } from "react-use";

import {
  downloadFile,
  exportToHtml,
  exportToJson,
  exportToMjml,
  IEmailTemplate,
  LatticeEditor,
  unlayerToLattice
} from "lattice";
import { TEMPLATE_DATA } from "@demo/pages/Editor/Arturia - Newsletter"; // Import the converter we created! Adjust the path to wherever you saved it.
// Import the converter we created! Adjust the path to wherever you saved it.

export default function Editor() {
  const { width } = useWindowSize();
  const compact = width > 1600;

  // --- New state for our Unlayer Import Modal ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [unlayerJson, setUnlayerJson] = useState("");

  const [template, setTemplate] = useState<IEmailTemplate>(() => ({
    ...TEMPLATE_DATA,
    content: cloneDeep(JSON.parse(TEMPLATE_DATA.content.content)),
  }));

  const handleExportHTML = async () => {
    const html = await exportToHtml(template);
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

  // --- Handler to parse JSON and update the Editor ---
  const handleImportUnlayer = () => {
    try {
      const parsed = JSON.parse(unlayerJson);

      // Basic feature detection to ensure it's an Unlayer format
      if (parsed.schemaVersion && parsed.body?.rows) {
        const convertedDesign = unlayerToLattice(parsed);

        // Update the Lattice editor state with the converted AST
        setTemplate((prev) => ({
          ...prev,
          content: convertedDesign,
        }));

        setIsModalOpen(false);
        setUnlayerJson(""); // Clear the textarea on success
      } else {
        alert(
          "This doesn't look like a valid Unlayer JSON template. Make sure it contains 'schemaVersion' and 'body'.",
        );
      }
    } catch (e) {
      alert("Failed to parse JSON. Please check your syntax.");
      console.error(e);
    }
  };

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
          {/* --- New Import Button --- */}
          <button
            style={{
              height: "30px",
              fontWeight: "bold",
              cursor: "pointer",
            }}
            onClick={() => setIsModalOpen(true)}
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
        onChange={setTemplate} // Automatically syncs state!
        onUploadImage={mockImageUpload}
        config={{
          compact,
          showSourceCode: true,
        }}
        mergeTags={{
          test: "test",
          test2: [{ label: "test2", value: "test2" }],
        }}
      />

      {/* --- Basic Modal Overlay for Unlayer Import --- */}
      {isModalOpen && (
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
            <h2 style={{ margin: 0 }}>Import Unlayer Template</h2>
            <p style={{ margin: 0, fontSize: "14px", color: "#666" }}>
              Paste your Unlayer JSON payload below to convert and load it into
              Lattice.
            </p>

            <textarea
              rows={15}
              value={unlayerJson}
              onChange={(e) => setUnlayerJson(e.target.value)}
              placeholder='{"counters": {...}, "body": {...}}'
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
                onClick={() => setIsModalOpen(false)}
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
                onClick={handleImportUnlayer}
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
