/* global it, describe */
'use strict';
/*
 * pastebin-js
 * https://github.com/j3lte/pastebin-js
 *
 * Copyright (c) 2014 Jelte Lagendijk
 * Licensed under the MIT license.
 */
var expect = require('chai').expect,
    nock = require('nock'),
    Pastebin = require('../bin/pastebin');

// BASIC TESTS
describe('Pastebin ::', function () {

    var pastebin = new Pastebin({
      'api_dev_key' : 'xxxxxxxxxxx',
      'api_user_name' : 'User',
      'api_user_password' : 'Password'
    });

    it('create new Pastebin', function () {
        expect(typeof pastebin).to.equal('object');
    });

    it('has method :: getPaste', function () {
        expect(typeof pastebin.getPaste).to.equal('function');
    });

    it('has method :: createPaste', function () {
        expect(typeof pastebin.createPaste).to.equal('function');
    });

    it('has method :: createPasteFromFile', function () {
        expect(typeof pastebin.createPasteFromFile).to.equal('function');
    });

    it('has method :: deletePaste', function () {
        expect(typeof pastebin.deletePaste).to.equal('function');
    });

    it('has method :: createAPIuserKey', function () {
        expect(typeof pastebin.createAPIuserKey).to.equal('function');
    });

    it('has method :: listUserPastes', function () {
        expect(typeof pastebin.listUserPastes).to.equal('function');
    });

    it('has method :: listTrendingPastes', function () {
        expect(typeof pastebin.listTrendingPastes).to.equal('function');
    });

    it('has method :: getUserInfo', function () {
        expect(typeof pastebin.getUserInfo).to.equal('function');
    });

    it('has method :: _parsePastes', function () {
        expect(typeof pastebin._parsePastes).to.equal('function');
    });

    it('has method :: _parseUser', function () {
        expect(typeof pastebin._parseUser).to.equal('function');
    });

    it('has method :: _parseXML', function () {
        expect(typeof pastebin._parseXML).to.equal('function');
    });

    it('has method :: _getRequired', function () {
        expect(typeof pastebin._getRequired).to.equal('function');
    });

    it('has method :: _getApi', function () {
        expect(typeof pastebin._getApi).to.equal('function');
    });

    it('has method :: _postApi', function () {
        expect(typeof pastebin._postApi).to.equal('function');
    });

    it('has method :: getPasteSync', function () {
        expect(typeof pastebin.getPasteSync).to.equal('function');
    });

    it('has method :: createPasteSync', function () {
        expect(typeof pastebin.createPasteSync).to.equal('function');
    });

    it('has method :: createPasteFromFileSync', function () {
        expect(typeof pastebin.createPasteFromFileSync).to.equal('function');
    });

    it('has method :: deletePasteSync', function () {
        expect(typeof pastebin.deletePasteSync).to.equal('function');
    });

    it('has method :: listUserPastesSync', function () {
        expect(typeof pastebin.listUserPastesSync).to.equal('function');
    });

    it('has method :: listTrendingPastesSync', function () {
        expect(typeof pastebin.listTrendingPastesSync).to.equal('function');
    });

    it('has method :: getUserInfoSync', function () {
        expect(typeof pastebin.getUserInfoSync).to.equal('function');
    });

});
