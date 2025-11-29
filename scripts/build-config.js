const fs = require('fs');
const path = require('path');

function loadEnv() {
  const envPath = path.join(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) return {};
  const raw = fs.readFileSync(envPath, 'utf8');
  return raw.split(/\r?\n/).reduce((acc, line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return acc;
    const [key, ...rest] = trimmed.split('=');
    acc[key] = rest.join('=');
    return acc;
  }, {});
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function writeRuntimeConfig(env) {
  const runtimeConfig = {
    apiBaseUrl: env.API_BASE_URL || 'https://api.example.com',
  };
  const targetDir = path.join(process.cwd(), 'public');
  ensureDir(targetDir);
  const targetPath = path.join(targetDir, 'runtime-config.json');
  fs.writeFileSync(targetPath, JSON.stringify(runtimeConfig, null, 2));
  console.log(`runtime-config.json written to ${targetPath}`);
}

const env = { ...loadEnv(), ...process.env };
writeRuntimeConfig(env);
