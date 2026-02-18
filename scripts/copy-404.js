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

    // Nuclear cleanup: Ensure no _redirects or _headers exist in dist
    // that might trigger Cloudflare's loop validator
    ['/_redirects', '/_headers'].forEach(file => {
        const fullPath = path.join(distDir, file);
        if (fs.existsSync(fullPath)) {
            console.log(`Deleting ghost file: ${file}`);
            fs.unlinkSync(fullPath);
        }
    });
} else {
    console.error('Error: dist/index.html not found. Build might have failed.');
    process.exit(1);
}
