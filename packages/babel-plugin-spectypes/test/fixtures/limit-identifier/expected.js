import * as _js from 'spectypes';
import { inc } from './inc';

const check = value => {
  let err;
  let error0;

  if (typeof value !== 'number') {
    error0 = true;
    (err = err || []).push({
      issue: 'not a number',
      path: []
    });
  }

  if (!error0 && !inc(value)) {
    (err = err || []).push({
      issue: 'does not fit the limit',
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
