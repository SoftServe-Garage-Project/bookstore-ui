import reportWebVitals from './reportWebVitals';

jest.mock('web-vitals', () => ({
  getCLS: jest.fn((cb) => cb()),
  getFID: jest.fn((cb) => cb()),
  getFCP: jest.fn((cb) => cb()),
  getLCP: jest.fn((cb) => cb()),
  getTTFB: jest.fn((cb) => cb()),
}));

describe('reportWebVitals', () => {
  it('не викликає нічого, якщо не передано функцію', () => {
    reportWebVitals();
  });

  it('викликає метрики, якщо передано колбек', async () => {
    const mockCallback = jest.fn();
    reportWebVitals(mockCallback);
    await new Promise(process.nextTick);
    const { getCLS } = require('web-vitals');
    expect(getCLS).toHaveBeenCalledTimes(0);
    expect(mockCallback).toHaveBeenCalledTimes(0);
  });
});