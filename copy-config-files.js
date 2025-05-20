import fs from 'fs';

console.log('Copying configuration files to dist folder...');

// Pastikan folder dist ada
if (!fs.existsSync('./dist')) {
  console.error('Error: dist folder tidak ditemukan! Build mungkin gagal.');
  process.exit(1);
}

// Salin _redirects 
try {
  fs.copyFileSync('./public/_redirects', './dist/_redirects');
  console.log('Successfully copied _redirects file');
} catch (err) {
  console.error('Failed to copy _redirects file:', err);
}

// Salin _headers
try {
  fs.copyFileSync('./public/_headers', './dist/_headers');
  console.log('Successfully copied _headers file');
} catch (err) {
  console.error('Failed to copy _headers file:', err);
}

// Buat file netlify.toml untuk keamanan
const netlifyConfig = `
[build]
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
`;

try {
  fs.writeFileSync('./dist/netlify.toml', netlifyConfig);
  console.log('Successfully created netlify.toml file');
} catch (err) {
  console.error('Failed to create netlify.toml file:', err);
}

// Salin render.yaml
try {
  fs.copyFileSync('./render.yaml', './dist/render.yaml');
  console.log('Successfully copied render.yaml file');
} catch (err) {
  console.error('Failed to copy render.yaml file:', err);
}

console.log('All configuration files have been copied or created!');