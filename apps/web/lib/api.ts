import { ITEMS_ROUTE } from "@meshbay/shared";

export type Item = {
  id: number;
  name: string;
  created_at: string;
};

export function apiBaseURL(): string {
  return process.env.API_URL ?? "http://localhost:8080";
}

export async function listItems(): Promise<Item[]> {
  try {
    const response = await fetch(`${apiBaseURL()}${ITEMS_ROUTE}`, { cache: "no-store" });
    if (!response.ok) {
      return [];
    }
    const payload: unknown = await response.json();
    return Array.isArray(payload) ? (payload as Item[]) : [];
  } catch {
    return [];
  }
}

export async function createItem(itemName: string): Promise<{ status: number; payload: unknown }> {
  const response = await fetch(`${apiBaseURL()}${ITEMS_ROUTE}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name: itemName }),
    cache: "no-store",
  });
  const payload: unknown = await response.json().catch(() => null);
  return { status: response.status, payload };
}
