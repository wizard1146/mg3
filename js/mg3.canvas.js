mg3 = typeof mg3 != 'undefined' ? mg3 : {}

mg3.canvas = (function() {
  /* Meta Variables */
  let qset       = mg3.utilities.qselect
  let raiseEvent = mg3.utilities.raiseEvent
  let uuid       = mg3.utilities.uuid
  let season     = mg3.season_001
  let inject     = function(str, tar) { var t = tar ? tar : body; t.insertAdjacentHTML('beforeend', str) }

  /* Settings */
  let settings = {
    defaults: {
      camera: {
/*
        alpha  : -Math.PI / 2,
        beta   :  Math.PI / 2.5,
        radius : 10,
        startPosition       : new BABYLON.Vector3( -1.73, 2.37, 4.97 ),
 */
        target : new BABYLON.Vector3( 0, 1, 0 ),

        wheelPrecision      : 11,
        rangeLowerProximity : 5,
        rangeHigherProximity: 135,

        alpha  : 5.61*Math.PI/4,
        beta   : 1.11*Math.PI/4,
        radius : 3*5,
        startPosition       : new BABYLON.Vector3( -2.2, 10.1, -5.7 ),

        upperBetaLimit: Math.PI / 2.2,
        lowerBetaLimit: Math.PI / (Math.PI * 1.7),
        panningAxis   : new BABYLON.Vector3(1.1,0,-1.6),
        sensibilityX  : 2000,
        sensibilityY  : 2000,
      },
    },
    dpi     : 192, // 192, 288
    fps     : 120,
    app     : {
      id_tray   : 'mg-main',
      id_subtray: 'mg-submain',
    },
    canvas  : {
      id    : 'mg-canvas',
    },
  }

  /* Events */
  let events = {
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
  }

  /* In-memory variables */
  let body, canvas, camera, engine, scene, units = {}, player;

  /* Computational variables */

  /* Loop control */
  let anim = {
    stop : false,
    frame: 0,
    fps  : settings.fps,
    fpsi : 0,
    start: 0,
    now  : 0,
    then : 0,
    gone : 0,  
    prep : function() {
      anim.stop  = false
      anim.fpsi  = 1000 / anim.fps
      anim.then  = performance.now()
      anim.start = anim.then
      anim.loop()
    },
    loop : function() { 
      if (anim.stop) { return }
      window.requestAnimationFrame( anim.loop )
      anim.now  = performance.now()
      anim.gone = anim.now - anim.then
      if (anim.gone > anim.fpsi) { 
        anim.then = anim.now - (anim.gone % anim.fpsi) 
        anim.frame++
        raiseEvent( canvas, events.internal.canvas_tick, anim.frame )
      }
    },
    cease : function() {
      anim.stop = true
    },
    reset : function() {
      anim.cease()
      anim.frame = 0
    },
    rates: function() { return 1000 * anim.frame/(anim.now - anim.start) },
  }
  

  let setup = function(size) {
    // some statics
    body = document.querySelector('body')
    
    // set up main
    body.addEventListener( events.incoming.injected_main, function() {
      main    = qset(`#${settings.app.id_tray}`)
      submain = qset(`#${settings.app.id_subtray}`)
      eventify()
    } )
    main    = qset(`#${settings.app.id_tray}`)
    submain = qset(`#${settings.app.id_subtray}`)
  }
  
  let eventify = function() {
    main.addEventListener( events.incoming.stage_start, stageStart )
    main.addEventListener( events.incoming.stage_kill , stageEnd   )
  }

  let stageStart = async function() {
    let s = `center fullscreen`
    let c = `<canvas id="${settings.canvas.id}" class="${s}"></canvas>`
    
    // add the canvas
    inject(c, submain)
    
    canvas = qset(`#${settings.canvas.id}`)
    canvas.addEventListener( events.incoming.loadModel, loadModel )

    var wi = window.innerWidth
    var he = window.innerHeight
    canvas.style.width = wi + 'px'
    canvas.style.height = he + 'px'

    // create the engine
    engine = new BABYLON.Engine(canvas, false, {}, false)
    // visual
    engine.setHardwareScalingLevel(0.5)
    engine.resize()

    // prevent gltf files from auto-playing
    BABYLON.SceneLoader.OnPluginActivatedObservable.add((e) => {
      if (e.name === 'gltf' && e instanceof BABYLON.GLTFFileLoader) {
        e.animationStartMode = BABYLON.GLTFLoaderAnimationStartMode.NONE
      }
    })
    
    // add event listeners
    window.addEventListener('resize', function() { engine.resize() })
    canvas.addEventListener( events.internal.canvas_tick, function() {
      stageTick()
      raiseEvent( main, events.outgoing.tick, {camera: camera} )
    })
    
    // run defaultScene
    scene = await defaultScene()
    
    // start the loop
    anim.prep()
  }
  
  let stageEnd = function() {
    anim.reset()
    canvas.remove()
    canvas = undefined
  }
  
  let stageTick = function() {
    // get updated data
    let data = mg3.engine.data()
    let hero = data.hero

    // move the models
    if (player && hero.a) {
      // move
      player.moveTo( -hero.x / 144, hero.y / 144 )
      // animate
      if (player.anim.current !== hero.a.key) {
        player.AnimateSpecific( hero.a.key )
      }
    }

    // render scene
    scene.render()
  }
  
  let defaultScene = async function() {
    // generate scene
    let scene = await createScene()
    // animate
 /*
    if (false) {
    
    engine.runRenderLoop(function() {
      scene.render()
    })
    }
   */ 
    // handler
    return scene
  }

  let createScene = function(options) {
    var scene = new BABYLON.Scene(engine)
    let c   = settings.defaults.camera
    let cam = {}
        cam.alpha  = options?.cameraAlpha  ? options?.cameraAlpha  : c.alpha
        cam.beta   = options?.cameraBeta   ? options?.cameraBeta   : c.beta
        cam.radius = options?.cameraRadius ? options?.cameraRadius : c.radius
        cam.target = options?.cameraTarget ? options?.cameraTarget : c.target
        cam.wp     = options?.cameraWheelPrecision  || c.wheelPrecision
        cam.lp     = options?.cameraLowerProximity  || c.rangeLowerProximity
        cam.hp     = options?.cameraHigherProximity || c.rangeHigherProximity
        cam.ub     = options?.cameraUpperBeta       || c.upperBetaLimit
        cam.lb     = options?.cameraLowerBeta       || c.lowerBetaLimit
        cam.pa     = options?.cameraPanningAxis     || c.panningAxis
        cam.sx     = options?.cameraSensibilityX    || c.sensibilityX
        cam.sy     = options?.cameraSensibilityY    || c.sensibilityY
        cam.sp     = options?.cameraStartPosition   || c.startPosition

    camera = new BABYLON.ArcRotateCamera('viewport', cam.alpha, cam.beta, cam.radius, cam.target)
    
    // Attach camera to canvas
    camera.attachControl( canvas, true, false, 0 )
    // Adjust the camera movements
    scene.useRightHandedSystem = true
    // Camera target
    camera.setTarget( cam.target )
    // Wheel inputs
    camera.inputs.addMouseWheel()
    camera.wheelPrecision   = cam.wp
    // Restrict camera-to-target range
    camera.lowerRadiusLimit = cam.lp
    camera.upperRadiusLimit = cam.hp
    // Restrict camera to above ground level
    camera.upperBetaLimit   = cam.ub
    camera.lowerBetaLimit   = cam.lb
    // Restrict Y-axis movement to prevent compound movements allowing below-ground transposition
    camera.panningAxis      = cam.pa
    // Change the speed of rotation
    camera.angularSensibilityX = cam.sx
    camera.angularSensibilityY = cam.sy
    // Set starting position
    // camera.position = cam.sp

    // All Light options
    let lightIntensity = options?.lightIntensity || 1

    // Set the Light
	let light = new BABYLON.HemisphericLight("Light", new BABYLON.Vector3(0, 4, 2), scene);
	light.diffuse  = new BABYLON.Color3(0.98, 0.97, 0.95);
	light.specular = new BABYLON.Color3(0.98, 0.97, 0.95);
	light.groundColor = new BABYLON.Color3(0, 0, 0);
    light.intensity = lightIntensity

    if (true) {
      // Central sphere for orientation
      if (false) {
        let sphere = BABYLON.MeshBuilder.CreateSphere("sphere", {diameter: 1, segments: 32}, scene);
        sphere.position.y = 1;
      }
      // Compass points for orientation
      let compass = [
        {name: 'north', color: BABYLON.Color3.Teal(),  x: 0,     y: -49.5},
        {name: 'east',  color: BABYLON.Color3.Red(),   x: 49.5,  y: 0},
        {name: 'south', color: BABYLON.Color3.Green(), x: 0,     y:  49.5},
        {name: 'west',  color: BABYLON.Color3.Blue(),  x: -49.5, y: 0},
      ]
      compass.forEach(point => {
        let p = BABYLON.MeshBuilder.CreateBox(point.name, {}, scene)
        p.position.x = point.x
        p.position.z = point.y
        let m = new BABYLON.StandardMaterial('material-for-' + point.name, scene)
        m.diffuseColor = point.color
        p.material = m
      })
      if (false) {
        const axes = new BABYLON.AxesViewer(scene, 5)
      }
    }
    ground = BABYLON.MeshBuilder.CreateGround("ground", {width: 26, height: 26}, scene);
    ground.receiveShadows = true;
    // add akcb tag
    // ground.akcbTag = akcbGroundTag
    
    // Make a light
    const dirlight = new BABYLON.DirectionalLight("dir01", new BABYLON.Vector3(1, -1, 0), scene);
    dirlight.position = new BABYLON.Vector3(0, 8, -11);
    // Shadow generator
    shadowGenerator = new BABYLON.ShadowGenerator(1024, dirlight);

    var axes = new BABYLON.AxesViewer(scene, 1)
    
    return scene
  }

  let loadModel = async function(uri, payload, isPlayer) {
    let obj = await BABYLON.SceneLoader.ImportMeshAsync('', uri, '', scene)
        
    let unit = new UnitModel(obj, payload)
    
    if (payload?.scale) unit.scaleTo( payload?.scale )
    if (payload?.position) unit.moveTo( payload?.position.x, payload?.position.y )
    if (payload?.rotation) unit.rotateTo( payload?.rotation )
    
    unit.AnimateIdle()

    // save the model 
    units[unit.uuid] = unit
    if (isPlayer) {
      player = unit
    }
  }
  
  class UnitModel {
    constructor(datum, payload) {
      Object.entries(datum).forEach(([k,v],i) => {
        this[k] = v
        if (k === 'meshes') this.actual = v[0]
      })
      this.uuid = uuid()
      // animation data
      this.animation = null
      this.anim = {}
      this.anim.current = ``
      // save meta information from payload
      if (payload?.animationKeys) this.anim.keys = payload?.animationKeys
      
      // meta information
      this.meta = {}
      this.meta.scale = 1

      this.showAxes()

      // save it to the module
      units[this.uuid] = this
    }
    // Helper Tools
    showAxes() {
      if (this?.axes) this.axes.dispose()
      // add a little axes
      this.axes = new BABYLON.AxesViewer(scene, 1/this.meta.scale)
      this.axes.xAxis.parent = this.actual
      this.axes.yAxis.parent = this.actual
      this.axes.zAxis.parent = this.actual
    }
    // Geo Controllers
    moveTo(x, y, z = 0) {
      this.actual.position = new BABYLON.Vector3( x, z, y )
    }
    scaleTo(scale) {
      this.meta.scale = scale
      this.actual.scaling.scaleInPlace( this.meta.scale )
      this.showAxes()
    }
    rotateTo(degrees) {
      this.actual.rotate(BABYLON.Axis.Y, degrees, BABYLON.Space.LOCAL)
    }
    rotateBy(degrees) {

    }
    // Animation Controllers
    AnimateStop() {
      if (this.animation) this.animation.stop(); this.animation = null;
    }
    AnimateSpecific(animation) {
      this.AnimateStop()
      let g = this.animationGroups
      let f = g.filter(a => a.name == animation)
      if (f.length) {
        this.anim.current = animation
        this.animation = f[0]
        this.animation.start( true, 1 )
      }
    }
    AnimateIdle() {
      if (this.anim.keys) this.AnimateSpecific(this.anim.keys.idle)
    }
    AnimateWalk() {
      if (this.anim.keys) this.AnimateSpecific(this.anim.keys.walk)
    }
  }
  
  // Initialisation listener
  qset('body').addEventListener( events.incoming.initialise, setup )

  return {
    setup       : setup,
    defaultScene: defaultScene, 
    loadModel   : loadModel,

    canvas      : function() { return canvas },
    camera      : function() { return camera },
    scene       : function() { return scene  },
    units       : function() { return units  },
 
    fps         : anim.rates,
  }
})()