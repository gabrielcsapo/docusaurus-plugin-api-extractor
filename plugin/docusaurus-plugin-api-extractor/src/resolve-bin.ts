import { readFileSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import findUp from 'find-up';

export async function resolveBin(packageName: string, binName: string): Promise<string> {
  const resolvedMain: string = require.resolve(packageName);
  const packageJSON: string | undefined = await findUp('package.json', {
    cwd: dirname(resolvedMain)
  });

  if (packageJSON) {
    const relativeBinPath: string = JSON.parse(readFileSync(packageJSON, 'utf-8')).bin[binName];

    if (relativeBinPath === undefined) throw new Error(`Could not find bin script ${binName}`);

    const binPath: string = join(dirname(packageJSON), relativeBinPath);

    if (!existsSync(binPath)) {
      throw new Error('Resolution is not correct');
    }

    return binPath;
  } else {
    throw new Error(`Could not find package.json for ${packageName}`);
  }
}
