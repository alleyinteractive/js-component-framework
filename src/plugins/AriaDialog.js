/* eslint-disable no-underscore-dangle */
import fastdom from 'fastdom';
import Aria from './Aria';

/**
 * Manage dialog (modal) elements
 *
 * @param {Object} config - Config options for AriaDialog
 * @param {HTMLElement} config.dialog - The dialog element
 * @param {HTMLElement} config.close - The dialog close button; should be the first child of the dialog
 * @param {Object} config.attributes - An Object of aria-* attributes to be added to the `target`, where the key completes an 'aria-' attribute name and the value is a valid attribute value.
 * @param {HTMLElement} config.content - The element wrapping the site content, of which the modal is NOT a child. The modal should be a child of document.body
 *
 * E.g.:
 * const modal = new AriaDialog({
 *   dialog: modalElement,
 *   close: closeElement,
 *   attributes: {
 *     label: 'Modal Title'
 *     labelledby: 'element-id'
 *     describedby: 'verbose-element-id'
 *   },
 *   content: siteWrapperElement
 * });
 */
export default class AriaDialog extends Aria {
  /**
   * Create the dialog overlay element.
   */
  static createOverlayElement() {
    const overlay = document.createElement('div');
    overlay.id = 'aria-dialog-overlay';
    return overlay;
  }

  constructor(config) {
    super();

    this.element = config.dialog;
    this.closeButton = config.close;
    this.siteContent = config.content;
    this.attributes = config.attributes || {};

    this.targetElement = this.element;

    this.overlay = document.getElementById('aria-dialog-overlay');
    if (null === this.overlay) {
      this.overlay = this.constructor.createOverlayElement();
      document.body.insertBefore(this.overlay, this.element);
    }

    this.isShown = false;

    // Bind class methods
    this.outsideClick = this.outsideClick.bind(this);
    this.keyDownHandler = this.keyDownHandler.bind(this);
    this.keydownTrapTab = this.keydownTrapTab.bind(this);
    this.keydownEsc = this.keydownEsc.bind(this);
    this._hide = this._hide.bind(this);
    this._show = this._show.bind(this);
    this.ariaHide = this.ariaHide.bind(this);
    this.ariaShow = this.ariaShow.bind(this);
    this.ariaToggle = this.ariaToggle.bind(this);

    Aria.eventPolyfill();
    this.init();
  }

  /**
   * Initial element setup.
   */
  init() {
    this.element.setAttribute('aria-hidden', 'true');

    Object.keys(this.attributes).forEach((attr) => {
      this.element.setAttribute(`aria-${attr}`, this.attributes[attr]);
    });
  }

  /**
   * Close the dialog on outside click.
   *
   * @param {Object} event The event object.
   */
  outsideClick(event) {
    if (this.isShown && !this.element.contains(event.target)) {
      this.ariaHide();
    }
  }

  /**
   * Handle key presses.
   *
   * @param {Object} event The event object.
   */
  keyDownHandler(event) {
    if (this.isShown) {
      if (event.keyCode === this.tabKey) {
        this.keydownTrapTab(event);
      } else if (event.keyCode === this.escapeKey) {
        this.keydownEsc();
      }
    }
  }

  /**
   * Trap key tabs inside dialog.
   *
   * @param {Object} event The event object.
   */
  keydownTrapTab(event) {
    this.collectInteractiveChildren();
    const focusedIndex = Array.prototype.indexOf.call(
      this.interactiveChildElements,
      document.activeElement
    );

    const lastItem = this.interactiveChildElements.length - 1;

    if (event.shiftKey && 0 === focusedIndex) {
      event.preventDefault();
      this.interactiveChildElements[lastItem].focus();
    } else if (!event.shiftKey && focusedIndex === lastItem) {
      event.preventDefault();
      this.interactiveChildElements[0].focus();
    }
  }

  /**
   * Close the dialog on ESC key press.
   */
  keydownEsc() {
    this.ariaHide();
  }

  /**
   * Externally-exposed hide method
   */
  ariaHide() {
    fastdom.mutate(this._hide);
  }

  /**
   * ARIA-hide the target element.
   *
   * @private
   */
  _hide() {
    this.element.setAttribute('aria-hidden', 'true');
    this.siteContent.setAttribute('aria-hidden', 'false');

    this.isShown = false;

    this.closeButton.removeEventListener('click', this.ariaHide);
    document.body.removeEventListener('keydown', this.keyDownHandler);
    this.overlay.removeEventListener('click', this.outsideClick);

    const detail = { expanded: this.isShown };
    const hide = Aria.createAriaEvent('dialoghide', detail);
    this.element.dispatchEvent(hide);

    this.focusEl.focus();
  }

  /**
   * Externally-exposed hide method
   */
  ariaShow() {
    fastdom.mutate(this._show);
  }

  /**
   * ARIA-show the target element.
   *
   * @private
   */
  _show() {
    this.focusEl = document.activeElement;
    this.element.setAttribute('aria-hidden', 'false');
    this.siteContent.setAttribute('aria-hidden', 'true');

    this.isShown = true;

    this.closeButton.addEventListener('click', this.ariaHide);
    document.body.addEventListener('keydown', this.keyDownHandler);
    this.overlay.addEventListener('click', this.outsideClick);

    const detail = { expanded: this.isShown };
    const show = Aria.createAriaEvent('dialogshow', detail);
    this.element.dispatchEvent(show);

    this.collectInteractiveChildren();
    this.setFocusToFirstItem();
  }

  /**
   * Toggle ARIA attributes.
   */
  ariaToggle() {
    if (this.isShown) {
      this.ariaHide();
    } else {
      this.ariaShow();
    }
  }
}
