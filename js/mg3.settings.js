mg3 = typeof mg3 != 'undefined' ? mg3 : {}

mg3.settings = (function() {
  let clone = mg3.utilities.clone

  let settings = {
    developer: {
      active       : true,
      display_XYZ  : true,
      unplug_splash: true,
    },
    application: {
      // CSS
      css_rules_identifier: `mg-css-rules`,
      color_background    : `hsl(224deg,61%,13%)`,
      // General
      // IDs
      id_main       : `mgm-main`,
      id_submain    : `mgm-submain`,
      id_mmenu      : `mgm-mmenu`,
      id_mmenu_list : `mgm-mmenu-list`,
      id_mmenu_quit : `mgm-mmenu-quit`,
      id_mmenu_sets : `mgm-mmenu-settings`,
      // Classes
      cl_mmenu_elem : `mgm-mmenu_elem`,
    },
    mmenu: {
      background  : `assets/splash_002.png`,
      height      : `70%`,
      width       : `23ch`,
      offset      : `3ch`,
      fsize       : `17pt`,
      // elements
      margin      : `0.4ch`,
      padding     : `1.3ch`,
      backing     : `rgba( 255, 255, 255, 0.03 )`,
      backingHover: `rgba( 255, 255, 255, 0.08 )`,
      // modal
      modal_fsize : `33pt`,
      modal_quit_width       : `13ch`,
      modal_quit_height      : `5.5ch`,
      modal_settings_width   : `23ch`,
      modal_settings_height  : `25.5ch`,
      modal_background       : `rgba( 255, 255, 255, 0.03 )`,
      modal_filter           : `blur(13px)`,
      modal_target_background: `rgba( 255, 255, 255, 0.08 )`,
      modal_target_filter    : `blur( 6px)`,
      modal_border_radius    : `9px`,
      modal_xclose_padding   : `0.8ch`,
      modal_hover_color      : `rgba( 184, 184, 203, 0.83 )`,
      // settings
      settings_header_color      : `rgba( 181, 184, 203, 0.78 )`,
      settings_header_line_height: `3.4ch`,
    },
    game: {
      // Settings
      fps           : 60,
      size_unit     : 24,
      speed_limiter : 20.4,
      speed_refactor: 55,
    },
    canvas: {
      // IDs
      id_canvas   : `mgm-canvas`,
      // Camera: target
      target : new BABYLON.Vector3( 0, 1, 0 ),
      alpha  : 5.61*Math.PI/4,
      beta   : 1.11*Math.PI/4,
      radius : 3*5,
      startPosition       : new BABYLON.Vector3( -2.2, 10.1, -5.7 ),
      // Camera: parameters
      wheelPrecision      : 11,
      rangeLowerProximity : 5,
      rangeHigherProximity: 135,
      upperBetaLimit: Math.PI / 2.2,
      lowerBetaLimit: Math.PI / (Math.PI * 1.7),
      panningAxis   : new BABYLON.Vector3(1.1,0,-1.6),
      sensibilityX  : 2000,
      sensibilityY  : 2000,
      // Follow Camera
      id_eye      : `follow-camera`,
      // Light
      hemisphericBrightness: 15,
    },
    hud: {
      // IDs
      id_main     : `mgh-main`,
      id_fps      : `mgh-fps`,
      id_xyz      : `mgh-xyz`,
      id_x        : `mgh-x`,
      id_y        : `mgh-y`,
      id_z        : `mgh-z`,
    },
    input: {
      id_js_dir   : `mgi-js-dir`,
      id_js_aim   : `mgi-js-aim`,
      // Joysticks
      js_maximum  : 100,
      // styling
      js_size         : `50vmin`,
      js_size_max     : `180px`,
      js_offset_bottom: `15px`,
      js_offset_left  : `13px`,
      js_offset_right : `24px`,
      // constructor options
      js_dir_options  : {
        internalFillColor  : `rgba( 231, 231, 231, 0.87 )`,
        internalLineWidth  : 7,
        internalStrokeColor: `rgba(  14,  14,  14, 0.27 )`,
        externalLineWidth  : 18,
        externalStrokeColor: `rgba(  83,  83,  83, 0.03 )`,
      },
      js_aim_options  : {
        internalFillColor  : `rgba( 231, 231, 231, 0.87 )`,
        internalLineWidth  : 7,
        internalStrokeColor: `rgba(  14,  14,  14, 0.27 )`,
        externalLineWidth  : 18,
        externalStrokeColor: `rgba(  83,  83,  83, 0.03 )`,
        autoReturnToCenter : false,
      },
    },
  }
  
  let retrieve = function(k) {
    if (typeof settings[k] != 'undefined') {
      return settings[k]
    }
    for (const [subsetting, entries] of Object.entries(settings)) {
      if (typeof entries[k] != 'undefined') {
        return entries[k]
      }
    }
    return settings
  }

  return {
    get: retrieve,
    set: function(k,v) { settings[k] = v; return clone(settings) },
  }
})()