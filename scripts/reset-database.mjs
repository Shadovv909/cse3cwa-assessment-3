import { rm } from "node:fs/promises";
import path from "node:path";

const databasePath = path.resolve(
  process.env.DATABASE_PATH || path.join(process.cwd(), "data", "phoneme-studio.db"),
);

for (const file of [databasePath, `${databasePath}-shm`, `${databasePath}-wal`]) {
  await rm(file, { force: true });
}

console.log(`Removed local database files for ${databasePath}`);
