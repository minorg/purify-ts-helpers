import { type Either, Left } from "purify-ts";
import { Equatable } from "./Equatable.js";

export namespace Eithers {
  export function equals<L, R>(
    leftEither: Either<L, R>,
    rightEither: Either<L, R>,
    leftEquals: (left: L, right: L) => boolean | Equatable.EqualsResult,
    rightEquals: (left: R, right: R) => boolean | Equatable.EqualsResult,
  ): Equatable.EqualsResult {
    if (leftEither.isLeft()) {
      if (rightEither.isLeft()) {
        return Equatable.EqualsResult.fromBooleanEqualsResult(
          leftEither.extract(),
          rightEither.extract(),
          leftEquals(leftEither.extract() as L, rightEither.extract() as L),
        );
      }
      return Left({
        right: rightEither.extract(),
        type: "LeftError",
      });
    }
    if (rightEither.isLeft()) {
      return Left({
        left: leftEither.unsafeCoerce(),
        type: "RightError",
      });
    }
    return Equatable.EqualsResult.fromBooleanEqualsResult(
      leftEither.unsafeCoerce(),
      rightEither.unsafeCoerce(),
      rightEquals(leftEither.unsafeCoerce(), rightEither.unsafeCoerce()),
    );
  }
}
