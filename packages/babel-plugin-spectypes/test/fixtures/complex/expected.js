import * as _spectypes from 'spectypes';

const _limit = age => age >= 0;

const persons = value => {
  let err;

  if (!Array.isArray(value)) {
    (err = err || []).push({
      issue: 'not an array',
      path: []
    });
  } else {
    for (let index = 0; index < value.length; index++) {
      const value_index = value[index];

      if (!(typeof value_index === 'object' && value_index !== null && !Array.isArray(value_index))) {
        (err = err || []).push({
          issue: 'not an object',
          path: [index]
        });
      } else {
        const value_index_name = value_index.name;

        if (typeof value_index_name !== 'string') {
          (err = err || []).push({
            issue: 'not a string',
            path: [index, 'name']
          });
        }

        const value_index_age = value_index.age;

        if (typeof value_index_age !== 'number') {
          (err = err || []).push({
            issue: 'not a number',
            path: [index, 'age']
          });
        } else if (!_limit(value_index_age)) {
          (err = err || []).push({
            issue: 'does not fit the limit',
            path: [index, 'age']
          });
        }

        const value_index_hobby = value_index.hobby;

        if (value_index_hobby !== undefined) {
          const value_index_hobby = value_index.hobby;

          if (!(value_index_hobby === 'coding' || value_index_hobby === 'poetry' || value_index_hobby === 'music')) {
            if (value_index_hobby !== 'coding') {
              (err = err || []).push({
                issue: "union case #0 mismatch: not a '" + 'coding' + "' string literal",
                path: [index, 'hobby']
              });
            }

            if (value_index_hobby !== 'poetry') {
              (err = err || []).push({
                issue: "union case #1 mismatch: not a '" + 'poetry' + "' string literal",
                path: [index, 'hobby']
              });
            }

            if (value_index_hobby !== 'music') {
              (err = err || []).push({
                issue: "union case #2 mismatch: not a '" + 'music' + "' string literal",
                path: [index, 'hobby']
              });
            }
          }
        }

        const value_index_properties = value_index.properties;

        if (!Array.isArray(value_index_properties)) {
          (err = err || []).push({
            issue: 'not an array',
            path: [index, 'properties']
          });
        } else {
          for (let index_index_properties = 0; index_index_properties < value_index_properties.length; index_index_properties++) {
            let unmatched_index_properties_index_index_properties;
            const value_index_properties_index_index_properties = value_index_properties[index_index_properties];

            if (!(typeof value_index_properties_index_index_properties === 'object' && value_index_properties_index_index_properties !== null && !Array.isArray(value_index_properties_index_index_properties))) {
              unmatched_index_properties_index_index_properties = true;
            } else {
              const value_index_properties_index_index_properties_tag = value_index_properties_index_index_properties.tag;

              if (value_index_properties_index_index_properties_tag !== 'house') {
                unmatched_index_properties_index_index_properties = true;
              }

              const value_index_properties_index_index_properties_address = value_index_properties_index_index_properties.address;

              if (typeof value_index_properties_index_index_properties_address !== 'string') {
                unmatched_index_properties_index_index_properties = true;
              }

              for (const key_index_properties_index_index_properties in value_index_properties_index_index_properties) {
                if (!(key_index_properties_index_index_properties === 'tag' || key_index_properties_index_index_properties === 'address')) {
                  unmatched_index_properties_index_index_properties = true;
                }
              }
            }

            if (unmatched_index_properties_index_index_properties) {
              unmatched_index_properties_index_index_properties = false;

              if (!(typeof value_index_properties_index_index_properties === 'object' && value_index_properties_index_index_properties !== null && !Array.isArray(value_index_properties_index_index_properties))) {
                unmatched_index_properties_index_index_properties = true;
              } else {
                const value_index_properties_index_index_properties_tag = value_index_properties_index_index_properties.tag;

                if (value_index_properties_index_index_properties_tag !== 'car') {
                  unmatched_index_properties_index_index_properties = true;
                }

                const value_index_properties_index_index_properties_model = value_index_properties_index_index_properties.model;

                if (typeof value_index_properties_index_index_properties_model !== 'string') {
                  unmatched_index_properties_index_index_properties = true;
                }

                for (const key_index_properties_index_index_properties in value_index_properties_index_index_properties) {
                  if (!(key_index_properties_index_index_properties === 'tag' || key_index_properties_index_index_properties === 'model')) {
                    unmatched_index_properties_index_index_properties = true;
                  }
                }
              }
            }

            if (unmatched_index_properties_index_index_properties) {
              if (!(typeof value_index_properties_index_index_properties === 'object' && value_index_properties_index_index_properties !== null && !Array.isArray(value_index_properties_index_index_properties))) {
                (err = err || []).push({
                  issue: 'union case #0 mismatch: not an object',
                  path: [index, 'properties', index_index_properties]
                });
              } else {
                const value_index_properties_index_index_properties_tag = value_index_properties_index_index_properties.tag;

                if (value_index_properties_index_index_properties_tag !== 'house') {
                  (err = err || []).push({
                    issue: "union case #0 mismatch: not a '" + 'house' + "' string literal",
                    path: [index, 'properties', index_index_properties, 'tag']
                  });
                }

                const value_index_properties_index_index_properties_address = value_index_properties_index_index_properties.address;

                if (typeof value_index_properties_index_index_properties_address !== 'string') {
                  (err = err || []).push({
                    issue: 'union case #0 mismatch: not a string',
                    path: [index, 'properties', index_index_properties, 'address']
                  });
                }

                for (const key_index_properties_index_index_properties in value_index_properties_index_index_properties) {
                  if (!(key_index_properties_index_index_properties === 'tag' || key_index_properties_index_index_properties === 'address')) {
                    (err = err || []).push({
                      issue: 'union case #0 mismatch: excess key - ' + key_index_properties_index_index_properties,
                      path: [index, 'properties', index_index_properties]
                    });
                  }
                }
              }

              if (!(typeof value_index_properties_index_index_properties === 'object' && value_index_properties_index_index_properties !== null && !Array.isArray(value_index_properties_index_index_properties))) {
                (err = err || []).push({
                  issue: 'union case #1 mismatch: not an object',
                  path: [index, 'properties', index_index_properties]
                });
              } else {
                const value_index_properties_index_index_properties_tag = value_index_properties_index_index_properties.tag;

                if (value_index_properties_index_index_properties_tag !== 'car') {
                  (err = err || []).push({
                    issue: "union case #1 mismatch: not a '" + 'car' + "' string literal",
                    path: [index, 'properties', index_index_properties, 'tag']
                  });
                }

                const value_index_properties_index_index_properties_model = value_index_properties_index_index_properties.model;

                if (typeof value_index_properties_index_index_properties_model !== 'string') {
                  (err = err || []).push({
                    issue: 'union case #1 mismatch: not a string',
                    path: [index, 'properties', index_index_properties, 'model']
                  });
                }

                for (const key_index_properties_index_index_properties in value_index_properties_index_index_properties) {
                  if (!(key_index_properties_index_index_properties === 'tag' || key_index_properties_index_index_properties === 'model')) {
                    (err = err || []).push({
                      issue: 'union case #1 mismatch: excess key - ' + key_index_properties_index_index_properties,
                      path: [index, 'properties', index_index_properties]
                    });
                  }
                }
              }
            }
          }
        }

        for (const key_index in value_index) {
          if (!(key_index === 'name' || key_index === 'age' || key_index === 'hobby' || key_index === 'properties')) {
            (err = err || []).push({
              issue: 'excess key - ' + key_index,
              path: [index]
            });
          }
        }
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
