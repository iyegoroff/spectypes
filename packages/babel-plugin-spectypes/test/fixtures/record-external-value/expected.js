import * as _spectypes from 'spectypes';

const Key = value => {
  let err;

  if (typeof value !== 'string') {
    (err = err || []).push({
      issue: 'not a string',
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

const check = value => {
  let err, result;
  result = {};

  if (!(typeof value === 'object' && value !== null && !Array.isArray(value))) {
    (err = err || []).push({
      issue: 'not an object',
      path: []
    });
  } else {
    for (let i = 0; i < _spectypes.bannedKeys.length; i++) {
      const ban = _spectypes.bannedKeys[i];

      if (Object.prototype.hasOwnProperty.call(value, ban)) {
        (err = err || []).push({
          issue: "includes banned '" + ban + "' key",
          path: []
        });
      }
    }

    for (const key in value) {
      let result_key;
      const value_key = value[key];
      const ext_value_key0 = Key(value_key);

      if (ext_value_key0.tag === 'failure') {
        (err = err || []).push(...ext_value_key0.failure.errors.map(fail => ({
          issue: '' + fail.issue,
          path: [key, ...fail.path]
        })));
      } else {
        result_key = ext_value_key0.success;
      }

      result[key] = result_key;
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
    success: result
  };
};
