import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

function waitForServer(url, timeout = 30000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const check = () => {
      http.get(url, (res) => {
        resolve();
      }).on('error', () => {
        if (Date.now() - start > timeout) {
          reject(new Error(`Timed out waiting for ${url}`));
        } else {
          setTimeout(check, 300);
        }
      });
    };
    check();
  });
}

async function start() {
  console.log('[TRD Pro] Compiling Electron main and preload scripts...');
  const tsc = spawn('pnpm', ['exec', 'tsc', '-p', 'tsconfig.electron.json'], {
    cwd: rootDir,
    shell: true,
    stdio: 'inherit'
  });

  await new Promise((resolve, reject) => {
    tsc.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`tsc exited with code ${code}`));
    });
  });

  // Ensure preload.cjs is in dist-electron/preload/
  const srcPreload = path.resolve(rootDir, 'src/preload/preload.cjs');
  const destPreloadDir = path.resolve(rootDir, 'dist-electron/preload');
  if (!fs.existsSync(destPreloadDir)) fs.mkdirSync(destPreloadDir, { recursive: true });
  fs.copyFileSync(srcPreload, path.resolve(destPreloadDir, 'preload.cjs'));

  console.log('[TRD Pro] Starting Vite development server...');
  const viteProcess = spawn('pnpm', ['exec', 'vite'], {
    cwd: rootDir,
    shell: true,
    stdio: 'inherit'
  });

  const devUrl = 'http://localhost:5173';
  await waitForServer(devUrl);
  console.log(`[TRD Pro] Vite server is ready at ${devUrl}`);

  console.log('[TRD Pro] Launching Electron window...');
  const electronProcess = spawn('pnpm', ['exec', 'electron', '.'], {
    cwd: rootDir,
    shell: true,
    stdio: 'inherit',
    env: {
      ...process.env,
      VITE_DEV_SERVER_URL: devUrl,
      NODE_ENV: 'development'
    }
  });

  const cleanup = () => {
    viteProcess.kill();
    electronProcess.kill();
    process.exit(0);
  };

  electronProcess.on('close', () => {
    console.log('[TRD Pro] Window closed. Cleaning up...');
    cleanup();
  });

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
}

start().catch((err) => {
  console.error('[TRD Pro] Error during startup:', err);
  process.exit(1);
});
