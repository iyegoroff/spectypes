import * as _js from 'spectypes';

const check = value => {
  let err;

  if (typeof value !== 'object' || Array.isArray(value) || value === null) {
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

    const value_y = value.y;

    if (typeof value_y !== 'string') {
      (err = err || []).push({
        issue: 'not a string',
        path: ['y']
      });
    }

    const value_z = value.z;

    if (typeof value_z !== 'boolean') {
      (err = err || []).push({
        issue: 'not a boolean',
        path: ['z']
      });
    }

    for (const key in value) {
      if (!(key === 'x' || key === 'y' || key === 'z')) {
        (err = err || []).push({
          issue: 'excess key - ' + key,
          path: []
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
