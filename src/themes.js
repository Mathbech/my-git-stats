// Quelques thèmes de base. Chaque thème = 4 couleurs.
// Ajoute les tiens librement (c'est ton projet !).

export const THEMES = {
  default: {
    title_color: "2f80ed",
    text_color: "434d58",
    icon_color: "4c71f2",
    bg_color: "fffefe",
    border_color: "e4e2e2",
  },
  dark: {
    title_color: "fff",
    text_color: "9f9f9f",
    icon_color: "79ff97",
    bg_color: "151515",
    border_color: "e4e2e2",
  },
  radical: {
    title_color: "fe428e",
    text_color: "a9fef7",
    icon_color: "f8d847",
    bg_color: "141321",
    border_color: "e4e2e2",
  },
  ocean_dark: {
    title_color: "6fc3df",
    text_color: "c0f0ff",
    icon_color: "6fc3df",
    bg_color: "0f1c2e",
    border_color: "2b4257",
  },
  tokyonight: {
    title_color: "70a5fd",
    text_color: "a9b1d6",
    icon_color: "bf91f3",
    bg_color: "1a1b27",
    border_color: "e4e2e2",
  },
};

/** Résout le thème + surcharges par paramètres d'URL. */
export function resolveTheme(query) {
  const base = THEMES[query.theme] || THEMES.default;
  return {
    title_color: query.title_color || base.title_color,
    text_color: query.text_color || base.text_color,
    icon_color: query.icon_color || base.icon_color,
    bg_color: query.bg_color || base.bg_color,
    border_color: query.border_color || base.border_color,
  };
}
