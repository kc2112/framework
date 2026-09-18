export function validateStorage(event = {}) {
  if (event.failStorage) {
    const err = new Error("storage validation failed");
    err.statusCode = 409;
    throw err;
  }
  return { function: "stage-6", documentId: event.documentId, ok: true };
}
