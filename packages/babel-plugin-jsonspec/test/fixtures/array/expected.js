import * as _js from 'jsonspec';

const check = value => {
  let err;

  if (!Array.isArray(value)) {
    (err = err || []).push({
      issue: 'not an array',
      path: []
    });
  } else {
    for (let index = 0; index < value.length; index++) {
      const value_index = value[index];

      if (typeof value_index !== 'number') {
        (err = err || []).push({
          issue: 'not a number',
          path: [index]
        });
      }
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
