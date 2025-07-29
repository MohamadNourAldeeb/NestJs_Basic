import * as fs from 'fs';
import * as path from 'path';

const FILE_PATH = './noor.pdf';
const CHUNK_SIZE = 1024 * 1024 * 1; // 1MB لكل Chunk
const BUFFER = fs.readFileSync(FILE_PATH);
const TOTAL_CHUNKS = Math.ceil(BUFFER.length / CHUNK_SIZE);

// التأكد من وجود المجلد chunks
const CHUNKS_DIR = './chunks';
if (!fs.existsSync(CHUNKS_DIR)) {
  fs.mkdirSync(CHUNKS_DIR);
}

for (let i = 0; i < TOTAL_CHUNKS; i++) {
  const start = i * CHUNK_SIZE;
  const end = start + CHUNK_SIZE;
  const chunk = BUFFER.slice(start, end);
  fs.writeFileSync(path.join(CHUNKS_DIR, `chunk_${i + 1}`), chunk);
  console.log(`✅ تم حفظ الجزء ${i + 1}`);
}

console.log('🎉 تم تقسيم الملف بنجاح');
