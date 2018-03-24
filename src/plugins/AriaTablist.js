/* eslint-disable no-underscore-dangle */
import fastdom from 'fastdom';
import Aria from './Aria';

/**
 * Manage tablist elements
 *
 * @param {Object} config - Config options for AriaTablist
 * @param {HTMLElement} config.tablist - The tab elements' parent element
 * @param {NodeList} config.panels - A list of panel elements; each panel should have a corresponding tab element in config.tabs
 *
 * E.g.:
 * const tablist = new AriaTablist({
 *   tablist: tabsWrapper,
 *   panels: panelElements,
 * });
 */
export default class AriaTablist extends Aria {
  constructor(config) {
    super();

    this.tablist = config.tablist;
    this.panels = config.panels;

    this.index = 0;

    this.key = {
      arrows: /37|39|40/, // left, right, or down
      arrLeftRight: /37|39/,
      arrLeft: 37,
      arrRight: 39,
      arrDown: 40,
    };

    this.tablistChildren = Array.prototype.slice.call(this.tablist.children);
    this.panels = Array.prototype.slice.call(this.panels);

    // Required markup is `<li><a href=""></a></li>`
    this.tabs = this.tablistChildren
      .filter((child) => null !== child.querySelector('a[href]'))
      .map((child) => child.querySelector('a[href]'));

    // Bail if there's a mismatch in tabs and panels
    if (this.tabs.length !== this.panels.length) {
      // eslint-disable-next-line max-len
      console.error('AriaTablist requires an equal number of tabs and tabpanels');
      return;
    }

    // Bind class methods
    this.shiftTabKeyDown = this.shiftTabKeyDown.bind(this);
    this.keyDownHandler = this.keyDownHandler.bind(this);
    this.arrowKeyDown = this.arrowKeyDown.bind(this);
    this.tabKeyDown = this.tabKeyDown.bind(this);
    this.ariaSwitchTab = this.ariaSwitchTab.bind(this);
    this._updateTabs = this._updateTabs.bind(this);
    this.updateTabs = this.updateTabs.bind(this);
    this.tearDown = this.tearDown.bind(this);

    Aria.eventPolyfill();

    this.init();
  }

  /**
   * Add necessary attributes and event listeners; collect interactive elements.
   */
  init() {
    this.tablist.setAttribute('role', 'tablist');

    // role=tab, aria-selected
    this.tabs.forEach((tab, index) => {
      if ('LI' === tab.parentElement.nodeName) {
        tab.parentElement.setAttribute('role', 'presentation');
      }

      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-selected', `${this.index === index}`);
      if (this.index === index) {
        tab.setAttribute('tabindex', '0');
      } else {
        tab.setAttribute('tabindex', '-1');
      }

      tab.addEventListener('click', this.ariaSwitchTab);
      tab.addEventListener('keydown', this.keyDownHandler);
    });

    // role=tabpanel, aria-labelledby, aria-hidden
    this.panels.forEach((panel, index) => {
      panel.setAttribute('role', 'tabpanel');
      panel.setAttribute('aria-hidden', `${this.index !== index}`);
    });

    this.targetElement = this.panels[this.index];
    this.collectInteractiveChildren();

    this.panels[this.index].addEventListener(
      'keydown',
      this.shiftTabKeyDown
    );

    const detail = { activePanel: this.panels[this.index] };
    const tabInit = Aria.createAriaEvent('tabinit', detail);
    this.tablist.dispatchEvent(tabInit);
  }

  /**
   * TAB from the active panel's first focusable element back to the active tab.
   *
   * @param {Object} event The event object.
   */
  shiftTabKeyDown(event) {
    if (event.keyCode === this.tabKey && event.shiftKey) {
      const focusIndex = this.interactiveChildElements
        .indexOf(document.activeElement);

      if (0 === focusIndex) {
        const currentPanel = this.panels
          .filter((panel) => ('false' === panel.getAttribute('aria-hidden')));
        const panelIndex = this.panels.indexOf(currentPanel[0]);

        event.preventDefault();
        this.tabs[panelIndex].focus();
      }
    }
  }

  /**
   * Handle tablist key presses.
   *
   * @param {Object} event The event object.
   */
  keyDownHandler(event) {
    if (event.keyCode === this.tabKey && !event.shiftKey) {
      this.tabKeyDown(event);
    } else if (this.key.arrows.test(event.keyCode)) {
      this.arrowKeyDown(event);
    }
  }

  /**
   * Move focus from active tab to active panel's first child.
   *
   * @param {Object} event The event object.
   */
  tabKeyDown(event) {
    if (this.interactiveChildElements.length) {
      event.preventDefault();
      this.interactiveChildElements[0].focus();
    }
  }

