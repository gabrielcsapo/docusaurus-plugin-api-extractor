import path from 'path';
import fs, { mkdirpSync } from 'fs-extra';
import type { LoadContext, Plugin } from '@docusaurus/types';
import { promisify } from 'util';
import { exec as _exec } from 'child_process';
import { resolveBin } from './resolve-bin';

import { generateDocs, ICategoryMetadatasFile } from './generate-docs';

// eslint-disable-next-line @typescript-eslint/typedef
const exec = promisify(_exec);

export interface IUserSuppliedOptions {
  outDir: string;
  srcDir: string;
  verbose?: boolean;
  force?: boolean;
  locale?: boolean;
}

/**
 * @public
 */
export interface IPluginOptions extends IUserSuppliedOptions {
  id: string;
  docsRoot: string;
  sidebarConfig: ICategoryMetadatasFile;
}

/**
 * @public
 */
export const DEFAULT_PLUGIN_OPTIONS: Partial<IPluginOptions> = {
  id: 'default',
  docsRoot: 'docs',
  outDir: 'api',
  sidebarConfig: {
    label: 'API'
  }
};

/**
 * @public
 * @param opts - options passed in via docusaurus.config.js
 * @returns - all options with default values if they are not defined
 */
export const getPluginOptions = (opts: IPluginOptions): IPluginOptions => {
  const options: IPluginOptions = {
    ...DEFAULT_PLUGIN_OPTIONS,
    ...opts
  };
  return options;
};

/**
 * Docusaurus plugin entrypoint
 * @public
 * @param context - global site context defined by docusaurus.
 * @param opts - options defined in docusaurus.config.js plugins array.
 * @returns
 */
export default function pluginDocusaurus(context: LoadContext): Plugin {
  const projectFolder: string = process.cwd();

  return {
    name: 'docusaurus-plugin-api-extractor',
    // eslint-disable-next-line @typescript-eslint/typedef
    extendCli(cli) {
      cli
        .command('api-extractor:init')
        .description('Initializes api-extractor for the project')
        .action(async () => {
          const binScript: string = await resolveBin('@microsoft/api-extractor', 'api-extractor');
          await exec(`${binScript} init`);
        });

      cli
        .command('api-extractor:run')
        .description('Generate API documentation')
        .option('-s, --srcDir <path>', 'Path to the sources files', 'src')
        .option(
          '-o, --outDir <name>',
          'Name of the directory that will be placed in the documentation root',
          'api'
        )
        .option('--force', 'Skips caching and forces the docs to be rebuilt', false)
        .option(
          '--local',
          `Indicates that API Extractor is running as part of a local build, e.g. on a developer's machine.`,
          true
        )
        .option('--verbose', 'Enable verbose logging', false)
        .action(
          async (
            options: IPluginOptions & {
              verbose: boolean;
              force: boolean;
              local: boolean;
            }
          ) => {
            const { siteDir } = context;
            const config: IPluginOptions = getPluginOptions(options);
            const outputDir: string = path.resolve(siteDir, config.docsRoot, config.outDir);

            if (!fs.existsSync(outputDir)) {
              mkdirpSync(outputDir);
            }
            await generateDocs(
              projectFolder,
              options.srcDir,
              outputDir,
              config.sidebarConfig,
              options.verbose,
              options.force,
              options.local
            );
          }
        );
    }
  };
}
