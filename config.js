const fs = require('fs');
const assignment = require('assignment');
const yaml = require('js-yaml');

// load basic config options
if (fs.existsSync('./config/common.yml'))
  var common = yaml.safeLoad(fs.readFileSync('./config/common.yml', 'utf8'));

// load config options specific to environments but not secret
let env = process.env.NODE_ENV || "development";
if (fs.existsSync(`./config/${env}.yml`))
  var config = yaml.safeLoad(fs.readFileSync(`./config/${env}.yml`, 'utf8'));

// load local overwrites - not commited to git
if (fs.existsSync('./config/local.yml'))
  var local = yaml.safeLoad(fs.readFileSync('./config/local.yml', 'utf8'));

// combine config files - local > env config > common
config = module.exports = assignment({}, common, config, local);


// load environment variable mappings
try {
  var env_map = yaml.safeLoad(fs.readFileSync('./config/env-map.yml', 'utf8'));
} catch (e) { console.log(e); }


// traverse an object tree an run a callback on each leaf node
// http://stackoverflow.com/questions/722668/traverse-all-the-nodes-of-a-json-object-tree-with-javascript
function traverse (obj, callback, trail) {
  trail = trail || [];

  Object.keys(obj).forEach(function (key) {
    let value = obj[key]
      , undef = typeof value === "undefined" || value === null
      ;

    if (!undef && Object.getPrototypeOf(value) === Object.prototype)
      traverse(value, callback, trail.concat(key));
    else
      callback.call(obj, key, value, trail);
  });
}

// ala http://stackoverflow.com/questions/6491463/accessing-nested-javascript-objects-with-string-key
// resolve "obj.path.to.value" into the nested value of on the object
Object.resolve = function(trail, obj) {
    return trail.reduce(function(prev, curr) {
        return prev ? prev[curr] : undefined
    }, obj || self)
}

// like the above, set "obj.path.to.value" on a nested object
Object.setByPath = function(trail, obj, value) {
  return trail.reduce(function(prev, curr, ix) {
    return (ix + 1 == parts.length)
      ? prev[curr] = value
      : prev[curr] = prev[curr] || {};
  }, obj);
}

// Process the environment variable mapping - Traverse the config tree and
// replace config values with the envrionment key configured in env-map.yml
traverse(config, (key, value, trail) => {
  let env_key = Object.resolve(trail, env_map);
  let env_value = process.env[env_key];
  if (typeof env_value === "undefined")
    return;

  Object.setByPath(trail, config, env_value);
})
