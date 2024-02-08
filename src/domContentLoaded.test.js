import domContentLoaded from './domContentLoaded';

// Mocks.
const providerFunc = jest.fn();
const addEventListener = jest.fn(() => {});

beforeAll(() => {
  // Allows setting document.readyState.
  Object.defineProperty(document, 'readyState', {
    value: 'loading',
    writable: true,
  });

  Object.defineProperty(document, 'addEventListener', {
    value: addEventListener,
  });
});

afterEach(() => jest.clearAllMocks());

test("'loading' readyState uses DOMContentLoaded", () => {
  domContentLoaded(providerFunc);
  expect(providerFunc).not.toHaveBeenCalled();

  expect(addEventListener).toHaveBeenCalledWith(
    'DOMContentLoaded',
    providerFunc,
    { once: true },
  );
});

test("'complete' readyState calls the function immediately", () => {
  document.readyState = 'complete';

  domContentLoaded(providerFunc);
  expect(providerFunc).toHaveBeenCalledTimes(1);

  expect(addEventListener).not.toHaveBeenCalled();
});

test("'interactive' readyState calls the funciton immediately", () => {
  document.readyState = 'interactive';

  domContentLoaded(providerFunc);
  expect(providerFunc).toHaveBeenCalledTimes(1);

  expect(addEventListener).not.toHaveBeenCalled();
});
