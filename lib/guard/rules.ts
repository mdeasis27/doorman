// lib/guard/rules.ts
// Deterministic input-classification rules. Each rule is a named, traceable
// check — the log names the rule that fired, so every block is auditable.

export type Rule = {
  id: string;
  name: string;
  family: "injection" | "encoding" | "jailbreak" | "tool-abuse";
  detect: (text: string) => boolean;
};

const hasZeroWidth = (t: string): boolean => /[\u200B-\u200D\uFEFF\u2060]/.test(t);

export const RULES: Rule[] = [
  {
    id: "direct-injection",
    name: "Inyección directa",
    family: "injection",
    detect: (t) =>
      /(ignore|ignora|ignorad)\s+(all\s+)?(previous|previas|las)?\s*instructions?/i.test(t) ||
      /instrucciones\s+(anteriores|previas|originales)/i.test(t) ||
      /you are (now|an?)/i.test(t) ||
      /(system|prompt)\s*:/i.test(t),
  },
  {
    id: "jailbreak",
    name: "Jailbreak conocido",
    family: "jailbreak",
    detect: (t) =>
      /\bDAN\b/i.test(t) ||
      /do anything now/i.test(t) ||
      /modo\s+desarrollador/i.test(t) ||
      /jailbreak/i.test(t),
  },
  {
    id: "tool-abuse",
    name: "Abuso de herramientas",
    family: "tool-abuse",
    detect: (t) =>
      /(aprobad?o|aprueba|rechazad?o|rechaza|escala)\s+sin\s+/i.test(t) ||
      /set\s+score/i.test(t) ||
      /puntuaci[oó]n\s*(de\s*)?100/i.test(t) ||
      /escrib(e|ir)\s+(en\s+)?el\s+ATS/i.test(t) ||
      /env[ií]a\s+(un\s+)?(correo|email)/i.test(t) ||
      /borr(a|ar)\s+(todos\s+)?los\s+rechazos/i.test(t),
  },
  {
    id: "encoding",
    name: "Payload codificado / texto oculto",
    family: "encoding",
    detect: (t) => hasZeroWidth(t) || /base64/i.test(t) || /unicode/i.test(t),
  },
];
