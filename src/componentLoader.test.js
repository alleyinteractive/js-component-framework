/* eslint-disable max-len */
import componentLoader from './componentLoader';

document.body.innerHTML = '<div id="event-root"></div>';

afterEach(() => jest.clearAllMocks());

const eventRoot = document.querySelector('#event-root');
const providerFunc = jest.fn();

test('Does not call the provider function with `load:false`', () => {
  componentLoader(providerFunc, false);
  expect(providerFunc).toHaveBeenCalledTimes(0);
});

test('Calls the provider function with the loader function', () => {
  const loader = jest.fn((func) => func());

  componentLoader(providerFunc, loader);
  expect(providerFunc).toHaveBeenCalledTimes(1);
});

test('Loads on event for single instance', () => {
  componentLoader(providerFunc, [eventRoot, 'jscf-test-event']);
  expect(providerFunc).toHaveBeenCalledTimes(0);

  eventRoot.dispatchEvent(new CustomEvent('jscf-test-event'));
  expect(providerFunc).toHaveBeenCalledTimes(1);
});

test('Fails silently on invalid event config', () => {
  componentLoader(providerFunc, [null, 'jscf-null-test']);
  expect(providerFunc).toHaveBeenCalledTimes(0);

  eventRoot.dispatchEvent(new CustomEvent('jscf-null-test'));
  expect(providerFunc).toHaveBeenCalledTimes(0);

  componentLoader(providerFunc, [eventRoot, 123]);
  expect(providerFunc).toHaveBeenCalledTimes(0);

  eventRoot.dispatchEvent(new CustomEvent('jscf-fail-test'));
  expect(providerFunc).toHaveBeenCalledTimes(0);
});
