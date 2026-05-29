/**
 * Tomotto build script
 * 웹 파일을 www/ 폴더로 복사 → Capacitor가 읽는 webDir
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const WWW = path.join(ROOT, 'www');

// 복사할 파일/폴더 목록
const COPY_TARGETS = [
  'index.html',
  'app.js',
  'style.css',
  'manifest.json',
  'sw.js',
  'assets',
];

function copyRecursive(src, dest) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const child of fs.readdirSync(src)) {
      copyRecursive(path.join(src, child), path.join(dest, child));
    }
  } else {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
  }
}

// www/ 초기화
if (fs.existsSync(WWW)) {
  fs.rmSync(WWW, { recursive: true, force: true });
}
fs.mkdirSync(WWW);

// 복사
for (const target of COPY_TARGETS) {
  const src = path.join(ROOT, target);
  if (!fs.existsSync(src)) {
    console.warn(`[skip] ${target} 없음`);
    continue;
  }
  copyRecursive(src, path.join(WWW, target));
  console.log(`[copy] ${target}`);
}

console.log('\n✅ www/ 빌드 완료');
