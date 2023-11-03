JS Component Framework
======================

A zero-dependency framework for configuring a JavaScript component and attaching it to a DOM element or collection of DOM elements, simplifying organization of DOM interactions on your website.

Components can be ES6 classes or simple functions, and their child nodes are collected automatically based on the component configuration and passed to the component, which reduces or removes the need to write DOM queries for each component.

<picture>
  <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/Mqxx/GitHub-Markdown/main/blockquotes/badge/light-theme/warning.svg">
  <img alt="Warning" src="https://raw.githubusercontent.com/Mqxx/GitHub-Markdown/main/blockquotes/badge/dark-theme/warning.svg">
</picture><br>

Version 3.0.0 contains breaking changes. See [v2 documentation](src/v2/) for backward compatibility.

<picture>
  <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/Mqxx/GitHub-Markdown/main/blockquotes/badge/light-theme/info.svg">
  <img alt="Info" src="https://raw.githubusercontent.com/Mqxx/GitHub-Markdown/main/blockquotes/badge/dark-theme/info.svg">
</picture><br>

**Coming from a previous version?** Find full upgrade documentation in [the Wiki](https://github.com/alleyinteractive/js-component-framework/wiki/Updating-to-v3).

## Getting Started

Install js-component-framework from [NPM](https://www.npmjs.com/package/js-component-framework).

```bash
npm install js-component-framework
```

## Creating a Component

Component elements are denoted by a `data-component` attribute, the value of which is used to match the component to its element(s).

```
<header data-component="site-header">...</header>
```

### The Configuration Object

 **name**: _(Required if `root` isn't defined)_ - The component name. This must match the component root element's `data-component` attribute value.

**root**: _(Optional)_ - The selector for the component root. Must be a valid CSS selector string used by `querySelector()`. Will be ignored if `name` is defined.

**component**: _(Required)_ - A component can be created as an ES6 class or a function. This property accepts the exported class or function to be initialized for the component.

**querySelector**: _(Optional)_ - An object mapping of `name: selector` pairs matching a single child element of the component. Each selector is passed to `querySelector()` and the result is passed to as component's `children` property. For example, if you provide `{ title: '.site-title' }`, the element will be accessible in your component as `children.title`.

**querySelectorAll**: _(Optional)_ - Same as `querySelector`, but each selector is passed to `querySelectorAll()` and returned as an array of elements for each selector.

**options**: _(Optional)_ - An arbitrary value, typically an object, used by the component. This could be a configuration for another JS library, values used for calculating styles, etc. This is passed to the wrapped function as the `options` property.

**load**: _(Optional)_ - Accepts `false`, array, or a callback. _Default is a `domContentLoaded` callback_.

* `false` will disable loading and instruct `componentProvider` to return the provider function
* An array, in the format of `[HTMLElement, event]`, will listen on `HTMLElement` for `event` (e.g., `[window, 'load']`)
* A callback that accepts a function and contains the logic to call the function

### Component Properties

Components receive an object of component properties as their only argument. These are based on the config and are included automatically by the framework.

**element**: the `data-component` element to which the component is attached

**children**: the component’s child elements as described in `config.querySelector` and `config.querySelectorAll`

**options**: the `config.options` value, if any

#### Functional Components

Functional components receive the object of component properties as their only parameter.

```javascript
function myComponent({ element, children, options }) { ... }
```

#### Classical Components

For classical components, the object of component properties is passed as the constructor's only parameter.

```javascript
class MyComponent {
  constructor({ element, children, options }) { ... }
}
```

## Loading Components

Due to the nature of the component framework, components must be prepared for loading prior to initialization. By default, the function that performs this preparation will also load the component.

### componentProvider

`componentProvider` creates a provider function that contains all the properties and DOM querying logic necessary for all instances of the component to be initialized.

The component will automatically be initialized according to the `config.load` value. If `config.load` is `false`, the provider function is returned.

**Parameters**

**config** _(Required)_ A component config object.

```javascript
import { componentProvider } from 'js-component-framework';

function productDetails({ element, children, options }) { ... }

const productDetailsConfig = {
  name: 'product-details',
  component: productDetails,
  // load: false | array | function
  querySelectorAll: {
    toggles: '.product-details__toggle',
  },
};

componentProvider(productDetailsConfig);
```

When using a bundler like webpack, import the ES module for a smaller footprint:

```javascript
import { componentProvider } from 'js-component-framework/es';
```

### componentLoader

`componentLoader` is used by `componentProvider` to load components. It is exported individually for cases where one doesn't want `componentProvider` to load the provider function automatically.

**Parameters**

**providerFunction**: _(Required)_ A function returned from `componentProvider`.

**load**: _(Optional)_ A valid `config.load` value. _Default is a `domContentLoaded` callback_.

```javascript
// my-component/my-component.js

const wrappedComponent = componentProvider(config); // config.load === false
export default wrappedComponent;
```

```javascript
// my-component/index.js

import { componentLoader } from 'js-component-framework';
import wrappedComponent from './my-component';

// This is a contrived example; in a real-world component this same outcome can 
// be accomplished simply by setting the config load value to `[window, 'load']`
componentLoader(wrappedComponent, [window, 'load']);
```
