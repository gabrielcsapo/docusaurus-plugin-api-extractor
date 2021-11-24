/**
 * This is simply here until https://github.com/stefanpenner/fs-tree-diff/pull/94 is released. Jest will yack on these files if we don't remove them.
 */

const fs = require('fs-extra');
const glob = require('glob');
const path = require('path');

const declarationFiles = glob.sync(
  path.resolve(
    __dirname,
    '../../../common/temp/node_modules/.pnpm/fs-tree-diff@2.0.1/node_modules/fs-tree-diff/lib'
  ) + '/*.d.ts'
);

const tsSourceFiles = glob.sync(
  path.resolve(
    __dirname,
    '../../../common/temp/node_modules/.pnpm/fs-tree-diff@2.0.1/node_modules/fs-tree-diff/lib'
  ) + '/*.ts'
);

for (const file of tsSourceFiles) {
  if (!declarationFiles.includes(file)) {
    fs.unlinkSync(file);
  }
}
