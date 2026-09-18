export function validateDocument(event = {}) {
  if (!event.documentId) {
    const err = new Error("documentId is required");
    err.statusCode = 400;
    throw err;
  }
  return { function: "stage-1", documentId: event.documentId, valid: true };
}
