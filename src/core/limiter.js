/**
 * Rate limiter function.
 *
 * @see https://medium.com/@pat_migliaccio/rate-limiting-throttling-consecutive-function-calls-with-queues-4c9de7106acc
 * @param {function} fn function to call.
 * @param {integer} wait interval between function calls.
 */
function limiter(fn, wait) {
  let isCalled = false;
  const calls = [];

  // eslint-disable-next-line func-names
  const caller = function () {
    if (calls.length && !isCalled) {
      isCalled = true;
      calls.shift().call();
      setTimeout(() => {
        isCalled = false;
        caller();
      }, wait);
    }
  };

  // eslint-disable-next-line func-names
  return function (...args) {
    calls.push(fn.bind(this, args));
    caller();
  };
}

export default limiter;
