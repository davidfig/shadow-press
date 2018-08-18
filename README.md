# shadow-press
Vanilla javascript to turn an HTMLElement into a shadow pressed element

## Rationale

I wanted to quickly create a highly configurable shadow press experience. Shadow press is when an HTMLELement has a box-shadow or text-shadow when unpressed, and then when pressed the shadow is hidden and the HTMLElement is pushed in the direction of the shadow.

## Live Example
[https://davidfig.github.io/shadow-press/](davidfig.github.io/shadow-press)

## Installation

    npm i shadowpress

## Simple Example

```js
var ShadowPress = require('shadowpress');

new ShadowPress(document.getElementById('test'), {
    moveType: 'margin',
    moveAmount: '0.5em',
    shadowValue: '0.5em 0.5em 0.5em rgba(0,0,0,0.3)',
    moveThreshold: 10
});
```

## License  
MIT License  
(c) 2018 [YOPEY YOPEY LLC](https://yopeyopey.com/) by [David Figatner](https://twitter.com/yopey_yopey/)
