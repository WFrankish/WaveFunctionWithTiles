import { MyImage } from "./myImage";
import { max } from "./utils";

export function loadImage(canvas: HTMLCanvasElement, imgSrc: string): Promise<ImageData> {
    const img = document.createElement("img");
    img.src = imgSrc;
    return new Promise((resolve, reject) => {
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;

            canvas.style.width = 2 * img.width + "px";
            canvas.style.height = 2 * img.height + "px";

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

export function writeImage(canvas: HTMLCanvasElement, keys: number[][], tilewidth: number, tileHeight: number): ImageData {
    const maxValue = max(keys.map(max));
    const pixels = createPixels(maxValue);

    const width = keys[0].length;
    const height = keys.length;
    canvas.width = width;
    canvas.height = height;

    canvas.style.width = 2 * tilewidth * width + "px";
    canvas.style.height = 2 * tileHeight * height + "px";

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
        ctx.putImageData(img, 0, 0);

        return img;
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

    }

    return resultView.buffer;
}