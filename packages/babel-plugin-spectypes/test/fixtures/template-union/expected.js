import * as _js from 'spectypes';

const _template = new RegExp('^' + _js.escape('test') + '(?:' + _js.escape('foo') + '|' + _js.numberTest + '|' + '123' + ')' + _js.booleanTest + '$');

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
