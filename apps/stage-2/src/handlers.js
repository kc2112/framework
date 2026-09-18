export function storeDocument(event = {}) {
  if (!event.documentId) {
    const err = new Error("documentId is required");
    err.statusCode = 400;
    throw err;
  }
  return { function: "stage-2", documentId: event.documentId, uri: `s3://docs/${event.documentId}` };
}
