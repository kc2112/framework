export function storeMetadata(event = {}) {
  return { function: "stage-3", documentId: event.documentId, stored: true };
}
