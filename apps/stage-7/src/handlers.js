export function buildResponse(event = {}) {
  return { function: "stage-7", statusCode: 200, message: "document stored", documentId: event.originalEvent?.documentId ?? event.documentId, results: event.results ?? {} };
}
