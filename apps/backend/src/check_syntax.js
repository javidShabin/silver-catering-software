import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const directoryPath = path.join(__dirname);

function getFiles(dir, files = []) {
  const fileList = fs.readdirSync(dir);
  for (const file of fileList) {
    const name = `${dir}/${file}`;
    if (fs.statSync(name).isDirectory()) {
      getFiles(name, files);
    } else {
      if (name.endsWith('.js') || name.endsWith('.jsx')) {
        files.push(name);
      }
    }
  }
  return files;
}

const files = getFiles(directoryPath);
let errorFiles = [];

for (const file of files) {
  try {
    execSync(`node -c "${file}"`, { stdio: 'ignore' });
  } catch (err) {
    errorFiles.push(file);
    console.error('Syntax error found in:', file);
  }
}

if (errorFiles.length === 0) {
  console.log('No syntax errors found.');
} else {
  console.log(`\nFound ${errorFiles.length} files with syntax errors.`);
}
