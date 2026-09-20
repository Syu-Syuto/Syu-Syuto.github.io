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
  width?: number;
  height?: number;
}

const imageDescriptions: Record<string, { webName: string; fullName: string; alt: string; width: number; height: number }> = {
  '20260123 上野-027.jpg': { webName: 'ueno-owl.webp', fullName: 'ueno-owl.jpg', alt: '暗い背景の中で光を浴びる白いフクロウ', width: 800, height: 1200 },
  '20260126 京都大阪Day2-059.jpg': { webName: 'aquarium-view.webp', fullName: 'aquarium-view.jpg', alt: 'たくさんの魚が泳ぐ水槽を眺める二人の後ろ姿', width: 1200, height: 800 },
  '20260126 京都大阪Day2-107.jpg': { webName: 'spinning-street.webp', fullName: 'spinning-street.jpg', alt: '光と人影が流れるようにぶれた街角', width: 800, height: 1200 },
  'codex-clipboard-37e947ba-123d-4633-a624-64d6f1e2681e.jpg': { webName: 'simulacra.webp', fullName: 'simulacra.jpg', alt: '建物の配管と通気口が顔のように並ぶ様子', width: 800, height: 1200 },
  '渇き.jpg': { webName: 'thirst.webp', fullName: 'thirst.jpg', alt: '白い動物の目元を捉えた接写', width: 1200, height: 800 },
  'codex-clipboard-328e3264-4772-4c2b-8b63-bdace728b673.jpg': { webName: 'cut-out.webp', fullName: 'cut-out.jpg', alt: '丸窓の向こうに木の枝が見える室内', width: 1200, height: 800 },
  'codex-clipboard-67414134-7629-414e-b81e-68630e6227b5.jpg': { webName: 'selfie.webp', fullName: 'selfie.jpg', alt: 'きらめく鏡の空間に置かれたカメラ', width: 1200, height: 800 },
  'codex-clipboard-05f65781-7de1-42b0-8ffe-4eca6b6f525b.jpg': { webName: 'habit.webp', fullName: 'habit.jpg', alt: '競技場のベンチに並んで座る二人の後ろ姿', width: 1200, height: 800 },
  'codex-clipboard-49cc5d05-9ca2-4961-a4b0-4e8b9d91f699.jpg': { webName: 'bloom.webp', fullName: 'bloom.jpg', alt: '夜空に大きく開く花火', width: 1200, height: 800 },
  'codex-clipboard-907550e2-dd70-4ccd-b68c-70951400af19.jpg': { webName: 'spotlight.webp', fullName: 'spotlight.jpg', alt: '木漏れ日に照らされた森の小さな植物', width: 1200, height: 800 },
  'codex-clipboard-9a595f95-0bf1-4b5a-8c1d-0139e2fe1e91.jpg': { webName: 'sleepless-city.webp', fullName: 'sleepless-city.jpg', alt: '夜の街並みと東京タワー', width: 1200, height: 800 },
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
  const expected = 'ファイル名,タイトル,撮影日,ひとこと,カメラ,レンズ,焦点距離,シャッタースピード,F値,ISO感度';
  if (headers?.join(',') !== expected) throw new Error(`写真登録.csv: 1行目の見出し「${expected}」を変更しないでください。`);

  const names = new Set<string>();
  return rows.map((row, index) => {
    const line = index + 2;
    if (row.length !== headers.length) throw new Error(`写真登録.csv ${line}行目: 列数を確認してください。`);
    const [rawName, rawTitle, rawCaptureDate, rawComment, rawCamera, rawLens, rawFocal, rawShutter, rawAperture, rawIso] = row;
    const fileName = rawName.trim();
    const title = rawTitle.trim();
    const dateMatch = rawCaptureDate.trim().match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})$/);
    if (!/^[^/\\]+\.jpe?g$/i.test(fileName) || fileName === '.' || fileName === '..') {
      throw new Error(`写真登録.csv ${line}行目: JPEGのファイル名を入力してください。`);
    }
    if (!title) throw new Error(`写真登録.csv ${line}行目: タイトルを入力してください。`);
    if (!dateMatch) throw new Error(`写真登録.csv ${line}行目: 撮影日は「2026/1/23」の形で入力してください。`);
    if (names.has(fileName)) throw new Error(`写真登録.csv ${line}行目: ファイル名が重複しています。`);
    names.add(fileName);
    const knownImage = imageDescriptions[fileName];
    if (!knownImage) throw new Error(`写真登録.csv ${line}行目: 画像ファイル「${fileName}」の登録情報がありません。`);
    const captureDate = `${dateMatch[1]}-${dateMatch[2].padStart(2, '0')}-${dateMatch[3].padStart(2, '0')}`;
    return {
      fileName,
      image: `/images/gallery/${encodeURIComponent(knownImage.webName)}`,
      fullImage: `/images/gallery/full/${encodeURIComponent(knownImage.fullName)}`,
      title,
      captureDate,
      comment: rawComment.trim() || undefined,
      camera: rawCamera.trim() || undefined,
      lens: rawLens.trim() || undefined,
      focalLength: rawFocal.trim() || undefined,
      shutterSpeed: rawShutter.trim() || undefined,
      aperture: rawAperture.trim() || undefined,
      iso: rawIso.trim() || undefined,
      alt: knownImage.alt,
      width: knownImage.width,
      height: knownImage.height,
    };
  }).sort((a, b) => b.captureDate.localeCompare(a.captureDate));
}

// 撮影日が新しい写真から表示する。
export const galleryPhotos = loadPhotos(photosCsv);
