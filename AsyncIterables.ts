export namespace AsyncIterables {
	export async function toArray<T>(
		asyncIterable: AsyncIterable<T>,
	): Promise<readonly T[]> {
		const values: T[] = [];
		for await (const value of asyncIterable) {
			values.push(value);
		}
		return values;
	}
}
