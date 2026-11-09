export const API_VERSION = "v1";
export const HEALTH_ROUTE = "/health";
export const ITEMS_ROUTE = "/api/items";
export const MAX_ITEM_NAME_LENGTH = 120;

export function itemNameFromPayload(payload) {
  if (typeof payload !== "object" || payload === null) {
    return "";
  }
  if (!("name" in payload) || typeof payload.name !== "string") {
    return "";
  }
  return payload.name.trim().slice(0, MAX_ITEM_NAME_LENGTH);
}

export function normalizeItem(record) {
  return {
    id: Number(record.id),
    name: String(record.name),
    created_at: new Date(record.created_at).toISOString(),
  };
}
