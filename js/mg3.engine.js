mg3 = typeof mg3 != 'undefined' ? mg3 : {}

mg3.engine = (function() {
  /* Meta variables */
  let qset       = mg3.utilities.qselect
  let raiseEvent = mg3.utilities.raiseEvent
  let UNITS      = mg3.season_001.UNITS
  let Tile       = mg3.constructs.tile
  let Player     = mg3.constructs.player
  let Actor      = mg3.constructs.actor
  let loadModel  = mg3.canvas.loadModel
  
  /* Module Settings & Events */
  let settings = {
    app     : {
      id_tray   : 'mg-main',
      id_subtray: 'mg-submain',
      id_canvas : 'mg-canvas',
    },
    game    : {
      size_unit    : 25,
      sizpu_sector : 40,

      speed_limiter: 20.4,
      speed_max    : 100,
    
      size_quadrant: 30000,
      size_sector  :   500,
      count_sector :     5,
      count_stars  :   898,
      
      initial_x    : 0,
      initial_y    : 0,
    }
  }
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
  /* Memory */
  let body, main, canvas;
  // Main data output
  let data = {
    hero    : {},
    sectors : {},
    limits  : {},
    settings: {},
  }
  /* Computational variables */
  let collider;


  /* Initialise */
  let initialise = function() {
    body = qset('body')

    body.addEventListener( events.incoming.injected_main, function() { 
      main = qset(`#${settings.app.id_tray}`); 
      listen()
      } )
  }
  
  /* Start function */
  let start = function() {
console.log(1)
    // get the level data

let shimData = {
  hero : {
    model: 'bearsnake',
    x  : 0,
    y  : -3,
  },
  units: [
    {model: 'sentinel', x: 0, y: 10},
  ],
  map  : [],
  terrain: [],
}

    // process the map data

    /* process the unit data */
    // generate the player
    generatePlayer('sentinel')

    // generate map
    // update the data package
    data.settings.size_sector = settings.game.size_sector
    // 
    heartbeat()
  }

  let generatePlayer = function(key, datum) { data.hero = generateUnit(key, datum, true) }

  let generateUnit = function(key, datum, isPlayer) {
    let meta = UNITS[key]
    let gen  = isPlayer ? Player : Actor

    // Engine Representation 
    let unit = new gen( isPlayer ? 'hero' : 'unit', { t: isPlayer ? 'player' : 'actor' })
        unit.a.keys = meta.animationKeys

    // Load Canvas Representation
console.log(document.querySelector('#' + settings.app.id_canvas))
    raiseEvent( document.querySelector('#' + settings.app.id_canvas), events.outgoing.loadModel, unit )

    return unit
  }
  
  let heartbeat = function() {
    window.requestAnimationFrame( heartbeat )
    
    updateHero()
  }
  
  let listen = function() {
    main.addEventListener( events.incoming.engine_start, start )
    main.addEventListener( events.incoming.input_joystick_dir, joystickDir )
    main.addEventListener( events.incoming.input_joystick_aim, joystickAim )
  }
  
  let joystickDir = function(e) {
    let datum = e.detail
    
    data.hero.v = {
      x: datum.x,
      y: datum.y,
      m: datum.len,
      r: datum.r,
    }
  }
  let joystickAim = function(e) {
    let datum = e.detail
    
    // Update hero rotation
    data.hero.r = datum.r
  }
  
  /* Update Functions */
  let updateHero = function() {
    let hero = data.hero
    let changed = false
    // add velocity
    let magnitude = hero.v.m
    let rotation  = hero.v.r
    
    hero.deltaX = hero.v.x / settings.game.speed_limiter
    hero.deltaY = hero.v.y / settings.game.speed_limiter
    
    // resolve deltas
    if (hero.deltaX != 0) {
      hero.x += hero.deltaX
      hero.deltaX = 0
      changed = true
    }
    if (hero.deltaY != 0) {
      hero.y += hero.deltaY
      hero.deltaY = 0
      changed = true
    }
    if (hero.deltaRotation != 0) {
      hero.deltaRotation = 0
      changed = true
    }
    if (changed) {
      hero.a.key = hero.a.keys.walk
    } else {
      hero.a.key = hero.a.keys.idle
    }
  }
  
  // Initialisation listener
  qset('body').addEventListener( events.incoming.initialise, initialise )

  return {
    data: function() { return data },
  }
})()
