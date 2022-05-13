const _map = x => new Date(x);

const _limit = x => !isNaN(Date.parse(x));

const check = value => {
  let err, result;

  if (!_limit(value)) {
    (err = err || []).push({
      issue: 'does not fit the limit',
      path: []
    });
  } else {
    result = _map(value);
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
