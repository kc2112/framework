export function storeAclData(event = {}) {
  return { function: "stage-4", documentId: event.documentId, acl: event.acl ?? "private" };
}
