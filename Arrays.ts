import { Left } from "purify-ts";
import { Equatable } from "./Equatable.js";

export namespace Arrays {
  export function equals<T>(
    leftArray: readonly T[],
    rightArray: readonly T[],
    elementEquals: (left: T, right: T) => boolean | Equatable.EqualsResult,
  ): Equatable.EqualsResult {
    if (leftArray.length !== rightArray.length) {
      return Left({
        left: leftArray,
        right: rightArray,
        type: "ArrayLength",
      });
    }

    for (
      let leftElementIndex = 0;
      leftElementIndex < leftArray.length;
      leftElementIndex++
    ) {
      const leftElement = leftArray[leftElementIndex];

      const rightUnequals: Equatable.EqualsResult.Unequal[] = [];
      for (
        let rightElementIndex = 0;
        rightElementIndex < rightArray.length;
        rightElementIndex++
      ) {
        const rightElement = rightArray[rightElementIndex];

        const leftElementEqualsRightElement =
          Equatable.EqualsResult.fromBooleanEqualsResult(
            leftElement,
            rightElement,
            elementEquals(leftElement, rightElement),
          );
        if (leftElementEqualsRightElement.isRight()) {
          break; // left element === right element, break out of the right iteration
        }
        rightUnequals.push(
          leftElementEqualsRightElement.extract() as Equatable.EqualsResult.Unequal,
        );
      }

      if (rightUnequals.length === rightArray.length) {
        // All right elements were unequal to the left element
        return Left({
          left: {
            array: leftArray,
            element: leftElement,
            elementIndex: leftElementIndex,
          },
          right: {
            array: rightArray,
            unequals: rightUnequals,
          },
          type: "ArrayElement",
        });
      }
      // Else there was a right element equal to the left element, continue to the next left element
    }

    return Equatable.EqualsResult.Equal;
  }
}
