mg3 = typeof mg3 != 'undefined' ? mg3 : {}

mg3.comptroller = (function() {
  /* Meta variables */
  let clone      = mg3.utilities.clone
  let qset       = mg3.utilities.qselect
  let raiseEvent = mg3.utilities.raiseEvent
  
  let settings   = mg3.settings.get()
  let fps        = mg3.settings.get('fps')
  
  let inject     = function(str, tar) { let t = tar ? tar : body; t.insertAdjacentHTML('beforeend', str) }
  
  // Meta
  let readyModules = [`canvas`, `engine`, `ux`]
  let clickMap = {
    /* IMPORTANT: These have to be ALL unique! */
    ux: ['new-game','continue-game','settings','settings-close','quit','quit-confirm','quit-close'],
  }

  /* Module Settings & Events */
  let events = {}
  
  events.preloader = {
    initial: `mgp-initialise`,
  }
  events.constructs = {
  
  }
  events.db = {
    
  }
  events.canvas = {
    unit_loaded  : `mgc-unit-loaded`,
  }
  events.engine = {
    unit         : `mge-unit`,
    click_outward: `outgoing-mge-click`,
  }
  events.ux = {
    click        : `incoming-mgx-click`,
    click_outward: `outgoing-mgx-click`,
  }
  events.input = {
  
  }
  
  events.comptroller = {
    // machine
    count : `mgc-module-count`,
    tick  : `mgc-tick`,
    ready : `mgc-ready`,
    // state transitions
    splash: `mgc-splash`,
    title : `mgc-title`,
    engine: `mgc-engine`,
    canvas: `mgc-canvas`,
    // router for UI interactions
    click : `mgc-click`,
    // canvas instructions
    unit  : `mgc-unit-create`,
    united: `mgc-unit-loaded`,
  }
  
  /* In-memory Variables */
  let body, clock, main, submain, mmenu, canvas, comptroller, modules;

  /* Computational variables */
  let state = 1, STATES = { SPLASH: 0, TITLE: 1, GAME: 2, END: 3, CREDITS: 4 }

  /* Clock controller */
  class Clock {
    constructor() {
      this.stopped = false
      this.frame = 0
      this.freq  = fps
      this.fpsi  = 0
      this.init  = 0
      this.now   = 0
      this.then  = 0
      this.gone  = 0
      
      this.prepare()
    }
    prepare() {
      this.stopped = false
      this.fpsi  = 1000 / this.freq
      this.then  = performance.now()
      this.init  = this.then
      return this
    }
    pause() {
      this.stopped = true
    }
    unpause() {
      this.stopped = false
    }
    reset() {
      this.pause()
      this.frame = 0
    }
    fps() {
      return 1000 * this.frame / ( this.now - this.init )
    }
    loop() {
      if (this.stopped) { /* do nothing */ } else {
        window.requestAnimationFrame( this.loop.bind(this) )
        this.now  = performance.now()
        this.gone = this.now - this.then
        if (this.gone > this.fpsi) {
          this.then = this.now - (this.gone % this.fpsi)
          this.frame++
          raiseEvent( canvas, events.comptroller.tick, [this.frame, this.fps()], true )
        }
      }
    }
  }
  
  let instantiate = function() {
    let f = `center fullscreen`
    // inject the main container
    createMain(f)
    // inject the canvas, hidden
    createCanvas(f)
    // inject the mainmenu, hidden
    createMenu(f)
  }
  
  let createMain = function(f) {
    inject(`<div id="${settings.application.id_main}" class="${f}"><div id="${settings.application.id_submain}" class="${f}"></div></div>`)
    // shorthand
    main    = qset(`#${settings.application.id_main}`)
    submain = qset(`#${settings.application.id_submain}`)
  }
  
  let createCanvas = function(f) {
    inject(`<canvas id="${settings.canvas.id_canvas}" class="${f} hidden"></canvas>`, submain)
    // shorthand
    canvas  = qset(`#${settings.canvas.id_canvas}`)
  }
  
  let createMenu = function(f) {
    inject(`<div id="${settings.application.id_mmenu}" class="${f} hidden"><div id="${settings.application.id_mmenu_list}"></div></div>`, submain)
    // shorthand
    mmenu   = qset(`#${settings.application.id_mmenu}`)
  }
  
  let renderState = function() {
    switch(state) {
      case STATES.SPLASH:
        raiseEvent( main, events.comptroller.splash )
        break;
      case STATES.TITLE:
        raiseEvent( main, events.comptroller.title )
        break;
      case STATES.GAME:
        raiseEvent( main, events.comptroller.engine )
        break;
      case STATES.END:
        break;
      case STATES.CREDITS:
        break;
      default:
        break;
    }
  }
  
  let listen = function() {
    body.addEventListener( events.comptroller.count, count )
    body.addEventListener( events.comptroller.tick, tick )
    body.addEventListener( events.comptroller.click, click )
    // engine
    canvas.addEventListener( events.engine.unit, unit )
    // canvas
    canvas.addEventListener( events.canvas.unit_loaded, unit_loaded )
    // incoming clicks
    for (const [module, v] of Object.entries(events)) {
      if (v.click_outward) {
        body.addEventListener( v.click_outward, function(e) { incoming(e, module) } )
      }
    }
  }
  
  let count = function(e) {
    modules.splice(modules.indexOf(e.detail), 1)
    if (modules.length <= 0) {
      // propagate to other modules
      raiseEvent( body, events.comptroller.ready, {body: body, main: main, submain: submain, mmenu: mmenu, canvas: canvas} )
    
      // render state
      renderState()
    }
  }

  let tick = function() {
    
  }
  
  // Engine => Canvas
  let unit = function(e) { raiseEvent( canvas, events.comptroller.unit, e.detail ) }
  let unit_loaded = function(e) { raiseEvent( main, events.comptroller.united, e.detail ) }
  
  /*
     UI interactions routers: 
       this was designed so we can have a universal language for transmitting interactions from dynamically inserted HTML DOM elements
       it does mean that this has to keep a fairly consistent and accurate internal associations across all modules
   */
  let click = function(e) {
    let msg = e.detail
    for (const [module,clicks] of Object.entries(clickMap)) {
      if (clicks.indexOf(msg) != -1) {
        raiseEvent( main, events[module].click, e.detail, true )
        return
      }
    }
    return false
  }
  /*
    Transition Engine: Receive incoming clicks and interpret
   */
  let incoming = function(e, f) {
    let msg = e.detail
    if (f == 'ux' && msg == 'new-game') {
      state = STATES.GAME
      renderState()
    }
    if (f == 'engine' && msg == 'engine-start') {
      raiseEvent( main, events.comptroller.canvas )
    }
  }

  // Initialisation listener
  body = qset(`body`)
  body.addEventListener( events.preloader.initial, function() {
    // clone Ready Modules
    modules = clone(readyModules)
    // Instantiate
    instantiate()
    // Listen
    listen()
    // Clock
    clock = new Clock()
    clock.prepare().loop()
  })
  
  return {
    events: function() { return clone(events) },
    clock : function() { return clock },
    state : function() { return state },
  }
})()
  
