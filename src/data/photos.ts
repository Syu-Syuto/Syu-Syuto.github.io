import photosCsv from '../../写真登録.csv?raw';

export interface GalleryPhoto {
  fileName: string;
  image: string;
  fullImage: string;
  title: string;
  captureDate: string;
  comment?: string;
  camera?: string;
  lens?: string;
  focalLength?: string;
  shutterSpeed?: string;
  aperture?: string;
  iso?: string;
  alt: string;
  width: number;
  height: number;
}

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
  const expected = 'ファイル名,公開ファイル名,タイトル,撮影日,ひとこと,代替テキスト,カメラ,レンズ,焦点距離,シャッタースピード,F値,ISO感度,幅,高さ';
  if (headers?.join(',') !== expected) throw new Error(`写真登録.csv: 1行目の見出し「${expected}」を変更しないでください。`);

  const sourceNames = new Set<string>();
  const publicNames = new Set<string>();
  return rows.map((row, index) => {
    const line = index + 2;
    if (row.length !== headers.length) throw new Error(`写真登録.csv ${line}行目: 列数を確認してください。`);
    const [rawName, rawPublicName, rawTitle, rawCaptureDate, rawComment, rawAlt, rawCamera, rawLens, rawFocal, rawShutter, rawAperture, rawIso, rawWidth, rawHeight] = row;
    const fileName = rawName.trim();
    const publicName = rawPublicName.trim();
    const title = rawTitle.trim();
    const alt = rawAlt.trim();
    const dateMatch = rawCaptureDate.trim().match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})$/);
    const width = Number(rawWidth.trim());
    const height = Number(rawHeight.trim());

    if (!/^[^/\\]+\.jpe?g$/i.test(fileName) || fileName === '.' || fileName === '..') {
      throw new Error(`写真登録.csv ${line}行目: 元のJPEGファイル名を入力してください。`);
    }
    if (!/^[a-z0-9][a-z0-9-]*\.jpg$/.test(publicName)) {
      throw new Error(`写真登録.csv ${line}行目: 公開ファイル名は半角英数字とハイフンのJPEG名にしてください。`);
    }
    if (!title) throw new Error(`写真登録.csv ${line}行目: タイトルを入力してください。`);
    if (!alt) throw new Error(`写真登録.csv ${line}行目: 代替テキストを入力してください。`);
    if (!dateMatch) throw new Error(`写真登録.csv ${line}行目: 撮影日は「2026/1/23」の形で入力してください。`);
    if (!Number.isInteger(width) || width <= 0 || !Number.isInteger(height) || height <= 0) {
      throw new Error(`写真登録.csv ${line}行目: 幅と高さを確認してください。`);
    }
    if (sourceNames.has(fileName)) throw new Error(`写真登録.csv ${line}行目: 元ファイル名が重複しています。`);
    if (publicNames.has(publicName)) throw new Error(`写真登録.csv ${line}行目: 公開ファイル名が重複しています。`);
    sourceNames.add(fileName);
    publicNames.add(publicName);

    const captureDate = `${dateMatch[1]}-${dateMatch[2].padStart(2, '0')}-${dateMatch[3].padStart(2, '0')}`;
    const webName = publicName.replace(/\.jpg$/i, '.webp');
    return {
      fileName,
      image: `/images/gallery/${encodeURIComponent(webName)}`,
      fullImage: `/images/gallery/full/${encodeURIComponent(publicName)}`,
      title,
      captureDate,
      comment: rawComment.trim() || undefined,
      camera: rawCamera.trim() || undefined,
      lens: rawLens.trim() || undefined,
      focalLength: rawFocal.trim() || undefined,
      shutterSpeed: rawShutter.trim() || undefined,
      aperture: rawAperture.trim() || undefined,
      iso: rawIso.trim() || undefined,
      alt,
      width,
      height,
    };
  }).sort((a, b) => b.captureDate.localeCompare(a.captureDate));
}

// 撮影日が新しい写真から表示する。
export const galleryPhotos = loadPhotos(photosCsv);
