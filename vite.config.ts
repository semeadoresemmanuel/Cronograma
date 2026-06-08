// Vite configuration for Calendário Semeadores
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import fs from 'fs';

const jsonDbPlugin = () => {
  const dbPath = path.resolve(__dirname, 'db.json');

  const handleApi = (req: any, res: any, next: any) => {
    if (req.url === '/api/items') {
      if (req.method === 'GET') {
        res.setHeader('Content-Type', 'application/json');
        try {
          if (fs.existsSync(dbPath)) {
            const data = fs.readFileSync(dbPath, 'utf-8');
            res.end(data);
          } else {
            res.end('[]');
          }
        } catch (err) {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: 'Failed to read db.json' }));
        }
      } else if (req.method === 'POST') {
        let body = '';
        req.on('data', (chunk: any) => {
          body += chunk.toString();
        });
        req.on('end', () => {
          try {
            JSON.parse(body);
            fs.writeFileSync(dbPath, body, 'utf-8');
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true }));
          } catch (err) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'Invalid JSON or write failed' }));
          }
        });
      }
    } else {
      next();
    }
  };

  return {
    name: 'json-db-plugin',
    configureServer(server: any) {
      server.middlewares.use(handleApi);
    },
    configurePreviewServer(server: any) {
      server.middlewares.use(handleApi);
    }
  };
};

export default defineConfig({
  plugins: [react(), tailwindcss(), jsonDbPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  server: {
    // HMR is disabled in AI Studio via DISABLE_HMR env var.
    // Do not modify—file watching is disabled to prevent flickering during agent edits.
    hmr: process.env.DISABLE_HMR !== 'true' ? { overlay: false } : false,
    host: true,
    allowedHosts: true,
    cors: true,
    watch: {
      ignored: ['**/db.json']
    },
  },
});
