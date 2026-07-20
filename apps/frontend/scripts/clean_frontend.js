import fs from 'fs';
import path from 'path';
import { globSync } from 'glob';

const srcPath = path.resolve(process.cwd(), './src');
const files = globSync(`${srcPath}/**/*.{js,jsx}`.replace(/\\/g, '/'));

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  // Replace user.planFeatures?.includes("...") with true
  content = content.replace(/user(\?)?\.planFeatures(\?)?\.includes\([^)]+\)/g, 'true');
  
  // Replace hasPlanFeature("...") with true (if there's a helper)
  content = content.replace(/hasPlanFeature\([^)]+\)/g, 'true');

  // Replace user.tenant with nothing, or user.tenant?.name with "Company"
  content = content.replace(/user(\?)?\.tenant(\?)?\.name/g, '"Company"');
  content = content.replace(/user(\?)?\.tenant(\?)?\.logoUrl/g, 'null');
  content = content.replace(/user(\?)?\.tenantName/g, '"Company"');
  
  // Replace user.role === 'super_admin' with false
  content = content.replace(/user(\?)?\.role\s*===\s*['"]super_admin['"]/g, 'false');
  content = content.replace(/user(\?)?\.role\s*!==\s*['"]super_admin['"]/g, 'true');

  if (content !== originalContent) {
    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
  }
});
