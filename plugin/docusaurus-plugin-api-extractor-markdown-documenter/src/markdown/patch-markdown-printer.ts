/**
 * mdast-util-to-markdown is what actually generates markdown in
 * remark. As part of this it will eagerly escape underscores when
 * they are part of "phrasing". This is problematic when a file path
 * for a link has underscores in it. When docusaurus validates links
 * it does a literal comparsion of the url and thus believes the
 * files don't exist.
 *
 * This is fixed in remark >= 14.0.0 however this requires that we use ESM.
 */

try {
  // eslint-disable-next-line @typescript-eslint/typedef
  const escapePatterns = require('mdast-util-to-markdown/lib/unsafe');

  // eslint-disable-next-line @typescript-eslint/typedef
  for (let i = escapePatterns.length - 1; i > 0; i--) {
    if (escapePatterns[i].character === '_') {
      escapePatterns.splice(i, 1);
    }
  }
} catch (e) {
  throw new Error(
    'Could not apply patch to markdown generate. Please open up an issue with the verion of this plugin'
  );
}
