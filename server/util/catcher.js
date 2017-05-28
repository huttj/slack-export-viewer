module.exports = function catcher(handler) {
  return (req, res, next) => {
    try {
      const promise = handler(req, res, next);
      if (promise && promise.catch) promise.catch(error => next(error.stack));
    } catch (error) {
      next(error.stack);
    }
  }
};