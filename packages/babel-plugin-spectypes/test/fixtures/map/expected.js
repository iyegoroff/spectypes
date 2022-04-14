import * as _js from 'spectypes';

const _map = x => x + 1;

const check = value => {
  let err, result;

  if (typeof value !== 'number') {
    (err = err || []).push({
      issue: 'not a number',
      path: []
    });
  }

  if (!err) {
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
