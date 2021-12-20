/* eslint-disable no-underscore-dangle */
import fastdom from 'fastdom';
import Aria from './Aria';

/**
 * Manage aria-haspopup elements
 *
 * @param {Object} config                 Config options for AriaPopup
 * @param {HTMLElement} config.controller The controlling element
 * @param {HTMLElement} config.target     The element controlled by `controller`
 * @param {Object} config.attributes      An Object of aria-* attributes to be added to the `target`, where the key
 *                                        completes an 'aria-' attribute name and the value is a valid attribute value.
 * @param {Boolean} config.loadOpen       Whether or not the popup should load expanded by default
 * @param {String} config.hasTransition   Delay updating post- hide/show routines until after `transitionend`
 *
 * E.g.:
 * const popup = new AriaPopup({
 *   controller: controllingButton,
 *   target: targetElement,
 *   attributes: {
 *     label: 'submenu'
 *     labelledby: 'element-id'
 *     describedby: 'verbose-element-id'
 *   }
 *   loadOpen: true,
 *   hasTransition: true,
 * });
 */
export default class AriaPopup extends Aria {
  constructor(config) {
    super();

    this.controller = config.controller;
    this.target = config.target;
    this.attributes = config.attributes || {};
    this._loadOpen = config.loadOpen || false;
    this.hasTransition = config.hasTransition || false;

    this.targetElement = this.target;

    this.targetAttr = {};

    // Bind class methods
    this.setTargetAttributes = this.setTargetAttributes.bind(this);
    this.rovingTabIndex = this.rovingTabIndex.bind(this);
    this.outsideClick = this.outsideClick.bind(this);
    this.keyDownHandler = this.keyDownHandler.bind(this);
    this.keydownTabOut = this.keydownTabOut.bind(this);
    this.keydownEsc = this.keydownEsc.bind(this);
    this.ariaSetup = this.ariaSetup.bind(this);
    this._hide = this._hide.bind(this);
    this._show = this._show.bind(this);
    this._postToggle = this._postToggle.bind(this);
    this._destroy = this._destroy.bind(this);
    this._reset = this._reset.bind(this);
    this.ariaHide = this.ariaHide.bind(this);
    this.ariaShow = this.ariaShow.bind(this);
    this.ariaToggle = this.ariaToggle.bind(this);
    this.ariaDestroy = this.ariaDestroy.bind(this);
    this.ariaReset = this.ariaReset.bind(this);

    this.collectInteractiveChildren();
    this.setTargetAttributes();
    Aria.eventPolyfill();
    this.ariaSetup();
  }

  /**
   * Add initial attributes, establish relationships, and listen for events
   */
  ariaSetup() {
    this.loadOpen = this._loadOpen;
    this.isExpanded = this._loadOpen;

    this.controller.popup = this;
    this.target.popup = this;

    this.controller.setAttribute('aria-haspopup', 'true');
    this.controller.setAttribute('aria-expanded', `${this.loadOpen}`);
    this.controller.setAttribute('aria-controls', this.targetId);

    if (this.target !== this.controller.nextElementSibling) {
      this.controller.setAttribute('aria-owns', this.targetId);
    }

    this.target.setAttribute('aria-hidden', `${!this.loadOpen}`);

    Object.keys(this.targetAttr).forEach((attr) => {
      this.target.setAttribute(attr, this.targetAttr[attr]);
    });

    this.rovingTabIndex();

    this.controller.addEventListener('click', this.ariaToggle);
    this.target.addEventListener('keydown', this.keyDownHandler);
    document.body.addEventListener('click', this.outsideClick);

    if (this.hasTransition) {
      this.target.addEventListener('transitionend', this._postToggle);
    }

    Aria.dispatchAriaEvent(
      'popupinit',
      this.controller,
      { expanded: this.isExpanded },
    );
  }

  /**
   * Copy attributes over as their full attribute name.
   */
  setTargetAttributes() {
    if (typeof this.attributes === 'object') {
      Object.keys(this.attributes).forEach((prop) => {
        this.targetAttr[`aria-${prop}`] = this.attributes[prop];
      });
    }

    // Configure a target element ID if it doesn't exist.
    if (this.target.id !== '') {
      this.targetId = this.target.id;
    } else {
      this.targetId = Aria.generateTargetId(this.target);
      this.target.id = this.targetId;
    }
  }

  /**
   * Close the dialog on outside click.
   *
   * @param {Object} event The event object.
   */
  outsideClick(event) {
    if (
      this.isExpanded
      && !this.loadOpen
      && !this.controller.contains(event.target)
      && !this.target.contains(event.target)
    ) {
      this.ariaHide();
    }
  }

