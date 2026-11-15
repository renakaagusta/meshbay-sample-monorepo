import express from "express";
import { Pool } from "pg";
import {
  API_VERSION,
  HEALTH_ROUTE,
  ITEM_ROUTE,
  ITEMS_ROUTE,
  itemNameFromPayload,
  normalizeItem,
} from "@meshbay/shared";

const schemaStatement = `CREATE TABLE IF NOT EXISTS items (
  id serial primary key,
  name text not null,
  created_at timestamptz default now()
)`;

const databaseURL = process.env.DATABASE_URL;
if (!databaseURL) {
  throw new Error("DATABASE_URL is required");
}

const port = Number(process.env.PORT ?? 8080);
const database = new Pool({ connectionString: databaseURL });
const service = express();

service.use(express.json());
service.use((request, response, nextHandler) => {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (request.method === "OPTIONS") {
    response.sendStatus(204);
    return;
  }
  nextHandler();
});

service.get(HEALTH_ROUTE, (request, response) => {
  response.json({ status: "ok", version: API_VERSION });
});

service.get(ITEMS_ROUTE, async (request, response) => {
  const queryResult = await database.query("SELECT id, name, created_at FROM items ORDER BY id");
  response.json(queryResult.rows.map(normalizeItem));
});

service.post(ITEMS_ROUTE, async (request, response) => {
  const itemName = itemNameFromPayload(request.body);
  if (itemName === "") {
    response.status(400).json({ error: "name is required" });
    return;
  }
  const queryResult = await database.query(
    "INSERT INTO items (name) VALUES ($1) RETURNING id, name, created_at",
    [itemName],
  );
  response.status(201).json(normalizeItem(queryResult.rows[0]));
});

function parseItemID(request, response) {
  const itemID = Number(request.params.itemID);
  if (!Number.isInteger(itemID) || itemID <= 0) {
    response.status(404).json({ error: "item not found" });
    return null;
  }
  return itemID;
}

service.get(ITEM_ROUTE, async (request, response) => {
  const itemID = parseItemID(request, response);
  if (itemID === null) {
    return;
  }
  const queryResult = await database.query(
    "SELECT id, name, created_at FROM items WHERE id = $1",
    [itemID],
  );
  if (queryResult.rows.length === 0) {
    response.status(404).json({ error: "item not found" });
    return;
  }
  response.json(normalizeItem(queryResult.rows[0]));
});

service.put(ITEM_ROUTE, async (request, response) => {
  const itemID = parseItemID(request, response);
  if (itemID === null) {
    return;
  }
  const itemName = itemNameFromPayload(request.body);
  if (itemName === "") {
    response.status(400).json({ error: "name is required" });
    return;
  }
  const queryResult = await database.query(
    "UPDATE items SET name = $2 WHERE id = $1 RETURNING id, name, created_at",
    [itemID, itemName],
  );
  if (queryResult.rows.length === 0) {
    response.status(404).json({ error: "item not found" });
    return;
  }
  response.json(normalizeItem(queryResult.rows[0]));
});

service.delete(ITEM_ROUTE, async (request, response) => {
  const itemID = parseItemID(request, response);
  if (itemID === null) {
    return;
  }
  const queryResult = await database.query("DELETE FROM items WHERE id = $1", [itemID]);
  if (queryResult.rowCount === 0) {
    response.status(404).json({ error: "item not found" });
    return;
  }
  response.sendStatus(204);
});

async function start() {
  await database.query(schemaStatement);
  service.listen(port, () => {
    console.log(`api listening on port ${port}`);
  });
}

start().catch((startError) => {
  console.error(startError);
  process.exit(1);
});
