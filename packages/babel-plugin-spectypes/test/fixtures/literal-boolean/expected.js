const check = value => {
  let err;

  if (value !== true) {
    (err = err || []).push({
      issue: "not a '" + true + "' boolean literal",
      path: []
    });
  }

  return err ? {
    tag: 'failure',
    failure: {
      value,
      errors: err
    }
  } : {
    tag: 'success',
    success: value
  };
};
