import * as _js from 'jsonspec';

const check = value => {
  let err;

  if (!Array.isArray(value)) {
    (err = err || []).push({
      issue: 'not an array',
      path: []
    });
  } else if (value.length < 2) {
    (err = err || []).push({
      issue: 'length is less than ' + 2,
      path: []
    });
  } else {
    const value_$30_ = value[0];

    if (typeof value_$30_ !== 'string') {
      (err = err || []).push({
        issue: 'not a string',
        path: [0]
      });
    }

    const value_$31_ = value[1];

    if (typeof value_$31_ !== 'string') {
      (err = err || []).push({
        issue: 'not a string',
        path: [1]
      });
    }

    for (let index = 2; index < value.length; index++) {
      const value_index = value[index];

      if (typeof value_index !== 'boolean') {
        (err = err || []).push({
          issue: 'not a boolean',
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
