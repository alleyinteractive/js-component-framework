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
  options: {
    offset: 100,
  },
};

export default headerConfig;
