import { defineConfig, ServerOptions } from 'vite';
import basicSsl from '@vitejs/plugin-basic-ssl';
import path from 'node:path';
import config from './laserfiche.config.json';
import { bundleLfless } from './vite-plugins/bundleLfless';
import { disableSharedChunking } from './vite-plugins/disableSharedChunking';
import { generateDirectoryHtml } from './vite-plugins/generateDirectoryHtml';

const formsJS = config.forms.js;

const input: Record<string, string> = {};

// Convert form config to entry points { [outputName]: entryPath }
const formJSList = Object.entries(formsJS);
if (formJSList.length === 0) {
  throw new Error('No forms found in config');
}
for (const [key, value] of formJSList) {
  input[key] = `${config.forms.rootDir}/${value}`;
}

const serverOptions: ServerOptions = {
  cors: {
    origin: 'https://sandbox-forms.a.clouddev.laserfiche.com',
    methods: ['GET', 'POST', 'OPTIONS'],
    preflightContinue: false,
  },
  headers: {
    'Access-Control-Allow-Private-Network': 'true',
  },
};

export default defineConfig(({ mode }) => ({
  server: serverOptions,
  appType: 'custom',
  build: {
    minify: mode === 'development' ? false : true,
    sourcemap: mode === 'development' ? true : false,
    // vite does not respect tsconfig target so we override
    target: 'esnext',
    copyPublicDir: true,
    rolldownOptions: {
      treeshake: true,

      // externalize any globally included libraries
      external: ['@laserfiche/lf-repository-api-client-v2'],

      // add inputs defined from config
      input,
      output: {
        dir: 'dist',
        format: 'es',
        entryFileNames: '[name].js',
        // push CSS output to dist by name only
        assetFileNames: '[name].[ext]',
        // chunkFileNames: '[name].js',
        // manualChunks: ((id) => {
        //   if (id.includes('components')) return 'components';
        // })
      },
    },
  },
  resolve: {
    alias: {
      // use the same alias as tsconfig
      '@': path.resolve(__dirname, 'src'),
      '@lib': path.resolve(__dirname, 'src/lib'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@css': path.resolve(__dirname, 'src/css'),
    },
  },

  plugins: [
    basicSsl(),
    disableSharedChunking(input),
    generateDirectoryHtml(),
    bundleLfless({
      validateSyntax: false, // CSS variables inside selectors cause validation issues
    }),
  ],
}));
