import jsdoc2md from 'jsdoc-to-markdown'
import { promises as fs } from 'node:fs'
import path from 'path'

/* input and output paths */
const inputFile = [
  "src/lib",
  "src/components"
]

/* get template data */
const templateData = await jsdoc2md.getTemplateData({ files: inputFile, })

const updateTemplateData = templateData.map((data) => {
  if (data.meta.path.includes("src/lib")) {
    data.scope = "lib"
  } else if (data.meta.path.includes("src/components")) {
    data.scope = "components"
  }
  return data;
});

const output = await jsdoc2md.render({ data: updateTemplateData });
await fs.writeFile(path.resolve(`./docs/API.md`), output);

// /* reduce templateData to an array of class names */
// const classNames = templateData.filter(i => i.kind === 'class').map(i => i.name)
// console.log(templateData)
// /* create a documentation file for each class */
// for (const className of classNames) {
//   const template = `{{#class name="${className}"}}{{>docs}}{{/class}}`
//   console.log(`rendering ${className}, template: ${template}`)
//   const output = await jsdoc2md.render({ data: templateData, template: template })
//   await fs.writeFile(path.resolve(`./docs/${className}.md`), output)
// }