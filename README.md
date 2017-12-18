# Component starter framework
This directory contains the tools for a JS component setup Alley uses, in different variations, on many projects including [hollywoodlife](https://github.com/alleyinteractive/pmc-hollywoodlife-2017), [brookings](https://github.com/alleyinteractive/brookings), and [hachette](https://github.com/alleyinteractive/hachette).

## What does this framework do?
This framework is a method of attaching an ES6 class to a DOM element or collection of DOM elements. This is largely accomplished by the Component and ComponentManager classes located at the top level of this directory in the following steps:

* You provide a configuration and an ES6 class (which extends the base Component class). More on how to set this up later in the documentation.
* In one of your entry points (`site.js`, `article.js`), create a ComponentManager and call its `instanceComponents` method, passing it one or more component configurations.
* The ComponentManager will loop through every match it finds for the component name in your configuration and start an instance of the component class. It will then add each instance of the component to a global manifest on the `window` object, using a property provided when you instanced the manager.
* This results in distinct (and encapsulated) functionality for each DOM element with JS functionality.

## How to set up a component

* Create a new subdirectory in this directory (`components`). The directory name should be capitalized and named for the component it contains. For example, a `Header` directory would contain a `Header.js` component.
* Create a configuration for your component within the directory you created. Generally, this is named using the convention `[componentName]Config.js`, so a header component would have `headerConfig.js`. An example configuration can be found [here](client/js/components/Header/headerConfig.js) The configuration requires several properties:
** `name` - *required* - **THIS _MUST_ BE UNIQUE**. An arbitrary name for the component. This is used to find component elements via data attribute `data-component="componentName"`. `name` is also used to store instances of the component in the global manifest.
** `class` - *required* - The imported ES6 class for the component.
** `querySelector` - *optional* - An object containing child selectors you'll need for the component logic. Each of these selectors should correspond to an element of which there is only one within the component (and will be queried using the `querySelector` JS method). The base Component class will automatically query these selectors and add them as properties to the class (using the provided object keys). For example, if you provide `title: '.site-title'`, this will be accessible in your component class as `this.children.title`.
** `querySelectorAll` - *optional* - Same as `querySelector`, but will provide an array of each element it finds matching the selector.
** `children` - *optional* - If you prefer to set up the contents of `this.children` manually, you can provide selectors directly to this object and query them yourself in the component constructor. Example in [here](client/js/components/Header/Header.js).
** `options` - *optional* - An object containing arbitrary additional options for the component. This could be a configuration for another JS library, values used for calculating styles, etc.
* Create an ES6 class for your component. Generally, this filename is capitalized and corresponds to the name of the class. For example, you'd use `Header.js` to name the file containing `class Header() {}`. When writing a component class, are some rules you need to follow and some guidelines:
** You _must_ provide a constructor. At minimum, the constructor should look like the following:
	```javascript
	constructor(config) {
		super(config);
	}
	```
	This constructor will be called when ComponentManager instances your component, your configuration passed in, then passed to the parent Component class using the `super()` function.
** Don't perform much logic within the class constructor. Instead, separate logic into distinct methods, each for a specific purpose. Use the constructor to call these methods and initialize any runtime component logic, event listeners, calculations, etc.
** Any method you might call from another component or use as a callback for an event listener should be bound to the component class using `this.myMethod = this.myMethod.bind(this)`. Methods can be called from other components using the component manager via `manager.callComponentMethod`. See the ComponentManager class for documentation.
* Import the component config in one of your entry point files, and pass that config to the ComponentManager's instanceComponents method. Generally speaking, you'll want to instance your component in the footer or on `DOMContentLoaded` An example can be found [here](client/js/site/site.js), but here's the gist of it:
```javascript
// site.js

import headerConfig from `./Header/headerConfig`;
import ComponentManager from `./ComponentManager`;

// Instance manager
const manager = new ComponentManager('wp-starter-theme');

// Instance component(s)
document.addEventListener('DOMContentLoaded', () => {
  manager.initComponents(headerConfig);
});
```
* Be sure you've added the appropriate data attribute containing your configured `name` to the element(s) on which you want this component to be attached. For example, You would add `data-component="siteHeader"` to instance the Header component, assuming you configured the Header component `name` to be `siteHeader`.

That's it, happy coding!
