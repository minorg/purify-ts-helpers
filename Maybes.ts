import type { Maybe } from "purify-ts";

export namespace Maybes {
  export function equals<T>(
    left: Maybe<T>,
    right: Maybe<T>,
    equals: (left: T, right: T) => boolean,
  ) {
    if (left.isJust()) {
      if (right.isJust()) {
        return equals(left.unsafeCoerce(), right.unsafeCoerce());
      }
      return false;
    }

    if (right.isJust()) {
      return false;
    }

    return true;
  }

  export function orThrowLazy<ValueT>(
    maybe: Maybe<ValueT>,
    orThrow: () => never,
  ): ValueT {
    if (maybe.isJust()) {
      return maybe.extract() as ValueT;
    }

    orThrow();
  }
}
