const catchAsync = (fn) => {
  return (req, res, next) => {
    // We execute the async controller function
    // If it resolves, great! If it rejects (throws an error), 
    // it automatically passes the error to Express's next() function
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export default catchAsync;
