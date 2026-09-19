import photosCsv from '../../写真登録.csv?raw';

export interface GalleryPhoto {
  fileName: string;
  image: string;
  title: string;
  comment?: string;
  camera?: string;
  lens?: string;
  focalLength?: string;
  shutterSpeed?: string;
  aperture?: string;
  iso?: string;
  alt: string;
  width?: number;
  height?: number;
}

const imageDescriptions: Record<string, { webName: string; alt: string; width: number; height: number }> = {
  '20260123 上野-027.jpg': { webName: 'ueno-owl.webp', alt: '暗い背景の中で光を浴びる白いフクロウ', width: 1600, height: 2400 },
  '20260126 京都大阪Day2-059.jpg': { webName: 'aquarium-view.webp', alt: 'たくさんの魚が泳ぐ水槽を眺める二人の後ろ姿', width: 2400, height: 1600 },
  '20260126 京都大阪Day2-107.jpg': { webName: 'spinning-street.webp', alt: '光と人影が流れるようにぶれた街角', width: 1600, height: 2400 },
};

function parseCsv(source: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let quoted = false;
  const text = source.replace(/^\uFEFF/, '');

  for (let index = 0; index < text.length; index++) {
    const char = text[index];
    if (quoted) {
      if (char === '"' && text[index + 1] === '"') { field += '"'; index++; }
      else if (char === '"') quoted = false;
      else field += char;
    } else if (char === '"') quoted = true;
    else if (char === ',') { row.push(field); field = ''; }
    else if (char === '\n' || char === '\r') {
      if (char === '\r' && text[index + 1] === '\n') index++;
      row.push(field);
      if (row.some((cell) => cell.trim())) rows.push(row);
      row = [];
      field = '';
    } else field += char;
  }

  if (quoted) throw new Error('写真登録.csv: ダブルクォートが閉じられていません。');
  if (field || row.length) {
    row.push(field);
    if (row.some((cell) => cell.trim())) rows.push(row);
  }
  return rows;
}

function loadPhotos(csv: string): GalleryPhoto[] {
  const [headers, ...rows] = parseCsv(csv);
  const expected = 'ファイル名,タイトル,ひとこと,カメラ,レンズ,焦点距離,シャッタースピード,F値,ISO感度';
  if (headers?.join(',') !== expected) throw new Error(`写真登録.csv: 1行目の見出し「${expected}」を変更しないでください。`);

  const names = new Set<string>();
  return rows.map((row, index) => {
    const line = index + 2;
    if (row.length !== headers.length) throw new Error(`写真登録.csv ${line}行目: 列数を確認してください。`);
    const [rawName, rawTitle, rawComment, rawCamera, rawLens, rawFocal, rawShutter, rawAperture, rawIso] = row;
    const fileName = rawName.trim();
    const title = rawTitle.trim();
    if (!/^[^/\\]+\.jpe?g$/i.test(fileName) || fileName === '.' || fileName === '..') {
      throw new Error(`写真登録.csv ${line}行目: JPEGのファイル名を入力してください。`);
    }
    if (!title) throw new Error(`写真登録.csv ${line}行目: タイトルを入力してください。`);
    if (names.has(fileName)) throw new Error(`写真登録.csv ${line}行目: ファイル名が重複しています。`);
    names.add(fileName);
    const knownImage = imageDescriptions[fileName];
    return {
      fileName,
      image: `/images/gallery/${encodeURIComponent(knownImage?.webName ?? fileName)}`,
      title,
      comment: rawComment.trim() || undefined,
      camera: rawCamera.trim() || undefined,
      lens: rawLens.trim() || undefined,
      focalLength: rawFocal.trim() || undefined,
      shutterSpeed: rawShutter.trim() || undefined,
      aperture: rawAperture.trim() || undefined,
      iso: rawIso.trim() || undefined,
      alt: knownImage?.alt ?? title,
      width: knownImage?.width,
      height: knownImage?.height,
    };
  });
}

// CSVの行順をそのままギャラリーの表示順にする。
export const galleryPhotos = loadPhotos(photosCsv);