  /**
   * Navigate through tablist with arrow keys.
   *
   * @param {Object} event The event object.
   */
  arrowKeyDown(event) {
    let newIndex = null;
    const deactivate = {};
    const activate = {};

    const currentIndex = this.tabs.indexOf(event.currentTarget);
    deactivate.tab = this.tabs[currentIndex];
    deactivate.panel = this.panels[currentIndex];

    this.panels.forEach((panel) => {
      panel.removeAttribute('tabindex');
    });

    if (this.key.arrLeftRight.test(event.keyCode)) {
      switch (event.keyCode) {
        case this.key.arrLeft:
          newIndex = currentIndex - 1;
          break;
        case this.key.arrRight:
          newIndex = currentIndex + 1;
          break;
        default:
          newIndex = null;
      }

      if (undefined !== this.tabs[newIndex]) {
        event.preventDefault();

        activate.index = newIndex;
        activate.tab = this.tabs[newIndex];
        activate.panel = this.panels[newIndex];

        this.updateTabs(deactivate, activate);
        activate.tab.focus();
      }
    } else if (event.keyCode === this.key.arrDown) {
      event.preventDefault();
      this.panels[currentIndex].setAttribute('tabindex', '-1');
      this.panels[currentIndex].focus();
    }
  }

  /**
   * Externally-exposed tab updater method
   */
  updateTabs(deactivate, activate) {
    fastdom.mutate(() => {
      this._updateTabs(deactivate, activate);
    });
  }

  /**
   * Toggle active panel based on active tab.
   *
   * @param {Object} deactivate
   * @param {HTMLElement} deactivate.tab The tab item to deactivate.
   * @param {HTMLElement} deactivate.panel The panel to deactivate.
   * @param {Object} activate
   * @param {HTMLElement} activate.tab The tab item to activate.
   * @param {HTMLElement} activate.panel The panel to activate.
   * @private
   */
  _updateTabs(deactivate, activate) {
    let selected = 'false';
    let hidden = 'true';

    if (
      (null !== deactivate.tab || null !== activate.tab) ||
      (null !== deactivate.panel || null !== activate.panel)
    ) {
      // Update current tab
      deactivate.tab.setAttribute('tabindex', '-1');
      deactivate.tab.setAttribute('aria-selected', selected);
      deactivate.panel.setAttribute('aria-hidden', hidden);

      this.targetElement = deactivate.panel;
      this.collectInteractiveChildren();

      Array.prototype.forEach.call(
        this.interactiveChildElements,
        (focusElement) => {
          focusElement.setAttribute('tabindex', '-1');
        }
      );

      deactivate.panel.removeEventListener('keydown', this.shiftTabKeyDown);

      // Update new active tab
      [selected, hidden] = [hidden, selected];
      activate.tab.setAttribute('tabindex', '0');
      activate.tab.setAttribute('aria-selected', selected);
      activate.panel.setAttribute('aria-hidden', hidden);

      this.targetElement = activate.panel;
      this.collectInteractiveChildren();

      Array.prototype.forEach.call(this.interactiveChildElements, (element) => {
        if ('-1' === element.getAttribute('tabindex')) {
          element.removeAttribute('tabindex');
        }
      });

      this.index = activate.index;

      activate.panel.addEventListener('keydown', this.shiftTabKeyDown);

      const detail = { activePanel: this.panels[this.index] };
      const tabChange = Aria.createAriaEvent('tabchange', detail);
      this.tablist.dispatchEvent(tabChange);
    }
  }

  /**
   * Collect tab and panel info then toggle tabs/panels.
   *
   * @param {Object} event The event object.
   */
  ariaSwitchTab(event) {
    const deactivate = {};
    const activate = {};

    event.preventDefault();

    if ('true' !== event.target.getAttribute('aria-selected')) {
      deactivate.tab = this.tablist.querySelector('[aria-selected="true"]');
      const currentTablistIndex = this.tabs.indexOf(deactivate.tab);
      deactivate.panel = this.panels[currentTablistIndex];

      activate.index = this.tabs.indexOf(event.target);
      activate.tab = this.tabs[activate.index];
      activate.panel = this.panels[activate.index];

      this.updateTabs(deactivate, activate);
    }
  }

  /**
   * Destroy the tablist, removing ARIA attributes and event listeners
   */
  tearDown() {
    this.tablist.removeAttribute('role');

    this.tabs.forEach((tab, index) => {
      tab.removeAttribute('role');
      tab.removeAttribute('aria-selected');
      if (this.index !== index) {
        tab.removeAttribute('tabindex');
      }

      tab.removeEventListener('click', this.ariaSwitchTab);
      tab.removeEventListener('keydown', this.keyDownHandler);
    });

    this.panels.forEach((panel) => {
      panel.removeAttribute('role');
      panel.removeAttribute('aria-hidden');
    });

    this.targetElement = this.panels[this.index];
    this.collectInteractiveChildren();

    this.panels[this.index].removeEventListener(
      'keydown',
      this.shiftTabKeyDown
    );

    const detail = { activePanel: null };
    const tablistTeardown = Aria.createAriaEvent('tablistTeardown', detail);
    this.tablist.dispatchEvent(tablistTeardown);
  }
}
