/* eslint-disable node/no-unpublished-import */
/* eslint-disable node/no-unsupported-features/es-syntax */
import { cached } from '../dist/diff';
import fixturify from 'fixturify';
import { existsSync, rmSync, statSync, writeFileSync } from 'fs';

const dir = {
  src: {
    'a.ts': 'let a;',
    'b.ts': 'let b;',
    c: {
      'd.ts': 'let d',
    },
  },
  temp: {
    'some-api.md': '',
  },
  out: {},
};

let extractorConfig;
beforeEach(() => {
  extractorConfig = {
    projectFolder: './fixtures',
    apiReportEnabled: true,
    apiJsonFilePath: './fixtures/temp/some-api.md',
  };
  fixturify.writeSync('fixtures', dir);
});

afterEach(() => {
  rmSync('./fixtures', { recursive: true });
});

test('idempotent update', async () => {
  expect.assertions(3);

  await cached(extractorConfig, 'src', './fixtures/out', async () => {
    await expect(true).toBe(true);
  });

  expect(existsSync('./fixtures/out/.api-extractor-meta')).toBe(true);

  await cached(extractorConfig, 'src', './fixtures/out', async () => {
    // should never happen
    await expect(true).toBe(false);
  });

  expect(existsSync('./fixtures/out/.api-extractor-meta')).toBe(true);
});

test('update', async () => {
  expect.assertions(5);

  await cached(extractorConfig, 'src', './fixtures/out', async () => {
    await expect(true).toBe(true);
  });

  expect(existsSync('./fixtures/out/.api-extractor-meta')).toBe(true);

  const oldStats = statSync('./fixtures/out/.api-extractor-meta');

  // sleep
  await new Promise((resolve) => {
    setTimeout(resolve, 200);
  });

  writeFileSync('./fixtures/src/f.ts', 'let f;');

  await cached(extractorConfig, 'src', './fixtures/out', async () => {
    // should be called because we wrote into the src/ dir
    await expect(true).toBe(true);
  });

  expect(existsSync('./fixtures/out/.api-extractor-meta')).toBe(true);
  const newStats = statSync('./fixtures/out/.api-extractor-meta');
  expect(newStats.mtime.getTime() > oldStats.mtime.getTime()).toBe(true);
});

test('updating the api md file busts the cache', async () => {
  expect.assertions(5);

  await cached(extractorConfig, 'src', './fixtures/out', async () => {
    await expect(true).toBe(true);
  });

  expect(existsSync('./fixtures/out/.api-extractor-meta')).toBe(true);

  const oldStats = statSync('./fixtures/out/.api-extractor-meta');

  // sleep
  await new Promise((resolve) => {
    setTimeout(resolve, 200);
  });

  writeFileSync('./fixtures/temp/some-api.md', '#hello');

  await cached(extractorConfig, 'src', './fixtures/out', async () => {
    // should be called because we wrote into the temp/some-api.md
    await expect(true).toBe(true);
  });

  expect(existsSync('./fixtures/out/.api-extractor-meta')).toBe(true);
  const newStats = statSync('./fixtures/out/.api-extractor-meta');
  expect(newStats.mtime.getTime() > oldStats.mtime.getTime()).toBe(true);
});
