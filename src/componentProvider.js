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
    options = {},
  } = config;

  if (typeof Component !== 'function') {
    return undefined;
  }

  /**
   * Collect component arguments based on the config.
   *
   * @returns {array} Array of arguments.
   */
  const getComponentArgs = () => {
    // Set component selector, preferring the `name` property.
    const selector = (undefined === name)
      ? config?.root
      : `[data-component='${name}']`;

    let componentEls;

    // Test for a valid selector.
    try {
      componentEls = document.querySelectorAll(selector);
    } catch (e) {
      console.error(e); // eslint-disable-line no-console
      return [];
    }

    // No component elements found.
    if (componentEls.length < 1) {
      console.log(`No elements found for ${selector}`); // eslint-disable-line no-console
      return [];
    }

    return Array.from(componentEls).map((element) => {
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
  };

  /**
   * The provider function.
   *
   * Finds DOM nodes upon which the component should be initialized, collects
   * references to child nodes thereof, and passes these as arguments to each
   * instance of the component.
   */
  const init = () => {
    const componentArgs = getComponentArgs();
    componentArgs.forEach((args) => new Component(args));
  };

  // Return the provider function for later execution.
  if (load === false) {
    return init;
  }

  /*
   * Call the provider function so it is executed as soon as the document is
   * parsed and loaded.
   *
   * This is a conventience option and is functionally identical to setting
   * `config.load` to false and calling the provider function later in the script.
   */
  if (load === true) {
    return void init(); // eslint-disable-line no-void
  }

  // Use the function defined in the `load` config property.
  return void componentLoader(init, load); // eslint-disable-line no-void
}
