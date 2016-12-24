var Browser = require('zombie')
var assert = require('chai').assert

let browser;

suite('Cross-page test', function() {
    setup(function() {
        browser = new Browser()
    })

    test('request group rate page from hood-river page', function(done) {
        let referrer = 'http://localhost:3000/tours/hood-river'
        browser.visit(referrer,  function() {
            browser.clickLink('.requestGroupRate', function()  {
                assert(browser.field('referrer').value === referrer)
                done()
            })
        })
    })

    test('requesting a group rate from the oregon coast tour page should ' + 
        'populate the referrer field', function (done) {
            var referrer = 'http://localhost:3000/tours/oregon-coast';
            browser.visit(referrer, function () {
                browser.clickLink('.requestGroupRate', function () {
                    assert(browser.field('referrer').value === referrer)
                    done()
                })
            })
    })

    test('visiting the "request group rate" page dirctly should result ' +
        'in an empty referrer field', function (done) {
            browser.visit('http://localhost:3000/tours/request-group-rate',
                function () {
                    assert(browser.field('referrer').value === '');
                    done();
                });
        });   
})
