import { Plugin } from 'vite';
import path from 'node:path';
import fs from 'node:fs/promises';
import { readFileSync, existsSync } from 'node:fs';
import less from 'less';

export interface BundleLflessOptions {
  /**
   * Whether to validate LESS syntax during build
   */
  validateSyntax?: boolean;
  /**
   * Output directory relative to build output (default: 'assets')
   */
  outDir?: string;
}

export function bundleLfless(options: BundleLflessOptions = {}): Plugin {
  const { validateSyntax = false, outDir } = options;

  let rootDir = process.cwd();
  const entryIdToName = new Map<string, string>(); // Map of entry module ID -> configured entry name
  const reverseImportGraph = new Map<string, Set<string>>(); // Map of imported module ID -> importing module IDs
  const lflessToImporters = new Map<string, Set<string>>(); // Map of lfless path -> direct non-lfless importers
  const loggedDetections = new Set<string>();

  return {
    name: 'bundle-lfless',
    apply: 'build',
    enforce: 'pre',

    configResolved(config) {
      rootDir = config.root ? path.resolve(config.root) : process.cwd();
      entryIdToName.clear();

      const input = config.build.rollupOptions?.input;
      if (!input) {
        return;
      }

      const addEntry = (name: string, entryPath: string) => {
        const absoluteEntryPath = path.resolve(rootDir, entryPath);
        entryIdToName.set(normalizeModuleId(absoluteEntryPath), name);
      };

      if (typeof input === 'string') {
        const name = path.basename(input, path.extname(input));
        addEntry(name, input);
        return;
      }

      if (Array.isArray(input)) {
        for (const entryPath of input) {
          const name = path.basename(entryPath, path.extname(entryPath));
          addEntry(name, entryPath);
        }
        return;
      }

      for (const [name, entryValue] of Object.entries(input)) {
        if (Array.isArray(entryValue)) {
          for (const entryPath of entryValue) {
            addEntry(name, entryPath);
          }
          continue;
        }

        addEntry(name, entryValue);
      }
    },

    moduleParsed(moduleInfo) {
      const importerIdWithQuery = path.normalize(moduleInfo.id);
      const importerIdNormalized = normalizeModuleId(moduleInfo.id);
      for (const importedId of moduleInfo.importedIds) {
        const importedIdWithQuery = path.normalize(importedId);
        const importedIdNormalized = normalizeModuleId(importedId);

        // Track both raw and normalized IDs so ownership traversal works with and without ?unique suffixes.
        addReverseGraphEdge(
          reverseImportGraph,
          importedIdWithQuery,
          importerIdWithQuery,
        );
        addReverseGraphEdge(
          reverseImportGraph,
          importedIdNormalized,
          importerIdNormalized,
        );
      }
    },

    // Prevent Vite from trying to parse .lfless files as JS
    async resolveId(source, importer) {
      if (source.endsWith('.lfless') || source.includes('.lfless')) {
        // Try Vite's resolver first so aliases and plugin resolution rules are honored.
        let resolvedPath = '';
        const resolved = await this.resolve(source, importer, {
          skipSelf: true,
        });
        if (resolved?.id) {
          resolvedPath = normalizeModuleId(resolved.id);
        } else if (importer && !path.isAbsolute(source)) {
          const importerDir = path.dirname(normalizeModuleId(importer));
          resolvedPath = path.resolve(importerDir, source);
        } else if (!path.isAbsolute(source)) {
          resolvedPath = path.resolve(rootDir, source);
        } else {
          resolvedPath = source;
        }

        // Track this import if it comes from a non-lfless module.
        if (
          importer &&
          !importer.includes('.lfless') &&
          !importer.startsWith('\0lfless:')
        ) {
          const normalizedImporter = normalizeModuleId(importer);
          const normalizedLfless = normalizeModuleId(resolvedPath);
          if (!lflessToImporters.has(normalizedLfless)) {
            lflessToImporters.set(normalizedLfless, new Set<string>());
          }
          lflessToImporters.get(normalizedLfless)?.add(normalizedImporter);
        }

        // Return a virtual module ID that won't be processed
        return '\0lfless:' + normalizeModuleId(resolvedPath);
      }
      return null;
    },

    // Provide empty content for virtual lfless modules
    load(id) {
      if (id.startsWith('\0lfless:')) {
        // Return empty export so imports don't break
        return 'export default {};';
      }
      return null;
    },

    async generateBundle() {
      if (lflessToImporters.size === 0) {
        console.log('⚠️  No .lfless files detected in entry points');
        return;
      }

      const formToLfless = new Map<string, Set<string>>();

      for (const [lflessPath, importerPaths] of lflessToImporters.entries()) {
        const ownerForms = new Set<string>();

        for (const importerPath of importerPaths) {
          const owningEntries = findOwningEntries(
            importerPath,
            reverseImportGraph,
            entryIdToName,
          );

          for (const owner of owningEntries) {
            ownerForms.add(owner);
          }
        }

        if (ownerForms.size === 0) {
          console.warn(
            `⚠️  Skipping ${path.relative(rootDir, lflessPath)} because no owning entry was found in the import graph.`,
          );
          continue;
        }

        for (const formName of ownerForms) {
          if (!formToLfless.has(formName)) {
            formToLfless.set(formName, new Set<string>());
          }
          formToLfless.get(formName)?.add(lflessPath);

          const outputName = `${formName}.less`;
          const relativeLfless = path.relative(rootDir, lflessPath);
          const detectionKey = `${formName}::${lflessPath}`;
          if (!loggedDetections.has(detectionKey)) {
            loggedDetections.add(detectionKey);
            console.log(
              `📦 Detected .lfless import: ${formName} imports ${relativeLfless} -> ${outputName}`,
            );
          }
        }
      }

      // Bundle each form output from all lfless files it owns.
      for (const [formName, lflessPaths] of formToLfless.entries()) {
        const outputName = `${formName}.less`;

        try {
          const bundles = await Promise.all(
            [...lflessPaths]
              .sort()
              .map((lflessPath) => resolveImports(lflessPath, rootDir)),
          );
          const bundledContent = bundles.join('\n');

          // Optionally validate LESS syntax
          if (validateSyntax) {
            try {
              await less.render(bundledContent, {
                filename: outputName,
                lint: true,
              });
              console.log(`✓ LESS syntax validation passed for ${outputName}`);
            } catch (error) {
              console.error(
                `✗ LESS syntax validation failed for ${outputName}:`,
              );
              if (error instanceof Error) {
                console.error(error.message);
              }
              throw error;
            }
          }

          // Emit the bundled file
          this.emitFile({
            type: 'asset',
            fileName: outDir ? `${outDir}/${outputName}` : outputName,
            source: bundledContent,
          });

          console.log(
            `✓ Bundled ${outputName} (${(bundledContent.length / 1024).toFixed(2)} KB)`,
          );
        } catch (error) {
          console.error(`Failed to bundle ${outputName}:`, error);
          throw error;
        }
      }
    },
  };
}

