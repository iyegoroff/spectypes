import * as _js from 'spectypes';

const _map = () => 'c';

const _map2 = () => 'c';

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
      let keyresult_key;
      let unmatchedkey_key;

      if (key !== 'a') {
        unmatchedkey_key = true;
      }

      if (!unmatchedkey_key) {
        keyresult_key = key;
      }

      if (unmatchedkey_key) {
        unmatchedkey_key = false;

        if (key !== 'b') {
          unmatchedkey_key = true;
        }

        if (!unmatchedkey_key) {
          keyresult_key = _map(key);
        }
      }

      if (unmatchedkey_key) {
        if (key !== 'a') {
          (err = err || []).push({
            issue: "key issue: union case #0 mismatch: not a '" + 'a' + "' string literal",
            path: [key]
          });
        }

        if (key !== 'b') {
          (err = err || []).push({
            issue: "key issue: union case #1 mismatch: not a '" + 'b' + "' string literal",
            path: [key]
          });
        }
      }

      const value_key = value[key];

      if (typeof value_key !== 'boolean') {
        (err = err || []).push({
          issue: 'not a boolean',
          path: [key]
        });
      }

      result[keyresult_key] = value_key;
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

