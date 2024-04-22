
bmx = (function() {
  // Settings
  let settings = {
    color_standard: new BABYLON.Color4(0.46, 0.46, 0.46, 0.88),
    color_range   : new BABYLON.Color4(0.27, 0.26, 0.70, 0.88),
    color_active  : new BABYLON.Color4(0.75, 0.09, 0.09, 0.45),
    color_marsh   : new BABYLON.Color4(0.22, 0.34, 0.29, 1.00),

    maxLights     : 18,
  }
  
  let dev = true;
  let body, canvas, engine, map;
  let client = {
    name: 'smolprotecc',
  }

  let events = {
    hexClicked : 'hexagon-clicked',
    hexTerminal: 'hexagon-terminus',
    hexMovement: 'hexagon-movement',
  }
  // Variables
  let materials = {}

  // Specific to babylon
  let unitRotations = {
    0: [
      (30 -  60) * Math.PI / 180,
      (30 - 120) * Math.PI / 180,
      (30 - 180) * Math.PI / 180,
      (30 - 240) * Math.PI / 180,
      (30 - 300) * Math.PI / 180,
      (30 - 360) * Math.PI / 180,
    ],
    1: [
      (30 + 120) * Math.PI / 180,
      (30 +  60) * Math.PI / 180,
      (30 +   0) * Math.PI / 180,
      (30 -  60) * Math.PI / 180,
      (30 - 120) * Math.PI / 180,
      (30 - 180) * Math.PI / 180,
    ],
  }

  let setup = function(size) {
    // some statics
    body = document.querySelector('body')

    // resize our canvas
    canvas = document.querySelector('canvas')
    canvas.height = size ? size : window.innerHeight
    canvas.width  = size ? size : window.innerWidth

    // create the engine
    engine = new BABYLON.Engine(canvas, false, {}, false)

    // prevent gltf files from auto-playing
    BABYLON.SceneLoader.OnPluginActivatedObservable.add((e) => {
      if (e.name === 'gltf' && e instanceof BABYLON.GLTFFileLoader) {
        e.animationStartMode = BABYLON.GLTFLoaderAnimationStartMode.NONE
      }
    })
    
    // add event listeners
    window.addEventListener('resize', function() { engine.resize() })
  }
  
  let defaultScene = async function() {
    // generate scene
    scene = await createScene()
    // animate
    engine.runRenderLoop(function() {
      scene.render()
    })
  }
  
  let createScene = async function(options) {

    // Initialise scene object
    var scene = new BABYLON.Scene(engine)
    
    // All camera options
    let cameraAlpha  = options?.cameraAlpha  || -Math.PI / 2
    let cameraBeta   = options?.cameraBeta   || Math.PI / 2.5
    let cameraRadius = options?.cameraRadius || 10
    let cameraTarget = options?.cameraTarget || new BABYLON.Vector3(0, 0, 0)
    
    let cameraWheelPrecision = options?.cameraWheelPrecision || 11
    let cameraRangeLowerProximity = options?.cameraRangeLowerProximity || 5
    let cameraRangeHigherProximity = options?.cameraRangeHigherProximity || 135
    let cameraStartPosition = options?.cameraStartPosition || new BABYLON.Vector3(-5.6,14.2,25.8) // new BABYLON.Vector3(-37,35,-49)
    
    // All camera instructions
    let camera = new BABYLON.ArcRotateCamera('viewport', cameraAlpha, cameraBeta, cameraRadius, cameraTarget)
    // Attach camera to canvas
    camera.attachControl(canvas, true, false, 0)
    // Adjust the camera movements
    scene.useRightHandedSystem = true
    // Camera target
    camera.setTarget(cameraTarget)
    // Wheel inputs
    camera.inputs.addMouseWheel()
    camera.wheelPrecision = cameraWheelPrecision
    // Restrict camera-to-target range
    camera.lowerRadiusLimit = cameraRangeLowerProximity
    camera.upperRadiusLimit = cameraRangeHigherProximity
    // Restrict camera to above ground level
    camera.upperBetaLimit = Math.PI / 2.2
    camera.lowerBetaLimit = Math.PI / (Math.PI * 1.7)
    // Restrict Y-axis movement to prevent compound movements allowing below-ground transposition
    camera.panningAxis = new BABYLON.Vector3(1.1,0,-1.6) // (2,0,3.3)
    // Change the speed of rotation
    camera.angularSensibilityX = 2000
    camera.angularSensibilityY = 2000
    // Set starting position
    camera.position = cameraStartPosition

    // All Light options
    let lightIntensity = options?.lightIntensity || 0.43

    // Set the Light
	let light = new BABYLON.HemisphericLight("Light", new BABYLON.Vector3(0, 4, 2), scene);
	light.diffuse  = new BABYLON.Color3(0.98, 0.97, 0.95);
	light.specular = new BABYLON.Color3(0.98, 0.97, 0.95);
	light.groundColor = new BABYLON.Color3(0, 0, 0);
    light.intensity = lightIntensity
    light.setEnabled(false)

    if (dev) {
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
    
    if (false) {
      engine.runRenderLoop(function() {
        camera.alpha += 0.001
      })
    }
    
    return scene
  }

  let drawHexagonMap = async function(hexmap) {
    // Exit if Scene is not ready
    if (!scene) { console.log('Scene not ready',scene); return }

    // Set an Origin from the Hex Map => not done yet!
    let origin = new BABYLON.Vector3(0, 0, 0)

    // create some standard materials
    materials.standard = new BABYLON.StandardMaterial('standard', scene)
    materials.standard.diffuseColor = settings.color_standard
    materials.standard.specularColor = new BABYLON.Color3(0, 0, 0)
    // materials.standard.diffuseTexture = new BABYLON.Texture('../assets/ftile-4.png', scene)
    
    materials.floor = new BABYLON.StandardMaterial('floor', scene)
    materials.floor.diffuseTexture = new BABYLON.Texture('../assets/stone-tile-map.jpeg', scene)
    materials.floor.alpha = 0.77

    // provide some floor variation
    materials.floors = {}
    let validFloors = ['tile-1.png','tile-2.png','tile-3.png','tile-4.png']
    validFloors.forEach(tile => {
      let material = new BABYLON.StandardMaterial(tile)
      material.diffuseTexture = new BABYLON.Texture('../assets/' + tile, scene)
      material.alpha = 0.77
      material.specularColor = new BABYLON.Color3(0, 0, 0)
      materials.floors[tile] = material
    })

    materials.active   = new BABYLON.StandardMaterial('red', scene)
    materials.active.diffuseColor = settings.color_active // BABYLON.Color3.Red()

    materials.terminus = new BABYLON.StandardMaterial('teal', scene)
    materials.terminus.diffuseColor = BABYLON.Color3.Teal()
    materials.pathTerminus = new BABYLON.StandardMaterial('magenta', scene)
    materials.pathTerminus.diffuseColor = BABYLON.Color3.Magenta()

    materials.path = new BABYLON.StandardMaterial('yellow', scene)
    materials.path.diffuseColor = BABYLON.Color3.Yellow()

    materials.range = new BABYLON.StandardMaterial('blue', scene)
    materials.range.diffuseColor = settings.color_range

    materials.wall = new BABYLON.StandardMaterial('gray', scene)
    materials.wall.diffuseColor = BABYLON.Color3.Gray()  
    materials.marsh = new BABYLON.StandardMaterial('green', scene)
    materials.marsh.diffuseColor = settings.color_marsh // BABYLON.Color3.Green()  

    Object.keys(materials).forEach(key => {
      // materials[key].maxSimultaneousLights = settings.maxLights
    })

    // Define the Hexagon Tile shape
    // https://playground.babylonjs.com/#PQ0GIE#1
    const mat = new BABYLON.StandardMaterial('mat') // mat.backFaceCulling = false; 
	const tileShape = [
      new BABYLON.Vector3(0.2, 0, 0),
      new BABYLON.Vector3(1, 0, 0),
      new BABYLON.Vector3(0.88, 0.15, 0),
      new BABYLON.Vector3(0, 0.15, 0)
	];
    const wallShape = [
      new BABYLON.Vector3(0.2, 0, 0),
      new BABYLON.Vector3(1, 0, 0),
      new BABYLON.Vector3(0.88, 0.3, 0),
      new BABYLON.Vector3(0, 0.3, 0)
    ];
    
    // Draw each Hexagon Tile

    // Create space to save some variables
    scene._hexstarUnits = []

    let tiles = []
    let points = hexmap.list
    for (var i = 0; i < points.length; i++) {
      let hexagon = points[i]

      // Create hextiles
      let name = 'hexagon-Q' + hexagon.hex.q + '-R' + hexagon.hex.r + '-S' + hexagon.hex.s
      let hexTile = BABYLON.MeshBuilder.CreateLathe(name, {
        shape: hexagon.isWall() ? wallShape : tileShape, 
        radius: 1, 
        tessellation: 6, 
        sideOrientation: BABYLON.Mesh.DOUBLESIDE,
      });
      hexTile.convertToFlatShadedMesh();
      // Turn the hextile for our orientation
      hexTile.rotation = new BABYLON.Vector3(0, Math.PI/2, 0)
      // Translate the hextile
      hexTile.position.copyFrom(origin)
      hexTile.position.x = hexagon.point.x
      hexTile.position.z = hexagon.point.y
      hexTile.position.y = -0.15
      // Add a face submesh
      const face = BABYLON.MeshBuilder.CreateDisc(name + '-face', {
        radius: 0.86,
        tessellation: 6,
      }, scene);
      face.position.y = 0.151
      face.rotation.x = 90*Math.PI/180
      face.rotation.y = 0
      face.rotation.z = 0
      face.parent = hexTile
      // Provide some session-specific data storage
      hexTile._hexstarData = {
        type: hexagon.type,
      }
      face._hexstarData = {
        material: hexagon.face,
        rotation: hexagon.faceRotation,
      }
      
      // Provide pickers
      face._hexagonPickFace = function() { return this }
      face._hexagonPickTile = function() { return this._parentNode }
      hexTile._hexagonPickFace = function() { return this._children[0] }
      hexTile._hexagonPickTile = function() { return this }

      // Provide meta-data
      hexTile._hexagon = hexagon
      if (hexagon.isWall()) {
        hexTile.obstacle = true
      }
      // Set materials for differing types
      if (hexagon.type && materials[hexagon.type]) {
        hexTile.material = materials[hexagon.type]
      } else {
        hexTile.material = materials.standard
      }
      // Set functions for resetting materials
      //   for the tile
      hexTile._hexagonResetMaterial = function() {
        if (materials[hexTile._hexstarData.type]) {
          hexTile.material = materials[hexTile._hexstarData.type]
        } else {
          hexTile.material = materials.standard
        }
      }
      //   for the face
      face._hexagonResetMaterial = function() {
        if (face._hexstarData.material && materials.floors[face._hexstarData.material]) {
          face.material = materials.floors[face._hexstarData.material]
        } else {
          face.material = materials.floor
        }
      }

      // Call materials
      face._hexagonResetMaterial()
      // Call rotation only on instantiation
      face.rotate(BABYLON.Axis.Z, face._hexstarData.rotation  * Math.PI / 180)
      
      // Draw any unit associated data
      if (hexagon.unit) {
        let unit = await meshifyUnit(hexagon.unit)
        scene._hexstarUnits.push(unit)
      }

      tiles.push(hexTile)
    }

    // draw lights
    let lightTemplate = {
      root       : 'assets/environment/torch/',
      url        : 'scene.gltf',
      coordinates: new Hex( 0, 0, 0),
      vertical   : 1.6,
      face       : 0,
      facing     : 2,
      uuid       : 1,
      name       : 'torch',
      owner      : 'smolprotecc',
      key        : 'torch',
      hitbox     : 1,
      scale      : 1,
    }
    let walls = [
      {coordinates: new Hex(  2, -7,  5), arc: -30},
      {coordinates: new Hex(  3,  0, -3), arc: -120},
      {coordinates: new Hex( -6,  7, -1), arc: -30},
      {coordinates: new Hex( -9,  2,  7), arc:  60},
    ]
    for (var index = 0; index < walls.length; index++) {
      let wall = walls[index]
      let L = clone(lightTemplate)
          L.coordinates = wall.coordinates
      let c = mapper.convert(L.coordinates)
      let g = await meshifyUnit(L)
          g.position = new BABYLON.Vector3( c.x, 1.7, c.y - 0.12 )
          g.rotate(BABYLON.Axis.Y, BABYLON.Tools.ToRadians( L.arc ), BABYLON.Space.LOCAL)
          g.material = materials.standard
      let w = BABYLON.MeshBuilder.CreateBox('wall-' + index, {height: 3.2, width: 1.8, depth: 0.18})
          w.position = new BABYLON.Vector3( c.x, 1.6, c.y )
          w.rotate(BABYLON.Axis.Y, BABYLON.Tools.ToRadians( L.arc ), BABYLON.Space.LOCAL)
      let m = new BABYLON.PointLight('pointlight', new BABYLON.Vector3( c.x - 0.12, L.vertical + 0.425, c.y - 0.12), scene)
          m.intensity = 0.65
          m.diffuse  = new BABYLON.Color3( 0.98, 0.45, 0.19 )
          m.specular = new BABYLON.Color3( 0.98, 0.45, 0.19 )
          m.position = new BABYLON.Vector3(c.x - 0.12 + 0.12, 1.7 + 0.425, c.y - 0.12 - 0.3)
    }
    /*
    let n = 1;
    for (var i = 0; i < n; i++) {
      let L = clone(lightTemplate)
      L.coordinates = new Hex( -3, 0, 3)
      let c = mapper.convert(L.coordinates)

      let g = await meshifyUnit(L)
      g.position = await new BABYLON.Vector3(c.x, 1.7, c.y - 0.12)
      g.rotate(BABYLON.Axis.Y, BABYLON.Tools.ToRadians( -30), BABYLON.Space.LOCAL)
      g.material = materials.standard

      let W = BABYLON.MeshBuilder.CreateBox('wall-' + i, {height: 3.2, width: 1.8, depth: 0.18})
      W.position = new BABYLON.Vector3(c.x, 1.6, c.y)

      let M = new BABYLON.PointLight('pointlight', new BABYLON.Vector3(c.x - 0.12, L.vertical + 0.425, c.y - 0.12), scene)
      M.intensity = 0.654321
      M.diffuse   = new BABYLON.Color3(0.98, 0.45, 0.18)
      M.specular  = new BABYLON.Color3(0.98, 0.45, 0.18)
      M.position = await new BABYLON.Vector3(c.x - 0.12 + 0.12, 1.7 + 0.425, c.y - 0.12 - 0.3)
    }*/

    // handle mouse interactions
    mousify()

    // eventify the scene
    eventify(tiles, hexmap)

    // Performance Enhancement: https://doc.babylonjs.com/divingDeeper/scene/optimize_your_scene
    scene.skipPointerMovePicking = true
    // scene.freezeActiveMeshes();
  }

  let rotational = {
    0: [
      BABYLON.Tools.ToRadians( -30),
      BABYLON.Tools.ToRadians( -90),
      BABYLON.Tools.ToRadians(-150),
      BABYLON.Tools.ToRadians( 150),
      BABYLON.Tools.ToRadians(  90),
      BABYLON.Tools.ToRadians(  30),
    ],
    1: [
      BABYLON.Tools.ToRadians(330 - 180),
      BABYLON.Tools.ToRadians(270 - 180),
      BABYLON.Tools.ToRadians(210 - 180),
      BABYLON.Tools.ToRadians(150 + 180),
      BABYLON.Tools.ToRadians( 90 + 180),
      BABYLON.Tools.ToRadians( 30 + 180),
    ]
  }
  let meshifyUnit = async function(unit) {
    return BABYLON.SceneLoader.ImportMeshAsync('', unit.root, unit.url, scene).then((r) => {
      let model = r.meshes[0]
      let animations = r.animationGroups

      console.log(animations)

      // set some data properties
      model.name = unit.name
      model._hexstarUnit = {
        /* store some referential data */
        reference : unit,

        /* location management */
        position: /* Hex() */ unit.coordinates,
        coords  : /* {x,y} */ mapper.convert(unit.coordinates),
        face    : unit.face,
        facing  : unit.facing,
        rotates : clone(rotational[unit.face]),

        /* location + mesh management */
        movement: unit.movement,
        scale   : unit.scale,
        vertical: unit.vertical,

        /* mesh management */
        /* defaults allow us to reset the _current values, in case we have in-game mechanics that alter these properties */
        defaultScale   : unit.scale,
        defaultVertical: unit.vertical,
        hitbox  : unit.hitbox,

        /* identifiers */
        uuid    : unit.uuid,
        key     : unit.key,
        name    : unit.name,
        owner   : unit.owner,
      }

      /* Provide some functions */

      /* Turning functions */
      // Initiate the Quaternion for Turning calculations
      model.rotate(BABYLON.Axis.Y, 0, BABYLON.Space.LOCAL)

      // Reset to North
      model._hexstarNorth = function() {
        let currentRotation = this.rotationQuaternion.toEulerAngles()
        // include some warnings for unknown rotations!
        if (currentRotation._x != 0) {
          console.log('Unexpected rotation-x with', model, '@', currentRotation._x)
        }
        if (currentRotation._z != 0) {
          console.log('Unexpected rotation-z with', model, '@', currentRotation._z)
        }
        this.rotate(BABYLON.Axis.Y, -currentRotation._y, BABYLON.Space.LOCAL)
      }

      // Turning function
      model._hexstarTurn = function(dir) {
        let face    = this._hexstarUnit.face
        let facing  = this._hexstarUnit.facing
        let turning = this._hexstarUnit.rotates[dir]
        if (turning) {
          this._hexstarUnit.facing = dir
          model._hexstarNorth()
          model.rotate(BABYLON.Axis.Y, turning, BABYLON.Space.LOCAL)
        }
      }

      // Positioning function
      model._hexstarPosition = function(position /* {x,y} */) {
        let c = mapper.convert(position)
        this._hexstarUnit.position = position
        this._hexstarUnit.coords   = c
        this.position = new BABYLON.Vector3(c.x, this._hexstarUnit.vertical ? this._hexstarUnit.vertical : 0, c.y)
        if (dev) { console.log('Repositioned', this._hexstarUnit.name, 'to', c) }
      }

      // Scaling function
      model._hexstarScaleTo = function(scale) {
        this._hexstarUnit.scale = scale
        this.scaling.scaleInPlace(this._hexstarUnit.scale)
      }

      // Rescaling function
      model._hexstarRescale = function() {
        this._hexstarScaleTo(this._hexstarUnit.defaultScale)
      }

      // Vertical function
      model._hexstarVerticalTo = function(vertical) {
        this._hexstarUnit.vertical = vertical
        this._hexstarPosition(this._hexstarUnit.position)
      }

      // Reverticalisation function
      model._hexstarRevertical = function() {
        this._hexstarVerticalTo(this._hexstarUnit.defaultVertical)
      }

      // Relatching
      model._hexstarRelatch = function(destination) {
        let d = 'hexagon-Q' + destination.q + '-R' + destination.r + '-S' + destination.s
        let t = scene.getMeshByName(d)
        t._hexagon.unit = this._hexstarUnit.reference
        // we can set the position to this tile, to reduce rounding errors
        this._hexstarPosition(t._hexagon.hex)
      }

      // Animation controllers
      model._hexstarAnimations = {
        /* Reference */
        reference: animations,
        current  : null,
        /* Settings */
        walk     : unit.animWalk ? unit.animWalk : 'Walk',
        walkSpeed: unit.animWalkSpeed ? unit.animWalkSpeed : 1,
        idle     : unit.animIdle ? unit.animIdle : 'Idle',
        idleSpeed: unit.animIdleSpeed ? unit.animIdleSpeed : 1,
      }
      // Walking animation
      model._hexstarAnimateWalk = function() {
        let animations = this._hexstarAnimations.reference
        let anim = animations.filter(anim => anim.name == this._hexstarAnimations.walk)
        if (anim.length) {
          this._hexstarAnimations.current = anim[0]
          this._hexstarAnimations.current.start(true, this._hexstarAnimations.walkSpeed)
        }
      }
      // Idle animation
      model._hexstarAnimateIdle = function() {
        let animations = this._hexstarAnimations.reference
        let anim = animations.filter(anim => anim.name == this._hexstarAnimations.idle)
        if (anim.length) {
          this._hexstarAnimations.current = anim[0]
          this._hexstarAnimations.current.start(true, this._hexstarAnimations.idleSpeed)
        }
      }
      model._hexstarAnimateStop = function() {
        if (this._hexstarAnimations.current) {
          this._hexstarAnimations.current.stop()
          this._hexstarAnimations.current = null
        }
      }
      model._hexstarAnimateReset = function() {
        this._hexstarAnimateStop()
        this._hexstarAnimateIdle()
      }

      // Set some transformations
      model._hexstarRescale()
      model._hexstarPosition(model._hexstarUnit.position)
      model._hexstarTurn(model._hexstarUnit.facing)
      model._hexstarAnimateIdle()

      // Dev visualisation
      if (false) {
        var axes = new BABYLON.AxesViewer(scene, 5)
        axes.xAxis.parent = model
        axes.yAxis.parent = model
        axes.zAxis.parent = model
      }
      return model
    })
  }

  let mousify = function() {
    // Performance
    const namePattern   = /[QRS][-]*\d+/g
    const letterPattern = /\w/
    // Variable
    let pointerTracker  = false

    scene.onPointerDown = function(e) {
      if (e.button == 0 /* LEFT CLICK */) {
        pointerTracker = true
      }
    }
    scene.onPointerMove = function() { pointerTracker = false }
    scene.onPointerUp = function(e, r) {
      if (e.button == 0 /* LEFT CLICK */ && pointerTracker) {
        let tile = r.pickedMesh
        if (tile && tile.name.match('hexagon-')) {
          // Extract Coordinates
          let coords = tile.name.match( namePattern ).map( c => parseInt(c.replace(letterPattern, '')) )
          // Raise Event
          body.dispatchEvent(new CustomEvent(events.hexClicked, {detail: {tile: r, name: tile.name, coordinates: coords}}))
        }
      }
    }
  }

  let eventify = function(tiles, hexmap) {
    let activeTile   = false
    let activeOrigin = {}
    let activePath   = []
    let allowCalculation = false
    let allowRange   = []
    /* Handle emitted events */

    // Handle Hex Tile click
    body.addEventListener(events.hexClicked, (e) => {
      if (false) { console.log(e.detail); console.log(activeTile); }
      if (activeTile) {
        let active   = scene.getMeshByName(activeTile)
        let terminus = e.detail.tile.pickedMesh._hexagonPickTile()

        // Terminate calculates & pass to server
        if (activePath.length) {
          body.dispatchEvent(new CustomEvent(events.hexMovement, {detail: {
            origin  : clone(activeOrigin), 
            terminus: clone(terminus._hexagon.hex), 
            path    : activePath.map(step => step.hex),
            unit    : active._hexagon?.unit?.uuid,
            name    : active._hexagon?.unit?.name,
            face    : active._hexagon?.unit?.face,
            facing  : active._hexagon?.unit?.facing,
          }}))
        }

        // Remove Terminus Tile Color
        terminus._hexagonResetMaterial()
        // Remove Active Tile Color
        active._hexagonResetMaterial()
        // Remove Path Tile Color
        activePath.forEach(tile => {
          let elem = scene.getMeshByName(tile.name)
          elem._hexagonResetMaterial()
        })
        // Remove Range Tile Color
        allowRange.forEach(tile => {
          let elem = scene.getMeshByName(tile)
          elem._hexagonResetMaterial()
        })
 
        // Reset variables
        activeTile = false
        activeOrigin = {}
        activePath   = []
        allowCalculation = false
        allowRange   = []
        scene.skipPointerMovePicking = true
        // scene.freezeActiveMeshes()
      } else {
        let actual = e.detail.tile.pickedMesh
        // console.log(actual)
        // console.log('face', actual._hexagonPickFace())
        // console.log('tile', actual._hexagonPickTile())
        if (actual.name.match('-face')) {
          actual = e.detail.tile.pickedMesh._parentNode
        }
        
        actual = e.detail.tile.pickedMesh._hexagonPickTile()
        activeTile = actual.name
        activeTile = actual._hexagonPickTile().name
        activeOrigin = actual._hexagon.hex
        scene.skipPointerMovePicking = false
        // scene.unfreezeActiveMeshes() // allows dynamic update of mesh materials

        // Add Active Tile Color
        let tile = actual // ._hexagonPickFace()
        tile.material = materials.active
        
        // flag to allow or disallow pathing to be computed based on ownership here
        let active = scene.getMeshByName(activeTile)
        console.log(active._hexagon)
        if (active._hexagon.unit) {
          if (active._hexagon.unit.isOwner(client.name)) {
            allowCalculation = active._hexagon.unit.movement

            // change the default colors of the rangeable tiles, to assist with programming
            let N   = allowCalculation
            let hex = active._hexagon.hex
            allowRange = []
            for (var q = -N; q < N + 1; q++) {
              for (var r = Math.max(-N, -q - N); r < Math.min(N, -q + N) + 1; r++) {
                var s = -q - r
                var h = hex.add(new Hex(q, r, s))
                let name = 'hexagon-Q' + h.q + '-R' + h.r + '-S' + h.s
                if (name != activeTile) {
                  allowRange.push(name)
                }
              }
            }
            paintRange(allowRange)
          } else {
            // maybe not
          }
        }
      }
    })

    // Create an ActionManager to assist with Path Calculation
    let am = new BABYLON.ActionManager(scene)
    am.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPointerOverTrigger, function(ev) {
      // Because of "skipPointerMovePicking", we do not need an "activeTile" check, otherwise we can implement on our own if required
      // if (!activeTile) { return }
      // console.log(ev.meshUnderPointer.name);

      // Because we passed in only hextiles, we should not need to verify that this mesh is a hextile
      let destination = ev.meshUnderPointer.name
      let tile = scene.getMeshByName(destination)

      // Allow path calculation only if we are the owner:
      if (allowCalculation) {
        // paintRange(allowRange)
        // Calculate the path
        let path = hexstar.search(hexmap, activeTile, destination)
        if (path) {
          // Trim the path to the length
          activePath = path.filter(step => step.g <= allowCalculation)
          // Highlight the path
          paintPath(activePath, allowRange)
        }

        // Highlight the terminus
        if (destination != activeTile && !tile._hexagon.isObstacle()) {
          let priorTerminus = materials.terminus.getBindedMeshes()
          priorTerminus.forEach(prior => {
            prior._hexagonResetMaterial()
          })
          let priorPathTerminus = materials.pathTerminus.getBindedMeshes()
          priorPathTerminus.forEach(prior => {
            if (allowRange.indexOf(prior.name) != -1) {
              if (materials[prior._hexagon.type]) {
                prior.material = materials[prior._hexagon.type]
              } else {
                prior.material = materials.range 
              }
            } else {
              prior._hexagonResetMaterial()
            }
          })
          if (path.length > activePath.length) {
            tile.material = materials.terminus
            scene.getMeshByName(activePath[activePath.length - 1].name).material = materials.pathTerminus
          } else {
            tile.material = materials.pathTerminus
          }
        }
      }
      
    }))
    // Attach this ActionManager to all the hextiles
    tiles.forEach(tile => {
      tile.actionManager = am
    })
  }

  let paintRange = function(range) {
    range.forEach(elem => {
      let tile = scene.getMeshByName(elem)
      if (!tile.obstacle && !tile._hexagon.type) {
        tile.material = materials.range
      }
    })
  }

  let paintPath = function(path, allowRange) {
    let previous = materials.path.getBindedMeshes()
    previous.forEach(prior => {
      if (allowRange.indexOf(prior.name) != -1) {
        if (materials[prior._hexagon.type]) {
          prior.material = materials[prior._hexagon.type]
        } else {
          prior.material = materials.range 
        }
      } else {
        prior._hexagonResetMaterial()
      }
    })
    path.forEach((node, index) => {
      let elem = scene.getMeshByName(node.name)
      elem.material = materials.path
    })
  }

  let receiveData = function() {
    // instruction
    // data
  }

  let move = function(unitData, steps) {
    let eventName = 'update-info'
    let notify = function(data) {
       body.dispatchEvent(new CustomEvent(eventName, {detail: data}))
    }

    let origin = steps[0].start
    let originName = 'hexagon-Q' + origin.q + '-R' + origin.r + '-S' + origin.s
    let tile = scene.getMeshByName(originName)
    
    let unit = scene.getMeshByName(unitData.name)

    let distance = 0;
    let step     = 0.03;
    let next;

    // play the walking animation
    unit._hexstarAnimateWalk()
    let last;
    let observer = scene.onBeforeRenderObservable.add(() => {
      if (distance === 0) {
        next = steps.shift()
        if (!next) {
          // movement is completed
          scene.onBeforeRenderObservable.remove(observer)
          // stop animation
          unit._hexstarAnimateReset()
          unit._hexstarRelatch(last)
        } else {
          unit._hexstarTurn(next.dir)
        }
      }
      if (next) {
        unit.movePOV(0, 0, /* adjust for base unit orientation */ unit._hexstarUnit.face ? -step : step)
        distance += step
        if (distance > next.move) {
          // unit._hexstarRelatch(next.end)
          last = next.end
          let prior = next.start
          scene.getMeshByName('hexagon-Q' + prior.q + '-R' + prior.r + '-S' + prior.s)._hexagon.unit = null
          distance = 0
        }
      }
    })
  }
  
  
  /* Helper functions */
  // Copies any object deeply: used in eventify()
  let clone = function(obj) {
      let copy
      if (null == obj || 'object' != typeof obj) { return obj }
      if (obj instanceof String) { return (' ' + obj).slice(1) }  /* https://stackoverflow.com/a/31733628 */
      if (obj instanceof Date) { return new Date().setTime(obj.getTime()) }
      if (obj instanceof Array) {
         copy = []
         for (let i = 0; i < obj.length; i++) { copy[i] = clone(obj[i]) }
         return copy
      }
      if (obj instanceof Object) {
         copy = {}
         for (let attr in obj) { if (obj.hasOwnProperty(attr)) { copy[attr] = clone(obj[attr]) } }
         return copy
      }
      throw new Error('Unable to copy obj! Type not supported.')
  }
  // Returns a distribution of unevenly distributed items if provided a field "pr"
  let _generateDistribution = function(obj) {
    let out = []
    let tpr = 0
    obj.forEach(item => {
      let n = 1000 / item.pr
      tpr += n
      out.push({item: item, pr: tpr})
    })
    out.sort((a,b) => a[1] - b[1])
    return {distribution: out, totalProbability: tpr}
  }
  // Picks from unevenly distributed items tagged with field "pr"
  let _pickDistribution = function(res) {
    let out = res.distribution
    let tpr = res.totalProbability
    let pos = Math.floor((Math.random() * tpr))
  
    for (var i = 0; i < out.length; i++) {
      let item = out[i]
      if (item.pr >= pos) {
        return item
      }
    } 
  }
  // Random
  let random = function(ceiling, min) {
     if (min && min > ceiling) { [ceiling, min] = [min, ceiling] }
     let c = ceiling || 1
     let m = min     || 0
     return (c - m) * Math.random() + m 
  }

  return {
    setup         : setup,
    defaultScene  : defaultScene,
    drawHexagonMap: drawHexagonMap,
    paintPath     : paintPath,
    /* Animation controls */
    move          : move,
    /* Client functions */
    setClientName : function(name) { client.name = name },
    getClient     : function() { return client },
  }
})()
