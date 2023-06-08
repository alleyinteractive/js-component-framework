import componentLoader from './componentLoader';

/**
 * Compile component elements and DOM attachments.
 *
 * @param {Object} config The component config.
 * @returns {Function|undefined} A function to initialize the component.
 */
export default function componentProvider(config) {
  const {
    component: Component,
    load, // default value omitted so `componentLoader` can use its default.
    name,
    querySelector = {},
    querySelectorAll = {},
  } = config;

  if (typeof Component !== 'function') {
    return undefined;
  }

  // The component selector.
  const selector = `[data-component='${name}']`;

  // Get component elements.
  const componentEls = document.querySelectorAll(selector);

  // Do nothing.
  if (componentEls.length < 1) {
    console.log(`No elements found for ${selector}`); // eslint-disable-line no-console
    return undefined;
  }

  // Get options.
  const options = config.options || {};

  /*
   * Collect component arguments based on the config.
   *
   * @returns {Array}
   */
  const componentArgs = Array.from(componentEls).map((element) => {
    const children = {};

    // Select single child nodes.
    Object.keys(querySelector).forEach((elementKey) => {
      children[elementKey] = element.querySelector(querySelector[elementKey]);
    });

    // Select groups of child nodes.
    Object.keys(querySelectorAll).forEach((elementKey) => {
      const nodeList = element.querySelectorAll(querySelectorAll[elementKey]);
      children[elementKey] = Array.from(nodeList);
    });

    return ({ element, children, options });
  });

  // Create the provider function.
  const init = () => componentArgs.forEach((args) => new Component(args));

  if (load !== false) {
    // Load the provider function.
    componentLoader(init, load);

    return undefined;
  }

  return init;
}
