export function storeHeaderData(event = {}) {
  return { function: "stage-5", documentId: event.documentId, headers: event.headers ?? {}, stored: true };
}
