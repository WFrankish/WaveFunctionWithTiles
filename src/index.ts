import { map2D, max } from "./utils";
import { MyImage } from "./myImage";
import { MySet } from "./mySet";
import { loadImage, tileify, createPixels, writeImage } from "./image";

function docReady(func: () => void) {
    // see if DOM is already available
    if (document.readyState === "complete" || document.readyState === "interactive") {
        // call on next available tick
        setTimeout(func, 1);
    } else {
        document.addEventListener("DOMContentLoaded", func);
    }
}

function init() {
    const button = document.getElementById("run") as HTMLButtonElement;

    button.onclick = run;
}

function run() {
    const set = new MySet(MyImage.compare);

    const original = document.getElementById("original") as HTMLCanvasElement;
    const training = document.getElementById("training") as HTMLCanvasElement;
    const tilesize = (document.getElementById("tilesize") as HTMLInputElement).valueAsNumber;

    loadImage(original, "input.png")
        .then(MyImage.fromImage)
        .then(img => tileify(img, tilesize, tilesize))
        .then(tiles => map2D(tiles, t => set.add(t)))
        .then(keys => writeImage(training, keys, tilesize, tilesize));
}

docReady(init);