'use strict';

var test = require('tape').test;
var sinon = require('sinon');

var underTest = require('../index.js');

test('test that succeed passes back json to context', function (assert) {
    assert.plan(1);

    var event = {
        "operation" : "succeed",
        "payload" : {
            "value1" : "some value 1",
            "value2" : "some value 2"
        }
    };

    var context = { succeed: function (arg) {} };
    var spy = sinon.spy(context, "succeed");

    underTest.handler(event, context);

    assert.true(spy.withArgs(event.payload).calledOnce, "Succeed on context called with payload");
});

test('test that fail records failure', function (assert) {
    assert.plan(1);

    var event = { "unexpected" : "value" };

    var context = { fail: function (arg) {} };
    var spy = sinon.spy(context, "fail");

    underTest.handler(event, context);

    assert.true(spy.withArgs('failure occurred').calledOnce, "Succeed on context called with payload");
});