const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // Use localhost when running locally, backend when in Docker
  const target = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  
  app.use(
    '/api',
    createProxyMiddleware({
      target: target,
      changeOrigin: true,
      logLevel: 'debug',
    })
  );
};
