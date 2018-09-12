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
var path = require('path');
chai.should();
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
var Q = require('q');
var Pastebin = require('../bin/pastebin');

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
describe('Pastebin :: createPasteFromFile', function () {

    var pastebin = new Pastebin({});
    var filename = path.join(__dirname, 'textfile.txt');

    afterEach(function () {
      pastebin._postApi.restore && pastebin._postApi.restore();
    });

    beforeEach(function () {
      sinon.stub(pastebin, '_postApi').callsFake(stubber('', false)); // Just to make sure we're not posting to Pastebin while testing
    });

    it('reject with error if no paste filename', function () {
      return pastebin.createPasteFromFile({}).should.be.rejectedWith('Filename not provided');
    });

    it('fulfilles with a paste ID', function () {
      pastebin._postApi.restore && pastebin._postApi.restore();
      sinon.stub(pastebin, '_postApi').callsFake(stubber('As3IMeWV', false));
      return pastebin.createPasteFromFile(filename).should.eventually.equal('As3IMeWV');
    });

    it('reject with error if format cannot be found', function () {
      return pastebin.createPasteFromFile(filename, null, 'unknown-script').should.be.rejectedWith('Error! Paste format unknown-script is unknown.');
    });

    it('reject with error if expiration cannot be found', function () {
      return pastebin.createPasteFromFile(filename, null, null, null, '1Y').should.be.rejectedWith('Error! Paste expiration 1Y is unknown.');
    });

    it('reject with error if privacy is set but no user & password are found', function () {
      var pb = new Pastebin();
      sinon.stub(pb, '_postApi').callsFake(stubber('', false)); // Just to make sure we're not posting to Pastebin while testing
      return pb.createPasteFromFile(filename, null, null, 2, null).should.be.rejectedWith('Error! For this privacy level you need to be logged in! Provide username and password!');
    });
});
