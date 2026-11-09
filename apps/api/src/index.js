import express from "express";
import { Pool } from "pg";
import {
  API_VERSION,
  HEALTH_ROUTE,
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
  response.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
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
