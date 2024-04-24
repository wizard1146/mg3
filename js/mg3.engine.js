mg3 = typeof mg3 != 'undefined' ? mg3 : {}

mg3.engine = (function() {
  /* Meta variables */
  let qset       = mg3.utilities.qselect
  let raiseEvent = mg3.utilities.raiseEvent
  let uuid       = mg3.utilities.uuid
  
  let Splash     = mg3.splash.Splash
  
  let Tile       = mg3.constructs.tile
  let Player     = mg3.constructs.player
  let Actor      = mg3.constructs.actor
  let loadModel  = mg3.canvas.loadModel
  
  let LEVELS     = mg3.season_001.LEVELS
  let UNITS      = mg3.season_001.UNITS
  
  let events     = mg3.comptroller.events()
  let event_initialise = events.preloader.initial
  
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
  /* Memory */
  let body, main, submain, mmenu, canvas;
  let levelData, splash, splasher;
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
    // get the level data

    // process the map data

    /* process the unit data */
    // generate the player
    generatePlayer('sentinel')

    // generate map
  }

  
  let heartbeat = function() {
    window.requestAnimationFrame( heartbeat )
    
    updateHero()
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
  body = qset('body')
  body.addEventListener( event_initialise, function(e) {
    // Listen
    listen()
    // Signal Ready
    raiseEvent( body, events.comptroller.count, `engine` )
  })
  
  let listen = function() {
    body.addEventListener( events.comptroller.ready, function(e) {
      let g = e.detail
      main    = g.main
      submain = g.submain
      canvas  = g.canvas
      mmenu   = g.mmenu
      /* Comptroller Instructions */
      main.addEventListener( events.comptroller.engine, startEngine )
      main.addEventListener( events.comptroller.united, unitLoaded )
    })
    
    // main.addEventListener( events.incoming.engine_start, start )
    // main.addEventListener( events.incoming.input_joystick_dir, joystickDir )
    // main.addEventListener( events.incoming.input_joystick_aim, joystickAim )
  }
  
  let startEngine = async function(e) {
    // clear Data
    resetData()
    
    // get level data
    levelData = LEVELS[`001`]
  
    // Start listening to Comptroller ticks
    main.addEventListener( events.comptroller.tick, tick )
    
    // Draw a Splash
    splash = new Splash({
      // settings
      background: `assets/splash_001.png`,
      fade      : 2300,
      // loader
      lines     : [`assets`],
      max       : Object.entries(levelData.enemies).length + 1,
      count     : 0,
    })
    splasher = splash.start();
    splasher.next()
    
    // Inform the Comptroller to tell Canvas to Unhide
    raiseEvent( body, events.engine.click_outward, `engine-start` )
    
    // Load a Level
    await loadLevel( levelData ) // MODIFY
  }
  
  let unitLoaded = function(e) {
    // console.log(`Unit Loaded`, e.detail)
    let completed = splash.updateLine(`assets`, splash.getLine(`assets`)[0][`count`]++, `Loaded unit ${e.detail.uuid}...`)
    if (completed) splasher.next()
  }
  
  let resetData = function() {
    data = {
      hero : {},
      units: {},
    }
  }
  
  let tick = function(e) {
    
  }
  
  let loadLevel = function(levelData) {
    // generate map
    
    // generate player
    let datum  = UNITS['sentinel'] // MODIFY
    let player = generateUnit( datum.key, datum, true )
    data.hero = player
    // generate units
    levelData.enemies.forEach(datum => {
      let enemy = generateUnit( datum.model, datum, false )
          enemy.enemy = true
      data.units[enemy.id] = enemy
    })
    // 
    console.log(data)
  }
  
  let generateUnit = function( key, datum, isPlayer ) {
    let meta = UNITS[key]
    let gen  = isPlayer ? Player : Actor
    
    let unit = new gen( isPlayer ? 'hero' : 'unit', {t: isPlayer ? 'player' : 'actor'})
        unit.a.keys = meta.animationKeys
        unit.meta   = meta
        unit.x = datum?.pos?.x
        unit.y = datum?.pos?.y
        unit.r = datum?.pos?.r
    
    raiseEvent( canvas, events.engine.unit, unit )
    
    return unit
  }


  return {
    data: function() { return data },
  }
})()