/*
    incoming: {
      initialise    : 'mgc-initialise',
      selfDestruct  : 'mgc-self-destruct',
      injected_main : `mgu-injected-main`,
      
      stage_start      : 'mgu-stage-start',
      state_change     : 'mgu-state-change',
      stage_kill       : `mgu_stage_kill`,
      loadModel: `mge-outgoing-load-model`,
    },
    internal: {
      setupReady       : 'mgb-ready',
      canvas_tick      : 'mgc_tick',
      canvas_mousemove : 'mousemove',
    },
    outgoing: {
      initialise    : 'mgc-initialise',
      selfDestruct  : 'mgc-self-destruct',
      stage_move    : 'mgx-stage-move',
      tick          : 'mgc-outgoing-tick',
    },
    
  let events = {
    incoming: {
      initialise    : 'mgc-initialise',
      injected_main : `mgu-injected-main`,
      engine_start  : `mgu-engine-start`,
      stage_start   : `mgu-stage-start`,
      
      input_key_movement     : 'mgi-input-key-movement',
      input_key_action       : 'mgi-input-key-action',
      input_key_miscellaneous: 'mgi-input-key-misc',
      
      input_joystick_dir     : `mgi-input-joystick-dir`,
      input_joystick_aim     : `mgi-input-joystick-aim`,
    },
    outgoing: {
      loadModel: `mge-outgoing-load-model`,
    },
  }
  
  let events = {
    incoming: {
      initialise  : 'mgc-initialise',
      stage_move  : 'mgx-stage-move',
      canvas_tick : 'mgc-outgoing-tick',
    },
    internal: {
      state_transition : 'mgu-transition',
      container_wipe   : 'mgu-wipe',
      container_subwipe: 'mgu-subwipe',
      request_stage    : 'mgu-request-stage',
    },
    outgoing: {
      injected_main    : `mgu-injected-main`,
      
      engine_start     : `mgu-engine-start`,
      stage_start      : 'mgu-stage-start',
      state_change     : 'mgu-state-change',
      stage_kill       : `mgu_stage_kill`,
      
      joystick_dir: 'mgu-joystick-dir',
      joystick_aim: 'mgu-joystick-aim',
    },
  }
*/