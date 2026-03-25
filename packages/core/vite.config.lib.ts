import { defineConfig, Plugin } from 'vite';
import dts from 'vite-plugin-dts';
import path from 'node:path';
import { copyFile, mkdir } from 'node:fs/promises';
import { globSync } from 'node:fs';

const srcDir = path.resolve(__dirname, 'src');
const distDir = path.resolve(__dirname, 'dist');

/**
 * Mark .lfless and .css imports as external so the import statements are
 * preserved in the output JS (instead of being stubbed to empty).
 * Consumers compile these via the bundleLfless plugin.
 */
function externalizeStyleImports(): Plugin {
  return {
    name: 'externalize-style-imports',
    enforce: 'pre',
    resolveId(source) {
      if (source.endsWith('.lfless') || source.endsWith('.css')) {
        return { id: source, external: true };
      }
      return null;
    },
  };
}

/**
 * Copy .lfless and .css files from src/ into dist/ so that the preserved
 * import statements resolve correctly from the published package.
 */
function copyStyleAssets(): Plugin {
  return {
    name: 'copy-style-assets',
    closeBundle: {
      sequential: true,
      async handler() {
        const patterns = ['**/*.lfless', '**/*.css'];
        for (const pattern of patterns) {
          const files = globSync(pattern, { cwd: srcDir });
          for (const file of files) {
            const src = path.join(srcDir, file);
            const dest = path.join(distDir, file);
            await mkdir(path.dirname(dest), { recursive: true });
            await copyFile(src, dest);
          }
        }
      },
    },
  };
}

export default defineConfig({
  build: {
    minify: false,
    lib: {
      entry: {
        index: path.resolve(srcDir, 'index.ts'),
        'plugins/index': path.resolve(srcDir, 'plugins/index.ts'),
        'plugins/bundleLfless': path.resolve(srcDir, 'plugins/bundleLfless.ts'),
        'plugins/disableSharedChunking': path.resolve(srcDir, 'plugins/disableSharedChunking.ts'),
        'plugins/generateDirectoryHtml': path.resolve(srcDir, 'plugins/generateDirectoryHtml.ts'),
      },
      formats: ['es'],
    },
    target: 'esnext',
    sourcemap: true,
    rollupOptions: {
      external: [
        /^@lfz\//,
        /^@laserfiche\//,
        /^vite$/,
        /^node:/,
        /^less$/,
        /^path$/,
        /^fs$/,
      ],
      output: {
        preserveModules: true,
        preserveModulesRoot: srcDir,
      },
    },
  },
  resolve: {
    alias: {
      '@': srcDir,
      '@lib': path.resolve(srcDir, 'lib'),
      '@components': path.resolve(srcDir, 'components'),
      '@css': path.resolve(srcDir, 'css'),
    },
  },
  plugins: [
    externalizeStyleImports(),
    copyStyleAssets(),
    dts({
      rollupTypes: false,
      tsconfigPath: path.resolve(__dirname, 'tsconfig.lib.json'),
      outDir: distDir,
    }),
  ],
});
