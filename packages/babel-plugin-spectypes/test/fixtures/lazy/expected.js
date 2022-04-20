import * as _spectypes from 'spectypes';

const person = value => {
  let err;

  if (typeof value !== 'object' || Array.isArray(value) || value === null) {
    (err = err || []).push({
      issue: 'not an object',
      path: []
    });
  } else {
    const value_name = value.name;

    if (typeof value_name !== 'string') {
      (err = err || []).push({
        issue: 'not a string',
        path: ['name']
      });
    }

    const value_likes = value.likes;

    if (!Array.isArray(value_likes)) {
      (err = err || []).push({
        issue: 'not an array',
        path: ['likes']
      });
    } else {
      for (let index_likes = 0; index_likes < value_likes.length; index_likes++) {
        const value_likes_index_likes = value_likes[index_likes];
        const ext_value_likes_index_likes0 = person(value_likes_index_likes);

        if (ext_value_likes_index_likes0.tag === 'failure') {
          (err = err || []).push(...ext_value_likes_index_likes0.failure.errors.map(fail => ({
            issue: '' + fail.issue,
            path: ['likes', index_likes, ...fail.path]
          })));
        }
      }
    }

    for (const key in value) {
      if (!(key === 'name' || key === 'likes')) {
        (err = err || []).push({
          issue: 'excess key - ' + key,
          path: []
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
