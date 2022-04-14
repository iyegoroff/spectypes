import * as _js from 'jsonspec';

const check = value => {
  let err;
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
