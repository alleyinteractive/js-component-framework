/**
 * Rate limiter function.
 *
 * @see https://medium.com/@pat_migliaccio/rate-limiting-throttling-consecutive-function-calls-with-queues-4c9de7106acc
 * @param {function} fn function to call.
 * @param {integer} wait interval between function calls.
 */
function limiter(fn, wait){
  let isCalled = false,
      calls = [];

  let caller = function(){
      if (calls.length && !isCalled){
          isCalled = true;
          calls.shift().call();
          setTimeout(function(){
              isCalled = false;
              caller();
          }, wait);
      }
  };

  return function(){
      calls.push(fn.bind(this, ...arguments));
      caller();
  };
}

export default limiter;
