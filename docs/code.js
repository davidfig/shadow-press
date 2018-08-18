const ShadowPress = require('..')

function test()
{
    new ShadowPress(document.getElementById('example-1'))

    new ShadowPress(document.getElementById('example-2'), {
        shadow: 'textShadow'
    })
}

window.onload = function ()
{
    test()
    require('fork-me-github')()
    require('./highlight')()
}