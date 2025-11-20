import { exec } from "child_process";
import path from "path";

export const checkPdfCompliance = (pdfPath) => {
  return new Promise((resolve, reject) => {
    const absPath = path.resolve(pdfPath);
    const command = `sudo /usr/local/bin/verapdf -f ua1 --format json "${absPath}"`;

    exec(command, { env: process.env }, (err, stdout, stderr) => {
      if (stdout && stdout.trim().startsWith("{")) {
        resolve(stdout);
        return;
      }

      console.error("veraPDF stdout:", stdout);
      console.error("veraPDF stderr:", stderr);
      console.error("veraPDF err:", err);

      reject(`veraPDF failed: ${stderr || err?.message || "Unknown error"}`);
    });

    try {
      const parsed = JSON.parse(stdout);
      resolve(parsed);
    } catch (e) {
      reject(`Failed to parse veraPDF output: ${e.message}`);
    }
  });
};
