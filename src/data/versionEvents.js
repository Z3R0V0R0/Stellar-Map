// ─── src/data/versionEvents.js ────────────────────────────────────────────────
// Eventos pré-definidos da versão atual.
// Como dev, edite apenas este arquivo para adicionar/remover eventos fixos.
//
// Estrutura de cada entrada:
//   id      → string única (snake_case), usada como chave de estado
//   nameKey → chave de tradução em translations.js (adicione em todos os idiomas)
//             OU use `name` para um nome fixo sem tradução
//   jades   → quantidade de jades que o evento concede
//   enabled → true = toggle ligado por padrão / false = desligado por padrão
//
// Exemplo de uso:
//   { id: "starward_express", nameKey: "ev_starward_express", jades: 400, enabled: false }
//   { id: "test_event",       name: "Evento Teste (sem tradução)", jades: 200, enabled: false }
// ──────────────────────────────────────────────────────────────────────────────




export const VERSION_EVENTS = [
  // ── Versão atual ────────────────────────────────────────────────────────────
  // Descomente ou adicione eventos conforme a versão em andamento.
  //
{ id: "event4", nameKey: "event_4",   jades: 1240, enabled: false },
{ id: "event5", nameKey: "event_5",   jades: 500, enabled: false },

];

export const PAST_EVENTS = [
  { id: "pe1", nameKey: "belobog_1",jades: 200, enabled: false },
  { id: "pe2", nameKey: "belobog_2",jades: 250, enabled: false },
  { id: "pe3", nameKey: "xianzhou_1",jades: 480, enabled: false },
  { id: "pe4", nameKey: "belobog_3",jades: 450, enabled: false },
  { id: "pe5", nameKey: "xianzhou_2",jades: 360, enabled: false },
  { id: "pe6", nameKey: "xianzhou_3",jades: 360, enabled: false },
  { id: "pe7", nameKey: "herta_1",jades: 100, enabled: false },
  { id: "pe8", nameKey: "penacony_1",jades: 200, enabled: false },
  { id: "pe9", nameKey: "penacony_2",jades: 320, enabled: false },
  { id: "pe10", nameKey: "penacony_3",jades: 100, enabled: false },
  { id: "pe11", nameKey: "penacony_4",jades: 120, enabled: false },
  { id: "pe12", nameKey: "xianzhou_4",jades: 300, enabled: false },
  { id: "pe13", nameKey: "xianzhou_5",jades: 650, enabled: false },
  { id: "pe14", nameKey: "xianzhou_6",jades: 120, enabled: false },
  { id: "pe15", nameKey: "penacony_5",jades: 180, enabled: false },
  { id: "pe16", nameKey: "penacony_8",jades: 210, enabled: false },
  { id: "pe17", nameKey: "express_1",jades: 390, enabled: false },
  { id: "pe18", nameKey: "amphoreus_1",jades: 200, enabled: false },
  { id: "pe19", nameKey: "amphoreus_2",jades: 120, enabled: false },
  { id: "pe20", nameKey: "amphoreus_3",jades: 360, enabled: false },
  { id: "pe21", nameKey: "amphoreus_4",jades: 240, enabled: false },
  { id: "pe22", nameKey: "penacony_6",jades: 360, enabled: false },
  { id: "pe23", nameKey: "amphoreus_5",jades: 120, enabled: false },
  { id: "pe24", nameKey: "penacony_7",jades: 480, enabled: false },
  { id: "pe25", nameKey: "herta_2",jades: 80, enabled: false },
  { id: "pe26", nameKey: "amphoreus_6",jades: 150, enabled: false },
  { id: "pe27", nameKey: "amphoreus_7",jades: 250, enabled: false },
  { id: "pe28", nameKey: "planarcadia_1",jades: 240, enabled: false },
  { id: "pe29", nameKey: "planarcadia_2",   jades: 180, enabled: false },
  { id: "pe30", nameKey: "planarcadia_3",   jades: 280, enabled: false },
];
 