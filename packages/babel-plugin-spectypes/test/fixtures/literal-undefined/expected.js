import * as _js from 'spectypes';

const check = value => {
  let err;

  if (value !== undefined) {
    (err = err || []).push({
      issue: "not a '" + undefined + "' literal",
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
