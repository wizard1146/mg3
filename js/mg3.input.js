mg3 = typeof mg3 != 'undefined' ? mg3 : {}

mg3.input = (function() {
  /* Meta variables */
  let qset       = mg3.utilities.qselect
  let raiseEvent = mg3.utilities.raiseEvent
  let inject     = function(str, tar) { let t = tar ? tar : body; t.insertAdjacentHTML('beforeend', str) }
  
  let events     = mg3.comptroller.events()
  let event_initialise = events.preloader.initial
  
  /* Module Settings & Events */
  let settings   = mg3.settings.get()
  
  /* Memory */
  let body, main, submain, mmenu, canvas;
  let jsDir, jsAim;

  /* Computational variables */

  
  // Initialisation
  body = qset(`body`)
  body.addEventListener( event_initialise, function() {
    // Listen
    listen()
    // Signal Ready
    raiseEvent( body, events.comptroller.count, `input` )
  })

  let listen = function() {
    body.addEventListener( events.comptroller.ready, function(e) {
      let g = e.detail
      main    = g.main
      submain = g.submain
      canvas  = g.canvas
      mmenu   = g.mmenu
      
      /* Comptroller Instructions */
      main.addEventListener( events.comptroller.canvas, renderInputs )
    })
  }

  let renderInputs = function() {
    renderJoysticks()
  }

  let renderJoysticks = function() {
    inject(`
      <div id="${settings.input.id_js_dir}" class="absolute bottom-left"></div>
      <div id="${settings.input.id_js_aim}" class="absolute bottom-right"></div>
    `, submain)
    jsDir = new JoyStick( settings.input.id_js_dir, settings.input.js_dir_options, joystickDir )
    jsAim = new JoyStick( settings.input.id_js_aim, settings.input.js_aim_options, joystickAim )
  }

  let joystickDir = function(e) { joystickNotify( joystickParse( e, 'dir' ) ) }
  let joystickAim = function(e) { joystickNotify( joystickParse( e, 'aim' ) ) }

  let joystickNotify = function( payload ) { raiseEvent( submain, events.input.js_payload, payload ) }

  let joystickParse = function(datum, type) {
    let x  = parseInt(datum.x)
    let y  = parseInt(datum.y)
    let r  = joystickRotation(x, y)
    let len = Math.min( Math.sqrt(x*x + y*y), settings.input.js_maximum )
    let mx  = len * Math.cos(r + Math.PI/2) * -1
    let my  = len * Math.sin(r + Math.PI/2)
    return {
      x: mx, y: my, r: r, len: len,
      c: datum.cardinalDirection,
      xp: datum.xPosition,
      yp: datum.yPosition,
      wh: type,
    }
  }

  let joystickRotation = function(x, y) {
    let r = Math.atan2(y, x) * 180 / Math.PI - 90
    if (r > 0) r -= 360
        r *= -1
    return (r * Math.PI) / 180
  }

  return {

  }
})()