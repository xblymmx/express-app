
suite('Global ttests', function() {
    test('page has valid title', () => {
        assert(document.title && document.title.match(/\S/) && document.title.toUpperCase() !== 'TODO')
    })
})