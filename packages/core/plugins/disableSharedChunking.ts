import { Plugin } from 'vite';
import { LoadResult } from 'rolldown';

// This plugin is used to disable shared chunking in vite. Modified code from: https://github.com/rollup/rollup/issues/2756#issuecomment-2078799110
export function disableSharedChunking(inputs: Record<string, string>): Plugin {
  const inputEntries = Object.values(inputs);
  let uniqueIdCounter = 1000;
  const currentEntry: Record<string, string | undefined> = {};
  const moduleToEntry: Record<string, string | undefined> = {}; // Track which entry each module belongs to
  return {
    name: 'disable-shared-chunking',
    enforce: 'pre',
    apply: 'build',
    // Convert all non-input imports to unique imports by input id

    async resolveId(source, importer, options) {
      const resolved = await this.resolve(source, importer, options);

      if (!resolved) return null;

      if (options.isEntry) {
        // Mark this entry point with a unique ID
        const uniqueId = `${uniqueIdCounter++}`;
        currentEntry[resolved.id] = uniqueId;
        moduleToEntry[resolved.id] = uniqueId;
      }
      
      // Only process application source code (files in src/), skip everything else
      if (resolved.id.includes('node_modules') || !resolved.id.includes('/src/')) {
        return null;
      }
      
      if (!inputEntries.some((file) => resolved.id.includes(file))) {
        const extIdx = resolved.id.lastIndexOf('.');
        const name = resolved.id.substring(0, extIdx);
        const dotExtension = resolved.id.substring(extIdx);
        if (dotExtension !== '.js' && dotExtension !== '.ts') {
          return null;
        }
        
        // Find which entry this module belongs to
        let id = currentEntry[importer ?? ''];
        
        // If not directly an entry, check if importer was previously resolved and has tracking info
        if (id === undefined && importer) {
          const regex = /\?unique=(\d+)/;
          const match = importer.match(regex);
          id = match?.[1];
        }
        
        // If still not found, check the moduleToEntry tracking
        if (id === undefined && importer) {
          id = moduleToEntry[importer];
        }
        
        // If we still can't find an entry, skip and let Vite handle it normally
        if (id === undefined) {
          return null;
        }
        
        // Track that this resolved module belongs to the same entry
        moduleToEntry[resolved.id] = id;
        
        // Keep extension at the end to make vite happy
        const uniqueId = `${name}?unique=${id}${dotExtension}`;
        return uniqueId;
      }
      return null;
    },
    // Load the unique imports by original id
    async load(id) {
      const regex = /(\?unique=\d+)/;
      if (regex.test(id)) {
        const loaded = await this.load({ id: id.replace(regex, '') });
        return loaded as LoadResult;
        console.log(`ZLoading module with unique ID: ${id} -> ${id.replace(regex, '')}`, loaded);
        if (loaded === undefined || loaded === null)
        // if (loaded === undefined || loaded.ast === null || loaded.code === null)
          throw new Error('Something went wrong');
        return {
          ...loaded,
          // ast: loaded.ast ?? undefined,
          code: loaded.code ?? '',
        };
      }
      return null;
    },
  };
}
