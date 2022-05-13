const check = value => {
  let err;

  if (value !== null) {
    (err = err || []).push({
      issue: "not a '" + null + "' literal",
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
