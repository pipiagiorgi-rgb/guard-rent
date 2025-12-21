import { get, set, del } from 'idb-keyval';

// Prefix for isolating this app's data
const STORAGE_PREFIX = 'guard-rent-';

export async function saveFile(fileId: string, file: File | Blob): Promise<string> {
    const key = `${STORAGE_PREFIX}file-${fileId}`;
    await set(key, file);
    return key;
}

export async function getFile(fileId: string): Promise<Blob | undefined> {
    const key = `${STORAGE_PREFIX}file-${fileId}`;
    return await get(key);
}

export async function deleteFile(fileId: string): Promise<void> {
    const key = `${STORAGE_PREFIX}file-${fileId}`;
    await del(key);
}

// Generate a random ID
export function generateId(): string {
    return Math.random().toString(36).substring(2, 15);
}
