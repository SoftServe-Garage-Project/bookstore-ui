const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  const proxyOptions = {
    target: 'https://localhost:8084',
    changeOrigin: true,
    secure: false,
    logLevel: 'debug',
    onProxyReq: (proxyReq, req, res) => {
      proxyReq.setHeader('Origin', 'https://localhost:8084');
    },
  };

  app.use('/api', createProxyMiddleware(proxyOptions));
  app.use('/oauth2', createProxyMiddleware(proxyOptions));
  app.use('/login/oauth2', createProxyMiddleware(proxyOptions));
};