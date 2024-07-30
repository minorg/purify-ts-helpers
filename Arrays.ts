export namespace Arrays {
	export function equals<T>(
		left: readonly T[],
		right: readonly T[],
		equals: (left: T, right: T) => boolean,
	) {
		if (left.length !== right.length) {
			return false;
		}

		for (const leftElement of left) {
			if (!right.some((rightElement) => equals(leftElement, rightElement))) {
				return false;
			}
		}

		return true;
	}
}
