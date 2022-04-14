import * as _js from 'jsonspec';

const _limit = prod => prod.contents === undefined || prod.price === prod.contents.reduce((sum, p) => sum + p.price, 0);

const _map = name => name.toUpperCase();

const _limit2 = price => price > 0;

const _template = new RegExp('^' + _js.stringTest + _js.escape('-') + _js.stringTest + _js.escape('-') + _js.numberTest + '$');

const product = value => {
  let err, result;
  let error0;
  result = {};

  if (typeof value !== 'object' || Array.isArray(value) || value === null) {
    error0 = true;
    (err = err || []).push({
      issue: 'not an object',
      path: []
    });
  } else {
    let result_name;
    const value_name = value.name;

    if (typeof value_name !== 'string') {
      error0 = true;
      (err = err || []).push({
        issue: 'not a string',
        path: ['name']
      });
    }

    if (!err) {
      result_name = _map(value_name);
    }

    result.name = result_name;
    let error_price0;
    const value_price = value.price;

    if (typeof value_price !== 'number') {
      error0 = true;
      error_price0 = true;
      (err = err || []).push({
        issue: 'not a number',
        path: ['price']
      });
    }

    if (!error_price0 && !_limit2(value_price)) {
      error0 = true;
      (err = err || []).push({
        issue: 'does not fit the limit',
        path: ['price']
      });
    }

    result.price = value_price;
    const value_id = value.id;

    if (typeof value_id !== 'string') {
      error0 = true;
      (err = err || []).push({
        issue: 'not a string',
        path: ['id']
      });
    } else if (!_template.test(value_id)) {
      error0 = true;
      (err = err || []).push({
        issue: 'template literal mismatch',
        path: ['id']
      });
    }

    result.id = value_id;
    let result_contents;
    const value_contents = value.contents;

    if ('contents' in value) {
      if (value_contents !== undefined) {
        result_contents = [];

        if (!Array.isArray(value_contents)) {
          error0 = true;
          (err = err || []).push({
            issue: 'not an array',
            path: ['contents']
          });
        } else {
          for (let index_contents = 0; index_contents < value_contents.length; index_contents++) {
            let result_contents_index_contents;
            const value_contents_index_contents = value_contents[index_contents];
            const ext_value_contents_index_contents0 = product(value_contents_index_contents);

            if (ext_value_contents_index_contents0.tag === 'failure') {
              error0 = true;
              (err = err || []).push(...ext_value_contents_index_contents0.failure.errors.map(fail => ({
                issue: '' + fail.issue,
                path: ['contents', index_contents, ...fail.path]
              })));
            } else {
              result_contents_index_contents = ext_value_contents_index_contents0.success;
            }

            result_contents[index_contents] = result_contents_index_contents;
          }
        }
      }

      result.contents = result_contents;
    }
  }

  if (!error0 && !_limit(result)) {
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
    success: result
  };
};
