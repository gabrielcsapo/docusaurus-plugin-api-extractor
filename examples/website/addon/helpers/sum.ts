/**
 * A helper that adds two numbers
 *
 * @frameworkItemType - Helper
 * @modulePath - addon/helpers/sum
 * @public
 *
 * @example
 * This is a helper that can be used in
 * ```ts
 * import sum from 'my-addon/helpers/sum';
 *
 * export default <template>{{sum 1 2}}</template>
 * ```
 *
 * @param a - left side
 * @param b - right side
 * @returns the sum of the left and right side
 */
export default function sum(a: number, b: number): number {
  return a + b;
}
