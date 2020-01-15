import { OverlappingModel } from "wavefunctioncollapse";
import { MyImage } from "./myImage";
import { writeMessage } from "./index";

export enum symmetryOption {
    none = 1,
    b = 2,
    c = 3,
    d = 4,
    e = 5,
    f = 6,
    g = 7,
    all = 8
}

export function runModel(img: ImageData, n: number, width: number, height: number,
    maxAttempts = 1, seed = Math.random, periodicInput = false, periodicOutput = true,
    symmetry = symmetryOption.none, ground = 0
): Promise<MyImage> {
    ("Beginning training...");

    return new Promise((resolve, reject) => {
        const model = new OverlappingModel(img.data, img.width, img.height, n, width, height, periodicInput, periodicOutput, symmetry.valueOf(), ground);

        writeMessage("Model training complete!");

        let success = false;
        let attempt = 0;
        while(!success && attempt < maxAttempts){
            attempt++;
            writeMessage(`Attempt ${attempt}...`)

            writeMessage("Generating...");
            success = model.generate(seed);    
            
            if(!success){
                writeMessage("Attempt failed.");
                model.clear();
            }
        }

        if (!success) {
            reject(Error("Exceeded max attempts."));
        } else {
            writeMessage("Generation complete!");

            const result = model.graphics();
            resolve(new MyImage(height, width, result.buffer));
        }        
    });
}