// ─── src/i18n/useT.js ─────────────────────────────────────────────────────────
// Hook de tradução para o Stellar Map
// Uso: const t = useT(lang)
//      t("chave")                    → string traduzida
//      t("chave", { n: 5 })          → substitui {n} pelo valor
//      t("chave", { name: "Foo" })   → substitui {name} pelo valor
// ─────────────────────────────────────────────────────────────────────────────

import { T } from "./translations";

export function useT(lang) {
  return (key, vars = {}) => {
    // Tenta o idioma atual, cai para PT-BR, depois retorna a chave
    const str = T[lang]?.[key] ?? T["Português"]?.[key] ?? key;

    // Substitui variáveis: {n}, {name}, {jades}, etc.
    return str.replace(/\{(\w+)\}/g, (_, k) =>
      vars[k] !== undefined ? vars[k] : `{${k}}`
    );
  };
}