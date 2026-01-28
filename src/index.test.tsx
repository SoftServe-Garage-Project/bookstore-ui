import React from 'react';

const mockRender = jest.fn();
jest.mock('react-dom/client', () => {
  return {
    __esModule: true,
    createRoot: jest.fn().mockImplementation(() => ({
      render: mockRender,
    })),
    default: {
      createRoot: jest.fn().mockImplementation(() => ({
        render: mockRender,
      })),
    },
  };
});

jest.mock('./App', () => () => <div data-testid="app" />);
jest.mock('./reportWebVitals', () => jest.fn());

describe('Index.tsx entry point', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    document.body.innerHTML = '';
  });

  it('має успішно ініціалізувати додаток', () => {
    const root = document.createElement('div');
    root.id = 'root';
    document.body.appendChild(root);
    jest.isolateModules(() => {
      require('./index');
    });

    expect(mockRender).toHaveBeenCalled();
    const renderedElement = mockRender.mock.calls[0][0];
    expect(renderedElement.type).toBe(React.StrictMode);
  });
});