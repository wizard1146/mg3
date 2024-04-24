mg3 = typeof mg3 != 'undefined' ? mg3 : {}

mg3.ux = (function() {
  /* Meta variables */
  let qset       = mg3.utilities.qselect
  let raiseEvent = mg3.utilities.raiseEvent
  let inject     = function(str, tar) { let t = tar ? tar : body; t.insertAdjacentHTML('beforeend', str) }
  
  let events     = mg3.comptroller.events()
  let event_initialise = events.preloader.initial
  
  /* Module Settings & Events */
  let settings   = mg3.settings.get()
  
  /* State variables */
  let STATE    = { SPLASH: 0, MAINMENU: 1, CREATOR: 2, GAME: 3, SKILLTREE: 4 }
  let SUBSTATE = { STORY: 0, CHARSHEET: 1, INVENTORY: 2 }
  /* Memory */
  let body, main, submain, mmenu, canvas;
  let state, substate, showX, showY;
  let js_dir, js_aim, hud_main;
  let jsDir, jsAim, hudX, hudY, hudSector, hudEngineThrust, hudFPS;
  
  /* Computational variables */


  let canvasTick = function(e) {
    // let data = e.detail.data
    // let hero = data.hero
    
    // show FPS
    hudFPS.innerHTML = mg3?.canvas?.fps().toFixed(1)
    // hudFPS.innerHTML = hero.a.key + ',' + hero.a.cardinal
    
    updateStageXY(e)

    // updateCoordinates(hero)
    // updateSector(hero)
    // updateThrust(hero)
  }
  
  let updateStageXY = function(e) {
    let c = e.detail.camera

    showX.innerHTML = (c.position.x.toFixed(1)).toString().padStart(6,' ')
    showY.innerHTML = (c.position.y.toFixed(1)).toString().padStart(6,' ')
    showZ.innerHTML = (c.position.z.toFixed(1)).toString().padStart(6,' ')
hudFPS.innerHTML = c.alpha + ',' + c.beta + ',' + c.radius
  }
  
  let updateCoordinates = function(hero) {
    hudX.innerHTML = Math.floor(hero.x)
    hudY.innerHTML = Math.floor(hero.y)
  }
  
  let updateSector = function(hero) {
    hudSector.innerHTML = `(${hero.sector.sx},${hero.sector.sy})`
  }
  
  let updateThrust = function(hero) {
    hudEngineThrust.innerHTML = `current heading: ${hero.r.toFixed(3)}<br/>current rotational speed: ${hero.v.r.toFixed(3)}` // `<br/>applied rotational delta: ${hero.dv.r.toFixed(3)}<br/>`
  }
  
  /* Stage */
  let requestStage = function() {
    // request Engine & Canvas
    raiseEvent( main, events.outgoing.engine_start )
    raiseEvent( main, events.outgoing.stage_start  )
    
    // add the joysticks
    inject(`<div id="${settings.controls.id_dir}" class="absolute bottom-left"></div><div id="${settings.controls.id_aim}" class="absolute bottom-right"></div>`, submain)
    jsDir   = new JoyStick(settings.controls.id_dir, settings.controls.js_dir_options, jsNotifyDir)
    jsPoint = new JoyStick(settings.controls.id_aim, settings.controls.js_aim_options, jsNotifyAim)
    
    // add the HUD
    inject(`<div id="${settings.hud.id_hud}" class="absolute fullscreen center no-pointer">
     <div id="${settings.canvas.id_xy}" class="absolute top-right">
       <div id="${settings.canvas.id_xy}-X" class="hidden relative"><div id="${settings.canvas.id_xy}-X-label">X</div><div id="${settings.canvas.id_xy}-X-value" class="absolute right text-right"></div></div>
       <div id="${settings.canvas.id_xy}-Y" class="hidden relative"><div id="${settings.canvas.id_xy}-Y-label">Y</div><div id="${settings.canvas.id_xy}-Y-value" class="absolute right text-right"></div></div>
       <div id="${settings.canvas.id_xy}-Z" class="hidden relative"><div id="${settings.canvas.id_xy}-Z-label">Z</div><div id="${settings.canvas.id_xy}-Z-value" class="absolute right text-right"></div></div>
     </div>
     <div id="${settings.canvas.id_fps}" class="absolute top-right"><div class="value syne-mono text-grey"></div></div>
     <!-- HUD Coordinates -->
     <div id="${settings.hud.id_x}" class="${settings.hud.class_coords} absolute syne-mono text-right text-grey bottom-left"><div class="label"></div><div class="value"></div></div>
     <div id="${settings.hud.id_y}" class="${settings.hud.class_coords} absolute syne-mono text-right text-grey"><div class="label"></div><div class="value"></div></div>
     <!-- HUD Sector -->
     <div id="${settings.hud.id_sector}" class="${settings.hud.class_sector} absolute circle top-left syne-mono text-center text-grey"><div class="label"></div><div class="value"></div></div>
     <!-- HUD Engine -->
     <div id="${settings.hud.id_engine}" class="">
       <div id="${settings.hud.id_engineThrust}" class="absolute bottom-middle syne-mono text-grey"><div class="value"></div></div>
     </div>
    </div>`, submain)
    
    // shorthands for performance
    hudX      = qset(`#${settings.hud.id_x} .value`)
    hudY      = qset(`#${settings.hud.id_y} .value`)
    hudSector = qset(`#${settings.hud.id_sector} .value`)
    hudEngineThrust = qset(`#${settings.hud.id_engineThrust} .value`)
    showX     = qset(`#${settings.canvas.id_xy}-X-value`)
    showY     = qset(`#${settings.canvas.id_xy}-Y-value`)
    showZ     = qset(`#${settings.canvas.id_xy}-Z-value`)
    hudFPS    = qset(`#${settings.canvas.id_fps} .value`)
    
    // adjust the Coordinates
    js_dir   = qset(`#${settings.controls.id_dir}`)
    js_aim   = qset(`#${settings.controls.id_aim}`)
    hud_main = qset(`#${settings.hud.id_hud}`)
    hud_x    = qset(`#${settings.hud.id_x}`)
    hud_y    = qset(`#${settings.hud.id_y}`)
    hud_y.style.bottom = js_dir.clientHeight
    hud_x.style.setProperty('left', `calc(${js_dir.clientWidth}px - ${hud_x.clientWidth}px)`)
  }
  
  let endStage = function() {
    console.log(`Killing the stage.`)
    
    // Notify everyone
    raiseEvent( main, events.outgoing.stage_kill )
    
    // Remove &
    js_dir.remove()
    js_aim.remove()
    hud_x.remove()
    hud_y.remove()
    hud_main.remove()
    
    // Reset
    js_dir   = undefined
    js_aim   = undefined
    hud_main = undefined
    hud_x = undefined
    hud_y = undefined
    
    // we remove main and reinject with state
    main.remove()
    main = undefined
    setTimeout(function() { initialise() }, 8000 )
  }
  
  /* Joystick interactions */
  let jsNotifyDir = function(e) {
    raiseEvent( main, events.outgoing.joystick_dir, e)
  }
  let jsNotifyAim = function(e) {
    raiseEvent( main, events.outgoing.joystick_aim, e)
  }
  
  // Wipe & Subwipe functions
  let wipe = function() {
    main.innerHTML = ''
    main.insertAdjacentHTML('beforeend', `<div id="${settings.app.id_subtray}"></div>`)
  }
  
  let subwipe = function() { submain.innerHTML = '' }



  // Initialisation listener
  body = qset(`body`)
  body.addEventListener( event_initialise, function() {
    // Listen
    listen()
    // Signal Ready
    raiseEvent( body, events.comptroller.count, `ux` )
  })
  
  let listen = function() {
    body.addEventListener( events.comptroller.ready, function(e) {
      let g = e.detail
      main    = g.main
      submain = g.submain
      canvas  = g.canvas
      mmenu   = g.mmenu
      
      /* Comptroller Instructions */
      main.addEventListener( events.comptroller.title, renderTitle )
      main.addEventListener( events.ux.click, click )
      main.addEventListener( events.comptroller.canvas, renderHUD )
    })
  }
  
  let renderHUD = function() {
    let x = `${settings.hud.class_coords} absolute syne-mono text-right text-grey bottom-left`
    let y = `${settings.hud.class_coords} absolute syne-mono text-right text-grey`
    inject(`
      <div id="${settings.hud.id_main}" class="absolute fullscreen center no-pointer">
        <div id="${settings.hud.id_xyz}" class="absolute top-right">
          <div id="${settings.hud.id_xyz}-X"><div class="label">X</div><div class="value"></div></div>
          <div id="${settings.hud.id_xyz}-Y"><div class="label">Y</div><div class="value"></div></div>
          <div id="${settings.hud.id_xyz}-Z"><div class="label">Z</div><div class="value"></div></div>
        </div>
        <div id="${settings.hud.id_fps}" class="absolute top-right syne-mono text-grey"><div class="value"></div></div>
        <div id="${settings.hud.id_x}" class="${x}"><div class="value"></div></div>
        <div id="${settings.hud.id_y}" class="${y}"><div class="value"></div></div>
      </div>
    `, submain)
  }
  
  let renderTitle = function() {
    let f = `center flexbox syne-mono text-bright text-accent text-right no-select cursor`
    let k = qset(`#${settings.application.id_mmenu_list}`)
        k.classList.value = f
    
    let menuElements = [{key: 'new-game', value: 'New Game'}, {key: 'continue-game', value: 'Continue Game'}, {key: 'settings', value: 'Settings'}, {key: 'quit', value: 'Quit'}]
    let clickTemplate = `<div class="${settings.application.cl_mmenu_elem}" id="ELEMENT_ID" onclick="ELEMENT_ONCLICK"><div class="backdrop"></div><div class="value">ELEMENT_VALUE</div></div>`
    let str = ``
    menuElements.forEach(item => {
      str += clickTemplate
               .replace(`ELEMENT_ID`, item.key)
               .replace(`ELEMENT_ONCLICK`, `mg3.utilities.raiseEvent( document.querySelector(\'body\'), \'${events.comptroller.click}\', \'${item.key}\' )`)
               .replace(`ELEMENT_VALUE`, item.value)
    })
    
    inject(str, k)
    
    // Unhide
    let m = qset(`#${settings.application.id_mmenu}`)
        m.classList.remove('hidden')
  }
  
  let renderQuit = function() {
    let clickReduce = `mg3.utilities.raiseEvent( document.querySelector(\'body\'), \'${events.comptroller.click}\', \'quit-close\' )`
    let clickXClose = `mg3.utilities.raiseEvent( document.querySelector(\'body\'), \'${events.comptroller.click}\', \'quit-confirm\' )`
    inject(`
      <div id="${settings.application.id_mmenu_quit}" class="full-modal syne-mono text-grey text-center">
      <div class="full-modal backing"></div>
      <div class="value no-select center cursor" onclick="${clickXClose}">Quit?</div>
      <div class="x-close no-select absolute top-right cursor" onclick="${clickReduce}">x</div>
      </div>`, mmenu)
  }
  let closeQuit = function() { qset(`#${settings.application.id_mmenu_quit}`).remove() }
  
  let renderSettings = function() {
    let clickReduce = `mg3.utilities.raiseEvent( document.querySelector(\'body\'), \'${events.comptroller.click}\', \'settings-close\' )`
    inject(`
      <div id="${settings.application.id_mmenu_sets}" class="full-modal syne-mono text-grey text-center">
      <div class="full-modal backing"></div>
      <div class="value flexbox flex-column no-select center cursor" onclick="">
        <div class="header">Settings</div>
      </div>
      <div class="x-close no-select absolute top-right cursor" onclick="${clickReduce}">x</div>
      </div>
    `, mmenu)
  }
  let closeSettings = function() { qset(`#${settings.application.id_mmenu_sets}`).remove() }
  
  let click = function(e) {
    let msg = e.detail
    switch(msg) {
      // Game
      case 'new-game':
        // inform
        raiseEvent( body, events.ux.click_outward, msg )
        // remove
        mmenu.classList.add('hidden')
        break;
      case 'continue-game':
        break;
        
      // Settings
      case 'settings': renderSettings(); break;
      case 'settings-close': closeSettings(); break;
      
      // Quit
      case 'quit': renderQuit(); break;
      case 'quit-confirm': window.close(); break;
      case 'quit-close': closeQuit(); break;
    }
  }
  
  return {
  
  }
})()