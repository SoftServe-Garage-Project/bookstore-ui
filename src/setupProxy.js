const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'https://localhost:8084',
      changeOrigin: true,
      secure: false,
      logLevel: 'debug',
    })
  );
};