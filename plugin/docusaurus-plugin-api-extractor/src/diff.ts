import { ExtractorConfig } from '@microsoft/api-extractor';
import { existsSync, readFileSync, writeFileSync } from 'fs-extra';
import FSTree, { Patch } from 'fs-tree-diff';
import { dirname, join } from 'path';
import walkSync, { Entry } from 'walk-sync';

const enum CompactedKeys {
  BASE_PATHS,
  RELATIVE_PATHS,
  MTIMES,
  MODES,
  SIZES,
  COMPACTED_ENTRIES
}

function inflateEntries(schema: ICompactedEntries): Entry[] {
  const entries: Entry[] = [];
  for (let i: number = 0; i < schema[CompactedKeys.COMPACTED_ENTRIES].length; i += 5) {
    const basePath: string = schema[CompactedKeys.BASE_PATHS][schema[CompactedKeys.COMPACTED_ENTRIES][i]];
    const relativePath: string =
      schema[CompactedKeys.RELATIVE_PATHS][schema[CompactedKeys.COMPACTED_ENTRIES][i + 1]];
    const mode: number = schema[CompactedKeys.MODES][schema[CompactedKeys.COMPACTED_ENTRIES][i + 2]];
    const mtime: number = schema[CompactedKeys.MTIMES][schema[CompactedKeys.COMPACTED_ENTRIES][i + 3]];
    const size: number = schema[CompactedKeys.SIZES][schema[CompactedKeys.COMPACTED_ENTRIES][i + 4]];
    entries.push(new Entry(relativePath, basePath, mode, size, mtime));
  }
  return entries;
}

type Executor = () => Promise<void>;

export async function cached(
  extractorConfig: ExtractorConfig,
  srcDir: string,
  outDir: string,
  executor: Executor
): Promise<void> {
  const metaPath: string = join(outDir, '.api-extractor-meta');
  const entry: string = join(extractorConfig.projectFolder, srcDir);
  const newEntries: Entry[] = walkSync.entries(entry, {
    globs: ['**/**/*.ts']
  });

  if (extractorConfig.apiReportEnabled) {
    const apiReportEntry: Entry[] = walkSync.entries(dirname(extractorConfig.apiJsonFilePath), {
      globs: ['*.md']
    });

    newEntries.push(...apiReportEntry);
    newEntries.sort((a, b) => {
      if (a.relativePath === b.relativePath) {
        return 0;
      } else if (a.relativePath < b.relativePath) {
        return -1;
      }
      return 1;
    });
  }

  const newTree: FSTree<Entry> = FSTree.fromEntries(newEntries);
  const hasMeta: boolean = existsSync(metaPath);

  let patch: Patch;
  if (hasMeta) {
    const oldEntries: Entry[] = inflateEntries(JSON.parse(readFileSync(metaPath, 'utf-8')));
    const oldTree: FSTree<Entry> = FSTree.fromEntries(oldEntries);
    patch = oldTree.calculatePatch(newTree);
  } else {
    patch = newTree.calculatePatch(FSTree.fromEntries([]));
  }

  if (patch.length > 0 || !hasMeta) {
    await executor();
    writeFileSync(metaPath, JSON.stringify(compactEntries(newEntries)));
  }
}

interface ICompactedEntries {
  [CompactedKeys.BASE_PATHS]: string[];
  [CompactedKeys.RELATIVE_PATHS]: string[];
  [CompactedKeys.MTIMES]: number[];
  [CompactedKeys.MODES]: number[];
  [CompactedKeys.SIZES]: number[];
  [CompactedKeys.COMPACTED_ENTRIES]: number[];
}

function compactEntries(entries: Entry[]): ICompactedEntries {
  const schema: ICompactedEntries = {
    [CompactedKeys.BASE_PATHS]: [],
    [CompactedKeys.RELATIVE_PATHS]: [],
    [CompactedKeys.MODES]: [],
    [CompactedKeys.MTIMES]: [],
    [CompactedKeys.SIZES]: [],
    [CompactedKeys.COMPACTED_ENTRIES]: []
  };

  for (let i: number = 0; i < entries.length; i++) {
    const entry: Entry = entries[i];

    schema[CompactedKeys.COMPACTED_ENTRIES].push(push(CompactedKeys.BASE_PATHS, entry.basePath));
    schema[CompactedKeys.COMPACTED_ENTRIES].push(push(CompactedKeys.RELATIVE_PATHS, entry.relativePath));
    schema[CompactedKeys.COMPACTED_ENTRIES].push(push(CompactedKeys.MODES, entry.mode));
    schema[CompactedKeys.COMPACTED_ENTRIES].push(push(CompactedKeys.MTIMES, entry.mtime));
    schema[CompactedKeys.COMPACTED_ENTRIES].push(push(CompactedKeys.SIZES, entry.size));
  }

  return schema;

  function push(type: keyof Omit<ICompactedEntries, CompactedKeys.COMPACTED_ENTRIES>, item: unknown): number {
    switch (type) {
      case CompactedKeys.BASE_PATHS:
        return maybePush(schema[CompactedKeys.BASE_PATHS], item);
      case CompactedKeys.RELATIVE_PATHS:
        return maybePush(schema[CompactedKeys.RELATIVE_PATHS], item);
      case CompactedKeys.MODES:
        return maybePush(schema[CompactedKeys.MODES], item);
      case CompactedKeys.MTIMES:
        return maybePush(schema[CompactedKeys.MTIMES], item);
      case CompactedKeys.SIZES:
        return maybePush(schema[CompactedKeys.SIZES], item);
    }
  }
}

function maybePush(array: unknown[], item: unknown): number {
  const index: number = array.indexOf(item);
  if (index === -1) return array.push(item) - 1;
  return index;
}
