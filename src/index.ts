import { map2D, max } from "./utils";
import { MyImage } from "./myImage";
import { MySet } from "./mySet";
import { loadImage, tileify, createPixels, writePixels, writeImage, keysFromPixels, untileify } from "./image";
import { runModel } from "./wavefunction";

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

    const original = document.getElementById("original") as HTMLCanvasElement;
    loadImage(original, "input.png");

    for(let i = 0; i < 5; i++){
        writeMessage("");
    }
}

function run() {
    const set = new MySet(MyImage.compare);

    const original = document.getElementById("original") as HTMLCanvasElement;
    const training = document.getElementById("training") as HTMLCanvasElement;
    const generated = document.getElementById("generated") as HTMLCanvasElement;
    const output = document.getElementById("output") as HTMLCanvasElement;

    const tileSize = (document.getElementById("tilesize") as HTMLInputElement).valueAsNumber;
    const outputSize = (document.getElementById("outputsize") as HTMLInputElement).valueAsNumber;
    const seed = (document.getElementById("seed") as HTMLInputElement).valueAsNumber;

    const n = (document.getElementById("modeln") as HTMLInputElement).valueAsNumber;
    const periodicIn = (document.getElementById("periodicin") as HTMLInputElement).checked;
    const periodicOut = (document.getElementById("periodicout") as HTMLInputElement).checked;
    const symmetry = Number.parseInt((document.getElementById("symmetry") as HTMLSelectElement).value);
    const ground = (document.getElementById("ground") as HTMLInputElement).valueAsNumber;
    const attempts = (document.getElementById("attempts") as HTMLInputElement).valueAsNumber;

    const groundKey = Number.isNaN(ground) ? undefined : ground;
    const seedFunc = Number.isNaN(seed) ? Math.random : () => seed;

    loadImage(original, "input.png")
        .then(MyImage.fromImage)
        .then(img => tileify(img, tileSize, tileSize))
        .then(tiles => map2D(tiles, t => set.add(t)))
        .then(async keys => {
            const maxValue = max(keys.map(max));
            const pixels = createPixels(1 + maxValue)

            const img = await writePixels(training, keys, pixels, tileSize, tileSize)
            runModel(
                img, n, outputSize, outputSize, attempts, seedFunc, 
                periodicIn, periodicOut,
                symmetry,
                groundKey
            )
                .then(img => writeImage(generated, img, tileSize, tileSize))
                .then(img => keysFromPixels(img, pixels))
                .then(keys => map2D(keys, k => set.find(k)))
                .then(tiles => untileify(tiles, tileSize, tileSize))
                .then(img => writeImage(output, img, 1, 1))
                .catch(ex => { console.error(ex); writeMessage(stringify(ex)) });
        });
}

const messages: string[] = [];

function stringify(obj: any): string {
    if(typeof obj === "string"){
        return obj;
    }

    if(obj instanceof Error){
        return obj.toString();
    }

    return JSON.stringify(obj);
}

export function writeMessage(message: string){
    if(message !== ""){
        console.log(message);
    }
    
    messages.push(message);

    if(messages.length > 5) {
        messages.shift();
    }

    const log = document.getElementById("log") as HTMLDivElement;

    log.innerHTML = "";

    messages.forEach(m => {
        const p = document.createElement("p");
        p.textContent = m;
        log.append(p);
    });
}

docReady(init);