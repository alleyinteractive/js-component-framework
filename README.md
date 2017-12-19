# Component Starter Framework

A framework for attaching an ES6 class to a DOM element or collection of DOM elements, making it easier to organize the DOM interactions on your website.

## How it works

A high-level overview on how it works. You ...

* provide a configuration and an ES6 class (which extends the base Component class).
* create a ComponentManager and call its `instanceComponents` method, passing it one or more component configurations created in the previous step.

The library will ...

* loop through every element match it finds for `data-component={componentName}` in your configuration and start an instance of the component class.
* add each instance of the component to a global manifest on the `window` object, using a property provided when you instanced the manager.

This results in distinct (and encapsulated) functionality for each DOM element.

## Best practices for creating components

### Create one directory per component

It will contain the configuration file and the class.

### The configuration file

Use the convention `[componentName]Config.js`. The configuration requires several properties:

* `name` - *required* - **THIS _MUST_ BE UNIQUE**. An arbitrary name for the component. This is used to find component elements via data attribute `data-component="componentName"`. `name` is also used to store instances of the component in the global manifest.
* `class` - *required* - The imported ES6 class for the component.
* `querySelector` - *optional* - An object containing child selectors you'll need for the component logic. Each of these selectors should correspond to an element of which there is only one within the component (and will be queried using the `querySelector` JS method). The base Component class will automatically query these selectors and add them as properties to the class (using the provided object keys). For example, if you provide `title: '.site-title'`, this will be accessible in your component class as `this.children.title`.
* `querySelectorAll` - *optional* - Same as `querySelector`, but will provide an array of each element it finds matching the selector.
* `children` - *optional* - If you prefer to set up the contents of `this.children` manually, you can provide selectors directly to this object and query them yourself in the component constructor. Example in [here](client/js/components/Header/Header.js).
* `options` - *optional* - An object containing arbitrary additional options for the component. This could be a configuration for another JS library, values used for calculating styles, etc.

[See the Header config example](./examples/Header/headerConfig.js) for context.

### The component class

To create a component, do the following at the top of the file:

```js
import { Component } from 'js-component-framework';
```

When writing a component class, are some rules you need to follow and some guidelines:

* You _must_ provide a constructor. At minimum, the constructor should look like the following:
	```js
	constructor(config) {
		super(config);
	}
	```
	This constructor will be called when ComponentManager instances your component, your configuration passed in, then passed to the parent Component class using the `super()` function.
* Don't perform much logic within the class constructor. Instead, separate logic into distinct methods, each for a specific purpose. Use the constructor to call these methods and initialize any runtime component logic, event listeners, calculations, etc.
* Any method you might call from another component or use as a callback for an event listener should be bound to the component class using `this.myMethod = this.myMethod.bind(this)`. Methods can be called from other components using the component manager via `manager.callComponentMethod`. See the ComponentManager class for documentation.

[See the Header example](./examples/Header/Header.js) for context.

## How to instantiate components

Import the component config in one of your entry point files, and pass that config to the ComponentManager's instanceComponents method. 

Generally speaking, you'll want to instantiate your component in the footer or on `DOMContentLoaded`.

```js

import { ComponentManager } from `js-component-framework`;
import headerConfig from `./Components/Header/headerConfig`;

// Instantiate manager
// "namespace" can be any string to namespace this instance of the manager
const manager = new ComponentManager('namespace');

// Create component instances
document.addEventListener('DOMContentLoaded', () => {
  manager.initComponents([
        headerConfig
    ]);
});
```

Be sure you've added the appropriate data attribute containing your configured `name` to the element(s) on which you want this component to be attached. For example, add `data-component="siteHeader"` to instance [the Header component](./examples/Header/Header.js), assuming you configured the Header component `name` to be `siteHeader`.
