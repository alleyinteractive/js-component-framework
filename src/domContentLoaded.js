/* eslint consistent-return: ["error", { "treatUndefinedAsUnspecified": true }] */

/**
 * Executes the given callback when DOMContentLoaded is ready.
 *
 * @param {function} callback Callback to execute once DOMContentLoaded completes.
 */
function domContentLoaded(callback) {
  if (
    document.readyState === 'complete'
    || document.readyState === 'interactive'
  ) {
    return void callback(); // eslint-disable-line no-void
  }

  document.addEventListener('DOMContentLoaded', callback, { once: true });
}

export default domContentLoaded;
