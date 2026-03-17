import { readFileSync, writeFileSync } from 'node:fs';

const raw = readFileSync('manifest.json', 'utf8');
const manifest = JSON.parse(raw);

const stripDistPrefix = (value) => String(value || '').replace(/^dist\//, '');
const stripPublicPrefix = (value) =>
  String(value || '').replace(/^public\//, '');

const rewriteIconMap = (iconMap) => {
  if (!iconMap || typeof iconMap !== 'object') return iconMap;

  return Object.fromEntries(
    Object.entries(iconMap).map(([size, path]) => [
      size,
      stripPublicPrefix(path),
    ]),
  );
};

manifest.content_scripts = (manifest.content_scripts || []).map((entry) => ({
  ...entry,
  js: Array.isArray(entry.js) ? entry.js.map(stripDistPrefix) : entry.js,
  css: Array.isArray(entry.css) ? entry.css.map(stripDistPrefix) : entry.css,
}));

if (manifest.action?.default_popup) {
  manifest.action.default_popup = stripDistPrefix(manifest.action.default_popup);
}

if (manifest.background?.service_worker) {
  manifest.background.service_worker = stripDistPrefix(manifest.background.service_worker);
}

manifest.icons = rewriteIconMap(manifest.icons);

if (manifest.action?.default_icon) {
  manifest.action.default_icon = rewriteIconMap(manifest.action.default_icon);
}

writeFileSync('dist/manifest.json', `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
