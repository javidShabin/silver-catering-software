import fs from 'fs';
import path from 'path';
import { globSync } from 'glob';

const backendSrcPath = path.resolve(process.cwd(), './src');
const files = globSync(`${backendSrcPath}/**/*.js`.replace(/\\/g, '/'));

files.forEach(file => {
  if (file.includes('auth.middleware.js') || file.includes('requireTenant.middleware.js') || file.includes('tenant.controller.js') || file.includes('superadmin') || file.includes('tenant.routes.js')) {
    return;
  }

  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  // Remove standard declarations
  content = content.replace(/const\s+tenantId\s*=\s*req\.user(?:\?)?\.tenantId;?/g, '');
  content = content.replace(/let\s+tenantId\s*=\s*req\.user(?:\?)?\.tenantId;?/g, '');
  content = content.replace(/tenantId\s*=\s*req\.user(?:\?)?\.tenantId;?/g, '');
  
  content = content.replace(/const\s+tenantId\s*=\s*req\.tenantId;?/g, '');
  content = content.replace(/let\s+tenantId\s*=\s*req\.tenantId;?/g, '');
  content = content.replace(/tenantId\s*=\s*req\.tenantId;?/g, '');

  content = content.replace(/const\s+\{\s*tenantId\s*\}\s*=\s*req\.user;?/g, '');
  
  // Remove standalone 'tenantId,' or 'tenantId' in objects
  // E.g. { id, tenantId } -> { id }
  // E.g. where: { tenantId } -> where: {}
  content = content.replace(/(?<![a-zA-Z0-9_])tenantId\s*,?/g, '');
  
  // Remove 'tenantId: ... ,'
  // This matches `tenantId:` followed by anything except `,` or `}` then an optional `,`
  content = content.replace(/tenantId\s*:\s*[^,}\n]+,?/g, '');
  
  // Clean up empty commas
  content = content.replace(/,\s*,/g, ',');
  content = content.replace(/\{\s*,/g, '{');
  content = content.replace(/,\s*\}/g, '}');

  // unique compound indices like tenantId_name
  content = content.replace(/tenantId_[a-zA-Z0-9_]+/g, (match) => match.replace('tenantId_', ''));
  content = content.replace(/[a-zA-Z0-9_]+_tenantId/g, (match) => match.replace('_tenantId', ''));

  if (content !== originalContent) {
    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
  }
});
