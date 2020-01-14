import { compare } from "./types";
import { binarySearch } from "./utils";

type entry<T> = {
    key: number,
    value: T
}
export class MySet<T> {
    readonly set: entry<T>[];

    readonly compare: compare<T>;

    constructor(compare: compare<T>) {
        this.set = [];
        this.compare = compare;
    }

    add(t: T): number {
        const i = binarySearch(this.set.map(s => s.value), t, this.compare);

        const found: entry<T> | undefined = this.set[i];

        if (found == undefined || this.compare(found.value, t) !== 0) {
            const entry = { key: this.set.length, value: t }
            this.set.splice(i, 0, entry);
            return entry.key;
        } else {
            return found.key;
        }
    }
}