export * from './sum';

/**
 * @public
 */
export const bar = 'bard';

/**
 * @public
 */
export const foo = 'fosso';

/**
 * @public
 */
export class Bizz {
  constructor(public bar = 'bar') {}
  /**
   * @public
   * @returns 1
   */
  foo(): number {
    return 1;
  }
}

/**
 * @public
 * Boxes an unknown value and unwraps it
 */
export class Box<T> {
  #boxee: T;
  constructor(boxee: T) {
    this.#boxee = boxee;
  }

  /**
   * Returns the raw underlying value
   * @returns T
   */
  unwrap(): T {
    return this.#boxee;
  }
}

/**
 * Constructor options for {@link (Animal:interface)}
 * @public
 */
export interface AnimalOptions {
  name: string;
}
/**
 * An interface to define an animal
 *
 * @example
 * Here's a simple example:
 *
 * ```ts
 * class Cow implements Animal {
 *   speak() {
 *     return 'mooo';
 *   }
 * }
 * ```
 *
 * @public
 */
export interface Animal {
  speak(): string;
}

/**
 * Gets a get
 * @public
 */
export interface Getter {
  get(): string;
}

/**
 * A Get class to get an empty string
 * @public
 */
export class Get implements Getter {
  get(): string {
    return '';
  }
}
