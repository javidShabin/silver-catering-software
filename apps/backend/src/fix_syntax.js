import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

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
let modifiedFiles = 0;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Fix `, req.user.` and `, req.tenant.` in arguments
  content = content.replace(/,\s*req\.user\.\s*\)/g, ')');
  content = content.replace(/,\s*req\.tenant\.\s*\)/g, ')');

  // Fix `req.user.` and `req.tenant.` as only arguments
  content = content.replace(/\(\s*req\.user\.\s*\)/g, '()');
  content = content.replace(/\(\s*req\.tenant\.\s*\)/g, '()');

  // Fix object destructuring errors e.g. { id: undefined }
  content = content.replace(/id:\s*}/g, 'id: undefined }');

  // Fix ticket.!== 
  content = content.replace(/ticket\.!==\s*\)/g, 'false)');

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Fixed:', file);
    modifiedFiles++;
  }
}

console.log(`Done. Modified ${modifiedFiles} files.`);