/**
 * Recursively resolves @import statements and concatenates files
 */
async function resolveImports(
  filePath: string,
  rootDir: string,
  processedFiles = new Set<string>(),
): Promise<string> {
  // Prevent circular dependencies
  const normalizedPath = path.normalize(filePath);
  if (processedFiles.has(normalizedPath)) {
    return `/* Circular dependency skipped: ${path.relative(rootDir, normalizedPath)} */\n`;
  }
  processedFiles.add(normalizedPath);

  // Read file content
  let content: string;
  try {
    content = await fs.readFile(filePath, 'utf-8');
  } catch (error) {
    throw new Error(`Failed to read ${filePath}: ${error}`);
  }

  // Find all @import statements
  const importRegex = /@import\s+['"]([^'"]+)['"]\s*;?/g;
  const imports: Array<{ match: string; importPath: string }> = [];
  let match: RegExpExecArray | null;

  while ((match = importRegex.exec(content)) !== null) {
    imports.push({
      match: match[0],
      importPath: match[1],
    });
  }

  // If no imports, return content as-is
  if (imports.length === 0) {
    return addFileHeader(filePath, rootDir) + content + '\n';
  }

  // Process imports in order
  let result = content;
  for (const { match, importPath } of imports.reverse()) {
    // Resolve import path relative to current file
    const dir = path.dirname(filePath);

    // Try with and without .lfless extension
    const extensions = ['', '.lfless', '.less', '.css'];
    let importContent = '';
    let foundPath = '';

    // Determine candidate base paths:
    // - Relative/absolute imports resolve from the importing file's directory
    // - Bare specifiers (e.g. '@lf/lf-form-builder/css/...') resolve from node_modules,
    //   with support for package.json "exports" maps
    const isRelative =
      importPath.startsWith('.') || path.isAbsolute(importPath);
    const candidateBases: string[] = [];

    if (isRelative) {
      candidateBases.push(path.resolve(dir, importPath));
    } else {
      // Try resolving via package.json exports first, then fall back to direct path
      const resolvedViaExports = resolvePackageExports(
        importPath,
        dir,
        rootDir,
      );
      if (resolvedViaExports) {
        candidateBases.push(resolvedViaExports);
      }

      // Walk up from the importing file to find node_modules
      let searchDir = dir;
      while (searchDir !== path.dirname(searchDir)) {
        const nmPath = path.join(searchDir, 'node_modules', importPath);
        candidateBases.push(nmPath);
        searchDir = path.dirname(searchDir);
      }
      // Also try from rootDir
      candidateBases.push(path.join(rootDir, 'node_modules', importPath));
    }

    for (const resolvedPath of candidateBases) {
      for (const ext of extensions) {
        const testPath = ext
          ? resolvedPath.replace(/\.(lfless|less|css)?$/, '') + ext
          : resolvedPath;
        try {
          await fs.access(testPath);
          foundPath = testPath;
          importContent = await resolveImports(
            testPath,
            rootDir,
            processedFiles,
          );
          break;
        } catch {
          // Try next extension
        }
      }
      if (foundPath) break;
    }

    if (!foundPath) {
      throw new Error(
        `Could not resolve import "${importPath}" from ${path.relative(rootDir, filePath)}`,
      );
    }

    // Replace @import with resolved content
    result = result.replace(match, importContent);
  }

  return addFileHeader(filePath, rootDir) + result + '\n';
}

