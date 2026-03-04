const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

walkDir('c:/Users/DELL/Downloads/veille/admin/src', (filePath) => {
    if (filePath.endsWith('.tsx') || filePath.endsWith('.ts') || filePath.endsWith('.css')) {
        let content = fs.readFileSync(filePath, 'utf8');
        let original = content;

        // For mailer.ts, replace with hex
        if (filePath.endsWith('mailer.ts')) {
            content = content.replace(/#7C3AED/gi, '#0284C7');
            content = content.replace(/#A78BFA/gi, '#38BDF8');
        } else {
            content = content.replace(/'#7C3AED'/gi, "'var(--brand)'");
            content = content.replace(/"#7C3AED"/gi, '"var(--brand)"');
            content = content.replace(/'#A78BFA'/gi, "'var(--brand-light)'");
            content = content.replace(/"#A78BFA"/gi, '"var(--brand-light)"');
            content = content.replace(/#7C3AED/gi, 'var(--brand)');
            content = content.replace(/#A78BFA/gi, 'var(--brand-light)');
        }

        if (content !== original) {
            fs.writeFileSync(filePath, content);
            console.log('Fixed', filePath);
        }
    }
});
