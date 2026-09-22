import { promises as fs } from "fs";
import path from "path";
import { seedData } from "./seed";
import type { StoreData } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const STORE_PATH = path.join(DATA_DIR, "store.json");

async function ensureStore(): Promise<StoreData> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    const raw = await fs.readFile(STORE_PATH, "utf8");
    return JSON.parse(raw) as StoreData;
  } catch {
    await fs.writeFile(STORE_PATH, JSON.stringify(seedData, null, 2), "utf8");
    return structuredClone(seedData);
  }
}

export async function readStore(): Promise<StoreData> {
  return ensureStore();
}

export async function writeStore(data: StoreData): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(STORE_PATH, JSON.stringify(data, null, 2), "utf8");
}

export async function updateStore(
  updater: (data: StoreData) => StoreData | void,
): Promise<StoreData> {
  const data = await readStore();
  const next = updater(data) ?? data;
  await writeStore(next);
  return next;
}

export async function resetStore(): Promise<StoreData> {
  const fresh = structuredClone(seedData);
  await writeStore(fresh);
  return fresh;
}
