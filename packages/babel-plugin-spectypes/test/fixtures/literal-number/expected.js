import * as _spectypes from 'spectypes';

const check = value => {
  let err;

  if (value !== 1) {
    (err = err || []).push({
      issue: "not a '" + 1 + "' number literal",
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
