import fs from 'fs/promises';
import path from 'path';
import less from 'less';
import { fileURLToPath } from 'url';

const INDEX_MARKER_START = '<!-- BUILD_DIRECTORY_START -->';
const INDEX_MARKER_END = '<!-- BUILD_DIRECTORY_END -->';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function compileLessToCss(distDir = path.resolve(__dirname, '..', 'dist')) {
  try {
    const files = await fs.readdir(distDir);
    const lessFiles = files.filter((f) => f.endsWith('.less'));
    if (lessFiles.length === 0) {
      console.warn('No .less files found in', distDir);
      return;
    }

    await Promise.all(
      lessFiles.map(async (fname) => {
        const full = path.join(distDir, fname);
        const src = await fs.readFile(full, 'utf8');
        try {
          const { css } = await less.render(src, { filename: full });
          const outName = fname.replace(/\.less$/, '.css');
          const outPath = path.join(distDir, outName);
          await fs.writeFile(outPath, css, 'utf8');
          console.log('Wrote', outPath);
        } catch (err) {
          // Fallback: write the .less content to a .css file so it's served as an asset.
          const outName = fname.replace(/\.less$/, '.css');
          const outPath = path.join(distDir, outName);
          await fs.writeFile(outPath, src, 'utf8');
          console.warn('Failed to compile .less to css; wrote raw .less as .css fallback:', outPath);
        }
      })
    );

    await refreshDirectoryIndex(distDir);
  } catch (err) {
    console.error('Error compiling less -> css:', err);
    process.exitCode = 1;
  }
}

async function main() {
  await compileLessToCss();
}

async function refreshDirectoryIndex(distDir) {
  const indexPath = path.join(distDir, 'index.html');
  const indexHtml = await fs.readFile(indexPath, 'utf8').catch(() => '');
  if (!indexHtml.includes(INDEX_MARKER_START) || !indexHtml.includes(INDEX_MARKER_END)) {
    return;
  }

  const files = (await fs.readdir(distDir))
    .filter((file) => !file.startsWith('.'))
    .sort((left, right) => left.localeCompare(right));

  const replacement = `${INDEX_MARKER_START}
        <ul style="display: flex; flex-direction: column; gap: 4px; border: 1px solid gray; padding: 32px;">
          ${files.map((file) => `<li><a href="${file}">${file}</a></li>`).join('\n')}
        </ul>
        ${INDEX_MARKER_END}`;

  const updatedHtml = indexHtml.replace(
    new RegExp(`${INDEX_MARKER_START}[\\s\\S]*?${INDEX_MARKER_END}`),
    replacement,
  );

  await fs.writeFile(indexPath, updatedHtml, 'utf8');
}

if (process.argv[1] === __filename) {
  void main();
}
