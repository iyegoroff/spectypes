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

    for (const key in value) {
      if (!(key === 'x')) {
        const value_key = value[key];

        if (typeof value_key !== 'boolean') {
          (err = err || []).push({
            issue: 'not a boolean',
            path: [key]
          });
        }
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
