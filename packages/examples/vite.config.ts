import { defineConfig, ServerOptions } from 'vite';
import basicSsl from '@vitejs/plugin-basic-ssl';
import config from './laserfiche.config.json';
import {
  bundleLfless,
  disableSharedChunking,
  generateDirectoryHtml,
} from '@lfz/lf-form-builder/plugins';

const formsJS = config.forms.js;

const input: Record<string, string> = {};

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
    target: 'esnext',
    copyPublicDir: true,
    rolldownOptions: {
      treeshake: true,
      external: ['@laserfiche/lf-repository-api-client-v2'],
      input,
      output: {
        dir: 'dist',
        format: 'es',
        entryFileNames: '[name].js',
        assetFileNames: '[name].[ext]',
      },
    },
  },
  plugins: [
    basicSsl(),
    disableSharedChunking(input),
    generateDirectoryHtml(),
    bundleLfless({
      validateSyntax: false,
    }),
  ],
}));
