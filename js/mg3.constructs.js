mg3 = typeof mg3 != 'undefined' ? mg3 : {}

mg3.constructs = (function() {
  /* Meta variables */
  let uuid     = mg3.utilities.uuid
  
  /* Module Settings & Events */
  let settings = mg3.settings.get()
  
  /* Memory */
  
  /* Computational variables */


  /* Meta Constructs */
  class Level {
    constructor(options) {
      this.enemies = options?.enemies ? options?.enemies : []
    }
  }
  
  /* WebGL Constructs */
  class Unit {
    constructor(options) {
      this.key   = options.key
      this.uri   = options.uri
      this.scale = options?.scale ? options?.scale : 1.0
      this.animationKeys = options?.animationKeys
    }
  }

  /* Classes */
  class Artefact {
    constructor(k, options) {
      // Key, X, Y, Type, Seed
      this.id = uuid()
      this.k = k
      let args = {
        x: 0,
        y: 0,
        t: 'undefined',
        s: Math.random(),
        r: 0,
        a: {
          key  : '',
        },
      }
      Object.entries(args).forEach(([k,v],i) => {
        if (options && options[k]) {
          this[k] = options[k]
        } else {
          this[k] = v
        }
      })
    }
    /* Animation Controllers */
  }

  class Collidable extends Artefact {
    constructor(key, options) {
      super(key, options)

      const w = options ? (options?.w ? options?.w : settings.game.size_unit) : settings.game.size_unit
      
      const bounds = [
        [-1 * w/2, -1 * w/2],
        [ 1 * w/2, -1 * w/2],
        [ 1 * w/2,  1 * w/2],
        [-1 * w/2,  1 * w/2],
      ]
      // this.collisionObject = options.collider.createPolygon(this.x, this.y, bounds)
    }
  }

  class Movable extends Collidable {
    constructor(key, options) {
      super(key, options)
      this.deltaX = 0
      this.deltaY = 0
      this.deltaRotation = 0
    }
  }

  class Tile extends Collidable {
    constructor(mx, my, size_sector, options) {
      const key = `sector_MX${mx}_MY${my}`
      super(key, options)

      const ss = size_sector 

      const mpx = mx * ss * 2
      const mpy = my * ss * 2    

      this.name = key
      this.mx   = mx
      this.my   = my
      this.t = 'tile'
      this.x = mpx
      this.y = mpy
      this.w = mpx - ss
      this.e = mpx + ss - 1
      this.n = mpy + ss - 1
      this.s = mpy - ss
      this.rangeVertical   = [mpy - ss, mpy + ss - 1]
      this.rangeHorizontal = [mpx - ss, mpx + ss - 1]
      this.items           = {}

      this.neighbours      = this.getNeighbours()
    }

    getNeighbours() {
      var n      = []
      var up     = this.my + 1
      var down   = this.my - 1 
      var left   = this.mx - 1
      var right  = this.mx + 1
      // Fill ABOVE, RIGHT, BELOW, LEFT
      for (var i = down; i < up+1; i++) {
        for (var j = left; j < right+1; j++) {
           n.push(`sector_MX${j}_MY${i}`)
        }
      }
      n.splice(n.indexOf(this.key), 1)
      return n
    }
  }

  class Actor extends Movable {
    constructor(key, options) {
      super(key, options)
      let args = {
        v: {
          m: 0,
          r: 0,
          x: 0,
          y: 0,
        }
      }
      Object.entries(args).forEach(([k,v],i) => {
        if (options && options[k]) {
          this[k] = options[k]
        } else {
          this[k] = v
        }
      })
    }
  }
  
  class Player extends Actor {
    constructor(key, options) {
      super(key, options)
    }
  }

  return {
    /* Metadata constructs */
    Level : Level,
    /* WebGL constructs */
    Unit  : Unit,
    /* Engine constructs */
    player: Player,
    actor : Actor,
    tile  : Tile,
  }
})()