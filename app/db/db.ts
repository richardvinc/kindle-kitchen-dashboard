import Database from "bun:sqlite";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { migrate } from "drizzle-orm/bun-sqlite/migrator";

const databasePath = path.join(import.meta.dir, "data/sqlite.db");
mkdirSync(path.dirname(databasePath), { recursive: true });

const sqlite = new Database(databasePath, {
	create: true,
});
export const db = drizzle({ client: sqlite });
migrate(db, { migrationsFolder: path.join(import.meta.dir, "../../drizzle") });
