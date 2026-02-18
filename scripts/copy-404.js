import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distDir = path.join(__dirname, '../dist');
const indexHtml = path.join(distDir, 'index.html');
const notFoundHtml = path.join(distDir, '404.html');

console.log('Post-build: Checking for dist directory...');

if (fs.existsSync(distDir) && fs.existsSync(indexHtml)) {
    console.log('Copying index.html to 404.html...');
    fs.copyFileSync(indexHtml, notFoundHtml);
    console.log('Successfully created 404.html for SPA fallback.');

    // Final Nuclear cleanup: Ensure NO _redirects or _headers exist in 'out'
    ['_redirects', '_headers'].forEach(file => {
        const fullPath = path.join(distDir, file);
        if (fs.existsSync(fullPath)) {
            console.log(`Deleting file from out: ${file}`);
            fs.unlinkSync(fullPath);
        }
    });
} else {
    console.error('Error: out/index.html not found. Build might have failed.');
    process.exit(1);
}
