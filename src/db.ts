import type { Bill } from './types';

const REAL_DB = 'bills-due-board:v1';
const DEMO_DB = 'demo:bills-due-board:v1';

function requestResult<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Browser storage failed.'));
  });
}

function transactionDone(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onabort = () => reject(transaction.error ?? new Error('Browser storage was interrupted.'));
    transaction.onerror = () => reject(transaction.error ?? new Error('Browser storage failed.'));
  });
}

async function openDatabase(demo: boolean): Promise<IDBDatabase> {
  const request = indexedDB.open(demo ? DEMO_DB : REAL_DB, 1);
  request.onupgradeneeded = () => {
    const database = request.result;
    if (!database.objectStoreNames.contains('documents')) database.createObjectStore('documents');
    if (!database.objectStoreNames.contains('keys')) database.createObjectStore('keys');
  };
  return requestResult(request);
}

async function encryptionKey(database: IDBDatabase): Promise<CryptoKey> {
  const read = database.transaction('keys', 'readonly');
  const stored = await requestResult(read.objectStore('keys').get('local-aes-key')) as CryptoKey | undefined;
  await transactionDone(read);
  if (stored) return stored;

  const key = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
  const write = database.transaction('keys', 'readwrite');
  write.objectStore('keys').put(key, 'local-aes-key');
  await transactionDone(write);
  return key;
}

export async function loadBills(demo: boolean): Promise<Bill[]> {
  const database = await openDatabase(demo);
  try {
    const transaction = database.transaction('documents', 'readonly');
    const document = await requestResult(transaction.objectStore('documents').get('bills')) as { iv: ArrayBuffer; ciphertext: ArrayBuffer } | undefined;
    await transactionDone(transaction);
    if (!document) return [];
    const key = await encryptionKey(database);
    const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: document.iv }, key, document.ciphertext);
    return JSON.parse(new TextDecoder().decode(plain)) as Bill[];
  } finally {
    database.close();
  }
}

export async function saveBills(demo: boolean, bills: Bill[]): Promise<void> {
  const database = await openDatabase(demo);
  try {
    const key = await encryptionKey(database);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const plain = new TextEncoder().encode(JSON.stringify(bills));
    const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, plain);
    const transaction = database.transaction('documents', 'readwrite');
    transaction.objectStore('documents').put({ iv: iv.buffer, ciphertext, updatedAt: Date.now() }, 'bills');
    await transactionDone(transaction);
  } finally {
    database.close();
  }
}

export async function updateBills(demo: boolean, change: (latest: Bill[]) => Bill[]): Promise<Bill[]> {
  const apply = async (): Promise<Bill[]> => {
    const latest = await loadBills(demo);
    const next = change(latest);
    await saveBills(demo, next);
    return next;
  };
  if ('locks' in navigator) {
    return navigator.locks.request(`bills-due-board:${demo ? 'demo' : 'real'}:write`, apply);
  }
  return apply();
}

export async function resetDemoStorage(): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const request = indexedDB.deleteDatabase(DEMO_DB);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error ?? new Error('The demo could not reset.'));
    request.onblocked = () => reject(new Error('Close another Bills Due Board tab, then reset the demo again.'));
  });
}

function dateFromToday(offset: number): string {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + offset);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function demoBills(): Bill[] {
  const now = new Date().toISOString();
  const make = (vendor: string, amount: number, offset: number, category: string, status: 'planned' | 'paid' = 'planned', notes = ''): Bill => ({
    id: crypto.randomUUID(), vendor, amount, dueDate: dateFromToday(offset), category, attachment: '', notes,
    status, paidAt: status === 'paid' ? dateFromToday(-2) : '', createdAt: now, updatedAt: now,
  });
  return [
    make('Harbor Electric', 184.62, -2, 'Utilities', 'planned', 'Studio and shop meter'),
    make('Northline Packaging', 426.80, 1, 'Supplies', 'planned', 'Invoice NP-1048'),
    make('Mira Workspace', 875, 3, 'Rent'),
    make('Cloudpost Mail', 38, 5, 'Software'),
    make('Ridgeway Insurance', 212.40, 9, 'Insurance'),
    make('Juniper Internet', 79, -5, 'Utilities', 'paid'),
  ];
}
