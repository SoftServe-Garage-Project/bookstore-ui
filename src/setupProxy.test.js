const setupProxy = require('./setupProxy');
const { createProxyMiddleware } = require('http-proxy-middleware');

jest.mock('http-proxy-middleware', () => ({
  createProxyMiddleware: jest.fn().mockReturnValue((req, res, next) => next()),
}));

describe('setupProxy', () => {
  it('має ініціалізувати проксі для /api', () => {
    const mockApp = {
      use: jest.fn(),
    };
    setupProxy(mockApp);

    expect(mockApp.use).toHaveBeenCalledTimes(1);

    expect(createProxyMiddleware).toHaveBeenCalledWith(
      expect.objectContaining({
        target: 'https://localhost:8084',
        changeOrigin: true,
        secure: false
      })
    );
  });
});