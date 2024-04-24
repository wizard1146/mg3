mg3 = typeof mg3 != 'undefined' ? mg3 : {}

mg3.canvas = (function() {
  /* Meta Variables */
  let qset       = mg3.utilities.qselect
  let raiseEvent = mg3.utilities.raiseEvent
  let uuid       = mg3.utilities.uuid
  let season     = mg3.season_001
  let inject     = function(str, tar) { var t = tar ? tar : body; t.insertAdjacentHTML('beforeend', str) }

  let events  = mg3.comptroller.events()
  let event_initialise = events.preloader.initial
  
  /* Settings */
  let settings   = mg3.settings.get()
  
  /*
  let settings = {
    defaults: {
      camera: {
        alpha  : -Math.PI / 2,
        beta   :  Math.PI / 2.5,
        radius : 10,
        startPosition       : new BABYLON.Vector3( -1.73, 2.37, 4.97 ),
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
  */

  /* Events */

  /* In-memory variables */
  let body, main, submain, mmenu;
  let canvas, engine, scene, units = {}, player;

  /* Computational variables */


  let createScene = function(options) {
    var scene = new BABYLON.Scene(engine)
    
    let c   = settings.canvas
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
  body = qset(`body`)
  body.addEventListener( event_initialise, function() {
    // Listen
    listen()
    // Signal Ready
    raiseEvent( body, events.comptroller.count, `canvas` )
  })
  
  let listen = function() {
    body.addEventListener( events.comptroller.ready, function(e) {
      let g = e.detail
      main    = g.main
      submain = g.submain
      canvas  = g.canvas
      mmenu   = g.mmenu
      
      /* Comptroller Instructions */
      main.addEventListener( events.comptroller.canvas, renderCanvas )
      canvas.addEventListener( events.comptroller.unit, loadModel )
      
      /* Canvas preparation */
      // Canvas sizing
      var wi = window.innerWidth
      var he = window.innerHeight
      canvas.width  = wi
      canvas.height = he
      // Engine
      engine = new BABYLON.Engine(canvas, false, {}, false)
      // Engine: Visual improvements
      engine.setHardwareScalingLevel(0.5)
      engine.resize()
      // BABYLON: Prevent gltf files from auto-playing
      BABYLON.SceneLoader.OnPluginActivatedObservable.add((e) => {
        if (e.name === 'gltf' && e instanceof BABYLON.GLTFFileLoader) {
          e.animationStartMode = BABYLON.GLTFLoaderAnimationStartMode.NONE
        }
      })
      // Engine: Listen for resize
      window.addEventListener('resize', function() { engine.resize() })
    })
  }
  
  let renderCanvas = async function(e) {
    // Unhide canvas
    canvas.classList.remove('hidden')
    // Create scene
    scene = await createScene()
    // Listen to Comptroller tick
    main.addEventListener( events.comptroller.tick, tick )
  }
  
  let tick = function() {
    // update scene
    
    // render scene  
    scene.render()
  }
  
  let loadModel = async function(e) {
    let datum = e.detail
    let uri   = `assets/${datum.meta.uri}/scene.gltf`
    
    let obj = await BABYLON.SceneLoader.ImportMeshAsync('', uri, '', scene)
    let unit = new UnitModel(obj, {animationKeys: datum.meta.animationKeys})
    
    if (datum?.meta?.scale) unit.scaleTo( datum?.meta?.scale )
    if (typeof datum?.x != 'undefined' && typeof datum?.y != 'undefined') unit.moveTo( datum?.x, datum?.y )
    if (datum?.r) unit.rotateTo( datum?.r )
    
    unit.AnimateIdle()

    // save the model 
    units[unit.uuid] = unit
    if (false) {
      player = unit
    }
    // notify Comptroller
    raiseEvent( canvas, events.canvas.unit_loaded, unit )
  }

  return {
    canvas      : function() { return canvas },
    camera      : function() { return camera },
    scene       : function() { return scene  },
    units       : function() { return units  },
  }
})()