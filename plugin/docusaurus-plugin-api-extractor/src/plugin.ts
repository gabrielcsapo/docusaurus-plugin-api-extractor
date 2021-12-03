import path from 'path';
import { promises as fs, existsSync } from 'fs';
import { mkdirpSync } from 'fs-extra';
import type { LoadContext, Plugin } from '@docusaurus/types';
import { promisify } from 'util';
import { exec as _exec } from 'child_process';

import { generateDocs } from './generate-docs';

// eslint-disable-next-line @typescript-eslint/typedef
const exec = promisify(_exec);

export interface ICLIOptions {
  outDir: string;
  srcDir: string;
  verbose?: boolean;
  force?: boolean;
  local?: boolean;
}

/**
 * @public
 */
export interface IPluginOptions {
  id: string;
  siteDir?: string;
}

interface IMergedPluginOptions extends IPluginOptions {
  siteDir: string;
  docsRoot: string;
  outDir: string;
  sidebarConfig: Record<string, string>;
}

/**
 * @public
 */
// eslint-disable-next-line @typescript-eslint/typedef
export const DEFAULT_PLUGIN_OPTIONS = {
  docsRoot: 'docs',
  outDir: 'api',
  sidebarConfig: {
    label: 'API'
  }
};

/**
 * @public
 * @param cliOptions - options passed in via docusaurus.config.js
 * @returns - all options with default values if they are not defined
 */
export const getPluginOptions = (
  cliOptions: ICLIOptions,
  pluginOptions: IPluginOptions,
  ctx: LoadContext
): IMergedPluginOptions => {
  return {
    ...DEFAULT_PLUGIN_OPTIONS,
    siteDir: ctx.siteDir,
    ...cliOptions,
    ...pluginOptions
  };
};

/**
 * Docusaurus plugin entrypoint
 * @public
 * @param context - global site context defined by docusaurus.
 * @param opts - options defined in docusaurus.config.js plugins array.
 * @returns
 */
export default function pluginDocusaurus(context: LoadContext, pluginOptions: IPluginOptions): Plugin {
  const projectFolder: string = process.cwd();

  return {
    name: 'docusaurus-plugin-api-extractor',
    // eslint-disable-next-line @typescript-eslint/typedef
    extendCli(cli) {
      cli
        .command('api-extractor:init')
        .description('Initializes api-extractor for the project')
        .action(async () => {
          const apiExtractor: string = require.resolve(
            path.join(process.cwd(), `./node_modules/.bin/api-extractor`)
          );
          await exec(`${apiExtractor} init`);
          await fs.writeFile(
            path.join(process.cwd(), 'api-documenter.json'),
            await fs.readFile(path.resolve(__dirname, './api-documenter.json', 'utf-8'))
          );
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
        .action(async (options: ICLIOptions) => {
          const config: IMergedPluginOptions = getPluginOptions(options, pluginOptions, context);
          const outputDir: string = path.resolve(config.siteDir, config.docsRoot, config.outDir);

          if (!existsSync(outputDir)) {
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
        });
    }
  };
}
