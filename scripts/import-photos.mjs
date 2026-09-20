import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import sharp from 'sharp';

const repoRoot = path.resolve(import.meta.dirname, '..');
const masterCsvPath = path.join(repoRoot, '写真登録.csv');
const galleryDir = path.join(repoRoot, 'public', 'images', 'gallery');
const fullDir = path.join(galleryDir, 'full');

const inputHeaders = ['元ファイル名', 'タイトル', '撮影日', 'ひとこと', '代替テキスト', 'カメラ', 'レンズ', '焦点距離', 'シャッタースピード', 'F値', 'ISO感度'];
const masterHeaders = ['ファイル名', '公開ファイル名', 'タイトル', '撮影日', 'ひとこと', '代替テキスト', 'カメラ', 'レンズ', '焦点距離', 'シャッタースピード', 'F値', 'ISO感度', '幅', '高さ'];

function parseArgs(argv) {
  const options = {
    csv: path.join(repoRoot, 'photo-import', '写真追加.csv'),
    source: path.join(repoRoot, 'photo-import', 'source'),
    dryRun: false,
  };

  for (let index = 0; index < argv.length; index++) {
    const arg = argv[index];
    if (arg === '--dry-run') options.dryRun = true;
    else if (arg === '--csv' && argv[index + 1]) options.csv = path.resolve(argv[++index]);
    else if (arg === '--source' && argv[index + 1]) options.source = path.resolve(argv[++index]);
    else throw new Error(`不明な引数です: ${arg}`);
  }
  return options;
}

function parseCsv(source, label) {
  const rows = [];
  let row = [];
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
  if (quoted) throw new Error(`${label}: ダブルクォートが閉じられていません。`);
  if (field || row.length) {
    row.push(field);
    if (row.some((cell) => cell.trim())) rows.push(row);
  }
  return rows;
}

function readObjects(rows, expectedHeaders, label) {
  const [headers, ...data] = rows;
  if (headers?.join(',') !== expectedHeaders.join(',')) {
    throw new Error(`${label}: 1行目の見出しを変更しないでください。\n必要な見出し: ${expectedHeaders.join(',')}`);
  }
  return data.map((cells, index) => {
    if (cells.length !== headers.length) throw new Error(`${label} ${index + 2}行目: 列数を確認してください。`);
    return Object.fromEntries(headers.map((header, column) => [header, cells[column].trim()]));
  });
}

function csvEscape(value) {
  const text = String(value ?? '');
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function writeCsv(headers, rows) {
  return `${[headers, ...rows.map((row) => headers.map((header) => row[header] ?? ''))]
    .map((row) => row.map(csvEscape).join(','))
    .join('\r\n')}\r\n`;
}

function normalizeDate(value, label) {
  const match = value.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})$/);
  if (!match) throw new Error(`${label}: 撮影日は「2026/1/23」の形で入力してください。`);
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
    throw new Error(`${label}: 実在する撮影日を入力してください。`);
  }
  return `${year}/${month}/${day}`;
}

function publicNameFor(date, usedNames) {
  const stamp = date.split('/').map((part, index) => index === 0 ? part : part.padStart(2, '0')).join('');
  for (let index = 1; index <= 999; index++) {
    const name = `photo-${stamp}-${String(index).padStart(2, '0')}.jpg`;
    if (!usedNames.has(name)) {
      usedNames.add(name);
      return name;
    }
  }
  throw new Error(`${date}: 公開ファイル名を作成できませんでした。`);
}

