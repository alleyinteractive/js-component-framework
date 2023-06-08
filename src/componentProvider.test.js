/* eslint-disable max-len */
import componentProvider from './componentProvider';

document.body.innerHTML = `
  <div id="test-one" data-component="test-one">
    <button class="cool-button">Cool Button!</button>
    <ul>
      <li>First List Item</li>
      <li>Second List Item</li>
      <li>Third List Item</li>
    </ul>
  </div>
  <div id="test-two">
    <div data-component="test-two">
      <button class="cool-button">Cool Button!</button>
      <ul>
        <li>First List Item</li>
        <li>Second List Item</li>
        <li>Third List Item</li>
      </ul>
    </div>
    <div data-component="test-two">
      <button class="cool-button">Cool Button!</button>
      <ul>
        <li>First List Item</li>
        <li>Second List Item</li>
        <li>Third List Item</li>
      </ul>
    </div>
    <div id="event-root"></div>
  </div>
`;

afterEach(() => jest.clearAllMocks());

const baseConfig = {
  component: jest.fn(),
  querySelector: {
    button: 'button',
    nothing: '.nonexistent-class',
  },
  querySelectorAll: {
    listItems: 'li',
  },
  options: { testing: true },
};

const eventRoot = document.querySelector('#event-root');

// Compile expected args for single instance.
const element = document.querySelector('#test-one');
const singleExpected = {
  element,
  children: {
    button: element.querySelector('button'),
    listItems: Array.from(element.querySelectorAll('li')),
    nothing: null,
  },
  options: { testing: true },
};

// Compile expected args for multiple instances.
const wrapper = document.querySelector('#test-two');
const elements = wrapper.querySelectorAll(':scope > div');
const testTwoExpected = Array.from(elements)
  .map((div) => ({
    element: div,
    children: {
      button: div.querySelector('button'),
      listItems: Array.from(div.querySelectorAll('li')),
      nothing: null,
    },
    options: { testing: true },
  }));

test('Provides expected arguments for single instance', () => {
  const config = { ...baseConfig, name: 'test-one' };

  componentProvider(config);
  expect(config.component).toHaveBeenCalledTimes(1);
  expect(config.component).toHaveBeenCalledWith(singleExpected);
});

test('Provides expected arguments for multiple instances', () => {
  const config = { ...baseConfig, name: 'test-two' };

  componentProvider(config);
  expect(config.component).toHaveBeenCalledTimes(2);

  expect(config.component).toHaveBeenNthCalledWith(1, testTwoExpected[0]);
  expect(config.component).toHaveBeenNthCalledWith(2, testTwoExpected[1]);
});

test('Returns the expected function for single instance when `load:false`', () => {
  const config = { ...baseConfig, name: 'test-one', load: false };

  const providerFunction = componentProvider(config);
  expect(config.component).toHaveBeenCalledTimes(0);

  providerFunction();
  expect(config.component).toHaveBeenCalledTimes(1);
  expect(config.component).toHaveBeenCalledWith(singleExpected);
});

test('Returns the expected function for multiple instances when `load:false`', () => {
  const config = { ...baseConfig, name: 'test-two', load: false };

  const providerFunction = componentProvider(config);
  expect(config.component).toHaveBeenCalledTimes(0);

  providerFunction();
  expect(config.component).toHaveBeenCalledTimes(2);

  expect(config.component).toHaveBeenNthCalledWith(1, testTwoExpected[0]);
  expect(config.component).toHaveBeenNthCalledWith(2, testTwoExpected[1]);
});

test('Loads on event for single instance', () => {
  const config = {
    ...baseConfig,
    name: 'test-one',
    load: [eventRoot, 'jscf-test-one-event'],
  };

  componentProvider(config);
  expect(config.component).toHaveBeenCalledTimes(0);

  eventRoot.dispatchEvent(new CustomEvent('jscf-test-one-event'));
  expect(config.component).toHaveBeenCalledTimes(1);
  expect(config.component).toHaveBeenCalledWith(singleExpected);
});

test('Loads on event for multiple instances', () => {
  const config = {
    ...baseConfig,
    name: 'test-two',
    load: [eventRoot, 'jscf-test-two-event'],
  };

  componentProvider(config);
  expect(config.component).toHaveBeenCalledTimes(0);

  eventRoot.dispatchEvent(new CustomEvent('jscf-test-two-event'));
  expect(config.component).toHaveBeenCalledTimes(2);

  expect(config.component).toHaveBeenNthCalledWith(1, testTwoExpected[0]);
  expect(config.component).toHaveBeenNthCalledWith(2, testTwoExpected[1]);
});

test('Fails silently on `null` event root', () => {
  const config = {
    ...baseConfig,
    name: 'test-one',
    load: [null, 'jscf-null-test'],
  };

  componentProvider(config);
  expect(config.component).toHaveBeenCalledTimes(0);

  eventRoot.dispatchEvent(new CustomEvent('jscf-null-test'));
  expect(config.component).toHaveBeenCalledTimes(0);
});
