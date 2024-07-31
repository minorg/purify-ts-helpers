import { type Maybe, Nothing } from "purify-ts";

export namespace Iterables {
  /**
   * Filter + map function over Iterables.
   *
   * Iterate over the given iterable, calling the map function for each value. If the map function returns a Just,
   * yield the Just. Otherwise continue iterating.
   */
  export function* filterMap<ValueT>(
    iterable: Iterable<ValueT>,
    map: (value: ValueT) => Maybe<ValueT>,
  ): Iterable<ValueT> {
    for (const value of iterable) {
      const mappedValue = map(value).extractNullable();
      if (mappedValue !== null) {
        yield mappedValue;
      }
    }
  }

  /**
   * Find + map function over Iterables.
   *
   * Iterate over the given iterable, calling the map function for each value. Return the first Just returned by the map
   * function and cease iterating. If the map function never returns Just, return Nothing.
   */
  export function findMap<ValueT>(
    iterable: Iterable<ValueT>,
    map: (value: ValueT) => Maybe<ValueT>,
  ): Maybe<ValueT> {
    for (const value of iterable) {
      const mappedValue = map(value);
      if (mappedValue.isJust()) {
        return mappedValue;
      }
    }
    return Nothing;
  }
}
