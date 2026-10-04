import { absoluteUrl } from "@/lib/seo";
import { CONTACT_EMAIL, SITE_NAME } from "@/lib/site";

/**
 * One email layout for every message the site sends (order emails, shipping notification,
 * contact form): table-based, inline styles only, 600px wide and fluid below that, so it
 * holds up in Outlook, Gmail and Apple Mail. It follows the site's tokens (app/tokens.css):
 * the deep navy header band with the white logo, a white card on the light page ground,
 * the brand teal for headings and rules, the condensed display face for headings with
 * safe fallbacks (no web fonts are loaded). The only remote image is the logo. A matching
 * plain-text version is built from the same content.
 */

const COLOR = {
  deep: "#001324", // --kinetus-bg-deep
  page: "#f7f7f8", // --kinetus-bg-subtle
  card: "#ffffff", // --kinetus-bg-base
  heading: "#071b34", // --kinetus-text-heading
  text: "#0d1622", // --kinetus-text-primary
  muted: "#49586c", // --kinetus-text-secondary
  accent: "#017288", // --kinetus-brand-teal
  border: "#e8ebef", // --kinetus-border-card
  inverseMuted: "#b8c4d0",
};

const FONT_DISPLAY = "'Roboto Condensed', 'Arial Narrow', Helvetica, Arial, sans-serif";
const FONT_BODY = "Inter, Helvetica, Arial, sans-serif";

/** The white horizontal logo (772 x 183), shown at 200px wide on the navy band. */
const LOGO = { path: "/brand/kinetus-logo-horizontal-white.png", width: 200, height: 47 };

export type EmailItemRow = {
  product: string;
  strength: string;
  quantity: number;
  price: string;
};

export type EmailSection = {
  heading?: string;
  /** Paragraphs, one per line. */
  lines?: string[];
  /** Label / value rows, e.g. the payment details; rows without a value are left out. */
  rows?: Array<[string, string | null | undefined]>;
  /** Items table with totals beneath it (HTML); `lines` is the plain-text version. */
  items?: { rows: EmailItemRow[]; totals: Array<[string, string]> };
  /** Draws the section as a bordered box (the payment instructions). */
  boxed?: boolean;
};

export type EmailContent = {
  /** The headline under the header band. */
  title: string;
  /** Shown large under the title, e.g. the order reference. */
  reference?: string;
  sections: EmailSection[];
  /** Footer lines under the contact address (the research-use line). */
  footer: string[];
};

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Escaped text with its line breaks kept. */
function textHtml(value: string): string {
  return escapeHtml(value).replace(/\r?\n/g, "<br>");
}

function presentRows(rows: EmailSection["rows"]): Array<[string, string]> {
  return (rows ?? []).filter((row): row is [string, string] => Boolean(row[1]?.trim()));
}

function headingHtml(heading: string): string {
  return `<h2 style="margin:0 0 12px;font-family:${FONT_DISPLAY};font-size:16px;line-height:1.3;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:${COLOR.accent}">${escapeHtml(heading)}</h2>`;
}

function linesHtml(lines: string[]): string {
  return lines
    .map(
      (line) =>
        `<p style="margin:0 0 8px;font-family:${FONT_BODY};font-size:15px;line-height:1.6;color:${COLOR.text}">${textHtml(line)}</p>`,
    )
    .join("");
}

function rowsHtml(rows: Array<[string, string]>): string {
  if (rows.length === 0) {
    return "";
  }
  const body = rows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:6px 12px 6px 0;font-family:${FONT_BODY};font-size:13px;line-height:1.4;color:${COLOR.muted};vertical-align:top;white-space:nowrap">${escapeHtml(label)}</td>` +
        `<td style="padding:6px 0;font-family:${FONT_BODY};font-size:15px;line-height:1.4;font-weight:700;color:${COLOR.heading};word-break:break-word">${textHtml(value)}</td></tr>`,
    )
    .join("");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 8px">${body}</table>`;
}

