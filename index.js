/**
 * Tag plugin for Verb
 */

const fs = require('fs');
const path = require('path');
const file = require('fs-utils');
const relative = require('relative');
const _ = require('lodash');



module.exports = function (verb) {
  verb.options = verb.options || {};
  var utils = verb.utils;
  var tags = {};

  tags.glob = function (patterns, options) {
    var defaults = {ext: verb.ext, docs: verb.docs};
    options = _.extend(defaults, options || {});

    // Extend the context with options defined in the tag
    _.extend(verb.context, options);
    _.extend(verb.options, options);

    var ext = verb.options.ext,
      matches = [],
      msg;

    matches = file.find(patterns, {
      filter: 'isFile'
    });

    // If a filename was given, but no results are returned, kindly notify the user.
    if (!matches.length) {
      msg = ' [nomatch] · verb could not find a match for {%%= glob("' + patterns + '") %}';
      verb.log.warn('  ' + verb.runner.name + msg);
      return;
    }

    var output = _.map(matches, function(filepath) {
      var verbContext = _.cloneDeep(verb.context);
      var content = file.readFileSync(String(filepath));
      var page = verb.matter(utils.delims.escape(content));

      // Extend context with metadata from front matter.
      var context = _.extend(verbContext, verb.options, page.data);
      var result = verb.template(page.content, context);

      // Adjust headings on each file
      return utils.adjust.headings(result);
    }).join('\n\n');

    return output;
  };

  return tags;
};

