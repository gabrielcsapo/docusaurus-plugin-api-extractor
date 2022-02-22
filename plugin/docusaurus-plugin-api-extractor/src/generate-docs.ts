import { dirname, join, resolve } from 'path';
import { existsSync } from 'fs';
import { mkdirpSync } from 'fs-extra';
import { ensureDirSync, writeFileSync } from 'fs-extra';
import { sync as glob } from 'glob';
import debugMessage from 'debug';
import { Extractor, ExtractorConfig, ExtractorLogLevel } from '@microsoft/api-extractor';
import type { ExtractorResult, IConfigFile } from '@microsoft/api-extractor';
import { ApiModel } from '@microsoft/api-extractor-model';
import { StandardMarkdownDocumenter } from 'standard-markdown-documenter';
import { ContainerNode } from 'standard-markdown-documenter/dist/interfaces';
import { SIDEBAR_VISITOR } from './sidebar-visitor';
import fs from 'fs';
import ejs from 'ejs';
import prettier from 'prettier';

const sidebar: string = fs.readFileSync(join(__dirname, './api-sidebar.ejs'), 'utf-8');
const tree: string = fs.readFileSync(join(__dirname, './api-sidebar-tree.ejs'), 'utf-8');

// eslint-disable-next-line @typescript-eslint/typedef
const sidebarTmpl = ejs.compile(sidebar);
// eslint-disable-next-line @typescript-eslint/typedef
const treeTmpl = ejs.compile(tree);

// eslint-disable-next-line @typescript-eslint/typedef
const debug = debugMessage('docusaurus-api-extractor:generate');

// TODO: we should use the right type for this, copied from https://github.com/facebook/docusaurus/blob/8d92e9bcf5cf533719b07b17db73facea788fac1/packages/docusaurus-plugin-content-docs/src/sidebars/generator.ts#L30
export interface ICategoryMetadatasFile {
  label?: string;
  position?: number;
  collapsed?: boolean;
  collapsible?: boolean;
  className?: string;
}

export function generateTmpExtractorConfig(
  configFile: IConfigFile,
  name: string,
  entryPoint: string,
  root: string = ''
): void {
  configFile.mainEntryPointFilePath = entryPoint;
  const safeName = name.replace('/', '.');
  const { apiReport, docModel, dtsRollup } = configFile;

  if (apiReport) {
    apiReport.reportFileName = `${safeName}.api.md`;
  }

  if (docModel && docModel.apiJsonFilePath) {
    const parts = docModel.apiJsonFilePath.split('/');
    parts[parts.length - 1] = `${safeName}.api.json`;
    docModel.apiJsonFilePath = parts.join('/');
  }

  if (dtsRollup && dtsRollup.untrimmedFilePath) {
    const parts = dtsRollup.untrimmedFilePath.split('/');
    parts[parts.length - 1] = `${safeName}.d.ts`;
    dtsRollup.untrimmedFilePath = parts.join('/');
  }

  writeFileSync(join(root, 'api-extractor.tmp.json'), JSON.stringify(configFile));
}

export function prepareExtratorConfig(name: string, configPath: string): ExtractorConfig {
  const configFile = ExtractorConfig.loadFile(configPath);
  return ExtractorConfig.prepare({
    configObject: configFile,
    configObjectFullPath: configPath,
    packageJson: {
      name
    },
    packageJsonFullPath: resolve('package.json')
  });
}

/**
 * Builds API documentation for a given directory.
 * @internal
 * @param extractorConfig - path to the main folder
 * @param srcDir - the source directory
 * @param outDir - the directory where we will emit docs
 * @param verbose - enables verbose mode for api-extractor
 * @param force - disables caching and forces the build to occur
 * @param inCI - flag for determining to turn local builds on and off
 */
export async function generateDocs(
  extractorConfig: ExtractorConfig,
  verbose: boolean,
  inCI: boolean
): Promise<ExtractorResult> {
  const reportDir = dirname(extractorConfig.reportFilePath);
  const tempReportDir = dirname(extractorConfig.reportTempFilePath);

  if (!existsSync(reportDir)) {
    mkdirpSync(reportDir);
  }

  if (!existsSync(tempReportDir)) {
    mkdirpSync(tempReportDir);
  }

  debug('projectFolder: %s', extractorConfig.packageFolder);

  return await generate(extractorConfig, verbose, inCI);
}

async function generate(
  extractorConfig: ExtractorConfig,
  verbose: boolean,
  inCI: boolean
): Promise<ExtractorResult> {
  const extractorResult = Extractor.invoke(extractorConfig, {
    typescriptCompilerFolder: join(extractorConfig.projectFolder, 'node_modules', 'typescript'),
    localBuild: !inCI,
    showVerboseMessages: verbose,
    // eslint-disable-next-line @typescript-eslint/typedef
    messageCallback(message) {
      if (
        (message.logLevel === 'warning' &&
          inCI &&
          message.text.includes('You have changed the public API signature for this project.')) ||
        message.text.includes('The API report file is missing.')
      ) {
        message.logLevel = ExtractorLogLevel.Error;
      }
    }
  });

  return extractorResult;
}

export async function generateMarkdownFiles(
  projectFolder: string,
  outDir: string,
  config: IConfigFile
): Promise<void> {
  try {
    ensureDirSync(outDir);

    const model = new ApiModel();
    const modelDir = config.docModel?.apiJsonFilePath
      ? dirname(config.docModel?.apiJsonFilePath).replace('<projectFolder>', projectFolder)
      : join(projectFolder, 'temp');

    const globs = glob(`${modelDir}/*.json`);

    for (const resolvedPath of globs) {
      model.loadPackage(resolvedPath);
    }

    const documenter = new StandardMarkdownDocumenter(model, outDir);

    await documenter.generateFiles();
    const sidebarNodes = await documenter.generateSidebar(SIDEBAR_VISITOR);

    const sidebarFile = prettier.format(
      sidebarTmpl({
        sideBarItems: sidebarNodes,
        dir: 'api',
        isSideBarItem,
        tree: treeTmpl
      }),
      { parser: 'babel', singleQuote: true }
    );

    writeFileSync(join(outDir, 'api-sidebar.js'), sidebarFile);
  } catch (e) {
    console.error(e);
    process.exitCode = 1;
  }
}

function isSideBarItem(items: string[] | ContainerNode[]): boolean {
  return Array.isArray(items) && typeof items[0] === 'object' && items[0] !== null && 'type' in items[0];
}