  /**
   * Handle key presses.
   *
   * @param {Object} event The event object.
   */
  keyDownHandler(event) {
    if (this.isExpanded && !this.loadOpen) {
      if (event.keyCode === this.tabKey) {
        this.keydownTabOut(event);
      } else if (event.keyCode === this.escapeKey) {
        event.stopPropagation();
        this.keydownEsc();
      }
    }
  }

  /**
   * Close the dialog on ESC key press.
   */
  keydownEsc() {
    this.ariaHide();
  }

  /**
   * Close submenu on tab-out.
   *
   * @param {Object} event The event object.
   */
  keydownTabOut(event) {
    const focusedIndex = Array.prototype.indexOf.call(
      this.interactiveChildElements,
      document.activeElement,
    );

    if (event.shiftKey && focusedIndex === 0) {
      event.preventDefault();
      this.ariaHide();
    } else if (
      !event.shiftKey
      && focusedIndex === this.interactiveChildElements.length - 1
    ) {
      this.ariaHide();
    }
  }

  /**
   * Prevent hidden menu items from having focus.
   */
  rovingTabIndex() {
    this.collectInteractiveChildren();

    Array.prototype.forEach.call(this.interactiveChildElements, (child) => {
      if (this.isExpanded) {
        child.removeAttribute('tabindex');
      } else {
        child.setAttribute('tabindex', '-1');
      }
    });
  }

  /**
   * Post-toggle cleanup.
   * Adjust focus and tabindex, dispatch the event.
   *
   * @private
   */
  _postToggle(event) {
    if (undefined === event || this.target === event.target) {
      if (this.isExpanded) {
        this.collectInteractiveChildren();
        this.rovingTabIndex();
      } else {
        this.rovingTabIndex();
      }

      Aria.dispatchAriaEvent(
        this.isExpanded ? 'popupshow' : 'popuphide',
        this.controller,
        { expanded: this.isExpanded },
      );
    }
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
    if (this.target.contains(document.activeElement)) {
      this.controller.focus();
    }

    this.controller.setAttribute('aria-expanded', 'false');
    this.target.setAttribute('aria-hidden', 'true');

    this.isExpanded = false;
    this.loadOpen = false;

    if (!this.hasTransition) {
      this._postToggle();
    }
  }

  /**
   * Externally-exposed show method
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
    this.controller.setAttribute('aria-expanded', 'true');
    this.target.setAttribute('aria-hidden', 'false');

    this.isExpanded = true;

    if (!this.hasTransition) {
      this._postToggle();
    }
  }

  /**
   * Toggle ARIA attributes.
   *
   * @param {Object} event The event object.
   */
  ariaToggle(event) {
    event.preventDefault();
    if (this.isExpanded) {
      this.ariaHide();
    } else {
      this.ariaShow();
    }
  }

  /**
   * Externally-exposed destroy method
   */
  ariaDestroy() {
    fastdom.mutate(this._destroy);
  }

  /**
   * Remove all ARIA attributes added by this class.
   *
   * @private
   */
  _destroy() {
    if (this.target.contains(document.activeElement)) {
      this.controller.focus();
    }

    this.controller.removeAttribute('aria-haspopup');
    this.controller.removeAttribute('aria-expanded');
    this.controller.removeAttribute('aria-controls');
    this.controller.removeAttribute('aria-owns');

    this.target.removeAttribute('aria-hidden');

    Object.keys(this.targetAttr).forEach((attr) => {
      this.target.removeAttribute(attr, this.targetAttr[attr]);
    });

    this.isExpanded = false;
    this.loadOpen = false;

    this.collectInteractiveChildren();

    Array.prototype.forEach.call(this.interactiveChildElements, (child) => {
      child.removeAttribute('tabindex');
    });

    this.controller.removeEventListener('click', this.ariaToggle);
    this.target.removeEventListener('keydown', this.keyDownHandler);
    this.target.removeEventListener('transitionend', this._postToggle);
    document.body.removeEventListener('click', this.outsideClick);

    Aria.dispatchAriaEvent(
      'popupdestroy',
      this.controller,
      { expanded: this.isExpanded },
    );
  }

  /**
   * Externally-exposed reset method
   */
  ariaReset() {
    fastdom.mutate(this._reset);
  }

  /**
   * Reset ARIA attributes.
   *
   * @private
   */
  _reset() {
    this.ariaSetup();

    if (this.target.contains(document.activeElement)) {
      this.controller.focus();
    }
  }
}
