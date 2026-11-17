import "server-only";
import { readFile } from "fs/promises";
import path from "path";
import { PDFDocument, PDFFont, PDFImage, PDFPage, degrees, rgb, type RGB } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import QRCode from "qrcode";
import { EVENT, ORGANIZER, SITE_URL, formatFcfa, tierById } from "@/lib/event";
import { qrPayload } from "./codes";
import { orderNumber, type OrderRow, type TicketRow } from "./supabase";

const ASSETS = path.join(process.cwd(), "assets");

const NAVY = hex("#003366");
const NAVY_DEEP = hex("#001A38");
const ORANGE = hex("#FE7200");
const GOLD = hex("#EFBB59");
const WHITE = rgb(1, 1, 1);
const PAPER = hex("#FBF8F3");
const INK = hex("#0F2340");
const MUTED = hex("#5B6B82");
const PAGE_BG = hex("#E9EDF3");

function hex(h: string): RGB {
  const n = parseInt(h.replace("#", ""), 16);
  return rgb(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
}

interface Fonts {
  display: PDFFont; // Golos 900
  heading: PDFFont; // Golos 800
  semi: PDFFont; // Golos 600
  body: PDFFont; // Roboto 400
  medium: PDFFont; // Roboto 500
  bold: PDFFont; // Roboto 700
}

interface Images {
  bg: PDFImage;
  logoWhite: PDFImage;
  logoNavy: PDFImage;
}

let assetCache: Promise<Record<string, Uint8Array>> | null = null;
function loadAssets() {
  if (!assetCache) {
    const files = {
      display: "fonts/golos-text-900.ttf",
      heading: "fonts/golos-text-800.ttf",
      semi: "fonts/golos-text-600.ttf",
      body: "fonts/roboto-400.ttf",
      medium: "fonts/roboto-500.ttf",
      bold: "fonts/roboto-700.ttf",
      bg: "img/ticket-bg.jpg",
      logoWhite: "img/logo-h-white.png",
      logoNavy: "img/logo-navy.png",
    };
    assetCache = Promise.all(
      Object.entries(files).map(async ([k, f]) => [k, new Uint8Array(await readFile(path.join(ASSETS, f)))] as const),
    ).then(Object.fromEntries);
  }
  return assetCache;
}

const dateFr = (d: Date, opts: Intl.DateTimeFormatOptions) =>
  d.toLocaleString("fr-FR", { timeZone: "Africa/Porto-Novo", ...opts });

/** PDF de la commande : un billet par page (format billet), puis le reçu récapitulatif. */
export async function generateOrderPdf(order: OrderRow, tickets: TicketRow[]): Promise<Uint8Array> {
  const a = await loadAssets();
  const pdf = await PDFDocument.create();
  pdf.registerFontkit(fontkit);
  pdf.setTitle(`AI-BID 2027 — Billets ${orderNumber(order.number)}`);
  pdf.setAuthor(ORGANIZER.name);
  pdf.setCreator("ai-bidder.com");

  const f: Fonts = {
    display: await pdf.embedFont(a.display, { subset: true }),
    heading: await pdf.embedFont(a.heading, { subset: true }),
    semi: await pdf.embedFont(a.semi, { subset: true }),
    body: await pdf.embedFont(a.body, { subset: true }),
    medium: await pdf.embedFont(a.medium, { subset: true }),
    bold: await pdf.embedFont(a.bold, { subset: true }),
  };
  const img: Images = {
    bg: await pdf.embedJpg(a.bg),
    logoWhite: await pdf.embedPng(a.logoWhite),
    logoNavy: await pdf.embedPng(a.logoNavy),
  };

  const sorted = [...tickets].sort((x, y) => x.position - y.position);
  for (let i = 0; i < sorted.length; i++) {
    await drawTicketPage(pdf, f, img, order, sorted[i], i + 1, sorted.length);
  }
  drawReceiptPage(pdf, f, img, order, sorted);
  return pdf.save();
}

// ---------------------------------------------------------------- billet

const TW = 842; // largeur page billet (≈ A4 paysage)
const TH = 340;
const M = 18; // marge autour du billet
const STUB = 214; // largeur du talon

async function drawTicketPage(pdf: PDFDocument, f: Fonts, img: Images, order: OrderRow, t: TicketRow, idx: number, total: number) {
  const tier = tierById(t.tier)!;
  const tierColor = hex(tier.color);
  const tierInk = hex(tier.ink);
  const page = pdf.addPage([TW, TH]);
  page.drawRectangle({ x: 0, y: 0, width: TW, height: TH, color: PAGE_BG });

  const x0 = M, y0 = M, w = TW - 2 * M, h = TH - 2 * M;
  const bodyW = w - STUB;
  const cut = x0 + bodyW; // ligne de perforation

  // Corps : photo de la salle + voile marine.
  page.drawImage(img.bg, { x: x0, y: y0, width: bodyW, height: h });
  page.drawRectangle({ x: x0, y: y0, width: bodyW * 0.68, height: h, color: NAVY_DEEP, opacity: 0.55 });
  page.drawRectangle({ x: x0, y: y0, width: bodyW, height: h, color: NAVY_DEEP, opacity: 0.25 });

  // Bande de couleur de la formule, verticale à gauche.
  const band = 34;
  page.drawRectangle({ x: x0, y: y0, width: band, height: h, color: tierColor });
  drawRotatedCentered(page, `TICKET ${tier.short}`, f.display, 13, x0 + band / 2, y0 + h / 2, tierInk, 4);

  // Talon papier.
  page.drawRectangle({ x: cut, y: y0, width: STUB, height: h, color: PAPER });
  page.drawRectangle({ x: cut, y: y0 + h - 8, width: STUB, height: 8, color: tierColor });

  // Encoches demi-cercle + perforation.
  for (const cy of [y0, y0 + h]) page.drawCircle({ x: cut, y: cy, size: 11, color: PAGE_BG });
  for (let yy = y0 + 16; yy < y0 + h - 16; yy += 9) {
    page.drawCircle({ x: cut, y: yy, size: 1.6, color: PAGE_BG });
  }
  // Coins arrondis simulés (petits quarts aux 4 coins extérieurs).
  for (const [cx, cy] of [[x0, y0], [x0, y0 + h], [x0 + w, y0], [x0 + w, y0 + h]] as const) {
    page.drawCircle({ x: cx, y: cy, size: 6, color: PAGE_BG });
  }

  // ---- contenu du corps
  const L = x0 + band + 24;
  let y = y0 + h - 38;

  const logoH = 24;
  const logoW = (img.logoWhite.width / img.logoWhite.height) * logoH;
  page.drawImage(img.logoWhite, { x: L - 3, y: y - 4, width: logoW, height: logoH });
  page.drawText("présente", { x: L + logoW + 4, y: y + 4, size: 9, font: f.body, color: hex("#C9D6EA") });

  const numLabel = `${idx}/${total}`;
  page.drawText(numLabel, { x: cut - 24 - f.semi.widthOfTextAtSize(numLabel, 9), y: y + 4, size: 9, font: f.semi, color: hex("#C9D6EA") });

  y -= 30;
  page.drawText("Masterclass", { x: L, y, size: 12, font: f.semi, color: GOLD });
  y -= 46;
  page.drawText("AI-BID 2027", { x: L - 2, y, size: 50, font: f.display, color: WHITE });
  y -= 20;
  y = drawWrapped(page, EVENT.theme, f.medium, 10, L, y, cut - 210 - L, hex("#DCE5F2"), 13);

  // Bloc participant
  y -= 18;
  page.drawText("Participant", { x: L, y, size: 8, font: f.body, color: hex("#AFC0D8") });
  y -= 22;
  page.drawText(fit(t.holder_name, f.heading, 20, 330), { x: L, y, size: 20, font: f.heading, color: WHITE });
  if (order.buyer_company) {
    y -= 14;
    page.drawText(fit(order.buyer_company, f.body, 9.5, 330), { x: L, y, size: 9.5, font: f.body, color: hex("#C9D6EA") });
  }

  // Infos (dates / lieu / horaires) en bas
  const infoY = y0 + 26;
  const cols = [
    { k: "Date", v: EVENT.datesLabel },
    { k: "Lieu", v: `${EVENT.venueShort}, Cotonou` },
    { k: "Horaires", v: EVENT.hoursShort },
  ];
  let cx = L;
  for (const c of cols) {
    page.drawText(c.k, { x: cx, y: infoY + 14, size: 7.5, font: f.body, color: hex("#AFC0D8") });
    page.drawText(c.v, { x: cx, y: infoY, size: 10, font: f.semi, color: WHITE });
    cx += Math.max(f.semi.widthOfTextAtSize(c.v, 10), 60) + 22;
  }
  page.drawLine({ start: { x: L, y: infoY + 30 }, end: { x: cut - 24, y: infoY + 30 }, thickness: 0.6, color: hex("#5D7598"), opacity: 0.7 });

  // Inclus (colonne droite du corps)
  const incX = cut - 186;
  page.drawRectangle({ x: incX - 14, y: infoY + 31, width: cut - (incX - 14), height: y0 + h - (infoY + 31), color: NAVY_DEEP, opacity: 0.62 });
  let iy = y0 + h - 64;
  page.drawText("Inclus", { x: incX, y: iy, size: 8, font: f.body, color: hex("#AFC0D8") });
  iy -= 4;
  for (const line of tier.included) {
    iy -= 12;
    page.drawCircle({ x: incX + 2.5, y: iy + 3, size: 1.8, color: tier.id === "premium" ? GOLD : tierColor });
    iy = drawWrapped(page, line, f.body, 8, incX + 9, iy, 160, hex("#E6EDF7"), 10) + 0;
    if (iy < infoY + 40) break;
  }

  // ---- talon
  const sx = cut + 18;
  const sw = STUB - 36;
  let sy = y0 + h - 34;
  page.drawText(tier.name, { x: sx, y: sy, size: 12, font: f.heading, color: tier.id === "premium" ? tierColor : INK });
  sy -= 15;
  page.drawText(formatFcfa(t.price), { x: sx, y: sy, size: 10, font: f.semi, color: tier.id === "pro" ? ORANGE : MUTED });

  const qrSize = 116;
  const qrPng = await QRCode.toBuffer(qrPayload(t.code), { errorCorrectionLevel: "M", margin: 0, width: 512, color: { dark: "#0F2340", light: "#FBF8F3" } });
  const qr = await pdf.embedPng(qrPng);
  sy -= qrSize + 12;
  page.drawImage(qr, { x: sx + (sw - qrSize) / 2, y: sy, width: qrSize, height: qrSize });

  sy -= 16;
  const codeSize = 10.5;
  page.drawText(t.code, { x: sx + (sw - f.bold.widthOfTextAtSize(t.code, codeSize)) / 2, y: sy, size: codeSize, font: f.bold, color: INK });

  sy -= 20;
  const rows: [string, string][] = [
    ["Reçu n°", orderNumber(order.number)],
    ["Payé le", order.paid_at ? dateFr(new Date(order.paid_at), { day: "2-digit", month: "2-digit", year: "numeric" }) : "—"],
    ["Réf. paiement", order.fedapay_reference ?? order.fedapay_transaction_id ?? "—"],
  ];
  for (const [k, v] of rows) {
    page.drawText(k, { x: sx, y: sy, size: 7.5, font: f.body, color: MUTED });
    const vv = fit(v, f.medium, 7.5, sw - 62);
    page.drawText(vv, { x: sx + sw - f.medium.widthOfTextAtSize(vv, 7.5), y: sy, size: 7.5, font: f.medium, color: INK });
    sy -= 11;
  }
  const note = "Billet nominatif · valable une fois";
  page.drawText(note, { x: sx + (sw - f.body.widthOfTextAtSize(note, 6.8)) / 2, y: y0 + 12, size: 6.8, font: f.body, color: MUTED });
}

// ---------------------------------------------------------------- reçu

function drawReceiptPage(pdf: PDFDocument, f: Fonts, img: Images, order: OrderRow, tickets: TicketRow[]) {
  const W = 595.28, H = 841.89, MX = 50;
  const page = pdf.addPage([W, H]);
  page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: WHITE });

  // En-tête photo
  const headH = (W * img.bg.height) / img.bg.width;
  page.drawImage(img.bg, { x: 0, y: H - headH, width: W, height: headH });
  page.drawRectangle({ x: 0, y: H - headH, width: W, height: headH, color: NAVY_DEEP, opacity: 0.6 });
  page.drawRectangle({ x: 0, y: H - headH - 6, width: W, height: 6, color: ORANGE });

  const logoH = 34;
  const logoW = (img.logoWhite.width / img.logoWhite.height) * logoH;
  page.drawImage(img.logoWhite, { x: MX - 4, y: H - 72, width: logoW, height: logoH });
  page.drawText("Reçu de paiement", { x: MX, y: H - 118, size: 26, font: f.display, color: WHITE });
  page.drawText(`AI-BID 2027 · ${EVENT.datesLabel} · ${EVENT.venueShort}, Cotonou`, { x: MX, y: H - 140, size: 10, font: f.medium, color: hex("#DCE5F2") });

  const rn = orderNumber(order.number);
  page.drawText(rn, { x: W - MX - f.heading.widthOfTextAtSize(rn, 14), y: H - 60, size: 14, font: f.heading, color: WHITE });
  const st = "PAYÉ";
  const stW = f.bold.widthOfTextAtSize(st, 10) + 20;
  page.drawRectangle({ x: W - MX - stW, y: H - 88, width: stW, height: 18, color: hex("#1E9E5A") });
  page.drawText(st, { x: W - MX - stW + 10, y: H - 83, size: 10, font: f.bold, color: WHITE });

  let y = H - headH - 44;
  // Émetteur / client
  const colW = (W - 2 * MX - 30) / 2;
  const block = (x: number, title: string, lines: string[]) => {
    page.drawText(title, { x, y, size: 8.5, font: f.semi, color: ORANGE });
    let yy = y - 16;
    lines.forEach((l, i) => {
      page.drawText(fit(l, i === 0 ? f.bold : f.body, 10, colW), { x, y: yy, size: 10, font: i === 0 ? f.bold : f.body, color: INK });
      yy -= 14;
    });
  };
  block(MX, "Émis par", [ORGANIZER.name, ORGANIZER.baseline, ORGANIZER.address, ORGANIZER.phone, ORGANIZER.email]);
  block(MX + colW + 30, "Client", [order.buyer_company || order.buyer_name, ...(order.buyer_company ? [order.buyer_name] : []), order.buyer_email, order.buyer_phone]);

  y -= 100;
  const meta: [string, string][] = [
    ["Date de paiement", order.paid_at ? dateFr(new Date(order.paid_at), { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—"],
    ["Moyen de paiement", "FedaPay (Mobile Money / carte)"],
    ["Référence transaction", order.fedapay_reference ?? order.fedapay_transaction_id ?? "—"],
  ];
  page.drawRectangle({ x: MX, y: y - 50, width: W - 2 * MX, height: 62, color: hex("#F3F6FA") });
  meta.forEach(([k, v], i) => {
    const x = MX + 14 + i * ((W - 2 * MX - 28) / 3);
    page.drawText(k, { x, y: y - 8, size: 8, font: f.body, color: MUTED });
    page.drawText(fit(v, f.medium, 9.5, 150), { x, y: y - 26, size: 9.5, font: f.medium, color: INK });
  });

  // Tableau des billets
  y -= 90;
  const cx = { label: MX, holder: MX + 150, code: MX + 300, price: W - MX };
  page.drawText("Formule", { x: cx.label, y, size: 8.5, font: f.semi, color: MUTED });
  page.drawText("Participant", { x: cx.holder, y, size: 8.5, font: f.semi, color: MUTED });
  page.drawText("N° de billet", { x: cx.code, y, size: 8.5, font: f.semi, color: MUTED });
  page.drawText("Montant", { x: cx.price - f.semi.widthOfTextAtSize("Montant", 8.5), y, size: 8.5, font: f.semi, color: MUTED });
  y -= 8;
  page.drawLine({ start: { x: MX, y }, end: { x: W - MX, y }, thickness: 1, color: NAVY });

  const maxRows = 22;
  for (const t of tickets.slice(0, maxRows)) {
    y -= 20;
    const tier = tierById(t.tier)!;
    page.drawRectangle({ x: cx.label, y: y - 1, width: 4, height: 11, color: hex(tier.color) });
    page.drawText(tier.name, { x: cx.label + 10, y, size: 9.5, font: f.medium, color: INK });
    page.drawText(fit(t.holder_name, f.body, 9.5, 140), { x: cx.holder, y, size: 9.5, font: f.body, color: INK });
    page.drawText(t.code, { x: cx.code, y, size: 9, font: f.medium, color: INK });
    const p = formatFcfa(t.price);
    page.drawText(p, { x: cx.price - f.medium.widthOfTextAtSize(p, 9.5), y, size: 9.5, font: f.medium, color: INK });
    y -= 7;
    page.drawLine({ start: { x: MX, y }, end: { x: W - MX, y }, thickness: 0.4, color: hex("#D5DDE8") });
  }
  if (tickets.length > maxRows) {
    y -= 16;
    page.drawText(`… et ${tickets.length - maxRows} autre(s) billet(s), détaillés sur les pages précédentes.`, { x: MX, y, size: 9, font: f.body, color: MUTED });
  }

  // Totaux
  y -= 30;
  const totals: [string, string, boolean][] = [["Total billets", formatFcfa(order.amount), false]];
  if (order.fees) totals.push(["Frais de paiement (FedaPay)", formatFcfa(order.fees), false]);
  totals.push(["Total payé", formatFcfa(order.amount + (order.fees ?? 0)), true]);
  for (const [k, v, strong] of totals) {
    const font = strong ? f.heading : f.medium;
    const size = strong ? 14 : 10;
    if (strong) {
      y -= 12;
      page.drawRectangle({ x: W - MX - 250, y: y - 10, width: 250, height: 30, color: NAVY });
    }
    page.drawText(k, { x: W - MX - 240, y, size: strong ? 11 : 10, font: strong ? f.semi : f.body, color: strong ? WHITE : MUTED });
    page.drawText(v, { x: W - MX - 10 - font.widthOfTextAtSize(v, size), y, size, font, color: strong ? WHITE : INK });
    y -= strong ? 34 : 20;
  }

  // Pied
  const foot = [
    "Ce reçu atteste du paiement intégral des billets ci-dessus. Chaque billet est nominatif, valable une seule fois et contrôlé par QR code à l'entrée.",
    `Vérification et assistance : ${ORGANIZER.phone} (WhatsApp) · ${ORGANIZER.email} · ${SITE_URL.replace("https://", "")}`,
  ];
  let fy = 70;
  page.drawLine({ start: { x: MX, y: fy + 26 }, end: { x: W - MX, y: fy + 26 }, thickness: 0.5, color: hex("#D5DDE8") });
  for (const line of foot) {
    fy = drawWrapped(page, line, f.body, 8, MX, fy, W - 2 * MX, MUTED, 11) - 15;
  }
  page.drawRectangle({ x: 0, y: 0, width: W, height: 8, color: ORANGE });
}

// ---------------------------------------------------------------- utilitaires

function fit(text: string, font: PDFFont, size: number, maxW: number): string {
  if (font.widthOfTextAtSize(text, size) <= maxW) return text;
  let s = text;
  while (s.length > 1 && font.widthOfTextAtSize(`${s}…`, size) > maxW) s = s.slice(0, -1);
  return `${s.trimEnd()}…`;
}

/** Écrit un texte sur plusieurs lignes ; retourne le y de la dernière ligne. */
function drawWrapped(page: PDFPage, text: string, font: PDFFont, size: number, x: number, y: number, maxW: number, color: RGB, lh: number): number {
  const words = text.split(/\s+/);
  let line = "";
  let yy = y;
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (font.widthOfTextAtSize(test, size) > maxW && line) {
      page.drawText(line, { x, y: yy, size, font, color });
      yy -= lh;
      line = w;
    } else line = test;
  }
  if (line) page.drawText(line, { x, y: yy, size, font, color });
  return yy;
}

function drawRotatedCentered(page: PDFPage, text: string, font: PDFFont, size: number, cx: number, cy: number, color: RGB, tracking = 0) {
  const chars = [...text];
  const widths = chars.map((c) => font.widthOfTextAtSize(c, size));
  const total = widths.reduce((s, w) => s + w, 0) + tracking * (chars.length - 1);
  // Rotation 90° : le texte monte de bas en haut.
  let yy = cy - total / 2;
  const capH = font.heightAtSize(size, { descender: false });
  for (let i = 0; i < chars.length; i++) {
    page.drawText(chars[i], { x: cx + capH / 2, y: yy, size, font, color, rotate: degrees(90) });
    yy += widths[i] + tracking;
  }
}
