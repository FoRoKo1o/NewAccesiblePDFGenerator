import { exec } from "child_process";
import path from "path";

export const checkPdfCompliance = (pdfPath) => {
  return new Promise((resolve, reject) => {
    const absPath = path.resolve(pdfPath);
    const command = `/usr/local/bin/verapdf -f ua1 --format json "${absPath}"`;

    exec(command, (err, stdout, stderr) => {
      if (err) {
        console.error("veraPDF error:", err);
        console.error("stderr:", stderr);
        return reject(`veraPDF failed: ${stderr || err.message}`);
      }

      try {
        const parsed = JSON.parse(stdout);
        resolve(parsed);
      } catch (e) {
        console.error("veraPDF raw output:", stdout);
        reject(`Failed to parse veraPDF JSON output: ${e.message}`);
      }
    });
  });
};
