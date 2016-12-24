var fortune = require('../lib/fortune.js')
var expect = require('chai').expect
var assert = require('chai').assert

suite('test fortune cookie', function() {
    test('fortune() should return a fortune cookie', function() {
        expect(fortune()).to.be.a('string')
    })
})