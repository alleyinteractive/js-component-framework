/**
 * Internal, extendable class for instantiating components.
 * Each component should contain functionality for a single DOM element or selector.
 */
export default class Component {
  /**
   * The string description for this class.
   * @private
   *
   * @type {String}
   */
  #stringDescription = 'FrameworkComponent';

  /**
   * Create a component
   *
   * @property {HTMLElement} config.element          The component element.
   *                                                 Has a `data-attribute` value matching `config.name`.
   * @property {string}      config.name             Component name, used in `data-component` attribute.
   * @property {object}      config.options          Arbitrary object of additional data.
   * @property {object}      config.querySelector    Map of component child element of which there is only one.
   * @property {object}      config.querySelectorAll Map of component child elements, of which there are many.
   */
  constructor({
    element,
    name,
    options,
    querySelector,
    querySelectorAll,
  }) {
    this.element = element;
    this.name = name;

    // Peripheral configuration properties
    this.options = options || {};
    this.children = {};

    // Query all children of which there is only one
    if (querySelector) {
      Object.keys(querySelector).forEach((elementKey) => {
        this.children[elementKey] = this.element
          .querySelector(querySelector[elementKey]);
      });
    }

    // Query all children of which there are many
    if (querySelectorAll) {
      Object.keys(querySelectorAll).forEach((elementKey) => {
        this.children[elementKey] = this.element
          .querySelectorAll(querySelectorAll[elementKey]);
      });
    }
  }

  /**
   * Get the string description for this object.
   * E.x., Component.toString() === '[object FrameworkComponent]'
   *
   * @return {string}
   */
  get [Symbol.toStringTag]() {
    return this.#stringDescription;
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
   * @param {HTMLElement} el      Element for which you need the offset
   * @param {HTMLElement} context Element relative to which the offset should be calculated
   */
  getOffsetTop(el, context) {
    return (context === el)
      ? 0
      : el.offsetTop + this.getOffsetTop(el.parentElement, context);
  }

  /**
   * Check whether a node is a descendant of another node.
   *
   * @param {HTMLElement} el      Element to check.
   * @param {HTMLElement} context Parent element to check against.
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
