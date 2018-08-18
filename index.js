/* Copyright (c) 2018 YOPEY YOPEY LLC */

const Mitt = require('mitt')

module.exports = class ShadowPress
{
    /**
     * Make an element into a ShadowPress
     * @param {HTMLElement} div
     * @param {object} [options]
     * @param {string} [moveType=padding] use padding or margin to move the div when pressed
     * @param {string} [shadow=boxShadow] choose either boxShadow or textShadow
     * @param {number} [shadowX=0.25em] amount to show the shadow (use negative for a left shadow)
     * @param {number} [shadowY=0.5em] amount to show the shadow (use negative for a top shadow)
     * @param {number} [shadowBlur=0.25em] amount to blur the shadow
     * @param {number} [shadowSpread=0] amount to spread the shadow (only for boxShadow)
     * @param {string} [shadowColor=rgba(0,0,0,0.25)] color of shadow
     * @param {string} [shadowPressed=none] what to set the shadow when pressed
     * @param {number} [moveThreshold] optional move distance in pixels that cancels the press
     * @param {string} [cursor=pointer] set cursor on element
     * @param {string} [noUserSelect=true] disable user select for this element
     * @fires down
     * @fires pressed
     * @fires move
     * @fires cancel
     */
    constructor(div, options)
    {
        this.div = div
        this.options(options)
        this.listeners()
        this.emitter = Mitt()
    }

    /**
     * setup options
     * @param {object} [options]
     * @private
     */
    options(options)
    {
        options = options || {}
        this.moveType = options.moveType || 'margin'
        this.shadow = options.shadow || 'boxShadow'
        this.shadowX = typeof options.shadowX !== 'undefined' ? options.shadowX : '0.3em'
        this.shadowY = typeof options.shadowY !== 'undefined' ? options.shadowY : '0.3em'
        const shadowSpread = options.shadowSpread || 0
        const shadowBlur = options.shadowBlur || 0
        const shadowColor = options.shadowColor || 'rgba(0,0,0,0.25)'
        this.shadowValue = this.shadowX + ' ' + this.shadowY + ' ' + shadowBlur + ' ' + (this.shadow === 'boxShadow' ? shadowSpread + ' ' : '') + shadowColor
        this.shadowPressed = options.shadowPressed || 'none'
        this.moveThreshold = options.moveThreshold || 0
        this.div.style[this.shadow] = this.shadowValue
        this.setupDirections()
        if (typeof options.cursor !== 'undefined')
        {
            this.div.style.cursor = options.cursor
        }
        else
        {
            this.div.style.cursor = 'pointer'
        }
        if (typeof options.noUserSelect === 'undefined' || options.noUserSelect === true)
        {
            this.div.style.userSelect = 'none'
        }
    }

    /**
     * @param {string} directions
     * @private
     */
    setupDirections()
    {
        if (this.shadowX)
        {
            if (this.shadowX < 0)
            {
                this.onHorizontal = this.moveType + 'Left'
                this.offHorizontal = this.moveType + 'Right'
            }
            else
            {
                this.onHorizontal = this.moveType + 'Right'
                this.offHorizontal = this.moveType + 'Left'
            }
        }
        if (this.shadowY)
        {
            if (this.shadowY < 0)
            {
                this.onVertical = this.moveType + 'Top'
                this.offVertical = this.moveType + 'Bottom'
            }
            else
            {
                this.onVertical = this.moveType + 'Bottom'
                this.offVertical = this.moveType + 'Top'
            }
        }
        this.div.style[this.onHorizontal] = this.shadowX.replace('-', '')
        this.div.style[this.onVertical] = this.shadowY.replace('-', '')
        this.div.style[this.offHorizontal] = this.div.style[this.offVertical] = 0
    }

    /**
     * setup listeners
     * @private
     */
    listeners()
    {
        this.downHandler = (e) => this.down(e)
        this.moveHandler = (e) => this.move(e)
        this.upHandler = (e) => this.up(e)
        this.div.addEventListener('touchstart', this.downHandler)
        this.div.addEventListener('mousedown', this.downHandler)
        this.div.addEventListener('mousemove', this.moveHandler)
        this.div.addEventListener('touchmove', this.moveHandler)
        this.div.addEventListener('mouseup', this.upHandler)
        this.div.addEventListener('touchend', this.upHandler)
        this.div.addEventListener('touchcancel', this.upHandler)
        this.div.addEventListener('mouseleave', this.upHandler)
    }

    /**
     * Register an event handler for the given type
     * @param {string} type - Type of event to listen for, or "*" for all events
     * @param {Function} handler - Function to call in response to given event
     */
    on(type, handler)
    {
        this.emitter.on(type, handler)
    }

    /**
     * Remove an event handler for the given type.
     * @param {*} type - Type of event to unregister handler from, or "*"
     * @param {*} handler - Handler function to remove
     */
    off(type, handler)
    {
        this.emitter.off(type, handler)
    }
    /**
     * Invoke all handlers for the given type. If present, "*" handlers are invoked after type-matched handlers.
     * @param {string} type - The event type to invoke
     * @param {*} [evt] - Any value (object is recommended and powerful), passed to each handler
     */
    emit(type, evt)
    {
        this.emitter.emit(type, evt)
    }

    /**
     * Translate mouse and touch event into screen coordinates
     * @param {object} e
     * @private
     */
    translateEvent(e)
    {
        let x, y

        if (e.changedTouches)
        {
            const touch = e.changedTouches[0]
            x = touch.pageX
            y = touch.pageY
        }
        else
        {
            x = e.pageX
            y = e.pageY
        }
        return { x, y }
    }

    /**
     * called when clearing -- usually puts back the shadow after a mouseup, touchend, mouseleave, or touchcancel event
     */
    clear()
    {
        this.div.style[this.onHorizontal] = this.shadowX.replace('-', '')
        this.div.style[this.onVertical] = this.shadowY.replace('-', '')
        this.div.style[this.offHorizontal] = this.div.style[this.offVertical] = 0
        this.div.style[this.shadow] = this.shadowValue
        this.isDown = null
    }

    /**
     * called when pressing -- usually removes the shadow on a mousedown or touchstart event
     */
    press()
    {
        this.div.style[this.offHorizontal] = this.shadowX.replace('-', '')
        this.div.style[this.offVertical] = this.shadowY.replace('-', '')
        this.div.style[this.onHorizontal] = this.div.style[this.onVertical] = 0
        this.div.style[this.shadow] = this.shadowPressed
    }

    /**
     * Handle a down event
     * @param {object} e
     * @private
     */
    down(e)
    {
        if (!this.isDown)
        {
            this.isDown = { point: this.translateEvent(e) }
            this.press()
            this.emitter.emit('down', { target: this.div, event: e })
        }
    }

    /**
     * Handle a move event
     * @param {object} e
     */
    move(e)
    {
        if (this.isDown)
        {
            const point = this.translateEvent(e)
            if (this.moveThreshold)
            {
                if (Math.sqrt(Math.pow(this.isDown.point.x - point.x, 2) + Math.pow(this.isDown.point.y - point.y, 2)) > this.moveThreshold)
                {
                    this.emitter.emit('cancel', { target: this.div, event: e })
                    this.clear()
                }
                else
                {
                    this.emitter.emit('move', { target: this.div, event: e })
                }
            }
            else
            {
                this.emitter.emit('move', { target: this.div, event: e })
            }
        }
    }

    /**
     * handle an up event
     */
    up()
    {
        if (this.isDown)
        {
            this.emitter.emit('pressed', { target: this.div })
            this.clear()
        }
    }
}

/**
 * fires when there is a touch or mousedown on an element
 * @event ShadowPress#down
 * @type {object}
 * @property {HTMLElement} div - target HTMLElement
 * @property {(MouseEvent|TouchEvent)} event
 */

/**
 * fires when there is a touchmove or mousemove on pressed element
 * @event ShadowPress#move
 * @type {object}
 * @property {HTMLElement} div - target HTMLElement
 * @property {(MouseEvent|TouchEvent)} event
 */

/**
 * fires when the element has been pressed without cancelling
 * @event ShadowPress#pressed
 * @type {object}
 * @property {HTMLElement} div - HTMLElement that was pressed
 * @property {(MouseEvent|TouchEvent)} event
 */

/**
 * fires when the press has been cancelled
 * @event ShadowPress#down
 * @type {object}
 * @property {HTMLElement} div - HTMLElement that was down
 * @property {(MouseEvent|TouchEvent)} event
 */