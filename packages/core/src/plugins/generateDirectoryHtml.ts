import { Plugin } from 'vite';
import fs from 'node:fs/promises';

export const generateDirectoryHtml = (): Plugin => {
  return {
    name: 'generate-directory-html',
    apply: 'build',
    async generateBundle(options, bundle) {
      const outDir = options.dir ?? options.file ?? 'dist';
      const indexHtml = await fs.readFile(`${outDir}/index.html`, 'utf8').catch(
        () => `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Laserfiche Dev Build Server</title>
  </head>
  <body style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh;">
    <h1>Laserfiche Dev Build Server</h1>
    <p>
      This is a development build server for the Laserfiche project.
    </p>
    <p>Do not use this server in production</p>
    {{BUILD_DIRECTORY}}
  </body>
</html>`,
      );
      const buildDirRegex = /{{BUILD_DIRECTORY}}/g;
      const buildOutput = `<div style="padding: 8px;">Build Output:
        <ul styly="display: flex; flex-direction: column; gap: 4px; border: 1px solid gray; padding: 32px;">
          ${Object.keys(bundle)
            .map((file) => `<li><a href="${file}">${file}</a></li>`)
            .join('\n')}
        </ul>
      </div>`;
      const newHtml = indexHtml.replace(buildDirRegex, buildOutput);
      await fs.writeFile(`${outDir}/index.html`, newHtml);
    },
  };
};
