Updating
========

This document outlines two approaches to updating an existing project to use version 3.0.0:
* [Add basic support for breaking changes](#add-basic-support-for-breaking-changes)
* [Convert components for full v3 support](#convert-components-for-full-v3-support)

Additionally, the plugins have been removed. Consider using [aria-components](https://www.npmjs.com/package/aria-components) instead.

## Add basic support for breaking changes

1. Update `Component` imports to use the `/v2` export.

```diff
- import { Component } from 'js-component-framework';
+ import { Component } from 'js-component-framework/v2';
```

2. Import `initComponents`, also from the `/v2` export, and use it in place of `ComponentManager`.

```diff
- import { ComponentManager } from 'js-component-framework';
+ import { initComponents } from 'js-component-framework/v2';

- const manager = new ComponentManager('namespace');

 document.addEventListener('DOMContentLoaded', () => {
-   manager.initComponents([
+   initComponents([
     headerConfig
   ]);
 });
```

## Convert components for full v3 support

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
