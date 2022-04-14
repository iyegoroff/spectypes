import * as _js from 'spectypes';

const check = value => {
  let err, result;

  if (value !== null && value !== undefined) {
    (err = err || []).push({
      issue: "not 'null' or 'undefined'",
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
    success: result
  };
};
