import * as _js from 'spectypes';

const _filter = x => x.length > 5;

const _filter2 = x => x;

const check = value => {
  let err, result;
  result = {};

  if (typeof value !== 'object' || Array.isArray(value) || value === null) {
    (err = err || []).push({
      issue: 'not an object',
      path: []
    });
  } else {
    for (let i = 0; i < _js.bannedKeys.length; i++) {
      const ban = _js.bannedKeys[i];

      if (Object.prototype.hasOwnProperty.call(value, ban)) {
        (err = err || []).push({
          issue: "includes banned '" + ban + "' key",
          path: []
        });
      }
    }

    for (const key in value) {
      const value_key = value[key];

      if (typeof value_key !== 'boolean') {
        (err = err || []).push({
          issue: 'not a boolean',
          path: [key]
        });
      }

      if (!err && _filter(key) && _filter2(value_key)) {
        result[key] = value_key;
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
    success: result
  };
};
