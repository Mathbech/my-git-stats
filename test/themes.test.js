import { test } from "node:test";
import assert from "node:assert/strict";
import { THEMES, resolveTheme } from "../src/themes.js";

test("chaque thème définit les cinq couleurs", () => {
  const keys = [
    "title_color",
    "text_color",
    "icon_color",
    "bg_color",
    "border_color",
  ];
  for (const [name, theme] of Object.entries(THEMES)) {
    for (const k of keys) {
      assert.ok(theme[k], `${name} manque ${k}`);
    }
  }
});

test("resolveTheme retombe sur default pour un thème inconnu", () => {
  assert.deepEqual(resolveTheme({ theme: "inexistant" }), {
    title_color: THEMES.default.title_color,
    text_color: THEMES.default.text_color,
    icon_color: THEMES.default.icon_color,
    bg_color: THEMES.default.bg_color,
    border_color: THEMES.default.border_color,
  });
});

test("resolveTheme applique les surcharges d'URL", () => {
  const resolved = resolveTheme({ theme: "dark", title_color: "ff0000" });
  assert.equal(resolved.title_color, "ff0000");
  assert.equal(resolved.text_color, THEMES.dark.text_color);
});
