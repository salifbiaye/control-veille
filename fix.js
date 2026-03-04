const fs = require('fs');
const file = 'c:/Users/DELL/Downloads/veille/admin/src/app/globals.css';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(/rgba\(124,\s*58,\s*237,\s*([0-9.]+)\)/g, (match, p1) => `color-mix(in srgb, var(--brand) ${Math.round(parseFloat(p1) * 100)}%, transparent)`);
fs.writeFileSync(file, content);
console.log('Fixed globals.css');