function stripJpegMetadataLosslessly(input) {
  if (input[0] !== 0xff || input[1] !== 0xd8) throw new Error('JPEG形式として読み取れません。');
  const kept = [input.subarray(0, 2)];
  let position = 2;

  while (position < input.length) {
    const start = position;
    if (input[position] !== 0xff) throw new Error(`JPEGマーカーが不正です（${position}バイト目）。`);
    while (input[position] === 0xff) position++;
    const marker = input[position++];
    if (marker === 0xda) {
      kept.push(input.subarray(start));
      return Buffer.concat(kept);
    }
    if (marker === 0xd8 || marker === 0xd9 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
      kept.push(input.subarray(start, position));
      continue;
    }
    if (position + 2 > input.length) throw new Error('JPEGセグメントが途中で切れています。');
    const length = input.readUInt16BE(position);
    const end = position + length;
    if (length < 2 || end > input.length) throw new Error('JPEGセグメント長が不正です。');

    const isApp = marker >= 0xe0 && marker <= 0xef;
    const isComment = marker === 0xfe;
    const isJfif = marker === 0xe0;
    const isAdobe = marker === 0xee;
    const isIcc = marker === 0xe2 && input.subarray(start, Math.min(end, start + 40)).includes(Buffer.from('ICC_PROFILE\0'));
    if (!isApp && !isComment || isJfif || isAdobe || isIcc) kept.push(input.subarray(start, end));
    position = end;
  }
  throw new Error('JPEGの画像データが見つかりません。');
}

