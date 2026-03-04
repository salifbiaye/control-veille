const fs = require('fs');
const file = 'c:/Users/DELL/Downloads/veille/admin/src/app/globals.css';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(/rgba\(167,\s*139,\s*250,\s*([0-9.]+)\)/g, (match, p1) => `color-mix(in srgb, var(--brand) ${Math.round(parseFloat(p1) * 100)}%, transparent)`);
fs.writeFileSync(file, content);
console.log('Fixed globals.css violet-400');
