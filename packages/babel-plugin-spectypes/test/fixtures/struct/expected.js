import * as _spectypes from 'spectypes';

const check = value => {
  let err, result;
  result = {};

  if (!(typeof value === 'object' && value !== null && !Array.isArray(value))) {
    (err = err || []).push({
      issue: 'not an object',
      path: []
    });
  } else {
    const value_x = value.x;

    if (typeof value_x !== 'number') {
      (err = err || []).push({
        issue: 'not a number',
        path: ['x']
      });
    }

    result.x = value_x;
    const value_y = value.y;

    if (typeof value_y !== 'string') {
      (err = err || []).push({
        issue: 'not a string',
        path: ['y']
      });
    }

    result.y = value_y;
    const value_z = value.z;

    if (typeof value_z !== 'boolean') {
      (err = err || []).push({
        issue: 'not a boolean',
        path: ['z']
      });
    }

    result.z = value_z;
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
