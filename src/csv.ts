import type { Bill } from './types';
import { isCalendarDate, isHttpLink, parseCurrencyAmount } from './validation';

function escapeCell(value: string | number): string {
  const raw = String(value);
  const text = /^[=+\-@\t\r]/.test(raw) ? `'${raw}` : raw;
  return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export function billsToCsv(bills: Bill[]): string {
  const header = ['vendor', 'amount', 'due_date', 'category', 'attachment', 'notes', 'status', 'paid_date'];
  const rows = bills.map((bill) => [bill.vendor, bill.amount.toFixed(2), bill.dueDate, bill.category, bill.attachment, bill.notes, bill.status, bill.paidAt]);
  return [header, ...rows].map((row) => row.map(escapeCell).join(',')).join('\r\n');
}

function parseRows(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (quoted) {
      if (char === '"' && text[index + 1] === '"') { cell += '"'; index += 1; }
      else if (char === '"') quoted = false;
      else cell += char;
    } else if (char === '"') quoted = true;
    else if (char === ',') { row.push(cell.trim()); cell = ''; }
    else if (char === '\n') { row.push(cell.trim()); rows.push(row); row = []; cell = ''; }
    else if (char !== '\r') cell += char;
  }
  if (quoted) throw new Error('The CSV has an open quote. Close it and import again.');
  if (cell || row.length) { row.push(cell.trim()); rows.push(row); }
  return rows.filter((item) => item.some(Boolean));
}

export function csvToBills(text: string): Bill[] {
  const rows = parseRows(text);
  if (rows.length < 2) throw new Error('The CSV has no bill rows. Add a row and import again.');
  const headers = rows[0].map((header) => header.trim().toLowerCase());
  for (const required of ['vendor', 'amount', 'due_date']) {
    if (!headers.includes(required)) throw new Error(`The CSV needs a ${required} column. Add it and import again.`);
  }
  const value = (row: string[], key: string) => row[headers.indexOf(key)]?.trim() ?? '';
  const now = new Date().toISOString();
  return rows.slice(1).map((row, index) => {
    const vendor = value(row, 'vendor');
    const amount = parseCurrencyAmount(value(row, 'amount'));
    const dueDate = value(row, 'due_date');
    if (!vendor) throw new Error(`Row ${index + 2} has no vendor. Add one and import again.`);
    if (amount === null) throw new Error(`Row ${index + 2} has an invalid amount. Use a number above zero with no more than two decimal places.`);
    if (!isCalendarDate(dueDate)) throw new Error(`Row ${index + 2} has an invalid due date. Use a real date in YYYY-MM-DD format.`);
    const rawStatus = value(row, 'status');
    if (rawStatus && rawStatus !== 'planned' && rawStatus !== 'paid') throw new Error(`Row ${index + 2} has an invalid status. Use planned or paid.`);
    const status = rawStatus === 'paid' ? 'paid' : 'planned';
    const attachment = value(row, 'attachment');
    if (!isHttpLink(attachment)) throw new Error(`Row ${index + 2} has an invalid attachment link. Use http:// or https://.`);
    const paidAt = value(row, 'paid_date');
    if (paidAt && !isCalendarDate(paidAt)) throw new Error(`Row ${index + 2} has an invalid paid date. Use a real date in YYYY-MM-DD format.`);
    return {
      id: crypto.randomUUID(), vendor, amount, dueDate,
      category: value(row, 'category') || 'Uncategorised', attachment, notes: value(row, 'notes'),
      status, paidAt: status === 'paid' ? paidAt || dueDate : '', createdAt: now, updatedAt: now,
    } satisfies Bill;
  });
}
