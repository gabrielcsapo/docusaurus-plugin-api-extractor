import util from 'util';
import { join, resolve } from 'path';
import { ensureDirSync, writeFileSync } from 'fs-extra';
import child_process from 'child_process';
import { cached } from './diff';
import { resolveBin } from './resolve-bin';
import debugMessage from 'debug';

// eslint-disable-next-line @typescript-eslint/typedef
const debug = debugMessage('docusaurus-api-extractor:generate');

// eslint-disable-next-line @typescript-eslint/typedef
const exec = util.promisify(child_process.exec);

import { Extractor, ExtractorConfig, ExtractorResult, ExtractorLogLevel } from '@microsoft/api-extractor';

// TODO: we should use the right type for this, copied from https://github.com/facebook/docusaurus/blob/8d92e9bcf5cf533719b07b17db73facea788fac1/packages/docusaurus-plugin-content-docs/src/sidebars/generator.ts#L30
export interface ICategoryMetadatasFile {
  label?: string;
  position?: number;
  collapsed?: boolean;
  collapsible?: boolean;
  className?: string;
}

/**
 * Builds API documentation for a given directory.
 * @internal
 * @param projectFolder - path to the main folder
 * @param tsConfigFile - path to the tsconfig.json file
 * @param entryPoint - string path to the directory to run api-extractor on
 * @param outDir - output directory of built API documentation
 */
export async function generateDocs(
  projectFolder: string,
  srcDir: string,
  outDir: string,
  sidebarConfig: ICategoryMetadatasFile,
  verbose: boolean = false,
  force: boolean = false,
  local: boolean = false
): Promise<void> {
  ensureDirSync(outDir);

  const extractorConfig: ExtractorConfig = ExtractorConfig.loadFileAndPrepare(
    join(projectFolder, 'api-extractor.json')
  );

  debug('projectFolder: %s', extractorConfig.packageFolder);
  if (force) {
    await generate(extractorConfig, outDir, sidebarConfig, verbose, local);
  } else {
    await cached(extractorConfig, srcDir, outDir, async () => {
      await generate(extractorConfig, outDir, sidebarConfig, verbose, local);
    });
  }
}

async function generate(
  extractorConfig: ExtractorConfig,
  outDir: string,
  sidebarConfig: ICategoryMetadatasFile,
  verbose: boolean,
  local: boolean
): Promise<void> {
  const extractorResult: ExtractorResult = Extractor.invoke(extractorConfig, {
    typescriptCompilerFolder: join(extractorConfig.projectFolder, 'node_modules', 'typescript'),
    localBuild: local,
    showVerboseMessages: verbose,
    // eslint-disable-next-line @typescript-eslint/typedef
    messageCallback(message) {
      if (
        (message.logLevel === 'warning' &&
          !local &&
          message.text.includes(
            'You have changed the public API signature for this project. Please copy the file'
          )) ||
        message.text.includes('The API report file is missing.')
      ) {
        message.logLevel = ExtractorLogLevel.Error;
      }
    }
  });

  if (!local && extractorResult.apiReportChanged) {
    return;
  }

  if (extractorResult.succeeded) {
    try {
      const cmd: string = `${await resolveBin(
        '@microsoft/api-documenter',
        'api-documenter'
      )} generate -i ${resolve(extractorConfig.projectFolder, 'temp')} -o ${outDir}`;

      debug('documeter cmd: %s', cmd);

      const { stdout, stderr } = await exec(cmd, {
        cwd: __dirname
      });

      console.log(stdout);

      if (stderr) {
        throw stderr;
      }

      writeFileSync(join(outDir, '_category_.json'), JSON.stringify(sidebarConfig, null, 4));
    } catch (e) {
      console.error(e);
      process.exitCode = 1;
    }
  } else {
    console.error(
      `API Extractor completed with ${extractorResult.errorCount} errors` +
        ` and ${extractorResult.warningCount} warnings`
    );
    process.exitCode = 1;
  }
}
