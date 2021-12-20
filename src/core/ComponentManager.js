// Available to all components
import Component from './Component';
import limiter from './limiter';

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

    // Set up "singleton" manifest containing references to
    // all component instances and elements they're attached to
    window[manifest] = window[manifest]
      ? window[manifest] : manifestDefaults;
    // Set up limiter to prevent race conditions in reads/writes to manifest
    window.jsComponentFrameworkLimiter = window.jsComponentFrameworkLimiter
      ? window.jsComponentFrameworkLimiter
      : limiter;

    this.manifest = window[manifest];
    this.limiter = window.jsComponentFrameworkLimiter;
  }

  /**
   * Loop through component elements and instantiate the component for each
   *
   * @param {object|array} configs - config or configs corresponding to components you want to instance
   * @param {HTMLElement} context - context on which to initialize components, default is `document`
   */
  initComponents(configs, context = document) {
    const componentConfigs = Array.isArray(configs) ? configs : [configs];

    componentConfigs.forEach(
      this.limiter((config) => this.initComponent(config, context), 500),
    );
  }

  initComponent(componentConfig, context) {
    const componentName = componentConfig.name;
    const ComponentClass = componentConfig.class;

    // Check if component is configured and extends the core Component class
    if (ComponentClass.prototype instanceof Component) {
      const hasComponent = Object.keys(this.manifest.components)
        .includes(componentName);
      const componentEls = context
        .querySelectorAll(`[data-component='${componentName}']`);

      // Can't find any elements!
      if (!componentEls.length) {
        /* eslint-disable no-console, max-len */
        console.info(`No elements found for data-component="${componentName}"`);
        /* eslint-enable */
        return;
      }

      // Add component to manifest if it doesn't exist already
      if (!hasComponent) {
        this.manifest.components[componentName] = {
          config: componentConfig,
          instances: [],
        };
      }

      // Loop through elements and add instance for each
      Array.prototype.forEach.call(componentEls, (element) => {
        // Skip this element if we've already instantiated a component on it
        const exists = this.manifest.components[componentName].instances
          .some((instance) => element.isSameNode(instance.element));

        if (exists) {
          return;
        }

        // Create and start instance
        const configCopy = componentConfig;
        configCopy.element = element;
        const instance = new ComponentClass(configCopy);

        // add instance to manifest
        this.manifest.components[componentName].instances.push({
          instance,
          element,
        });
      });
    }
  }

  /**
   * Loop through and restart components (use, for example, if you've removed and re-added components from the DOM and need the JS started again)
   *
   * @param {string} componentName - name of component to instantiate
   * @param {HTMLElement} context - context on which to initialize components, default is entire document
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
      this.manifest[componentName]
      && this.manifest[componentName].instances
    ) {
      this.manifest[componentName].instances.forEach((instance) => {
        // Use JS .call to call the component method with proper context
        if (typeof instance[method] === 'function') {
          instance[method].call(instance, ...args);
        }
      });
    }
  }
}
