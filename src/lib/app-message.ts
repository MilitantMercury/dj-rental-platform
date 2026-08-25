export type AppMessageTone = "success" | "error" | "info";

const messageCopy: Record<string, string> = {
  "pratica-chiusa": "Pratica chiusa correttamente.",
  "stato-aggiornato": "Stato aggiornato correttamente.",
  "bozza-salvata": "Bozza salvata correttamente.",
  "preventivo-pubblicato": "Preventivo pubblicato correttamente.",
  "checklist-aggiornata": "Checklist aggiornata correttamente.",
  "preparazione-avviata": "Preparazione avviata correttamente.",
  "contenitore-salvato": "Contenitore salvato correttamente.",
  "allegato-salvato": "Allegato salvato correttamente.",
};

const errorPattern = /(?:errore|non[- ]|non$|invalid|insufficient|negat|impossibile|mancant|incomplet|fallit|controlla|scegli|riprova|soltanto|tropp[oaie]|supera(?:to)?|al massimo|obbligator|scadut[oaie])/i;

export function formatAppMessage(message: string) {
  const value = message.trim();
  const copied = messageCopy[value];
  if (copied) return copied;

  if (/^[a-z0-9]+(?:-[a-z0-9]+)+$/i.test(value)) {
    const readable = value.replaceAll("-", " ");
    return `${readable.charAt(0).toUpperCase()}${readable.slice(1)}.`;
  }

  return value;
}

export function appMessageTone(message: string): AppMessageTone {
  return errorPattern.test(message) ? "error" : "success";
}
