/* eslint-disable no-console */

/**
 * Internal class for instantiating the Module Manager
 */
export default class ComponentManager {
  /**
   * Start the component manager.
   *
   * @param {string} manifest Arbitrary string maintained for backward compatibility.
   */
  constructor(manifest = '') {
    /**
     * Warn about deprecation if a manifest namespace is provided.
     *
     * This is meant to provide a means for quieting warnings for projects
     * unable to upgrade immediately by omitting the manifest namespace.
     *
     * @type {boolean}
     */
    this.shouldWarnDeprecated = (manifest !== '');
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
  initComponent = (componentConfig, context) => {
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

      if (this.shouldWarnDeprecated) {
        console.group('js-component-framework:');
        console.warn('Component & ComponentManager are deprecated.');
        // eslint-disable-next-line max-len
        console.info('See https://github.com/alleyinteractive/js-component-framework for more information.');
        console.groupEnd();

        this.shouldWarnDeprecated = false;
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
