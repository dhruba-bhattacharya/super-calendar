import { cp, mkdir } from 'node:fs/promises';
await mkdir('dist', { recursive: true });
await cp('src', 'dist', { recursive: true });
await cp('public', 'dist/public', { recursive: true });
console.log('Built Calendar static bundle in dist/');
