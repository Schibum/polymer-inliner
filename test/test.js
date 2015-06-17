/**
 * @license
 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

var assert = require('chai').assert;
var fs = require('fs');
var dom5 = require('dom5');
var pred = dom5.predicates;

suite('PolymerInliner', function() {
  var inline = require('../index');

  suite('Split API', function() {
    var obj;
    setup(function() {
      obj = inline.split('', 'foo.js');
    });

    test('return object with js and html properties', function() {
      assert.property(obj, 'html');
      assert.property(obj, 'js');
    });

    test('output html is serialized', function() {
      assert.typeOf(obj.html, 'string');
    });

  });

  suite('Script Outlining', function() {
    suite('Default', function() {

      var obj;
      setup(function() {
        var docText = fs.readFileSync('test/html/index.html', 'utf-8');
        obj = inline.split(docText, 'foo.js');
      });

      test('Scripts are in order', function() {
        var script = obj.js;
        var oneIndex = script.indexOf('one');
        var twoIndex = script.indexOf('two');
        assert.ok(oneIndex < twoIndex);
      });

      test('Newline Semicolon should be used for concating', function() {
        var script = obj.js;
        var expected = '//inline comment\n;var next_statement';
        var actual = script.indexOf(expected);
        assert(actual > -1);
      });

      test('Dom modules are removed from html', function() {
        var doc = dom5.parse(obj.html);
        var module = dom5.query(doc, pred.hasTagName('dom-module'));
        assert(!module);
      });

      test('Styles are removed from html', function() {
        var doc = dom5.parse(obj.html);
        var module = dom5.query(doc, pred.hasTagName('style'));
        assert(!module);
      });

      test('Dom content is registered', function() {
        var script = obj.js;
        assert.match(script, /PolymerInliner\.addImportContent\(\'.*<dom-module/);
        assert.include(script, 'TestStyleContent');
      });

      test('registatin is in order', function() {
        var script = obj.js;
        var importIndex = script.indexOf('PolymerInliner.addImportContent\(\'<dom-module');
        var twoIndex = script.indexOf('two');
        assert.ok(importIndex < twoIndex);
      });

    });
  });
});
