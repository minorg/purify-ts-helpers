import { Either, Left, type Maybe } from "purify-ts";
import { Arrays } from "./Arrays.js";
import { Maybes } from "./Maybes.js";

export interface Equatable<T> {
  equals(other: T): Equatable.EqualsResult;
}

export namespace Equatable {
  /**
   * Compare two arrays of Equatables and return an EqualsResult.
   */
  export function arrayEquals<T extends Equatable<T>>(
    leftArray: readonly T[],
    rightArray: readonly T[],
  ): EqualsResult {
    return Arrays.equals(leftArray, rightArray, (leftModel, rightModel) =>
      leftModel.equals(rightModel),
    );
  }

  /**
   * Compare two objects with equals(other: T): boolean methods and return an EqualsResult.
   */
  export function booleanEquals<T extends { equals: (other: T) => boolean }>(
    left: T,
    right: T,
  ): EqualsResult {
    return Equatable.EqualsResult.fromBooleanEqualsResult(
      left,
      right,
      left.equals(right),
    );
  }

  /**
   * Compare two objects with equals(other: T): EqualsResult and return the EqualsResult.
   *
   * This is typically used as a property value comparator in objectEquals.
   */
  export function equals<T extends Equatable<T>>(
    left: T,
    right: T,
  ): EqualsResult {
    return left.equals(right);
  }

  export type EqualsResult = Either<EqualsResult.Unequal, true>;

  export namespace EqualsResult {
    export const Equal: EqualsResult = Either.of<Unequal, true>(true);

    export function fromBooleanEqualsResult(
      left: any,
      right: any,
      equalsResult: boolean | EqualsResult,
    ): EqualsResult {
      if (typeof equalsResult !== "boolean") {
        return equalsResult;
      }

      if (equalsResult) {
        return Equal;
      }
      return Left({
        left,
        right,
        type: "BooleanEquals",
      });
    }

    export type Unequal =
      | {
          readonly left: {
            readonly array: readonly any[];
            readonly element: any;
            readonly elementIndex: number;
          };
          readonly right: {
            readonly array: readonly any[];
            readonly unequals: readonly Unequal[];
          };
          readonly type: "ArrayElement";
        }
      | {
          readonly left: readonly any[];
          readonly right: readonly any[];
          readonly type: "ArrayLength";
        }
      | {
          readonly left: any;
          readonly right: any;
          readonly type: "BooleanEquals";
        }
      | {
          readonly left: any;
          readonly right: any;
          readonly type: "LeftError";
        }
      | {
          readonly error: Error;
          readonly type: "LeftPropertyAccess";
        }
      | {
          readonly right: any;
          readonly type: "LeftNull";
        }
      | {
          readonly left: bigint | boolean | number | string;
          readonly right: bigint | boolean | number | string;
          readonly type: "Primitive";
        }
      | {
          readonly left: object;
          readonly right: object;
          readonly propertyName: string;
          readonly propertyValuesUnequal: Unequal;
          readonly type: "Property";
        }
      | {
          readonly left: any;
          readonly right: any;
          readonly type: "RightError";
        }
      | {
          readonly error: Error;
          readonly type: "RightPropertyAccess";
        }
      | {
          readonly left: any;
          readonly type: "RightNull";
        };
  }

  /**
   * Compare the Equatable values of two Maybes and return an EqualsResult.
   */
  export function maybeEquals<T extends Equatable<T>>(
    leftMaybe: Maybe<T>,
    rightMaybe: Maybe<T>,
  ): EqualsResult {
    return Maybes.equals(leftMaybe, rightMaybe, (left, right) =>
      left.equals(right),
    );
  }

  /**
   * Nop comparison of two null values, returning an EqualsResult.
   *
   * Typically used as a property value comparator in objectEquals when both property values are guaranteed to be null.
   */
  export function nullEquals(_left: null, _right: null): EqualsResult {
    return Equatable.EqualsResult.Equal;
  }

  /**
   * Compare the properties of two objects and return an EqualsResult.
   * @param leftObject
   * @param rightObject
   * @param propertyValuesEqual object specifying property comparators, typically other Equatable.* functions
   */
  export function objectEquals<ObjectT extends object>(
    leftObject: ObjectT,
    rightObject: ObjectT,
    propertyValuesEqual: Partial<{
      [PropertyName in keyof ObjectT]: (
        leftPropertyValue: ObjectT[PropertyName],
        rightPropertyValue: ObjectT[PropertyName],
      ) => boolean | EqualsResult;
    }>,
  ): EqualsResult {
    for (const propertyName of Object.keys(propertyValuesEqual)) {
      const propertyNameKeyof = propertyName as keyof ObjectT;

      let leftPropertyValue: ObjectT[keyof ObjectT];
      try {
        leftPropertyValue = leftObject[propertyNameKeyof];
      } catch (e) {
        return Left({
          left: leftObject,
          right: rightObject,
          propertyName,
          propertyValuesUnequal: {
            error: e as Error,
            type: "LeftPropertyAccess",
          },
          type: "Property",
        });
      }

      let rightPropertyValue: ObjectT[keyof ObjectT];
      try {
        rightPropertyValue = rightObject[propertyNameKeyof];
      } catch (e) {
        return Left({
          left: leftObject,
          right: rightObject,
          propertyName,
          propertyValuesUnequal: {
            error: e as Error,
            type: "RightPropertyAccess",
          },
          type: "Property",
        });
      }

      // biome-ignore lint/style/noNonNullAssertion: <explanation>
      const booleanOrEqualsResult = propertyValuesEqual[propertyNameKeyof]!(
        leftPropertyValue,
        rightPropertyValue,
      );

      let propertyValuesUnequal: EqualsResult.Unequal;
      if (typeof booleanOrEqualsResult === "boolean") {
        if (booleanOrEqualsResult) {
          continue; // To the next property
        }
        propertyValuesUnequal = {
          left: leftPropertyValue,
          right: rightPropertyValue,
          type: "BooleanEquals",
        };
      } else if (booleanOrEqualsResult.isRight()) {
        continue; // To the next property
      } else {
        propertyValuesUnequal =
          booleanOrEqualsResult.extract() as EqualsResult.Unequal;
      }

      return Left({
        left: leftObject,
        right: rightObject,
        propertyName,
        propertyValuesUnequal: propertyValuesUnequal,
        type: "Property",
      });
    }

    return EqualsResult.Equal;
  }

  /**
   * Compare two values for strict equality (===), returning an EqualsResult rather than a boolean.
   */
  export function strictEquals<T extends bigint | boolean | number | string>(
    left: T,
    right: T,
  ): EqualsResult {
    return EqualsResult.fromBooleanEqualsResult(left, right, left === right);
  }
}
