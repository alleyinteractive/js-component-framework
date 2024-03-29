# Version 2

A framework for attaching an ES6 class to a DOM element or collection of DOM elements, making it easier to organize the DOM interactions on your website.

<picture>
  <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/Mqxx/GitHub-Markdown/main/blockquotes/badge/light-theme/warning.svg">
  <img alt="Warning" src="https://raw.githubusercontent.com/Mqxx/GitHub-Markdown/main/blockquotes/badge/dark-theme/warning.svg">
</picture><br>

Version 3.0.0 includes the following breaking changes for projects coming from v2:

* **Removed**: `ComponentManager` and its manifset; use `initComponents` instead
* **Changed**: Imports should use the `/v2` export (`'js-component-framework/v2'`)

Find full upgrade documentation in [the Wiki](https://github.com/alleyinteractive/js-component-framework/wiki/Updating-to-v3).

---

## Getting Started

Install the js-component-framework and all the plugins:

```bash
npm install js-component-framework
```

Below is a basic set up for using the component framework:

```javascript
import { Component } from 'js-component-framework/v2';

/**
 * Custom component which extends the base component class.
 */
class MyComponent extends Component {

  /**
   * Start the component
   */
  constructor(config) {
    super(config);
  }
}
```

## Creating a Component

Component elements are denoted by a `data-component` attribute, the value of which is used to match the component to its element(s).

```html
<header data-component="site-header">...</header>
```

### The Configuration Object

**name**: _(Required)_ - The component name. This must match the component root element's `data-component` attribute value.

**component**: _(Required)_ - A component can be created as an ES6 class or a function. This property accepts the exported class or function to be initialized for the component.

**querySelector**: _(Optional)_ - An object mapping of `name: selector` pairs matching a single child element of the component. Each selector is passed to `querySelector()` and the result is passed to as component's `children` property. For example, if you provide `{ title: '.site-title' }`, the element will be accessible in your component as `children.title`.

**querySelectorAll**: _(Optional)_ - Same as `querySelector`, but each selector is passed to `querySelectorAll()` and returned as an array of elements for each selector.

**options**: _(Optional)_ - An arbitrary value, typically an object, used by the component. This could be a configuration for another JS library, values used for calculating styles, etc. This is passed to the wrapped function as the `options` property.

### The component class

❗️ All components **must** extend `Component`.

```javascript
import { Component } from 'js-component-framework/v2';
```

❗️ A constructor is **required**. At minimum, the constructor should look like the following:

```javascript
constructor(config) {
  super(config);
}
```

## How to instantiate components

Import the component config in an entry point and pass that config to the `initComponents` function.

```javascript
import { initComponents } from 'js-component-framework/v2';
import headerConfig from './Components/Header';

// Create component instances
document.addEventListener('DOMContentLoaded', () => {
  initComponents([
    headerConfig
  ]);
});
```
