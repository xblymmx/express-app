
suite('About Page test', () => {
    test('page should contain link to contact page', () => {
        assert($('a[href="/contact"]').length)
    })
})