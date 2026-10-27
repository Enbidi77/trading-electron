import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { createServer } from 'vite';
import electronPath from 'electron';

// Ensure Electron doesn't run in Node mode if invoked from an environment with ELECTRON_RUN_AS_NODE
delete process.env.ELECTRON_RUN_AS_NODE;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

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
  const viteServer = await createServer({
    root: rootDir,
    configFile: path.resolve(rootDir, 'vite.config.ts')
  });
  await viteServer.listen();
  viteServer.printUrls();

  const devUrl = viteServer.resolvedUrls?.local[0] || 'http://localhost:5173';

  console.log(`[TRD Pro] Launching Electron window pointing to ${devUrl}...`);
  const electronEnv = {
    ...process.env,
    VITE_DEV_SERVER_URL: devUrl,
    NODE_ENV: 'development'
  };
  delete electronEnv.ELECTRON_RUN_AS_NODE;

  const electronProcess = spawn(electronPath, ['.'], {
    cwd: rootDir,
    stdio: 'inherit',
    env: electronEnv
  });

  const cleanup = async () => {
    try {
      await viteServer.close();
    } catch (_) {}
    try {
      if (!electronProcess.killed) electronProcess.kill();
    } catch (_) {}
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
