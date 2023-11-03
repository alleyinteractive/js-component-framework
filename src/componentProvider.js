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

  // Set component selector, preferring the `name` property.
  const selector = (undefined === name)
    ? config?.root
    : `[data-component='${name}']`;

  // Get options.
  const options = config.options || {};

  /**
   * The provider function.
   *
   * Collects component elements and passes them to each instance of the component.
   */
  const init = () => {
    let componentEls;

    // Test for a valid selector.
    try {
      componentEls = document.querySelectorAll(selector);
    } catch(e) {
      console.error(e); // eslint-disable-line no-console
      return undefined;
    }

    // No component elements found.
    if (componentEls.length < 1) {
      console.log(`No elements found for ${selector}`); // eslint-disable-line no-console
      return undefined;
    }

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

    // eslint-disable-next-line no-void
    return void componentArgs.forEach((args) => new Component(args));
  };

  if (load !== false) {
    // Load the provider function.
    componentLoader(init, load);

    return undefined;
  }

  return init;
}
