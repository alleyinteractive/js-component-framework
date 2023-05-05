Upgrading to v3
=======================

Only classical components were supported in previous versions of js-component-framework. This document outlines the steps to convert them to be used with v3 of this package.

The plugins have been removed. Consider using [aria-components](https://www.npmjs.com/package/aria-components) instead.

## Starting Point

```javascript
// Header.js
import { Component } from 'js-component-framework';

export default class Header extends Component {
  constructor(config) {
    super(config);

    // Manual elements
    this.menuToggle = this.children.menuToggle;

    // Other Options
    this.offset = this.options.offset;

    // Initializations
    this.init();
  }

  init() {
    console.log(
      'Access the configured child selectors via this.children'
    );
    console.log('Header title', this.children.title);
    console.log('Menu toggle', this.menuToggle);
    console.log('Header menu items', this.children.menuItems);
  }
}
```

```javascript
// index.js
import Header from './Header';

const headerConfig = {
  name: 'siteHeader',
  class: Header,
  querySelector: {
    title: '.site-title',
  },
  querySelectorAll: {
    menuItems: '.menu-item',
  },
  options: {
    offset: 100,
  },
};

export default headerConfig;
```

```javascript
// site.js
import { ComponentManager } from 'js-component-framework';
import headerConfig from './components/Header';

const manager = new ComponentManager('namespace');

document.addEventListener('DOMContentLoaded', () => {
  manager.initComponents([
    headerConfig
  ]);
});
```

## Updates

1. Change the `class` config property to `component`.

```diff
// index.js
import Header from './Header';

const headerConfig = {
  name: 'siteHeader',
-  class: Header,
+  component: Header,
  querySelector: {
    title: '.site-title',
  },
  querySelectorAll: {
    menuItems: '.menu-item',
  },
  options: {
    offset: 100,
  },
};

export default headerConfig;
```

2. Classical components no longer extend `Component`.

```diff
// Header.js
- import { Component } from 'js-component-framework';

- export default class Header extends Component {
+ export default class Header {
  constructor(config) {
-    super(config);
```

3. Set any necessary instance properties based on the object passed to the constructor.

```diff
export default class Header {
-  constructor(config) {
+  constructor({ element, children, options }) {
+    this.element = element;
+    this.children = children;
+    this.options = options;
```


4. Remove `ComponentManager` imports and instead use `componentProvider` to load the component in the file from which  the config was previously exported.

```diff
// index.js
+ import { componentProvider } from 'js-component-framework';
import Header from './Header';

const headerConfig = {
  name: 'siteHeader',
  component: Header,
  querySelector: {
    title: '.site-title',
  },
  querySelectorAll: {
    menuItems: '.menu-item',
  },
  options: {
    offset: 100,
  },
};

- export default headerConfig;
+ componentProvider(headerConfig);
```

```diff
// site.js
- import { ComponentManager } from 'js-component-framework';
- import headerConfig from './components/Header';
+ import './components/Header';

- const manager = new ComponentManager('namespace');

-document.addEventListener('DOMContentLoaded', () => {
-  manager.initComponents([
-    headerConfig
-  ]);
-});
```

## Result

```javascript
// Header.js
export default class Header {
  constructor({ element, children, options}) {
    this.element = element;
    this.children = children;
    this.options = options;

    // Manual elements
    this.menuToggle = this.children.menuToggle;

    // Other Options
    this.offset = this.options.offset;

    // Initializations
    this.init();
  }

  init() {
    console.log(
      'Access the configured child selectors via this.children'
    );
    console.log('Header title', this.children.title);
    console.log('Menu toggle', this.menuToggle);
    console.log('Header menu items', this.children.menuItems);
  }
}
```

```javascript
// index.js
import Header from './Header';

const headerConfig = {
  name: 'siteHeader',
  component: Header,
  querySelector: {
    title: '.site-title',
  },
  querySelectorAll: {
    menuItems: '.menu-item',
  },
  options: {
    offset: 100,
  },
};

componentProvider(headerConfig);
```

```javascript
// site.js
import  './components/Header';
```
