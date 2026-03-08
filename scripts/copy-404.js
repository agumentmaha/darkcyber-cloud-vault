import { copyFileSync } from 'fs';
try {
  copyFileSync('dist/index.html', 'dist/404.html');
} catch (e) {
  // ignore
}
