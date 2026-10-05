const COPY: Record<string, { en: string; es: string }> = {
  "batch.1": { en: "documents 1 to 5 checked", es: "documentos 1 a 5 revisados" },
  "batch.2": { en: "documents 6 to 10 checked", es: "documentos 6 a 10 revisados" },
  "batch.3": { en: "documents 11 to 15 checked", es: "documentos 11 a 15 revisados" },
  "batch.4": { en: "documents 16 to 20 checked", es: "documentos 16 a 20 revisados" },
};
export function traceCopy(locale: "en" | "es", key: string) { return COPY[key]?.[locale] ?? key; }