function itemsHtml(items: NonNullable<EmailSection["items"]>): string {
  const cell = (align: string, extra = "") =>
    `padding:10px 8px;font-family:${FONT_BODY};font-size:14px;line-height:1.4;color:${COLOR.text};text-align:${align};border-bottom:1px solid ${COLOR.border};${extra}`;
  const head = (label: string, align: string) =>
    `<th style="padding:0 8px 8px;font-family:${FONT_DISPLAY};font-size:12px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:${COLOR.muted};text-align:${align};border-bottom:2px solid ${COLOR.accent}">${label}</th>`;
  const rows = items.rows
    .map(
      (row) =>
        `<tr><td style="${cell("left", "font-weight:700;color:" + COLOR.heading)}">${escapeHtml(row.product)}</td>` +
        `<td style="${cell("left")}">${escapeHtml(row.strength)}</td>` +
        `<td style="${cell("center")}">${row.quantity}</td>` +
        `<td style="${cell("right", "white-space:nowrap")}">${escapeHtml(row.price)}</td></tr>`,
    )
    .join("");
  const totals = items.totals
    .map(([label, value], index) => {
      const last = index === items.totals.length - 1;
      const style = `padding:${last ? "10px" : "6px"} 8px 0;font-family:${last ? FONT_DISPLAY : FONT_BODY};font-size:${last ? "17px" : "14px"};font-weight:${last ? 700 : 400};color:${last ? COLOR.heading : COLOR.text};`;
      return `<tr><td colspan="3" style="${style}text-align:right">${escapeHtml(label)}</td><td style="${style}text-align:right;white-space:nowrap">${escapeHtml(value)}</td></tr>`;
    })
    .join("");
  return (
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse">` +
    `<tr>${head("Product", "left")}${head("Strength", "left")}${head("Qty", "center")}${head("Price", "right")}</tr>` +
    rows +
    totals +
    `</table>`
  );
}

function sectionHtml(section: EmailSection): string {
  // With an items table, `lines` is only the plain-text version of it.
  const body =
    (section.heading ? headingHtml(section.heading) : "") +
    rowsHtml(presentRows(section.rows)) +
    (section.items ? itemsHtml(section.items) : linesHtml(section.lines ?? []));
  if (section.boxed) {
    return `<tr><td style="padding:0 32px 24px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid ${COLOR.border};border-left:4px solid ${COLOR.accent};border-radius:12px;background:${COLOR.page}"><tr><td style="padding:20px 20px 12px">${body}</td></tr></table></td></tr>`;
  }
  return `<tr><td style="padding:0 32px 24px">${body}</td></tr>`;
}

/** The HTML and plain-text versions of one email. */
export function renderEmail(content: EmailContent): { html: string; text: string } {
  const logoUrl = absoluteUrl(LOGO.path);
  const reference = content.reference
    ? `<p style="margin:8px 0 0;font-family:${FONT_DISPLAY};font-size:26px;line-height:1.2;font-weight:700;letter-spacing:0.04em;color:${COLOR.accent}">${escapeHtml(content.reference)}</p>`
    : "";
  const footer = content.footer
    .map(
      (line) =>
        `<p style="margin:8px 0 0;font-family:${FONT_BODY};font-size:12px;line-height:1.5;color:${COLOR.inverseMuted}">${escapeHtml(line)}</p>`,
    )
    .join("");

  const html =
    `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="x-apple-disable-message-reformatting"><title>${escapeHtml(content.title)}</title></head>` +
    `<body style="margin:0;padding:0;background:${COLOR.page};-webkit-text-size-adjust:100%">` +
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${COLOR.page}"><tr><td align="center" style="padding:24px 12px">` +
    `<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;background:${COLOR.card};border:1px solid ${COLOR.border};border-radius:12px;overflow:hidden">` +
    // Header band with the logo.
    `<tr><td style="background:${COLOR.deep};padding:28px 32px;border-bottom:3px solid ${COLOR.accent}">` +
    `<img src="${escapeHtml(logoUrl)}" width="${LOGO.width}" height="${LOGO.height}" alt="${escapeHtml(SITE_NAME)}" style="display:block;width:${LOGO.width}px;max-width:100%;height:auto;border:0;outline:none;text-decoration:none;color:#ffffff;font-family:${FONT_DISPLAY};font-size:20px;font-weight:700">` +
    `</td></tr>` +
    // Title and reference.
    `<tr><td style="padding:32px 32px 24px">` +
    `<h1 style="margin:0;font-family:${FONT_DISPLAY};font-size:26px;line-height:1.2;font-weight:700;letter-spacing:0.02em;text-transform:uppercase;color:${COLOR.heading}">${escapeHtml(content.title)}</h1>` +
    reference +
    `</td></tr>` +
    content.sections.map(sectionHtml).join("") +
    // Footer band.
    `<tr><td style="background:${COLOR.deep};padding:24px 32px">` +
    `<p style="margin:0;font-family:${FONT_BODY};font-size:13px;line-height:1.5"><a href="mailto:${CONTACT_EMAIL}" style="color:#ffffff;text-decoration:underline">${CONTACT_EMAIL}</a></p>` +
    footer +
    `</td></tr>` +
    `</table></td></tr></table></body></html>`;

  const text =
    [
      [content.title, content.reference].filter(Boolean).join("\n"),
      ...content.sections.map((section) =>
        [
          section.heading?.toUpperCase(),
          ...presentRows(section.rows).map(([label, value]) => `${label}: ${value}`),
          ...(section.lines ?? []),
        ]
          .filter(Boolean)
          .join("\n"),
      ),
      [CONTACT_EMAIL, ...content.footer].join("\n"),
    ]
      .filter((block) => block.trim().length > 0)
      .join("\n\n") + "\n";

  return { html, text };
}
