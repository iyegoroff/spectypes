import * as _spectypesNext from 'spectypes-next';

const check = value => {
  let err;

  if (typeof value !== 'boolean') {
    (err = err || []).push({
      issue: 'not a boolean',
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
