// Available to all components
import Component from './Component';

/**
 * Internal class for instantiating the Module Manager
 */
export default class ComponentManager {

  /**
   * Start the component manager
   *
   * @param {string} manifest - arbitrary string corresponding to an object on `window` that we'll use to track configuration and instances of each component.
   *                            This generally corresponds to the WP theme name (`wp-starter-theme` for example)
   */
  constructor(manifest) {
    const manifestDefaults = { components: {} };

    window[manifest] = window[manifest] ?
      Object.assign({}, window[manifest], manifestDefaults) :
      manifestDefaults;

    this.manifest = window[manifest];
  }

  /**
   * Loop through component elements and instantiate the component for each
   *
   * @param {object|array} configs - config or configs corresponding to components you want to instance
   * @param {HTMLElement} context - context on which to initalize components, default is `document`
   */
  initComponents(configs, context = document) {
    const componentConfigs = Array.isArray(configs) ? configs : [configs];

    componentConfigs.forEach((config) => {
      const componentConfig = config;
      const componentName = componentConfig.name;
      const ComponentClass = componentConfig.class;

      // Check if component is configured and extends the core Component class
      if (ComponentClass.prototype instanceof Component) {
        const hasComponent = Object.prototype
          .hasOwnProperty
          .call(this.manifest.components, componentName);
        const componentEls = context
          .querySelectorAll(`[data-component='${componentConfig.name}']`);

        // Can't find any elements!
        if (! componentEls.length) {
          /* eslint-disable no-console, max-len */
          console.error(
            `Component '${componentName}' does not exist or is configured incorrectly.
Check 'client/js/site/config.js' to ensure this component has a configuration object.
Also, verify the '${componentName}' class extends the core component class located in client/js/site/Component.js`
          );
          /* eslint-enable */
          return;
        }

        // Add component to manifest if it doesn't exist already
        if (! hasComponent) {
          this.manifest.components[componentName] = {
            config: componentConfig,
            instances: [],
          };
        }

        // Loop through elements and add instance for each
        Array.prototype.forEach.call(componentEls, (element) => {
          // Skip this element if we've already instantiated a component on it
          const exists = this.manifest.components[componentName].instances
            .some((instance) => element === instance.element);

          if (exists) {
            return;
          }

          // Create and start instance
          componentConfig.element = element;
          const instance = new ComponentClass(componentConfig);

          // add instance to manifest
          this.manifest.components[componentName].instances.push({
            instance,
            element,
          });
        });
      }
    });
  }

  /**
   * Loop through and restart components (use, for example, if you've removed and re-added components from the DOM and need the JS started again)
   *
   * @param {string} componentName - name of component to instantiate
   * @param {HTMLElement} context - context on which to initalize components, default is entire document
   */
  reinitComponent(componentName, context) {
    const componentConfig = this.manifest.components[componentName].config;

    if (componentConfig) {
      this.initComponents([componentConfig], context);
    }
  }

  /**
   * Call a method of a component from a different component
   *
   * @param {string} componentName - Name of component that has target function
   * @param {function} method - Component method you want to call
   * @param {array} args - Array of arguments to pass to component method
   */
  static callComponentMethod(componentName, method, args = []) {
    // Does the component exist?
    if (
      this.mainfest[componentName] &&
      this.mainfest[componentName].instances
    ) {
      this.mainfest[componentName].instances.forEach((instance) => {
        // Use JS .apply to call the component method with proper context
        if ('function' === typeof instance[method]) {
          instance[method].call(instance, ...args);
        }
      });
    }
  }
}
