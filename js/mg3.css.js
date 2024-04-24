mg3 = typeof mg3 != 'undefined' ? mg3 : {}

mg3.css = (function() {
  /* Meta variables */
  let addCSS  = mg3.utilities.addCSS
  let events  = mg3.comptroller.events()
  let settings = mg3.settings.get()
  let qset    = function( selector ) { let b = document.querySelectorAll( selector ); return b?.length > 1 ? b : document.querySelector( selector ) }
  
  let event_initialise = events.preloader.initial
  
  /* Module Settings & Events */
  let settingr = {
    hud      : {
      width          : `40%`,
      height         : `13vmin`,
      coordXY_width  : `calc(7ch + 4ch)`,
      coordXY_opacity: `0.55`,
      sector_size    : `11ch`,
      sector_margin  : `1.4ch`,
      sector_opacity : `0.4`,
    },
    // ux
    
    // IDs
    id: {
      canvas_id_xy     : 'mgx-xy',
      canvas_id_fps    : 'mgx-fps',
      mainmenu         : 'mgu-mainmenu',
      mainmenu_list    : 'mgu-mainmenu-list',
      mainmenu_list_class: 'mgu-listElement',
      joystick_dir     : 'mg-joystick-dir',
      joystick_point   : 'mg-joystick-aim',
      hud_main         : 'mg-hud-main',
      hud_x            : 'mg-hud-x',
      hud_y            : 'mg-hud-y',
      hud_sector       : 'mg-hud-sector',
      hud_coords_class : 'mg-hud-class-coords',
    },
  }
  
  /* Memory */
  let s_app    = settings.application
  let s_mmenu  = settings.mmenu
  let s_game   = settings.game
  let s_canvas = settings.canvas
  let s_hud    = settings.hud
  let s_input  = settings.input
  
  /* Computational variables */

  
  let refresh = function() {
    let r = settings.application.css_rules_identifier
    // Remove previous CSS rules
    document.querySelectorAll( r ).forEach(e => e.remove())
    // Implement current CSS rules
    cssRules.forEach(rule => {
      addCSS( rule, r )
    })
  }
  
  let cssRules = [
    `
    /* Fonts */
    @import url('https://fonts.googleapis.com/css2?family=M+PLUS+1+Code:wght@100..700&display=swap');
    @import url('https://fonts.googleapis.com/css2?family=Syne+Mono&display=swap');
    .mplus {
      font-family: "M PLUS 1 Code", monospace;
    }
    .syne-mono {
      font-family: "Syne Mono", monospace;
    }
    `,
    `
    :root {
      --app-background-color: ${settings.application.color_background};
    }
    body {
      background: var(--app-background-color);
    }
    `,
    `
    /* Shorthand classes */
    .dev {
      border: 1px solid rgba( 255, 1, 1, 1 );
    }
    .absolute {
      position : absolute;
    }
    .fullscreen {
      width    : 100%;
      height   : 100%;
    }
    .center {
      position : absolute;
      left     : 50%;
      top      : 50%;
      transform: translate( -50%, -50% );
    }
    .top-left  {
      left     : 0%;
      top      : 0%;
    }
    .top-right {
      right    : 0%;
      top      : 0%;
    }
    .right {
      right    : 0%;
    }
    .left {
      left     : 0%;
    }
    .bottom-right {
      right    : 0%;
      bottom   : 0%;
    }
    .bottom-middle {
      left     : 50%;
      bottom   : 0%;
      transform: translate( -50%, 0% );
    }
    .bottom-left {
      left     : 0%;
      bottom   : 0%;
    }
    .flexbox {
      display  : flex;
    }
    .flex-column {
      flex-direction: column;
    }
    .text-center {
      text-align: center;
    }
    .text-right {
      text-align: right;
    }
    .no-select {
      user-select: none;
    }
    .cursor {
      cursor: pointer;
    }
    .no-pointer {
      pointer-events: none;
    }
    .circle {
      border-radius: 50%;
    }
    .hidden {
      display: none;
    }
    .full-modal {
      position : absolute;
      left     : 50%;
      top      : 50%;
      transform: translate( -50%, -50% );
      width    : 100%;
      height   : 100%;
    }
    `,
    `
    /* Colors & Effects */
    .translucent-white {
      background: rgba( 255, 255, 255, 0.04 );
    }
    .text-grey {
      color   : rgba( 141, 141, 189, 0.65 );
    }
    .text-bright {
      color   : rgba( 184, 184, 203, 0.78 );
    }
    .text-accent {
      text-shadow:
        1px -1px 0 rgba( 44, 44, 44, 0.83 ),
        1px  1px 0 rgba( 14, 14, 14, 0.93 );  
    }
    .backdrop-blur {
      backdrop-filter: blur(6px);
    }
    `,
    ` 
    /* Core Elements */
    #${s_hud.id_fps} {
      right: calc(1.1vmin + 8ch + 0.5vmin + 2.3ch);
      top  : 13px;
    }
    #${s_app.id_main}, #${s_app.id_submain} {
    }

    /* Main Menu */
    #${s_app.id_mmenu} {
      background-image: url(${s_mmenu.background});
      background-size : cover;
    }
    #${s_app.id_mmenu_list} {
      width           : calc(${s_mmenu.width} - ${s_mmenu.offset});
      height          : ${s_mmenu.height};
      padding-right   : ${s_mmenu.offset};
      padding-left    : ${s_mmenu.offset};
      justify-content : center;
      flex-direction  : column;
      font-size       : ${settings.mmenu.fsize};
    }
    .${s_app.cl_mmenu_elem} {
      padding         : ${s_mmenu.padding};
      margin          : ${s_mmenu.margin};
      background      : ${s_mmenu.backing};
      border-radius   : 9px;
      position        : relative;
      overflow  : hidden;
      transition: all 230ms;
    }
    .${s_app.cl_mmenu_elem} .value {
      position: relative;
    }
    .${s_app.cl_mmenu_elem} .backdrop {
      position : absolute;
      overflow : hidden;
      width    : 100%;
      height   : 100%;
      left     : 0%;
      top      : 0%;
      backdrop-filter: blur(6px);
    }
    .${s_app.cl_mmenu_elem}:hover {
      background      : ${s_mmenu.backingHover};
    }
    .${s_app.cl_mmenu_elem}:hover .value {
      color   : rgba( 231, 184, 203, 0.78 );
    }
    .${s_app.cl_mmenu_elem}:hover .backdrop {
      backdrop-filter: blur(11px);
    }
    
    /* Main Menu Modals */
    #${s_app.id_mmenu_sets},
    #${s_app.id_mmenu_quit} {
      font-size      : ${s_mmenu.modal_fsize};
      backdrop-filter: ${s_mmenu.modal_filter};
    }
    #${s_app.id_mmenu_sets} .backing,
    #${s_app.id_mmenu_sets} .value {
      width          : ${s_mmenu.modal_settings_width};
      height         : ${s_mmenu.modal_settings_height};
    }
    #${s_app.id_mmenu_quit} .backing,
    #${s_app.id_mmenu_quit} .value {
      width       : ${s_mmenu.modal_quit_width};
      height      : ${s_mmenu.modal_quit_height};
    }
    #${s_app.id_mmenu_sets} .backing,
    #${s_app.id_mmenu_quit} .backing {
      background     : ${settings.mmenu.modal_target_background};
      backdrop-filter: ${s_mmenu.modal_target_filter};
      border-radius  : ${s_mmenu.modal_border_radius};
    }
    #${s_app.id_mmenu_quit} .value {
      line-height : ${s_mmenu.modal_quit_height};
    }
    #${s_app.id_mmenu_sets} .x-close,
    #${s_app.id_mmenu_quit} .x-close {
      padding        : ${s_mmenu.modal_xclose_padding};
      line-height    : 1ch;
      background     : ${settings.mmenu.modal_target_background};
      backdrop-filter: ${s_mmenu.modal_target_filter};
      border-bottom-left-radius: ${s_mmenu.modal_border_radius};
    }
    #${s_app.id_mmenu_sets} .x-close:hover,
    #${s_app.id_mmenu_quit} .value:hover,
    #${s_app.id_mmenu_quit} .x-close:hover {
      color          : ${s_mmenu.modal_hover_color};
    }
    #${s_app.id_mmenu_sets} .header {
      color          : ${s_mmenu.settings_header_color};
      line-height    : ${s_mmenu.settings_header_line_height};
    }
    
    /* Canvas */
    #${s_canvas.id_canvas} {
      outline: none;
    }
    #${s_hud.id_xyz} {
      padding-left  : 1.1vmin;
      padding-bottom: 0.8vmin;
      padding-top   : 0.5vmin;
      padding-right : 0.5vmin;
      border-bottom-left-radius: 6px;
      min-width : 8ch;
      color     : rgba( 231, 231, 231, 0.33 );
      background: rgba( 255, 255, 255, 0.03 );
    }
    
    #${s_hud.id_xyz} div {
      display       : flex;
      flex-direction: row;
    }
    #${s_hud.id_xyz} div div {
      white-space   : pre-wrap;
    }
    #${s_hud.id_xyz}-X .value,
    #${s_hud.id_xyz}-Y .value,
    #${s_hud.id_xyz}-Z .value {
      right    : calc(0% + 1.5ch);
    }
    
    /* Joysticks */
    #${s_input.id_js_dir},
    #${s_input.id_js_aim} {
      width    : ${settings.input.js_size};
      height   : ${settings.input.js_size};
      max-width : ${settings.input.js_size_max};
      max-height: ${settings.input.js_size_max};
    }
    #${s_input.id_js_dir},
    #${s_input.id_js_aim} {
      bottom   : ${settings.input.js_offset_bottom};
    }
    #${s_input.id_js_dir} {
      left     : ${settings.input.js_offset_left};
    }
    #${s_input.id_js_aim} {
      right    : ${settings.input.js_offset_right};
    }
    
    /* HUD */
    #${s_hud.id_main} {
    
    }
    #${s_hud.id_x} {
    
    }
    #${s_hud.id_y} {
    
    }
    #${s_hud.id_x},
    #${s_hud.id_y} {
    
    }
    `,
  ]
  
  // Initialisation listener
  qset('body').addEventListener( event_initialise, refresh )

  return {
    init    : refresh,
    refresh : refresh,
    settings: function() { return settings },
  }
})()