async function prepareImage(sourcePath, stagedFullPath, stagedWebPath) {
  const original = await fs.readFile(sourcePath);
  const originalMetadata = await sharp(original).metadata();
  if (originalMetadata.format !== 'jpeg') throw new Error('JPEG画像だけを登録できます。');

  let fullBuffer;
  if (originalMetadata.orientation && originalMetadata.orientation !== 1) {
    fullBuffer = await sharp(original)
      .autoOrient()
      .jpeg({ quality: 98, chromaSubsampling: '4:4:4' })
      .toBuffer();
  } else {
    fullBuffer = stripJpegMetadataLosslessly(original);
  }

  const fullMetadata = await sharp(fullBuffer).metadata();
  if (fullMetadata.exif || fullMetadata.iptc || fullMetadata.xmp) throw new Error('高画質画像のメタデータ除去に失敗しました。');
  if (!fullMetadata.width || !fullMetadata.height) throw new Error('画像サイズを取得できませんでした。');

  await fs.writeFile(stagedFullPath, fullBuffer);
  const webBuffer = await sharp(fullBuffer)
    .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 82, effort: 5 })
    .toBuffer();
  const webMetadata = await sharp(webBuffer).metadata();
  if (webMetadata.exif || webMetadata.iptc || webMetadata.xmp) throw new Error('軽量画像のメタデータ除去に失敗しました。');
  await fs.writeFile(stagedWebPath, webBuffer);

  return { width: fullMetadata.width, height: fullMetadata.height };
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const inputText = await fs.readFile(options.csv, 'utf8').catch(() => {
    throw new Error(`入力CSVが見つかりません: ${options.csv}`);
  });
  const masterText = await fs.readFile(masterCsvPath, 'utf8');
  const inputRows = readObjects(parseCsv(inputText, '入力CSV'), inputHeaders, '入力CSV');
  const masterRows = readObjects(parseCsv(masterText, '写真登録.csv'), masterHeaders, '写真登録.csv');
  if (!inputRows.length) throw new Error('入力CSVに写真を1件以上記入してください。');

  const existingSources = new Set(masterRows.map((row) => row['ファイル名']));
  const usedPublicNames = new Set(masterRows.map((row) => row['公開ファイル名']));
  const pendingSources = new Set();
  const planned = [];

  for (const [index, row] of inputRows.entries()) {
    const line = index + 2;
    const sourceName = row['元ファイル名'];
    if (!/^[^/\\]+\.jpe?g$/i.test(sourceName)) throw new Error(`入力CSV ${line}行目: 元ファイル名にはJPEGのファイル名だけを入力してください。`);
    if (!row['タイトル']) throw new Error(`入力CSV ${line}行目: タイトルを入力してください。`);
    if (!row['代替テキスト']) throw new Error(`入力CSV ${line}行目: 代替テキストを入力してください。`);
    if (existingSources.has(sourceName) || pendingSources.has(sourceName)) throw new Error(`入力CSV ${line}行目: 「${sourceName}」は登録済み、または重複しています。`);
    pendingSources.add(sourceName);
    const captureDate = normalizeDate(row['撮影日'], `入力CSV ${line}行目`);
    const publicName = publicNameFor(captureDate, usedPublicNames);
    const sourcePath = path.join(options.source, sourceName);
    const webName = publicName.replace(/\.jpg$/, '.webp');
    for (const targetPath of [path.join(fullDir, publicName), path.join(galleryDir, webName)]) {
      if (await fs.stat(targetPath).then(() => true, () => false)) throw new Error(`出力先がすでに存在します: ${targetPath}`);
    }
    planned.push({ row, sourceName, sourcePath, captureDate, publicName, webName });
  }

  const stagingParent = path.join(repoRoot, 'source-images');
  await fs.mkdir(stagingParent, { recursive: true });
  const stagingDir = await fs.mkdtemp(path.join(stagingParent, '.photo-import-'));
  const newMasterRows = [];
  const createdFiles = [];

  try {
    for (const item of planned) {
      const stagedFull = path.join(stagingDir, item.publicName);
      const stagedWeb = path.join(stagingDir, item.webName);
      const dimensions = await prepareImage(item.sourcePath, stagedFull, stagedWeb).catch((error) => {
        throw new Error(`${item.sourceName}: ${error.message}`);
      });
      newMasterRows.push({
        'ファイル名': item.sourceName,
        '公開ファイル名': item.publicName,
        'タイトル': item.row['タイトル'],
        '撮影日': item.captureDate,
        'ひとこと': item.row['ひとこと'],
        '代替テキスト': item.row['代替テキスト'],
        'カメラ': item.row['カメラ'],
        'レンズ': item.row['レンズ'],
        '焦点距離': item.row['焦点距離'],
        'シャッタースピード': item.row['シャッタースピード'],
        'F値': item.row['F値'],
        'ISO感度': item.row['ISO感度'],
        '幅': String(dimensions.width),
        '高さ': String(dimensions.height),
      });
    }

    const combinedRows = [...newMasterRows, ...masterRows].sort((a, b) => {
      const [aYear, aMonth, aDay] = normalizeDate(a['撮影日'], a['ファイル名']).split('/').map(Number);
      const [bYear, bMonth, bDay] = normalizeDate(b['撮影日'], b['ファイル名']).split('/').map(Number);
      return Date.UTC(bYear, bMonth - 1, bDay) - Date.UTC(aYear, aMonth - 1, aDay);
    });

    if (!options.dryRun) {
      await fs.mkdir(fullDir, { recursive: true });
      for (const item of planned) {
        const fullTarget = path.join(fullDir, item.publicName);
        const webTarget = path.join(galleryDir, item.webName);
        await fs.copyFile(path.join(stagingDir, item.publicName), fullTarget);
        createdFiles.push(fullTarget);
        await fs.copyFile(path.join(stagingDir, item.webName), webTarget);
        createdFiles.push(webTarget);
      }
      const temporaryMaster = `${masterCsvPath}.tmp`;
      await fs.writeFile(temporaryMaster, writeCsv(masterHeaders, combinedRows), 'utf8');
      await fs.rename(temporaryMaster, masterCsvPath);
    }

    console.log(options.dryRun ? '検査完了（ファイルは変更していません）' : '写真登録が完了しました');
    for (const item of planned) console.log(`- ${item.row['タイトル']} → ${item.publicName}`);
  } catch (error) {
    for (const file of createdFiles) await fs.rm(file, { force: true });
    throw error;
  } finally {
    await fs.rm(stagingDir, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
  }
}

main().catch((error) => {
  console.error(`\n写真登録を中止しました。\n${error.message}`);
  process.exitCode = 1;
});
