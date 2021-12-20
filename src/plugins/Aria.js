/**
 * Aria class.
 */
export default class Aria {
  /**
   * Polyfill CustomEvent.
   *
   * @static
   * @returns {Boolean}
   */
  static eventPolyfill() {
    if (typeof window.CustomEvent === 'function') {
      return false;
    }

    function CustomEvent(
      event,
      params = {
        bubbles: false,
        cancelable: false,
        detail: undefined,
      },
    ) {
      const evt = document.createEvent('CustomEvent');
      evt.initCustomEvent(
        event,
        params.bubbles,
        params.cancelable,
        params.detail,
      );
      return evt;
    }

    CustomEvent.prototype = window.Event.prototype;

    window.CustomEvent = CustomEvent;
    return true;
  }

  /**
   * Dispatch a CustomEvent.
   *
   * @static
   * @param {String} type The type of the event.
   * @param {HTMLElement} detail The element upon which the event should be dispatched.
   * @param {Object} detail Data to be passed with the event.
   */
  static dispatchAriaEvent(type, element, detail = {}) {
    const event = new CustomEvent(
      type,
      {
        bubbles: true,
        cancelable: true,
        detail,
      },
    );

    element.dispatchEvent(event);
  }

  /**
   * Check if an element is visible
   *
   * @static
   * @param {HTMLElement} element The element whose visibility is being checked
   * @returns {Boolean}
   */
  static isVisible(element) {
    return !!(
      element.offsetWidth
      || element.offsetHeight
      || element.getClientRects().length
    );
  }

  /**
   * Create an `id` attribute for the target element, based on a derpHash of the element's className.
   *
   * @returns {String}
   */
  static generateTargetId(element) {
    const targetClasses = element.className;
    // derpHash: Ensure a passably unique ID (but lets not go overboard)
    const derpHash = (Math.random() / targetClasses.length)
      .toString(16).split('.')[1];
    return `id_${derpHash}_${targetClasses.split(' ').join('_')}`;
  }

  constructor() {
    // eslint-disable-next-line max-len
    this.collectInteractiveChildren = this.collectInteractiveChildren.bind(this);
    this.setFocusToFirstItem = this.setFocusToFirstItem.bind(this);

    this.selectors = [
      'a[href]',
      'area[href]',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'button:not([disabled])',
      'iframe',
      'object',
      'embed',
      '[contenteditable]',
      '[tabindex]:not([tabindex^="-"])',
    ].join(',');

    this.tabKey = 9;
    this.escapeKey = 27;
  }

  /**
   * Collect all interactive child elements.
   */
  collectInteractiveChildren() {
    if (undefined === this.targetElement) {
      // eslint-disable-next-line no-console
      console.error(
        'No `targetElement` specified for collectInteractiveChildren',
      );
      return;
    }

    const interactiveElements = this.targetElement.querySelectorAll(
      this.selectors,
    );
    this.interactiveChildElements = Array.prototype.filter.call(
      interactiveElements,
      (child) => this.constructor.isVisible(child),
    );
  }

  /**
   * Focus the dialog's first interactive child.
   */
  setFocusToFirstItem() {
    if (this.interactiveChildElements.length) {
      this.interactiveChildElements[0].focus();
    }
  }
}
