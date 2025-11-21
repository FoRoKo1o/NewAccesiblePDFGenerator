import { execFile } from "child_process";
import path from "path";

export function fixAnnotations(inputPdfPath, outputPdfPath) {
    console.log(`fixing annotations`);
    const scriptPath = path.resolve("fix_annotations.py");
    return new Promise((resolve, reject) => {
        execFile("python3", [scriptPath, inputPdfPath, outputPdfPath], (error, stdout, stderr) => {
            if (error) {
                return reject({ error, stdout, stderr });
            }
            resolve({ stdout, stderr, path: outputPdfPath });
        });
    });
}