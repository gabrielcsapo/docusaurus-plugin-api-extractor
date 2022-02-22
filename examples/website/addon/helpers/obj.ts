/**
 * Creates a mutable object
 * @frameworkItemType - Helper
 * @modulePath - addon/helpers/obj
 * @public
 *
 * @param a - left side
 * @returns an unknown object
 */
export default function obj(a: unknown): Record<string, unknown> {
  return { unknown: a };
}
