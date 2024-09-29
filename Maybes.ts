import { Left, type Maybe } from "purify-ts";
import { Equatable } from "./Equatable.js";

export namespace Maybes {
  export function equals<T>(
    leftMaybe: Maybe<T>,
    rightMaybe: Maybe<T>,
    valueEquals: (left: T, right: T) => boolean | Equatable.EqualsResult,
  ): Equatable.EqualsResult {
    if (leftMaybe.isJust()) {
      if (rightMaybe.isJust()) {
        return Equatable.EqualsResult.fromBooleanEqualsResult(
          leftMaybe,
          rightMaybe,
          valueEquals(leftMaybe.unsafeCoerce(), rightMaybe.unsafeCoerce()),
        );
      }
      return Left({
        left: leftMaybe.unsafeCoerce(),
        type: "RightNull",
      });
    }

    if (rightMaybe.isJust()) {
      return Left({
        right: rightMaybe.unsafeCoerce(),
        type: "LeftNull",
      });
    }

    return Equatable.EqualsResult.Equal;
  }

  // export function orThrowLazy<ValueT>(
  //   maybe: Maybe<ValueT>,
  //   orThrow: () => never,
  // ): ValueT {
  //   if (maybe.isJust()) {
  //     return maybe.extract() as ValueT;
  //   }
  //
  //   orThrow();
  // }
}
