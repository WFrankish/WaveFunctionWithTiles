import { compare } from "./types";


export function map2D<S, T>(array: S[][], func: (s: S) => T): T[][] {
    return array.map(r => r.map(func));
}

export function binarySearch<T>(arr: T[], x: T, compare: compare<T>, start = 0, end = arr.length): number {
    if (start == end) {
        return start;
    }

    let mid = Math.floor((start + end) / 2);

    const result = compare(arr[mid], x);

    if (result === 0) {
        return mid;
    }

    if (result < 0) { // x is bigger
        return binarySearch(arr, x, compare, start, mid);
    } else {
        return binarySearch(arr, x, compare, mid + 1, end);
    }
}

export function max(arr: number[]): number {
    return arr.slice().sort((a, b) => b - a)[0];
}

export function doAsync(func: () => void) : Promise<void> {
    return new Promise(resolve => {
        setTimeout(() => {
            func();
            resolve();
        }, 1);
    });
}