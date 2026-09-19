import wishlistCsv from '../../やりたいことリスト.csv?raw';

export interface WishlistItem {
  text: string;
  note?: string;
  /** 追加日。新しい日付から表示する。 */
  addedAt: string;
  /** CSVの達成日に日付が入るとチェックを表示する。並び順には影響させない。 */
  completedAt?: string;
}

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let quoted = false;
  const source = text.replace(/^\uFEFF/, '');

  for (let i = 0; i < source.length; i++) {
    const char = source[i];
    if (quoted) {
      if (char === '"' && source[i + 1] === '"') { field += '"'; i++; }
      else if (char === '"') quoted = false;
      else field += char;
    } else if (char === '"') quoted = true;
    else if (char === ',') { row.push(field); field = ''; }
    else if (char === '\n' || char === '\r') {
      if (char === '\r' && source[i + 1] === '\n') i++;
      row.push(field);
      if (row.some((cell) => cell.trim())) rows.push(row);
      row = [];
      field = '';
    } else field += char;
  }
  if (quoted) throw new Error('やりたいことリスト.csv: ダブルクォートが閉じられていません。');
  if (field || row.length) {
    row.push(field);
    if (row.some((cell) => cell.trim())) rows.push(row);
  }
  return rows;
}

function readDate(value: string, rowNumber: number, column: string): string | undefined {
  if (!value.trim()) return undefined;
  const match = /^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/.exec(value.trim());
  if (!match) throw new Error(`やりたいことリスト.csv ${rowNumber}行目: ${column}は「2026-09-17」の形で入力してください。`);
  const iso = `${match[1]}-${match[2].padStart(2, '0')}-${match[3].padStart(2, '0')}`;
  if (Number.isNaN(Date.parse(iso)) || new Date(`${iso}T00:00:00Z`).toISOString().slice(0, 10) !== iso) {
    throw new Error(`やりたいことリスト.csv ${rowNumber}行目: ${column}の日付を確認してください。`);
  }
  return iso;
}

function loadWishlist(csv: string): WishlistItem[] {
  const [headers, ...rows] = parseCsv(csv);
  if (headers?.join(',') !== '追加日,やりたいこと,補足,達成日') {
    throw new Error('やりたいことリスト.csv: 1行目の見出し「追加日,やりたいこと,補足,達成日」を変更しないでください。');
  }
  return rows.map(([added, text, note, completed], index) => {
    const rowNumber = index + 2;
    if (!text?.trim()) throw new Error(`やりたいことリスト.csv ${rowNumber}行目: やりたいことを入力してください。`);
    const addedAt = readDate(added ?? '', rowNumber, '追加日');
    if (!addedAt) throw new Error(`やりたいことリスト.csv ${rowNumber}行目: 追加日を入力してください。`);
    return {
      text: text.trim(),
      note: note?.trim() || undefined,
      addedAt,
      completedAt: readDate(completed ?? '', rowNumber, '達成日'),
    };
  });
}

// CSVの上の行ほど新しいメモ。日付が同じときも、この行順を保つ。
export const wishlistItems = loadWishlist(wishlistCsv);

export function newestWishlistItems(items: readonly WishlistItem[] = wishlistItems): WishlistItem[] {
  return items
    .map((item, index) => ({ item, index }))
    .sort((a, b) => Date.parse(b.item.addedAt) - Date.parse(a.item.addedAt) || a.index - b.index)
    .map(({ item }) => item);
}
