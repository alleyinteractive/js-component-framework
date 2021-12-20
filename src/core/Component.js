/**
 * Internal, extendable class for instantiating components.
 * Each component should contain functionality for a single DOM element or selector.
 */
export default class Component {
  /**
   * Create a component
   *
   * @param {object} config - Options for the component
   * @param {string} config.name - Name of component, used in data-component attribute for instantiation and key for instance manifest
   * @param {Class}  config.class - ES6 class instance (should extend this class)
   * @param {object} config.querySelector - children of component's element of which there are only one
   * @param {object} config.querySelectorAll - children of component's element of which there are many
   * @param {object} config.options - arbitrary object of additional options
   * @param {object} config.children - selectors (defined as strings) you can query manually in the component
   */
  constructor(config) {
    this.element = config.element;
    this.started = false;
    this.name = config.name;

    // Peripheral configuration properties
    this.options = config.options || {};
    this.children = config.children || {};

    // Query all children of which there is only one
    if (config.querySelector) {
      Object.keys(config.querySelector).forEach((elementKey) => {
        this.children[elementKey] = this.element
          .querySelector(config.querySelector[elementKey]);
      });
    }

    // Query all children of which there are many
    if (config.querySelectorAll) {
      Object.keys(config.querySelectorAll).forEach((elementKey) => {
        this.children[elementKey] = this.element
          .querySelectorAll(config.querySelectorAll[elementKey]);
      });
    }
  }

  /**
   * Destroy the component, removing the element from the dom and all attached event handlers
   */
  destroy() {
    // remove instance element from DOM
    this.element.parentNode.removeChild(this.element);
  }

  /**
   * Get the top offset of an element relative to a specific DOM node.
   *
   * @param {HTMLElement} el - Element for which you need the offset
   * @param {HTMLElement} context - Element relative to which the offset should be calculated
   */
  getOffsetTop(el, context) {
    return (context === el) ? 0
      : el.offsetTop + this.getOffsetTop(el.parentElement, context);
  }

  /**
   * Check whether a node is a descendant of another node
   *
   * @param {HTMLElement} el - Element to check
   * @param {HTMLElement} context - Parent element to check against
   */
  static isChild(el, context) {
    if (el) {
      let node = el.parentNode;

      while (node) {
        if (node === context) {
          return true;
        }
        node = node.parentNode;
      }
    }

    return false;
  }
}
