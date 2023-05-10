# Change Log
This project adheres to [Semantic Versioning](http://semver.org/).

## 3.0.0

**Added**

* Adds `componentProvider` for initializing and loading components
* Adds `initComponents` for initializing legacy components using the `/v2` export

**Changed**

* Simplifies component creation by allowing components to be a class or a function
* Moves `Component` to the `/v2` endpoint

**Removed**

* Removes the rate limiter and writes to `window[manifest]`, which results in faster code execution
* Removes `ComponentManager`; use `initComponents` instead
* Removes Aria plugins; consider using [aria-components](https://www.npmjs.com/package/aria-components) instead.
* Removes the `/core` export due to code restructuring

## 2.1.0

Adds an ES Module export to reduce bundle sizes

## 2.0.0

**Changed**

* Reduce the size of the framework by adding a core/ directory which does not include the Aria plugins
* Updates babel configs and plugins
* Updates ESLint config and include Airbnb standards

**Removed**

* Polyfills and support for IE

## 1.2.6

Automated security updates

## 1.2.5

**Changed**

* Moved rate limiter to standalone function.

**Removed**

* Bottleneck library

## 1.2.4

Automated security updates

## 1.2.2

**Fixed**

* Bottleneck updates caused missing polyfills and non-transpiled code

**Changed**

* Updates Bottleneck package to latest

**Added**

* Babel polyfills and plugins relative to bottleneck package update
* Browserlist settings to package.json

## 1.2.1

**Fixed**

Bugs related to the hasTransition option for AriaPlugin

## 1.2.0

Updates to Aria classes.

**Fixed**

* Prevents arrow keys from activating out-of-bounds tabs

**Added**

* hasTransition option to delay focus, etc. until after transition
* Target and controller now have a reference to the parent popup
* loadOpen config option

**Changed**

* Normalizes Aria event names
* Refactors AriaTablist setup to verify markup

**Removed**

* Removes breakpoint option and related code
* Event listeners on ariaDestroy
* First item focus for popups

## 1.0.3

**Added**

Aria plugins.

## 1.0.1

Documentation updates.

## 1.0.0

Initial release.