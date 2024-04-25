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
  let settings   = mg3.settings.get()

  /* Memory */
  let body, main, submain, mmenu, canvas;
  let levelData, splash, splasher;
  // Main data output
  let data = {
    hero    : {},
    units   : {},
    settings: {},
  }
  /* Computational variables */

  
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
    // calculate the difference between face rotation & walk rotation
    // console.log( hero.r.toFixed(2), ',',  hero.v.r.toFixed(2), ',', (hero.v.r - hero.r).toFixed(3) )
    let inversion= false
    let diff     = Math.abs(hero.r - hero.v.r)
    if (diff > Math.PI/2) { 
      inversion = true
    }
    
    /* Update the animation spec */
    if (changed) {
      let k = hero.a.keys.walk
      if (inversion) {
        if (magnitude > settings.game.run_threshold) {
          k = hero.a.keys.run_back
        } else {
          k = hero.a.keys.walk_back
        }
      } else {
        if (magnitude > settings.game.run_threshold) k = hero.a.keys.run
      }
      hero.a.key = k
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
      main.addEventListener( events.comptroller.js_payload, jsPayload )
    })
  }
  
  let startEngine = async function(e) {
    // pause the Clock
    raiseEvent( canvas, events.engine.clock_pause, `starting engine and level loading` )
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
    if (completed) { 
      splasher.next()
      raiseEvent( canvas, events.engine.clock_unpause, `level loading completed` )
    }
  }

  let jsPayload = function(e) {
    let payload = e.detail
    if (payload.wh == 'dir') {
      data.hero.v = {
        x: -payload.x / settings.game.speed_refactor,
        y:  payload.y / settings.game.speed_refactor,
        m:  payload.len,
        r:  payload.r,
      }
    } else if (payload.wh == 'aim') {
      data.hero.r = payload.r
    }
  }
  
  let resetData = function() {
    data = {
      hero : {},
      units: {},
    }
  }
  
  let tick = function(e) {
    updateHero()
  }
  
  let loadLevel = function(levelData) {
    // generate map
    
    // generate player
    let datum  = UNITS['player'] // MODIFY
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
        unit.x = datum?.pos?.x || unit.x
        unit.y = datum?.pos?.y || unit.y
        unit.r = datum?.pos?.r || unit.r
        unit.isPlayer = isPlayer
    
    raiseEvent( canvas, events.engine.unit, unit )
    
    return unit
  }

  return {
    data: function() { return data },
  }
})()
