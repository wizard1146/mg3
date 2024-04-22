mg3 = typeof mg3 != 'undefined' ? mg3 : {}

mg3.css = (function() {
  /* Meta variables */
  let addCSS = mg3.utilities.addCSS
  let qset   = function( selector ) { let b = document.querySelectorAll( selector ); return b?.length > 1 ? b : document.querySelector( selector ) }
  
  /* Module Settings & Events */
  let settings = {
    // globals
    ruleIdentifier: 'mg-css-rules',
    
    // ui
    colors: {
      appBackground: `hsl(224deg,61%,13%)`,
    },
    joysticks: {
      size         : `50vmin`,
      size_max     : `180px`,
      offset_bottom: `15px`,
      offset_left  : `13px`,
      offset_right : `24px`,
    },
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
    mainmenu: {
      background: `assets/splash_002.png`,
      height    : `70%`,
      width     : `23ch`,
      offset    : `3ch`,
      fsize     : `17pt`,
      // elements
      margin    : `0.4ch`,
      padding   : `1.3ch`,
      backing   : `rgba( 255, 255, 255, 0.03 )`,
      backingHover: `rgba( 255, 255, 255, 0.08 )`
    }
  }
  let events = {
    incoming: {
      initialise  : 'mgc-initialise',
      selfDestruct: 'mgc-self-destruct',
    },
    internal: {
    
    },
    outgoing: {
    
    },
  }
  
  /* Memory */
  
  /* Computational variables */

  
  let refresh = function() {
    let r = settings.ruleIdentifier
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
      --app-background-color: ${settings.colors.appBackground};
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
    #${settings.id.canvas_id_fps} {
      right: calc(1.1vmin + 8ch + 0.5vmin + 1.3ch);
      top  : 13px;
    }
    #mg-main, #mg-submain {
      position: absolute;
      left    : 0%;
      top     : 0%;
      height  : 100%;
      width   : 100%;
    }

    /* Main Menu */
    #${settings.id.mainmenu} {
      background-image: url(${settings.mainmenu.background});
      background-size : cover;
    }
    #${settings.id.mainmenu_list} {
      width           : calc(${settings.mainmenu.width} - ${settings.mainmenu.offset});
      height          : ${settings.mainmenu.height};
      padding-right   : ${settings.mainmenu.offset};
      padding-left    : ${settings.mainmenu.offset};
      justify-content : center;
      flex-direction  : column;
      font-size       : ${settings.mainmenu.fsize};
    }
    .${settings.id.mainmenu_list_class} {
      padding         : ${settings.mainmenu.padding};
      margin          : ${settings.mainmenu.margin};
      background      : ${settings.mainmenu.backing};
      border-radius   : 9px;
      position        : relative;
      overflow  : hidden;
      transition: all 230ms;
    }
    .${settings.id.mainmenu_list_class} .value {
      position: relative;
    }
    .${settings.id.mainmenu_list_class} .backdrop {
      position : absolute;
      overflow : hidden;
      width    : 100%;
      height   : 100%;
      left     : 0%;
      top      : 0%;
      backdrop-filter: blur(6px);
    }
    .${settings.id.mainmenu_list_class}:hover {
      background      : ${settings.mainmenu.backingHover};
    }
    .${settings.id.mainmenu_list_class}:hover .value {
      color   : rgba( 231, 184, 203, 0.78 );
    }
    .${settings.id.mainmenu_list_class}:hover .backdrop {
      backdrop-filter: blur(11px);
    }
    
    /* Canvas */
    #mg-canvas {

    }
    #${settings.id.canvas_id_xy} {
      padding-left  : 1.1vmin;
      padding-bottom: 0.8vmin;
      padding-top   : 0.5vmin;
      padding-right : 0.5vmin;
      border-bottom-left-radius: 6px;
      min-width : 8ch;
      color     : rgba( 231, 231, 231, 0.33 );
      background: rgba( 255, 255, 255, 0.03 );
    }
    
    #${settings.id.canvas_id_xy} div {
      display       : flex;
      flex-direction: row;
    }
    #${settings.id.canvas_id_xy} div div {
      white-space   : pre-wrap;
    }
    #${settings.id.canvas_id_xy}-X-value,
    #${settings.id.canvas_id_xy}-Y-value,
    #${settings.id.canvas_id_xy}-Z-value {
      right    : calc(0% + 1.5ch);
    }
    
    /* Joysticks */
    #${settings.id.joystick_dir},
    #${settings.id.joystick_point} {
      width    : ${settings.joysticks.size};
      height   : ${settings.joysticks.size};
      max-width : ${settings.joysticks.size_max};
      max-height: ${settings.joysticks.size_max};
    }
    #${settings.id.joystick_dir},
    #${settings.id.joystick_point} {
      bottom   : ${settings.joysticks.offset_bottom};
    }
    #${settings.id.joystick_dir} {
      left     : ${settings.joysticks.offset_left};
    }
    #${settings.id.joystick_point} {
      right    : ${settings.joysticks.offset_right};
    }
    
    /* HUD */
    #${settings.id.hud_main} {
    
    }
    #${settings.id.hud_x} {
      width : ${settings.hud.coordXY_width};
    }
    #${settings.id.hud_y} {
      width : ${settings.hud.coordXY_width};
    }
    #${settings.id.hud_x},
    #${settings.id.hud_y} {
      opacity: ${settings.hud.coordXY_opacity};
    }
    #${settings.id.hud_sector} {
      margin : ${settings.hud.sector_margin};
      width  : ${settings.hud.sector_size};
      height : ${settings.hud.sector_size};
      border : 1px dashed rgba( 141, 141, 169, 0.33 );
      opacity: ${settings.hud.sector_opacity};
    }
    #${settings.id.hud_sector} .value {
      line-height: calc(${settings.hud.sector_size} * 0.97);
    }
    `,
  ]
  
  // Initialisation listener
  qset('body').addEventListener( events.incoming.initialise, refresh )

  return {
    init    : refresh,
    refresh : refresh,
    settings: function() { return settings },
  }
})()