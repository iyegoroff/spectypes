import * as _spectypes from 'spectypes';

const check = value => {
  let err;

  if (value !== 'test') {
    (err = err || []).push({
      issue: "not a '" + 'test' + "' string literal",
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
