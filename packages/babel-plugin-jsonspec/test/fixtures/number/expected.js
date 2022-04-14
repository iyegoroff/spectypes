import * as _js from 'jsonspec';

const check = value => {
  let err;

  if (typeof value !== 'number') {
    (err = err || []).push({
      issue: 'not a number',
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
