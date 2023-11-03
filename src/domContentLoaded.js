/**
 * Executes the given callback when DOMContentLoaded is ready.
 *
 * @param {function} cb Callback to execute once DOMContentLoaded completes.
 */
const domContentLoaded = (cb) => {
  if (
    document.readyState === 'complete'
    || document.readyState === 'interactive'
  ) {
    cb();
  }

  document.addEventListener('DOMContentLoaded', cb, { once: true });
};

export default domContentLoaded;
