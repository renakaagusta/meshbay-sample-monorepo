export type ItemRecord = {
  id: number;
  name: string;
  created_at: string;
};

export const API_VERSION: string;
export const HEALTH_ROUTE: string;
export const ITEMS_ROUTE: string;
export const MAX_ITEM_NAME_LENGTH: number;

export function itemNameFromPayload(payload: unknown): string;
export function normalizeItem(record: unknown): ItemRecord;
