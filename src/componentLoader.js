import domContentLoaded from './domContentLoaded';

/**
 * Execute the given function according to the `load` parameter.
 *
 * @param {function} init The function to execute.
 * @param {boolean|array|function} load The loading instructions.
 */
export default function componentLoader(init, load = domContentLoaded) {
  if (init) {
    if (typeof load === 'function') {
      load(init);
    } else if (Array.isArray(load)) {
      const [element, event] = load;

      // e.g., load: [window, 'load']
      element?.addEventListener(event, init);
    }
  }
}
