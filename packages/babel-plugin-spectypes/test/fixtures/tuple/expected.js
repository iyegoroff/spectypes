import * as _js from 'spectypes';

const check = value => {
  let err;

  if (!Array.isArray(value)) {
    (err = err || []).push({
      issue: 'not an array',
      path: []
    });
  } else if (value.length !== 3) {
    (err = err || []).push({
      issue: 'length is not ' + 3,
      path: []
    });
  } else {
    const value_$30_ = value[0];

    if (typeof value_$30_ !== 'number') {
      (err = err || []).push({
        issue: 'not a number',
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

    const value_$32_ = value[2];

    if (typeof value_$32_ !== 'boolean') {
      (err = err || []).push({
        issue: 'not a boolean',
        path: [2]
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
