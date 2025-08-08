import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isProduction = process.env.NODE_ENV === 'production';

async function createServer() {
  const app = express();
  let vite;

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, '..', 'dist/client'), { index: false }));
  }

  app.use('*', async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const templatePath = isProduction 
        ? path.resolve(__dirname, '..', 'dist/client/index.html')
        : path.resolve(__dirname, '..', 'index.html');
      
      let template = fs.readFileSync(templatePath, 'utf-8');

      let render;
      if (isProduction) {
        ({ render } = await import('../dist/server/entry-server.js'));
      } else {
        template = await vite.transformIndexHtml(url, template);
        ({ render } = await vite.ssrLoadModule('/src/entry-server.jsx'));
      }

      const { html: appHtml, helmet } = render(url);
      
      const headHtml = [
        helmet.title.toString(),
        helmet.meta.toString(),
        helmet.link.toString(),
        helmet.script.toString(),
      ].join('');

      template = template.replace(``, headHtml);
      template = template.replace(``, appHtml);

      res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
    } catch (e) {
      if (vite) vite.ssrFixStacktrace(e);
      next(e);
    }
  });

  return app;
}

const app = await createServer();
export default app;