import { MyImage } from "./myImage";
import { doAsync } from "./utils";

export function loadImage(canvas: HTMLCanvasElement, imgSrc: string): Promise<ImageData> {
    const img = document.createElement("img");
    img.src = imgSrc;
    return new Promise((resolve, reject) => {
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;

            canvas.style.width = img.width + "px";
            canvas.style.height = img.height + "px";

            const ctx = canvas.getContext("2d");
            if (ctx !== null) {
                ctx.drawImage(img, 0, 0);
                resolve(ctx.getImageData(0, 0, img.width, img.height));
            } else {
                reject(Error("ctx is null"));
            }
        }
    });
}

export async function writePixels(canvas: HTMLCanvasElement, keys: number[][], pixels: ArrayBuffer, tileWidth: number, tileHeight: number): Promise<ImageData> {
    const width = keys[0].length;
    const height = keys.length;
    canvas.width = width;
    canvas.height = height;

    canvas.style.width = tileWidth * width + "px";
    canvas.style.height = tileHeight * height + "px";

    const ctx = canvas.getContext("2d");
    if (ctx !== null) {
        const img = ctx.createImageData(width, height);
        const myImage = MyImage.fromImage(img);
        const palleteView = new Uint32Array(pixels);

        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                const key = keys[y][x];
                const pixelView = new Uint32Array([palleteView[key]]);
                const pixel = new Uint8ClampedArray(pixelView.buffer);
                myImage.setPixel(x, y, pixel);
            }
        }

        doAsync(() => ctx.putImageData(img, 0, 0));

        return img;
    } else {
        throw Error("ctx is null");
    }
}

export async function writeImage(canvas: HTMLCanvasElement, image: MyImage, tileWidth: number, tileHeight: number): Promise<MyImage> {
    const ctx = canvas.getContext("2d");

    canvas.width = image.width;
    canvas.height = image.height;

    canvas.style.width = tileWidth * image.width + "px";
    canvas.style.height = tileHeight * image.height + "px";

    if (ctx !== null) {
        const img = ctx.createImageData(image.width, image.height);

        const outputView = new Uint8Array(img.data.buffer);
        const inputView = new Uint8Array(image.data);

        for (let i = 0; i < inputView.byteLength; i++) {
            outputView[i] = inputView[i];
        }

        doAsync(() => ctx.putImageData(img, 0, 0));

        return image;
    } else {
        throw Error("ctx is null");
    }
}

export function tileify(image: MyImage, tileWidth: number, tileHeight: number): MyImage[][] {
    if (image.width % tileWidth !== 0) {
        throw Error("invalid width");
    }

    if (image.height % tileHeight !== 0) {
        throw Error("invalid height");
    }

    const result: MyImage[][] = [];
    for (let y = 0; y < image.height; y += tileHeight) {
        const row: MyImage[] = [];
        for (let x = 0; x < image.width; x += tileWidth) {
            const tile = MyImage.fromBlank(tileWidth, tileHeight);
            for (let yi = 0; yi < tileHeight && y + yi < image.height; yi++) {
                for (let xi = 0; xi < tileWidth && x + xi < image.width; xi++) {
                    const pixel = image.getPixel(x + xi, y + yi);
                    tile.setPixel(xi, yi, pixel);
                }
            }
            row.push(tile);
        }
        result.push(row);
    }

    return result;
}

export function untileify(tiles: MyImage[][], tileWidth: number, tileHeight: number): MyImage {
    const height = tiles.length;
    const width = tiles[0].length;
    const image = MyImage.fromBlank(width * tileWidth, height * tileHeight);

    for (let x = 0; x < height; x++) {
        const column = tiles[x];
        for (let y = 0; y < width; y++) {
            const tile = column[y];
            for (let yi = 0; yi < tileHeight; yi++) {
                for (let xi = 0; xi < tileWidth; xi++) {
                    const pixel = tile.getPixel(xi, yi);
                    image.setPixel(x * tileWidth + xi, y * tileWidth + yi, pixel);
                }
            }
        }
    }

    return image;
}

export function createPixels(count: number): ArrayBuffer {
    const resultView = new Uint32Array(count);
    if (count < 255) {
        const dv = Math.floor(255 / count);
        for (let i = 0; i < count; i++) {
            const v = i * dv;
            const pixelView = new Uint8ClampedArray([v, v, v, 255]).buffer;
            resultView[i] = new Uint32Array(pixelView)[0];
        }
    } else {
        for (let i = 0; i < count; i++) {
            resultView[i] = i;
        }
    }

    return resultView.buffer;
}

export function keysFromPixels(img: MyImage, pixels: ArrayBuffer): number[][] {
    const pallete = [...new Uint32Array(pixels)];

    const result: number[][] = [];
    for (let x = 0; x < img.width; x++) {
        const row: number[] = [];
        for (let y = 0; y < img.height; y++) {
            const pixel = new Uint32Array(img.getPixel(x, y).buffer)[0];
            row.push(pallete.indexOf(pixel));
        }
        result.push(row);
    }

    return result;
}