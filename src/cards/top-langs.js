// Rend une carte SVG "top langages". Deux layouts : normal (barres) et compact.
import { escapeXml, sanitizeHex, parseBool } from "../utils.js";
import { resolveTheme } from "../themes.js";

export function renderTopLangsCard(langs, query = {}) {
  const t = resolveTheme(query);
  const title_color = sanitizeHex(t.title_color, "#2f80ed").slice(1);
  const text_color = sanitizeHex(t.text_color, "#434d58").slice(1);
  const bg_color = sanitizeHex(t.bg_color, "#fffefe").slice(1);
  const border_color = sanitizeHex(t.border_color, "#e4e2e2").slice(1);

  const hideBorder = parseBool(query.hide_border, false);
  const compact = query.layout === "compact";
  const count = Math.min(Math.max(parseInt(query.langs_count || "5", 10) || 5, 1), 20);
  const title = query.custom_title ? escapeXml(query.custom_title) : "Most Used Languages";

  const top = langs.slice(0, count);
  const width = Number(query.card_width) || 300;

  if (compact) {
    return renderCompact(top, { title, width, title_color, text_color, bg_color, border_color, hideBorder });
  }
  return renderNormal(top, { title, width, title_color, text_color, bg_color, border_color, hideBorder });
}

function renderNormal(top, o) {
  const startY = 55;
  const rowH = 40;
  const height = startY + top.length * rowH;
  const barWidth = o.width - 50;

  const rows = top
    .map((l, i) => {
      const y = startY + i * rowH;
      const filled = Math.max((l.percent / 100) * barWidth, 2);
      return `
      <g transform="translate(0, ${y})">
        <text x="25" y="0" fill="#${o.text_color}" font-size="14" font-weight="600">${escapeXml(l.name)} ${l.percent.toFixed(2)}%</text>
        <rect x="25" y="10" width="${barWidth}" height="8" rx="4" fill="#ddd"/>
        <rect x="25" y="10" width="${filled}" height="8" rx="4" fill="${escapeColor(l.color)}"/>
      </g>`;
    })
    .join("");

  return svgWrap(o, height, rows);
}

function renderCompact(top, o) {
  const totalBarWidth = o.width - 50;
  let x = 25;
  const segments = top
    .map((l) => {
      const w = Math.max((l.percent / 100) * totalBarWidth, 2);
      const seg = `<rect x="${x}" y="55" width="${w}" height="8" fill="${escapeColor(l.color)}"/>`;
      x += w;
      return seg;
    })
    .join("");

  const legend = top
    .map((l, i) => {
      const col = i % 2;
      const rowIndex = Math.floor(i / 2);
      const lx = 25 + col * (o.width / 2 - 10);
      const ly = 90 + rowIndex * 25;
      return `
      <g transform="translate(${lx}, ${ly})">
        <circle cx="5" cy="-4" r="5" fill="${escapeColor(l.color)}"/>
        <text x="16" y="0" fill="#${o.text_color}" font-size="12" font-weight="500">${escapeXml(l.name)} ${l.percent.toFixed(2)}%</text>
      </g>`;
    })
    .join("");

  const rows = Math.ceil(top.length / 2);
  const height = 90 + rows * 25 + 10;
  return svgWrap(o, height, `<rect x="25" y="55" width="${totalBarWidth}" height="8" rx="4" fill="#ddd"/>${segments}${legend}`);
}

function svgWrap(o, height, inner) {
  return `<svg width="${o.width}" height="${height}" viewBox="0 0 ${o.width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${o.title}">
  <rect x="0.5" y="0.5" rx="4.5" width="${o.width - 1}" height="${height - 1}" fill="#${o.bg_color}" stroke="#${o.border_color}" stroke-opacity="${o.hideBorder ? 0 : 1}"/>
  <text x="25" y="35" fill="#${o.title_color}" font-size="18" font-weight="700" font-family="Segoe UI, Ubuntu, sans-serif">${o.title}</text>
  <g font-family="Segoe UI, Ubuntu, sans-serif">${inner}
  </g>
</svg>`;
}

function escapeColor(c) {
  if (!c) return "#858585";
  return /^#?[0-9a-fA-F]{3,8}$/.test(c) ? (c.startsWith("#") ? c : `#${c}`) : "#858585";
}
