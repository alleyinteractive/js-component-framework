import { Component } from 'js-component-framework';

/**
 * Component for instantiating Headroom for sticky header
 */
export default class Header extends Component {

  /**
   * Start the component
   */
  constructor(config) {
    super(config);

    // Manual elements
    this.menuToggle = this.element.querySelector(this.children.menuToggle);

    // Other Options
    this.offset = this.options.offset;

    // Initalizations
    this.init();
  }

  /**
   * Initialize Header
   */
  init() {
    console.log(
      'You can access the configured child selectors via this.children'
    );
    console.log('Header title', this.children.title);
    console.log('Menu toggle', this.menuToggle);
    console.log('Header menu items', this.children.menuItems);
  }
}