/**
 * Add a comment header to identify the source file
 */
function addFileHeader(filePath: string, rootDir: string): string {
  const relativePath = path.relative(rootDir, filePath);
  return `\n/* === ${relativePath} === */\n`;
}

function normalizeModuleId(id: string): string {
  const withoutVirtualPrefix = id.startsWith('\0lfless:')
    ? id.slice('\0lfless:'.length)
    : id;
  const withoutQuery = withoutVirtualPrefix.split('?')[0];
  return path.normalize(withoutQuery);
}

function addReverseGraphEdge(
  reverseImportGraph: Map<string, Set<string>>,
  importedId: string,
  importerId: string,
): void {
  if (!reverseImportGraph.has(importedId)) {
    reverseImportGraph.set(importedId, new Set<string>());
  }
  reverseImportGraph.get(importedId)?.add(importerId);
}

function findOwningEntries(
  importerId: string,
  reverseImportGraph: Map<string, Set<string>>,
  entryIdToName: Map<string, string>,
): Set<string> {
  const owners = new Set<string>();
  const queue = [importerId];
  const visited = new Set<string>();

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current || visited.has(current)) {
      continue;
    }
    visited.add(current);

    const entryName = entryIdToName.get(current);
    if (entryName) {
      owners.add(entryName);
      continue;
    }

    const parents = reverseImportGraph.get(current);
    if (!parents) {
      continue;
    }

    for (const parent of parents) {
      if (!visited.has(parent)) {
        queue.push(parent);
      }
    }
  }

  return owners;
}

/**
 * Resolve a bare specifier like '@lf/lf-form-builder/css/form-theme.lfless'
 * through the target package's "exports" map in package.json.
 * Returns an absolute file path, or null if resolution fails.
 */
function resolvePackageExports(
  specifier: string,
  importerDir: string,
  rootDir: string,
): string | null {
  // Split the specifier into package name and subpath.
  // Scoped packages: @scope/pkg/sub/path → package = @scope/pkg, subpath = ./sub/path
  const parts = specifier.startsWith('@')
    ? specifier.split('/')
    : specifier.split('/');
  const packageName = specifier.startsWith('@')
    ? parts.slice(0, 2).join('/')
    : parts[0];
  const subpath =
    './' + parts.slice(specifier.startsWith('@') ? 2 : 1).join('/');

  // Walk up from importerDir to find the package's node_modules directory.
  const searchDirs = [importerDir];
  let dir = importerDir;
  while (dir !== path.dirname(dir)) {
    dir = path.dirname(dir);
    searchDirs.push(dir);
  }
  if (!searchDirs.includes(rootDir)) {
    searchDirs.push(rootDir);
  }

  for (const searchDir of searchDirs) {
    const pkgDir = path.join(searchDir, 'node_modules', packageName);
    const pkgJsonPath = path.join(pkgDir, 'package.json');
    if (!existsSync(pkgJsonPath)) continue;

    let pkgJson: { exports?: Record<string, string | Record<string, string>> };
    try {
      pkgJson = JSON.parse(readFileSync(pkgJsonPath, 'utf-8'));
    } catch {
      continue;
    }

    const exports = pkgJson.exports;
    if (!exports || typeof exports !== 'object') continue;

    // Try exact match first
    const exactTarget =
      typeof exports[subpath] === 'string' ? exports[subpath] : null;
    if (exactTarget) {
      return path.resolve(pkgDir, exactTarget);
    }

    // Try wildcard patterns (e.g. "./css/*": "./src/css/*")
    for (const [pattern, target] of Object.entries(exports)) {
      if (typeof target !== 'string' || !pattern.includes('*')) continue;
      const prefix = pattern.split('*')[0];
      const suffix = pattern.split('*')[1] || '';
      if (subpath.startsWith(prefix) && subpath.endsWith(suffix)) {
        const endIndex =
          suffix.length > 0 ? subpath.length - suffix.length : undefined;
        const wildcardMatch = subpath.slice(prefix.length, endIndex);
        const resolved = target.replace('*', wildcardMatch);
        return path.resolve(pkgDir, resolved);
      }
    }
  }

  return null;
}
