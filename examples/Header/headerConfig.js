import Header from './Header';

const headerConfig = {
  name: 'siteHeader',
  class: Header,
  querySelector: {
    title: '.site-title', // Automatically queried via `this.element.querySelector(selector)`
  },
  querySelectorAll: {
    menuItems: '.menu-item', // Automatically queried via `this.element.querySelectorAll(selector)`
  },
  children: {
    menuToggle: '.menu-toggle', // You can set up the component children manually, if you prefer
  },
  options: {
    offset: 100,
  },
};

export default headerConfig;
