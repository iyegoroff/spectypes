import * as _js from 'spectypes';

const _filter = x => x > 1;

const check = value => {
  let err, result;
  result = [];

  if (!Array.isArray(value)) {
    (err = err || []).push({
      issue: 'not an array',
      path: []
    });
  } else {
    let filterindex = 0;

    for (let index = 0; index < value.length; index++) {
      const value_index = value[index];

      if (typeof value_index !== 'number') {
        (err = err || []).push({
          issue: 'not a number',
          path: [index]
        });
      }

      if (!err && _filter(value_index)) {
        result[filterindex++] = value_index;
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
