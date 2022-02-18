import path from 'path';
import { promises as fs, existsSync } from 'fs';
import { mkdirpSync } from 'fs-extra';
import type { LoadContext, Plugin } from '@docusaurus/types';
import { promisify } from 'util';
import { exec as _exec } from 'child_process';
import debugMessage from 'debug';

import {
  generateDocs,
  generateMarkdownFiles,
  generateTmpExtractorConfig,
  prepareExtratorConfig
} from './generate-docs';
import { ExtractorConfig, ExtractorResult } from '@microsoft/api-extractor';
import type { IConfigFile } from '@microsoft/api-extractor';
import { parse } from 'comment-json';

// eslint-disable-next-line @typescript-eslint/typedef
const debug = debugMessage('docusaurus-api-extractor:plugin');

// eslint-disable-next-line @typescript-eslint/typedef
const exec = promisify(_exec);

export interface ICLIOptions {
  outDir: string;
  verbose?: boolean;
  ci?: boolean;
}

interface IMaterializedCLIOptions extends ICLIOptions {
  verbose: boolean;
  ci: boolean;
}

/**
 * @public
 */
export interface IPluginOptions {
  id: string;
  siteDir?: string;
  entryPoints?: Record<string, string>;
}

interface IMergedPluginOptions {
  siteDir: string;
  entryPoints: Record<string, string>;
  docsRoot: string;
  outDir: string;
  sidebarConfig: Record<string, string>;
  ci: boolean;
  verbose: boolean;
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
 * @param cliOptions - options passed in via cli
 * @param pluginOptions - options passed in via docusaurus.config.js
 * @param ctx - docusaurus load context
 * @param configFile - extractorconfig JSON
 * @returns - all options with default values if they are not defined
 */
export const getPluginOptions = async (
  packageName: string,
  siteDir: string,
  cliOptions: ICLIOptions,
  pluginOptions: IPluginOptions,
  configFile: IConfigFile
): Promise<IMergedPluginOptions> => {
  const { outDir, ci, verbose } = cliOptions;

  const materizedCLIOptions: IMaterializedCLIOptions = {
    outDir,
    ci: ci ? true : false,
    verbose: verbose ? true : false
  };

  const config: IMergedPluginOptions = {
    ...DEFAULT_PLUGIN_OPTIONS,
    siteDir,
    entryPoints: {
      [packageName]: configFile.mainEntryPointFilePath
    },
    ...materizedCLIOptions,
    ...pluginOptions
  };

  const { outDir: mergedOutdir, docsRoot: mergedDocsRoot, siteDir: mergedSiteDir } = config;

  config.outDir = path.resolve(mergedSiteDir, mergedDocsRoot, mergedOutdir);

  return config;
};

/**
 * Docusaurus plugin entrypoint
 * @public
 * @param context - global site context defined by docusaurus.
 * @param opts - options defined in docusaurus.config.js plugins array.
 * @returns
 */
export default function pluginDocusaurus(context: LoadContext, pluginOptions: IPluginOptions): Plugin {
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
            await fs.readFile(path.resolve(__dirname, './api-documenter.json'), 'utf-8')
          );
        });

      cli
        .command('api-extractor:run')
        .description('Generate API documentation')
        .option(
          '-o, --outDir <name>',
          'Name of the directory that will be placed in the documentation root',
          'api'
        )
        .option(
          '--ci',
          `Indicates that API Extractor is running in CI and makes sure the public API hasn't changed`
        )
        .option('-v, --verbose', 'Enable verbose logging')
        .action(async (options: ICLIOptions) => {
          const configFile: IConfigFile = parse(await fs.readFile('api-extractor.json', 'utf-8'));
          const { siteDir: originalSiteDir } = context;

          const packageName: string = JSON.parse(await fs.readFile('package.json', 'utf-8')).name;

          const { ci, docsRoot, siteDir, outDir, entryPoints, verbose }: IMergedPluginOptions =
            await getPluginOptions(packageName, originalSiteDir, options, pluginOptions, configFile);

          if (!existsSync(outDir)) {
            mkdirpSync(outDir);
          }

          try {
            for (const packageName in entryPoints) {
              if (entryPoints.hasOwnProperty(packageName)) {
                generateTmpExtractorConfig(configFile, packageName, entryPoints[packageName]);

                console.log(`Extracing docs for "${packageName}"`);

                const extractorConfig: ExtractorConfig = prepareExtratorConfig(
                  packageName,
                  path.resolve('api-extractor.tmp.json')
                );

                debug(`Generating docs: "${packageName}"`);
                debug(`"${packageName}"'s entry ${entryPoints[packageName]}`);

                const extractorResult: ExtractorResult = await generateDocs(extractorConfig, verbose, ci);

                if (extractionFailed(extractorResult)) {
                  return;
                }
              }
            }

            if (process.exitCode !== 1) {
              await generateMarkdownFiles(process.cwd(), path.resolve(siteDir, docsRoot, outDir), configFile);
            }
          } catch (e) {
            process.exitCode = 1;
            console.error(e);
          } finally {
            await fs.unlink(path.resolve('api-extractor.tmp.json'));
          }
        });
    }
  };
}

function extractionFailed(extractorResult: ExtractorResult): boolean {
  if (!extractorResult.succeeded) {
    console.error(
      `API Extractor did with ${extractorResult?.errorCount} error(s)` +
        ` and ${extractorResult?.warningCount} warning(s)`
    );
    process.exitCode = 1;
    return true;
  }

  return false;
}
