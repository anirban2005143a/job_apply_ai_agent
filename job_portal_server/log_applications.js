import fs from 'fs';
import path from 'path';
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const applicationLogPath = path.join(__dirname, 'application_submissions.log');

export const logApplication = (data) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    ...data
  };

  fs.appendFile(
    applicationLogPath,
    JSON.stringify(logEntry, null, 2) + '\n-------------------\n',
    (err) => {
      if (err) {
        console.error('Failed to write application log:', err);
      }
    }
  );
}
