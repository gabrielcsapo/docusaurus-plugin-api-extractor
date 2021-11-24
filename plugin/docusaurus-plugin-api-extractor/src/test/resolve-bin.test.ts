import { resolveBin } from '../resolve-bin';
import { resolve } from 'path';

test('it resolves the bin path', async () => {
  await expect(resolveBin('typescript', 'tsc')).resolves.toBe(
    resolve(
      __dirname,
      '../../../../common/temp/node_modules/.pnpm/typescript@4.4.4/node_modules/typescript/bin/tsc'
    )
  );
});

test('throws if the packageName is not given', async () => {
  // @ts-expect-error
  await expect(resolveBin(undefined, 'tsc')).rejects.toThrowError(
    'The first argument to require.resolve must be a string. Received null or undefined.'
  );
});

test('throws if the bin name is not given', async () => {
  // @ts-expect-error
  await expect(resolveBin('typescript')).rejects.toThrowError('Could not find bin script undefined');
});

test('throws if the package cannot be resolved', async () => {
  expect.assertions(1);

  await expect(resolveBin('notexistingpackage', 'foo')).rejects.toThrowError(
    /Cannot find module 'notexistingpackage' from/
  );
});
