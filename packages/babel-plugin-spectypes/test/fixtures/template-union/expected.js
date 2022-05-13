import * as _spectypes from 'spectypes';

const _template = new RegExp('^' + _spectypes.escapeRegexp('test') + '(?:' + _spectypes.escapeRegexp('foo') + '|' + _spectypes.numberTest + '|' + '123' + ')' + _spectypes.booleanTest + '$');

const check = value => {
  let err;

  if (typeof value !== 'string') {
    (err = err || []).push({
      issue: 'not a string',
      path: []
    });
  } else if (!_template.test(value)) {
    (err = err || []).push({
      issue: 'template literal mismatch',
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
