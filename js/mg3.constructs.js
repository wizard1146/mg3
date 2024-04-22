mg3 = typeof mg3 != 'undefined' ? mg3 : {}

mg3.constructs = (function() {

  class Level {
    constructor(options) {
      this.enemies = options?.enemies ? options?.enemies : []
    }
  }
  
  class Unit {
    constructor(options) {
      this.key   = options.key
      this.uri   = options.uri
      this.scale = options?.scale ? options?.scale : 1.0
      this.animationKeys = options?.animationKeys
    }
  }
  
  return {
    Level: Level,
    Unit : Unit,
  }
})()