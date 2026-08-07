// Rend une carte SVG de stats GitHub.
import { escapeXml, formatNumber, sanitizeHex, parseBool } from "../utils.js";
import { resolveTheme } from "../themes.js";

export function renderStatsCard(stats, query = {}) {
  const t = resolveTheme(query);
  const title_color = sanitizeHex(t.title_color, "#2f80ed").slice(1);
  const text_color = sanitizeHex(t.text_color, "#434d58").slice(1);
  const icon_color = sanitizeHex(t.icon_color, "#4c71f2").slice(1);
  const bg_color = sanitizeHex(t.bg_color, "#fffefe").slice(1);
  const border_color = sanitizeHex(t.border_color, "#e4e2e2").slice(1);

  const hideBorder = parseBool(query.hide_border, false);
  const showIcons = parseBool(query.show_icons, false);
  const customTitle = query.custom_title
    ? escapeXml(query.custom_title)
    : `${escapeXml(stats.name)}'s GitHub Stats`;

  const rows = [
    { icon: "⭐", label: "Total Stars Earned", value: stats.stars },
    { icon: "⬆", label: "Total Commits (last year)", value: stats.commits },
    { icon: "🔀", label: "Total PRs", value: stats.prs },
    { icon: "ⓘ", label: "Total Issues", value: stats.issues },
    { icon: "👥", label: "Followers", value: stats.followers },
  ];

  const lineHeight = 25;
  const startY = 55;
  const width = 495;
  const height = startY + rows.length * lineHeight + 25;

  const rowsSvg = rows
    .map((r, i) => {
      const y = startY + i * lineHeight;
      const iconSvg = showIcons
        ? `<text x="25" y="${y}" fill="#${icon_color}" font-size="15">${r.icon}</text>`
        : "";
      const labelX = showIcons ? 50 : 25;
      return `
      <g>
        ${iconSvg}
        <text x="${labelX}" y="${y}" fill="#${text_color}" font-size="14" font-weight="600">${r.label}</text>
        <text x="${width - 25}" y="${y}" fill="#${text_color}" font-size="14" font-weight="700" text-anchor="end">${formatNumber(r.value)}</text>
      </g>`;
    })
    .join("");

  return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${customTitle}">
  <rect x="0.5" y="0.5" rx="4.5" width="${width - 1}" height="${height - 1}" fill="#${bg_color}" stroke="#${border_color}" stroke-opacity="${hideBorder ? 0 : 1}"/>
  <text x="25" y="35" fill="#${title_color}" font-size="18" font-weight="700" font-family="Segoe UI, Ubuntu, sans-serif">${customTitle}</text>
  <g font-family="Segoe UI, Ubuntu, sans-serif">${rowsSvg}
  </g>
</svg>`;
}
