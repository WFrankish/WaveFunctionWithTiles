import { Pixel } from "./types";

export class MyImage {
    readonly data: ArrayBuffer;
    readonly height: number;
    readonly width: number;

    constructor(width: number, height: number, data: ArrayBuffer) {
        this.data = data;
        this.height = height;
        this.width = width;
    }

    getPixel(x: number, y: number): Pixel {
        const imageView = new Uint32Array(this.data);
        const i = this.findPixel(x, y);
    
        const pixelView = new Uint32Array([imageView[i]]);
        return new Uint8ClampedArray(pixelView.buffer);
    }

    setPixel(x: number, y: number, pixel: Pixel) {
        const imageView = new Uint32Array(this.data);
        const pixelView = new Uint32Array(pixel.buffer);
        const i = this.findPixel(x, y);
        imageView[i] = pixelView[0];
    }

    findPixel(x: number, y: number): number {
        let result = y;
        result *= this.width;
        result += x;
        return result;
    }

    static fromImage(image: ImageData): MyImage {
        return new MyImage(image.width, image.height, image.data.buffer);
    }

    static fromBlank(width: number, height: number): MyImage {
        return new MyImage(width, height, new Uint32Array(height * width).buffer)
    }

    static compare(a: MyImage, b: MyImage) {
        const av = new DataView(a.data);
        const bv = new DataView(b.data);
        let result = av.byteLength - bv.byteLength;

        for (let i = 0; i < av.byteLength && result == 0; i++) {
            result = av.getUint8(i) - bv.getUint8(i);
        }

        return result;
    }

    static equals(a: MyImage, b: MyImage) {
        const av = new DataView(a.data);
        const bv = new DataView(b.data);

        if (av.byteLength !== bv.byteLength) {
            return false;
        }

        for (let i = 0; i < av.byteLength; i++) {
            if (av.getUint8(i) !== bv.getUint8(i)) {
                return false;
            }
        }

        return true;
    }
}