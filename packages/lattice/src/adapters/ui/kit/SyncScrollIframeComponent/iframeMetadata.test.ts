import { describe, expect, it } from "vitest";
import { createIframeSource, syncIframeMetadata } from "./iframeMetadata";

describe("iframe metadata", () => {
  it("adds the language and title to the initial document", () => {
    const source = createIframeSource({
      language: "fr-CA",
      title: "Email editor: Desktop preview",
    });

    expect(source).toContain('<html lang="fr-CA"');
    expect(source).toContain("<title>Email editor: Desktop preview</title>");
  });

  it("escapes metadata before it enters the document", () => {
    const source = createIframeSource({
      language: 'en" data-test="unsafe',
      title: "Preview <draft>",
    });

    expect(source).toContain('lang="en&quot; data-test=&quot;unsafe"');
    expect(source).toContain("<title>Preview &lt;draft&gt;</title>");
  });

  it("updates metadata after a prop change", () => {
    const document = {
      documentElement: { lang: "en" },
      title: "Old title",
    } as Pick<Document, "documentElement" | "title">;

    syncIframeMetadata(document, {
      language: "es",
      title: "Editor de correo: Vista previa",
    });

    expect(document.documentElement.lang).toBe("es");
    expect(document.title).toBe("Editor de correo: Vista previa");
  });
});
