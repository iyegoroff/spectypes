import * as _spectypes from 'spectypes';
import { inc } from './inc';

const check = value => {
  let err, result;

  if (typeof value !== 'number') {
    (err = err || []).push({
      issue: 'not a number',
      path: []
    });
  }

  if (!err) {
    result = inc(value);
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
