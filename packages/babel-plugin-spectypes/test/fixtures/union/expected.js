import * as _js from 'spectypes';

const check = value => {
  let err;
  let unmatched;

  if (typeof value !== 'number') {
    unmatched = true;
  }

  if (unmatched) {
    unmatched = false;

    if (typeof value !== 'string') {
      unmatched = true;
    }
  }

  if (unmatched) {
    unmatched = false;

    if (typeof value !== 'boolean') {
      unmatched = true;
    }
  }

  if (unmatched) {
    if (typeof value !== 'number') {
      (err = err || []).push({
        issue: 'union case #0 mismatch: not a number',
        path: []
      });
    }

    if (typeof value !== 'string') {
      (err = err || []).push({
        issue: 'union case #1 mismatch: not a string',
        path: []
      });
    }

    if (typeof value !== 'boolean') {
      (err = err || []).push({
        issue: 'union case #2 mismatch: not a boolean',
        path: []
      });
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
