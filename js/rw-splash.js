/*
   How to use:

    let rws = runeworks.splash.start({
      fadeOutDelay: 2400,
    })
    rws.next()
    // Your intermediate code here

    rws.next()
    // Continue here
 */

runeworks = typeof runeworks != 'undefined' ? runeworks : {}

runeworks.splash = (function() {
  /* Variables */
  // Meta Variables
  let splashContainer   = 'runeworks-splash-container'
  let CSSIdentifier     = 'runeworks-splash-CSS'
  let caretColor        = 'rgba( 71, 52, 199, 1.00)'
  let titleText         = 'Yellow Hat'
  let splash64          = 'assets/splash_007.png'

  let settings = {
    image: {
      source: `assets/splash_008.png`,
      width : 830, // 1376,
      height: 830, // 864,
      aspect: 1, // 1376/864,
      ratio : 0.66,
    },
  }

  let splashDelay       = 4600
  let fadeOutDelay      = 1450
  let displayCaret      = false
  let typeSpeed         = 56
  let typeVariance      = 14
  // In-memory variables
  // Computational variables

  let sleep = function(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  let start = async function* (options) {
    splashDelay  = !options ? splashDelay  : options?.splashDelay  ? options?.splashDelay  : splashDelay 
    fadeOutDelay = !options ? fadeOutDelay : options?.fadeOutDelay ? options?.fadeOutDelay : fadeOutDelay
  
    // Remove existing elements
    document.querySelector('#' + splashContainer)?.remove()
    document.querySelector('.' + CSSIdentifier)?.remove()
    // Add CSS
    addCSS(cssRules())
    // Add Markup   
    document.querySelector('body').insertAdjacentHTML('beforeend', markup)

    let dimension = window.innerHeight * settings.image.ratio
    let height    = dimension
    let width     = height * settings.image.aspect
    let canvas    = document.querySelector('#runeworks-splash-canvas')
    let context   = canvas.getContext('2d')
    // Set Splash Image size
    canvas.setAttribute('style',`height: ${height}px; width: ${width}px;`)

    let x = 0, y = 0, w = canvas.width, h = canvas.height;
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Set Splash Image source
    let img = new Image()
    img.onload = function() {
      context.drawImage(img, x, y, w, h)

      /*
      // Create Radial
      const grd = context.createRadialGradient(w/2, h/2, 15, w/2, h/2, w);
      grd.addColorStop(0.00, `rgba( 14, 14, 14, 0.0 )`);
      grd.addColorStop(0.44, `rgba(  7,  7,  7, 0.7 )`);
      grd.addColorStop(0.51, `rgba(  0,  0,  0, 1.0 )`);

      // Draw a filled Rectangle
      context.fillStyle = grd;
      context.fillRect(x, y, w, h);
      */
    }
    img.src = settings.image.source

    // Animate the Title Text
    await typeWriter( document.querySelector('#runeworks-splash-title'), titleText, 0, null)

    // Suspend operations
    yield;

    // Fade out the text
    let caret = document.querySelector('span.runeworks-caret')
    if (caret) { caret.setAttribute('style','opacity: 0;') }
    document.querySelector('#runeworks-splash-container').classList.add('runeworks-splash-fadeOut')

    await sleep(fadeOutDelay)

    document.querySelector('#' + splashContainer)?.remove()
    document.querySelector('.' + CSSIdentifier)?.remove()
    
    return true
  }
  
  /* https://codepen.io/Danielgroen/pen/VeRPOq */
  let typeWriter = async function(target, text, i, fnCallback) {
    if (i < text.length) {
      target.innerHTML = text.substring(0, i + 1) + (displayCaret ? '<span aria-hidden="true" class="runeworks-caret"></span>' : '')
      
      await sleep(Math.random() * typeVariance + typeSpeed)
      return typeWriter(target, text, i + 1, fnCallback)
    } else {
      await sleep(splashDelay)
      return fnCallback
    }
  }

  /* CSS */
  let addCSS = function(rule, container, ruleIdentifier) {
    let rc = ruleIdentifier ? ruleIdentifier : CSSIdentifier
    let output = '<div class="' + rc + '" style="display:none;">&shy;<style>' + rule + '</style></div>'
    document.querySelectorAll(rc).forEach(e => e.remove())
    if (container) {
    console.log(container)
      document.querySelector(container).insertAdjacentHTML('beforeend', output)
    } else {
      document.body.insertAdjacentHTML('beforeend', output)
    }
  }
  
  /* Statics */
  let markup = `
  <div id="runeworks-splash-container" class="center">
    <div id="runeworks-splash-background" class="center"></div>
    <canvas id="runeworks-splash-canvas" class="center" width="1024" height="1024"></canvas>
    <div id="runeworks-splash-title" class="center"></div>
  </div>
  `
  let cssRules = function() { 
    return `
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300&display=swap');
    .center {
      position : absolute;
      left     : 50%;
      top      : 50%;
      transform: translate( -50%, -50% );
    }
    #${splashContainer} {
      width     : 100%;
      height    : 100%;
      z-index   : 50;
      box-shadow: 0 0 200px rgba(0,0,0,0.9) inset;
    }
    #runeworks-splash-background {
      width     : 100%;
      height    : 100%;
      background  : rgba( 1, 1, 1, 1 );
    }
    #runeworks-splash-title {
      font-family : 'Poppins';
      font-size   : 55pt;
      color       : rgba( 231, 231, 231, 1.00 );
      white-space : nowrap;
      width       : 100%;
      text-align  : center;
      background     : inherit;
      mix-blend-mode : difference;
      background-clip: text;
      filter         :  grayscale(1) contrast(9);
    }
    .runeworks-splash-fadeOut {
      animation   : runeworks-splash-fading ${fadeOutDelay}ms ease;
      animation-fill-mode: forwards;
    }
    @keyframes runeworks-splash-fading {
       0% { opacity: 1; }
     100% { opacity: 0; }
    }

    span.runeworks-caret {
      border-right: .05em solid;
      animation   : runeworks-caret 1000ms steps(1) infinite;
    }
    @keyframes runeworks-caret {
      50% { border-color: transparent; }
    }
    
    #runeworks-splash-canvas {
      filter: opacity(0.55);
    }
    `
  }

  return {
    start: start,
  }
})()