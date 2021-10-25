import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { sync as resolve } from 'resolve';
import findUp from 'find-up';

export async function resolveBin(
  packageName: string,
  binName: string
): Promise<string> {
  const resolvedMain = resolve(packageName);
  const packageJSON = await findUp('package.json', {
    cwd: dirname(resolvedMain),
  });

  if (packageJSON) {
    const relativeBinPath: string = JSON.parse(
      readFileSync(packageJSON, 'utf-8')
    ).bin[binName];

    if (relativeBinPath === undefined)
      throw new Error(`Could not find bin script ${binName}`);

    return join(dirname(packageJSON), relativeBinPath);
  } else {
    throw new Error(`Could not find package.json for ${packageName}`);
  }
}
