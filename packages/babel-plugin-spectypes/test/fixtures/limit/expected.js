const _limit = x => x > 1;

const check = value => {
  let err;

  if (typeof value !== 'number') {
    (err = err || []).push({
      issue: 'not a number',
      path: []
    });
  } else if (!_limit(value)) {
    (err = err || []).push({
      issue: 'does not fit the limit',
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
