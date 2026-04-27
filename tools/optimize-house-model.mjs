import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import zlib from 'node:zlib';
import { promisify } from 'node:util';

const gzip = promisify(zlib.gzip);
const brotliCompress = promisify(zlib.brotliCompress);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const modelsDir = path.resolve(__dirname, '..', 'public', 'models');
const sourcePath = path.join(modelsDir, 'smart-house.gltf');
const outputPath = path.join(modelsDir, 'smart-house.gltf');
const outputBinPath = path.join(modelsDir, 'smart-house.bin');

async function optimizeModel() {
  const sourceRaw = await fs.readFile(sourcePath, 'utf-8');
  const gltf = JSON.parse(sourceRaw);

  if (!Array.isArray(gltf.buffers) || gltf.buffers.length === 0) {
    throw new Error('No buffers found in smart-house.gltf');
  }

  const firstBuffer = gltf.buffers[0];
  if (typeof firstBuffer.uri === 'string' && firstBuffer.uri.startsWith('data:')) {
    const commaIndex = firstBuffer.uri.indexOf(',');
    if (commaIndex === -1) {
      throw new Error('Invalid data URI in glTF buffer');
    }

    const base64Payload = firstBuffer.uri.slice(commaIndex + 1);
    const binary = Buffer.from(base64Payload, 'base64');

    await fs.writeFile(outputBinPath, binary);
    firstBuffer.uri = 'smart-house.bin';
    firstBuffer.byteLength = binary.byteLength;
  }

  const minified = JSON.stringify(gltf);
  await fs.writeFile(outputPath, minified, 'utf-8');

  const [gltfGz, gltfBr] = await Promise.all([
    gzip(Buffer.from(minified), { level: 9 }),
    brotliCompress(Buffer.from(minified), {
      params: {
        [zlib.constants.BROTLI_PARAM_QUALITY]: 11,
      },
    }),
  ]);

  await Promise.all([
    fs.writeFile(`${outputPath}.gz`, gltfGz),
    fs.writeFile(`${outputPath}.br`, gltfBr),
  ]);

  try {
    const binRaw = await fs.readFile(outputBinPath);
    const [binGz, binBr] = await Promise.all([
      gzip(binRaw, { level: 9 }),
      brotliCompress(binRaw, {
        params: {
          [zlib.constants.BROTLI_PARAM_QUALITY]: 11,
        },
      }),
    ]);
    await Promise.all([
      fs.writeFile(`${outputBinPath}.gz`, binGz),
      fs.writeFile(`${outputBinPath}.br`, binBr),
    ]);
  } catch {
    // No bin generated yet; ignore.
  }

  const stats = await Promise.all([
    fs.stat(outputPath),
    fs.stat(`${outputPath}.gz`),
    fs.stat(`${outputPath}.br`),
    fs.stat(outputBinPath).catch(() => null),
  ]);

  console.log('Model optimization complete:');
  console.log(`- smart-house.gltf: ${stats[0].size} bytes`);
  console.log(`- smart-house.gltf.gz: ${stats[1].size} bytes`);
  console.log(`- smart-house.gltf.br: ${stats[2].size} bytes`);

  if (stats[3]) {
    console.log(`- smart-house.bin: ${stats[3].size} bytes`);
  }
}

optimizeModel().catch((error) => {
  console.error(error);
  process.exit(1);
});
