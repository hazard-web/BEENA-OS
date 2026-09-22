import { promises as fs } from "fs";
import path from "path";
import { seedData } from "./seed";
import type { StoreData } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const STORE_PATH = path.join(DATA_DIR, "store.json");

/** Netlify / serverless has a read-only filesystem — keep data in memory. */
const useMemory =
  process.env.NETLIFY === "true" ||
  !!process.env.NETLIFY_LOCAL ||
  !!process.env.VERCEL ||
  !!process.env.AWS_LAMBDA_FUNCTION_NAME ||
  process.env.BEENA_STORE === "memory";

let memoryStore: StoreData | null = null;

function cloneSeed(): StoreData {
  return structuredClone(seedData);
}

async function ensureStore(): Promise<StoreData> {
  if (useMemory) {
    if (!memoryStore) memoryStore = cloneSeed();
    return memoryStore;
  }

  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const raw = await fs.readFile(STORE_PATH, "utf8");
    return JSON.parse(raw) as StoreData;
  } catch {
    const fresh = cloneSeed();
    try {
      await fs.writeFile(STORE_PATH, JSON.stringify(fresh, null, 2), "utf8");
    } catch {
      memoryStore = fresh;
      return fresh;
    }
    return fresh;
  }
}

export async function readStore(): Promise<StoreData> {
  return ensureStore();
}

export async function writeStore(data: StoreData): Promise<void> {
  if (useMemory || memoryStore) {
    memoryStore = data;
    if (useMemory) return;
  }

  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(STORE_PATH, JSON.stringify(data, null, 2), "utf8");
  } catch {
    memoryStore = data;
  }
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
  const fresh = cloneSeed();
  await writeStore(fresh);
  return fresh;
}
