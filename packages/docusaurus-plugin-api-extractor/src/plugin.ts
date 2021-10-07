import path from "path";
import fs from "fs-extra";
import { exec } from "child_process";
import { LoadContext } from "@docusaurus/types";

/**
 * @public
 */
export interface PluginOptions {
  id: string;
  docsRoot: string;
  out: string;
  entryPoints?: string[];
  configFile: string;
}

/**
 * @public
 */
export const DEFAULT_PLUGIN_OPTIONS: PluginOptions = {
  id: "default",
  docsRoot: "docs",
  out: "api",
  configFile: path.resolve(__dirname, "..", "api-extractor.json"),
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
 * @param configFile - path to the tsconfig.json file
 * @param entryPoint - string path to the directory to run api-extractor on
 * @param out - output directory of built API documentation
 */
async function buildDocs(configFile: string, entryPoint: string, out: string) {
  await new Promise((resolve, reject) => {
    const command = `${require.resolve('@microsoft/api-extractor/bin/api-extractor')} run --local -c ${configFile} && ${require.resolve('@microsoft/api-documenter/bin/api-documenter')} markdown -i ${entryPoint} -o ${out}`;
    console.log(command);
    return exec(
      command,
      (err, stdout) => {
        if (err) {
          reject(err);
        } else {
          console.log(stdout);
          resolve(stdout);
        }
      }
    );
  });
}

let built = false;

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

  fs.removeSync(outputDir);
  fs.ensureDirSync(outputDir);

  if (!options.entryPoints) {
    throw new Error("entryPoints were not provided in configuration");
  }

  if(!built) {
    built = true;
    for (const entryPoint of options.entryPoints) {
      await buildDocs(options.configFile, path.resolve(process.cwd(), entryPoint), outputDir);
    }
  }

  return {
    name: "docusaurus-plugin-api-extractor",
  };
}
