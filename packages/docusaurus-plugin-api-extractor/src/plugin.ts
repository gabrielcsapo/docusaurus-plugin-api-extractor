import path from "path";
import fs from "fs-extra";
import child_process from "child_process";
import { LoadContext } from "@docusaurus/types";
import util from 'util';

const exec = util.promisify(child_process.exec);

import {
  Extractor,
  ExtractorConfig,
  ExtractorResult,
} from "@microsoft/api-extractor";

// TODO: we should use the right type for this, copied from https://github.com/facebook/docusaurus/blob/8d92e9bcf5cf533719b07b17db73facea788fac1/packages/docusaurus-plugin-content-docs/src/sidebars/generator.ts#L30
type CategoryMetadatasFile = {
  label?: string;
  position?: number;
  collapsed?: boolean;
  collapsible?: boolean;
  className?: string;
};

/**
 * @public
 */
export interface PluginOptions {
  id: string;
  docsRoot: string;
  out: string;
  entryPoint?: string;
  tsConfigFile?: string;
  projectFolder?: string;
  sidebarConfig: CategoryMetadatasFile;
}

/**
 * @public
 */
export const DEFAULT_PLUGIN_OPTIONS: PluginOptions = {
  id: "default",
  docsRoot: "docs",
  out: "api",
  sidebarConfig: {
    label: "API"
  }
};

/**
 * @public
 * @param opts - options passed in via docusaurus.config.js
 * @returns - all options with default values if they are not defined
 */
export const getPluginOptions = (
  opts: Partial<PluginOptions>
): PluginOptions => {
  const options = {
    ...DEFAULT_PLUGIN_OPTIONS,
    ...opts,
  };
  return options;
};

/**
 * Builds API documentation for a given directory.
 * @internal
 * @param projectFolder - path to the main folder
 * @param tsConfigFile - path to the tsconfig.json file
 * @param entryPoint - string path to the directory to run api-extractor on
 * @param out - output directory of built API documentation
 */
async function buildDocs(
  projectFolder: string,
  tsConfigFile: string,
  entryPoint: string,
  sidebarConfig: CategoryMetadatasFile,
  out: string
) {
  fs.ensureDirSync(out);
    const extractorConfig = ExtractorConfig.prepare({
      packageJsonFullPath: path.resolve(projectFolder, "package.json"),
      configObjectFullPath: undefined,
      configObject: {
        mainEntryPointFilePath: path.resolve(process.cwd(), entryPoint),
        projectFolder: projectFolder,
        compiler: {
          tsconfigFilePath: path.resolve(process.cwd(), tsConfigFile),
          skipLibCheck: false,
        },
        bundledPackages: [],
        newlineKind: "crlf",
        apiReport: {
          enabled: true,
          reportFileName: "<unscopedPackageName>.api.md",
          reportFolder: "<projectFolder>/temp/",
          reportTempFolder: "<projectFolder>/temp/",
        },
        docModel: {
          enabled: true,
          apiJsonFilePath: "<projectFolder>/temp/<unscopedPackageName>.api.json",
        },
        dtsRollup: {
          enabled: true,
          untrimmedFilePath: "<projectFolder>/dist/<unscopedPackageName>.d.ts",
          betaTrimmedFilePath: "",
          publicTrimmedFilePath: "",
          omitTrimmingComments: false,
        },
        tsdocMetadata: {
          enabled: true,
          tsdocMetadataFilePath: "<lookup>",
        },
        testMode: false,
      },
    });
  
    // Invoke API Extractor
    const extractorResult: ExtractorResult = Extractor.invoke(extractorConfig, {
      // Equivalent to the "--local" command-line parameter
      localBuild: true,
  
      // Equivalent to the "--verbose" command-line parameter
      showVerboseMessages: true,
    });
  
    if (extractorResult.succeeded) {
      console.log(`API Extractor completed successfully`);
      console.log(extractorResult);

      const { stdout, stderr } = await exec(`${require.resolve(
        "@microsoft/api-documenter/bin/api-documenter"
      )} generate -i ${path.resolve(projectFolder, "temp")} -o ${path.resolve(projectFolder, "temp", 'built')}`,
      {
        cwd: __dirname,
      })

      console.log(`${stdout}`);
      console.error(`${stderr}`);
  
      fs.writeFileSync(
        path.resolve(process.cwd(), out, "_category_.json"),
        JSON.stringify(
          sidebarConfig,
          null,
          4
        )
      );

      fs.copySync(path.resolve(projectFolder, "temp", 'built'), path.resolve(
        process.cwd(),
        out
      ))

      fs.removeSync(path.resolve(projectFolder, 'temp'));  
    } else {
      console.log(`API Extractor completed with ${extractorResult.errorCount} errors` +
      ` and ${extractorResult.warningCount} warnings`)
    }
}

/**
 * Docusaurus plugin entrypoint
 * @public
 * @param context - global site context defined by docusaurus.
 * @param opts - options defined in docusaurus.config.js plugins array.
 * @returns
 */
 export default async function pluginDocusaurus(
  context: LoadContext,
  opts: Partial<PluginOptions>
) {
  const { siteDir } = context;
  const options = getPluginOptions(opts);
  const outputDir = path.resolve(siteDir, options.docsRoot, options.out);

  if (!options?.entryPoint) {
    throw new Error("entryPoints were not provided in configuration");
  }

  if (!options?.tsConfigFile) {
    throw new Error("tsConfigFile were not provided in configuration");
  }

  if (!options?.projectFolder) {
    throw new Error("projectFolder were not provided in configuration");
  }

  if(!fs.existsSync(outputDir)) {
    await buildDocs(
      options.projectFolder,
      options.tsConfigFile,
      path.resolve(process.cwd(), options.entryPoint),
      options.sidebarConfig,
      outputDir
    );
  }

  return {
    name: "docusaurus-plugin-api-extractor",
    extendCli(cli: any) {
      cli
        .command('api-extractor:build')
        .description('Build docs')
        .action(async () => {
          fs.removeSync(outputDir)
          fs.ensureDirSync(outputDir);

          if (!options?.entryPoint) {
            throw new Error("entryPoints were not provided in configuration");
          }
        
          if (!options?.tsConfigFile) {
            throw new Error("tsConfigFile were not provided in configuration");
          }
        
          if (!options?.projectFolder) {
            throw new Error("projectFolder were not provided in configuration");
          }

          await buildDocs(
            options.projectFolder,
            options.tsConfigFile,
            path.resolve(process.cwd(), options.entryPoint),
            options.sidebarConfig,
            outputDir
          );
        });
    }
  };
}
