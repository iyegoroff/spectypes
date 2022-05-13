import { int } from './num';

const check = value => {
  let err, result;
  result = [];

  if (!Array.isArray(value)) {
    (err = err || []).push({
      issue: 'not an array',
      path: []
    });
  } else {
    for (let index = 0; index < value.length; index++) {
      let result_index;
      const value_index = value[index];
      const ext_value_index0 = int(value_index);

      if (ext_value_index0.tag === 'failure') {
        (err = err || []).push(...ext_value_index0.failure.errors.map(fail => ({
          issue: '' + fail.issue,
          path: [index, ...fail.path]
        })));
      } else {
        result_index = ext_value_index0.success;
      }

      result[index] = result_index;
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
