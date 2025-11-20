import { exec } from "child_process";
import path from "path";

export const checkPdfCompliance = (pdfPath) => {
  return new Promise((resolve, reject) => {
    const absPath = path.resolve(pdfPath);
    const command = `sudo /usr/local/bin/verapdf -f ua1 --format json "${absPath}"`;

    exec(command, { env: { ...process.env, HOME: "/home/ubuntu" } }, (err, stdout, stderr) => {
      if (err) {
        console.error("veraPDF error:", stderr || err.message);
        reject(`Command failed: ${command}\n${stderr || err.message}`);
        return;
      }

      try {
        const parsed = JSON.parse(stdout);
        resolve(parsed);
      } catch (e) {
        reject(`Failed to parse veraPDF output: ${e.message}`);
      }
    });
  });
};
