import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer as createViteServer } from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

async function createServer() {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'custom',
  });
  
  app.use(vite.middlewares);

  app.use('*', async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const templatePath = path.resolve(__dirname, '..', process.env.NODE_ENV === 'production' ? 'dist/index.html' : 'index.html');
      let template = fs.readFileSync(templatePath, 'utf-8');
      
      const { render } = await vite.ssrLoadModule('/src/entry-server.jsx');
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
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
  
  return app;
}

let server;
createServer().then((app) => (server = app));

export default (req, res) => {
  server(req, res);
};