const check = value => {
  let err;

  if (!(typeof value === 'object' && value !== null && !Array.isArray(value))) {
    (err = err || []).push({
      issue: 'not an object',
      path: []
    });
  } else {
    const value_x = value.x;

    if (value_x !== undefined) {
      if (typeof value_x !== 'number') {
        (err = err || []).push({
          issue: 'not a number',
          path: ['x']
        });
      }
    }

    for (const key in value) {
      if (!(key === 'x')) {
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
