/* eslint-disable node/no-unsupported-features/es-syntax */
import { resolveBin } from '../dist/resolve-bin';
import { join } from 'path';

test('it resolves the bin path', async () => {
  await expect(resolveBin('typescript', 'tsc')).resolves.toBe(
    join(process.cwd(), 'node_modules', 'typescript', 'bin', 'tsc')
  );
});

test('throws if the packageName is not given', async () => {
  await expect(resolveBin(undefined, 'tsc')).rejects.toThrowError('Path must be a string.');
});

test('throws if the bin name is not given', async () => {
  await expect(resolveBin('typescript')).rejects.toThrowError('Could not find bin script undefined');
});

test('throws if the package cannot be resolved', async () => {
  expect.assertions(1);

  await expect(resolveBin('notexistingpackage', 'foo')).rejects.toThrowError(
    /Cannot find module 'notexistingpackage' from/
  );
});
