const fs = require('fs');
const files = [
    'c:/Users/DELL/Downloads/veille/admin/src/components/ui/PageHero.tsx',
    'c:/Users/DELL/Downloads/veille/admin/src/components/layout/Sidebar.tsx',
    'c:/Users/DELL/Downloads/veille/admin/src/features/dashboard/components/DashboardStats.tsx',
    'c:/Users/DELL/Downloads/veille/admin/src/app/dashboard/analytics/page.tsx'
];

files.forEach(file => {
    if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf8');
        let modified = content.replace(/\$\{([a-zA-Z_.]+)\}([0-9A-Fa-f]{2})/g, (match, p1, p2) => {
            let percent = Math.round((parseInt(p2, 16) / 255) * 100);
            return `color-mix(in srgb, \${${p1}} ${percent}%, transparent)`;
        });
        if (content !== modified) {
            fs.writeFileSync(file, modified);
            console.log('Fixed', file);
        }
    }
});
