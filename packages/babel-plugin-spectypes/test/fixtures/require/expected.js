const _spectypes = require('spectypes');

const check = value => {
  let err;

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
      const value_key = value[key];

      if (typeof value_key !== 'boolean') {
        (err = err || []).push({
          issue: 'not a boolean',
          path: [key]
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
