import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

const app = express();

app.use('/musics', createProxyMiddleware({
  target: 'http://music-service:2500',
  changeOrigin: true,
  pathRewrite: {
    '^/musics': '',
  },
}));

app.use('/games', createProxyMiddleware({
  target: 'http://game-service:3000',
  changeOrigin: true,
  pathRewrite: {
    '^/games': '',
  },
}));

app.listen(3002, '0.0.0.0', () => {
  console.log('Gateway listening on port 3002');
});