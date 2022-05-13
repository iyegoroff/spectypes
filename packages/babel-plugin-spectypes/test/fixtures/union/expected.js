const check = value => {
  let err;

  if (!(typeof value === 'number' || typeof value === 'string' || typeof value === 'boolean')) {
    if (typeof value !== 'number') {
      (err = err || []).push({
        issue: 'union case #0 mismatch: not a number',
        path: []
      });
    }

    if (typeof value !== 'string') {
      (err = err || []).push({
        issue: 'union case #1 mismatch: not a string',
        path: []
      });
    }

    if (typeof value !== 'boolean') {
      (err = err || []).push({
        issue: 'union case #2 mismatch: not a boolean',
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
