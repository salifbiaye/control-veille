const fs = require('fs');
const file = 'c:/Users/DELL/Downloads/veille/admin/src/app/globals.css';
let content = fs.readFileSync(file, 'utf8');
if (!content.includes('slideInRight')) {
    content += `\n@keyframes slideInRight {\n  from { transform: translateX(100%); }\n  to { transform: translateX(0); }\n}\n`;
    fs.writeFileSync(file, content);
    console.log('Added slideInRight keyframes');
} else {
    console.log('slideInRight already exists');
}
