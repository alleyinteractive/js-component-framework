/* eslint-disable no-console */

/**
 * Internal class for instantiating the Module Manager
 */
export default class ComponentManager {
  /**
   * Start the component manager.
   */
  constructor() {
    if (arguments.length > 0) {
      console.group('js-component-framework:');
      console.log('ComponentManager manifest is no longer supported.');
      // eslint-disable-next-line max-len
      console.info('See https://github.com/alleyinteractive/js-component-framework for more information.');
      console.groupEnd();
    }
  }

  /**
   * Loop through component elements and instantiate the component for each.
   *
   * @param {object|array} configs Config or configs corresponding to components you want to instantiate.
   * @param {HTMLElement}  context Context on which to initialize components, default is `document`.
   */
  initComponents = (configs, context = document) => {
    Array.from(configs).forEach((config) => (
      this.initComponent(config, context)
    ));
  };

  /**
   * Initialize a component in its elements.
   *
   * @param {object} componentConfig The component configuration object.
   * @param {string} context         The component context.
   */
  initComponent = (componentConfig, context) => { // eslint-disable-line class-methods-use-this
    const {
      class: configClass,
      component,
      name: componentName,
    } = componentConfig;

    // Prefer the v3 `component` property.
    const ComponentClass = component || configClass;
    const componentSelector = `[data-component='${componentName}']`;

    // Check if component extends the core Component class
    if (ComponentClass.prototype.toString() === '[object FrameworkComponent]') {
      const componentEls = context.querySelectorAll(componentSelector);

      if (!componentEls.length) {
        console.info(`No elements found for ${componentSelector}`);
        return;
      }

      componentEls.forEach((element) => {
        // Pass the component element in with the config.
        const configCopy = {
          ...componentConfig,
          element,
        };
        const instance = new ComponentClass(configCopy); // eslint-disable-line no-unused-vars
      });
    }
  };
}
