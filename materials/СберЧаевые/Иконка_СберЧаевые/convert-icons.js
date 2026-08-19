/**
 * Конвертер SVG → PNG для иконок СберЧаевые.
 * Требуется: Node.js + пакет `sharp` (npm install sharp)
 *
 * Использование:
 *   node convert-icons.js
 *
 * Генерирует PNG 64x64, 128x128, 256x256 для каждого SVG.
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const SIZES = [64, 128, 256];
const SVG_FILES = [
  'sber-1-qr-coin.svg',
  'sber-2-qr-receipt.svg',
  'sber-3-qr-wallet.svg',
  'sber-4-qr-heart.svg',
];

async function convert() {
  for (const svgFile of SVG_FILES) {
    const svgPath = path.join(__dirname, svgFile);
    if (!fs.existsSync(svgPath)) {
      console.error(`  ✗ Файл не найден: ${svgFile}`);
      continue;
    }

    const baseName = path.basename(svgFile, '.svg');
    const svgBuffer = fs.readFileSync(svgPath);

    for (const size of SIZES) {
      const pngFile = `${baseName}-${size}px.png`;
      const pngPath = path.join(__dirname, pngFile);

      try {
        await sharp(svgBuffer)
          .resize(size, size)
          .png()
          .toFile(pngPath);
        console.log(`  ✓ ${pngFile}`);
      } catch (err) {
        console.error(`  ✗ Ошибка ${pngFile}: ${err.message}`);
      }
    }
  }
  console.log('\nГотово!');
}

convert();
