import { defineConfig, Plugin } from 'vite';
import dts from 'vite-plugin-dts';
import path from 'node:path';

/** Stub .lfless and .css imports — consumers compile these via bundleLfless plugin */
function stubStyleImports(): Plugin {
  return {
    name: 'stub-style-imports',
    enforce: 'pre',
    resolveId(source) {
      if (source.endsWith('.lfless') || source.endsWith('.css')) {
        return `\0stub-style`;
      }
      return null;
    },
    load(id) {
      if (id === '\0stub-style') {
        return '';
      }
      return null;
    },
  };
}

export default defineConfig({
  build: {
    minify: false,
    lib: {
      entry: {
        index: path.resolve(__dirname, 'src/index.ts'),
        'plugins/index': path.resolve(__dirname, 'plugins/index.ts'),
        'plugins/bundleLfless': path.resolve(__dirname, 'plugins/bundleLfless.ts'),
        'plugins/disableSharedChunking': path.resolve(__dirname, 'plugins/disableSharedChunking.ts'),
        'plugins/generateDirectoryHtml': path.resolve(__dirname, 'plugins/generateDirectoryHtml.ts'),
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
        preserveModules: false,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@lib': path.resolve(__dirname, 'src/lib'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@css': path.resolve(__dirname, 'src/css'),
    },
  },
  plugins: [
    stubStyleImports(),
    dts({
      rollupTypes: false,
      tsconfigPath: path.resolve(__dirname, 'tsconfig.json'),
      outDir: path.resolve(__dirname, 'dist'),
      // Flatten src/ prefix so types end up at dist/index.d.ts
      beforeWriteFile: (filePath: string, content: string) => {
        const distSrc = path.join('dist', 'src');
        if (filePath.includes(distSrc)) {
          return {
            filePath: filePath.replace(distSrc, 'dist'),
            content,
          };
        }
        return { filePath, content };
      },
    }),
  ],
});
