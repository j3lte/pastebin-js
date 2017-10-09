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

var stubber = function (returnValue) {
  return function (path, params) {
    var deferred = Q.defer();
    deferred.resolve(returnValue);
    return deferred.promise;
  };
};

// BASIC TESTS
describe('Pastebin :: createPaste', function () {

    // afterEach(function () {
    //   console.log('restore');
    //   pastebin._postApi.restore();
    // });
    //
    // pastebin = new Pastebin({
    //   'api_dev_key' : 'xxxxxxxxxxx',
    //   // 'api_user_name' : 'User',
    //   // 'api_user_password' : 'Password'
    // });
    //
    // it('reject with error in API user key length', function () {
    //   sinon.stub(pastebin, '_postApi', stubber('xxxxx-user-key'));
    //   return pastebin.getUserInfo().should.be.rejectedWith('Error in createAPIuserKey! xxxx-user-key');
    // });
});
