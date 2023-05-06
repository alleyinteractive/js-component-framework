/* eslint-disable no-console */

/**
 * Initialize a component in its elements.
 *
 * @param {object} componentConfig The component configuration object.
 * @param {string} context         The component context.
 */
function initComponent(componentConfig, context) {
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
}

/**
 * Loop through configs and instantiate the component for each.
 *
 * @param {object|array} configs Config or configs corresponding to components you want to instantiate.
 * @param {HTMLElement}  context Context on which to initialize components, default is `document`.
 */
export default function initComponents(configs, context = document) {
  Array.from(configs).forEach((config) => initComponent(config, context));
}
