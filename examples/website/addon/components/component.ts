/**
 * @internal
 */
export class Component<T> {
  args: T;
  constructor(args: T) {
    this.args = args;
  }
}
