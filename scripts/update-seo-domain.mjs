import { readFile, writeFile } from 'fs/promises';
import { resolve } from 'path';

const domain = process.env.SITE_DOMAIN?.trim();
if (!domain) {
  process.exit(0);
}

const normalized = domain.startsWith('http') ? domain : `https://${domain}`;
const files = ['robots.txt', 'sitemap.xml'];

await Promise.all(
  files.map(async (file) => {
    const filePath = resolve('dist', file);
    try {
      const content = await readFile(filePath, 'utf-8');
      const updated = content.replaceAll('https://your-domain.com', normalized);
      if (updated !== content) {
        await writeFile(filePath, updated, 'utf-8');
      }
    } catch {
      return;
    }
  })
);
