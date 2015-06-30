/**
 * @license
 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

// jshint node: true
'use strict';

var dom5 = require('dom5');
var dom5 = require('dom5');
var pred = dom5.predicates;
var stringEscape = require('jsesc');

var inlineScriptFinder = pred.AND(
  pred.hasTagName('script'),
  pred.OR(
    pred.NOT(
      pred.hasAttr('type')
    ),
    pred.hasAttrValue('type', 'application/javascript')
  ),
  pred.NOT(
    pred.hasAttr('src')
  )
);

function isCustomElement(node) {
  return node.tagName.indexOf('-') >= 0;
}


function prefixCustomElements(doc, prefix) {
  dom5.queryAll(doc, isCustomElement)
    .forEach(function(el) {
      el.tagName = prefix + el.tagName;
    });
  dom5.queryAll(doc, pred.hasAttr('is'))
    .forEach(function(el) {
      var is = dom5.getAttribute(el, 'is');
      if (is.indexOf('-') >= 0)
        dom5.setAttribute(el, 'is', prefix + is);
    });
}

function split(source, options) {
  options = options || {};
  var prefix = options.prefix || '';
  var doc = dom5.parse(source);
  prefixCustomElements(doc, prefix);
  var body = dom5.query(doc, pred.hasTagName('body'));
  var head = dom5.query(doc, pred.hasTagName('head'));
  var scripts = dom5.queryAll(doc, inlineScriptFinder);

  var contents = [];
  dom5.remove(body);
  scripts.forEach(function(sn) {
    var nidx = sn.parentNode.childNodes.indexOf(sn) + 1;
    var next = sn.parentNode.childNodes[nidx];
    dom5.remove(sn);
    // remove newline after script to get rid of nasty whitespace
    if (next && dom5.isTextNode(next) && !/\S/.test(dom5.getTextContent(next))) {
      dom5.remove(next);
    }
    contents.push(dom5.getTextContent(sn));
  });
  var importContent = dom5.serialize(head) + dom5.serialize(body);
  contents.unshift('PolymerInliner.addImportContent(\'' + stringEscape(importContent) + '\');');
  dom5.remove(head);
  dom5.remove(body);

  var html = dom5.serialize(doc);
  // newline + semicolon should be enough to capture all cases of concat
  var js = contents.join('\n;');

  return {
    html: html,
    js: js
  };
}

module.exports = {
  split: split
};
