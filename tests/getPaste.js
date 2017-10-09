/* global it, describe, before, after, beforeEach, afterEach */
'use strict';
/*
 * pastebin-js
 * https://github.com/j3lte/pastebin-js
 *
 * Copyright (c) 2013-2017 Jelte Lagendijk
 * Licensed under the MIT license.
 */
var chai = require('chai');
var sinon = require('sinon');
chai.should();
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
var Q = require('q');
var Pastebin = require('../bin/pastebin'),
    pastebin;

var stubber = function (returnValue, error) {
  return function (path, params) {
    var deferred = Q.defer();
    if (error) {
      deferred.reject(returnValue);
    } else {
      deferred.resolve(returnValue);
    }
    return deferred.promise;
  };
};

// BASIC TESTS
describe('Pastebin :: getPaste', function () {

    afterEach(function () {
      pastebin._getApi.restore();
    });

    pastebin = new Pastebin({});

    it('reject with error if no paste ID', function () {
      sinon.stub(pastebin, '_getApi', stubber('paste content', false));
      return pastebin.getPaste().should.be.rejectedWith('No paste id!');
    });

    it('fulfilles with a paste ID', function () {
      sinon.stub(pastebin, '_getApi', stubber('This is a paste content', false));
      return pastebin.getPaste('As3IMeWV').should.eventually.equal('This is a paste content');
    });
});
