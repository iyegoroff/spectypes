import * as _spectypes from 'spectypes';

const check = value => {
  let err;

  if (value !== undefined) {
    if (typeof value !== 'number') {
      (err = err || []).push({
        issue: 'not a number',
        path: []
      });
    }
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
