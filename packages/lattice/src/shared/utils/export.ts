import mjml from "mjml-browser";
import { JsonToMjml } from "@/domain/compile/JsonToMjml";
import { IEmailTemplate } from "@/shared/typings";

/**
 * Converts the email template state into a raw MJML string.
 */
export function exportToMjml(template: IEmailTemplate): string {
  return JsonToMjml({
    data: template.content,
    mode: "production",
    context: template.content,
  });
}

export interface ExportToHtmlOptions {
  /** Runs on the MJML string before mjml() compiles it. Use it to evaluate Handlebars. */
  transformMjml?: (mjml: string) => string | Promise<string>;
}

/**
 * Converts the email template state into production-ready HTML.
 */
export async function exportToHtml(
  template: IEmailTemplate,
  options?: ExportToHtmlOptions,
): Promise<string> {
  let mjmlString = exportToMjml(template);
  if (options?.transformMjml) {
    mjmlString = await options.transformMjml(mjmlString);
  }
  const result = await mjml(mjmlString);
  return result.html;
}

/**
 * Converts the email template state into a JSON string.
 */
export function exportToJson(template: IEmailTemplate): string {
  return JSON.stringify(template.content, null, 2);
}

/**
 * Triggers a browser download for the provided content.
 */
export function downloadFile(
  content: string,
  filename: string,
  mimeType: string,
) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
