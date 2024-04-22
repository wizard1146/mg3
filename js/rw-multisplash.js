/*
   Art credited to @DaiDai

   How to use:

   let rml = runeworks.multisplash.start(['smolprotecc','wazir'])
   rml.next()

   // Run this until all your users are 100 OR
   runeworks.multisplash.update({
     user: 'smolprotecc', progress: 40
   })

   // Take the return from runeworks.multisplash.update(data) and 
   //    continue only when it returns false, i.e.

   let complete = runeworks.multisplash.update({user: 'smolprotecc', progress: 40})
   if (!complete) {
     rml.next()

     // Do your things
   }

 */

runeworks = typeof runeworks != 'undefined' ? runeworks : {}

runeworks.multisplash = (function() {
  /* Variables */
  // Meta Variables
  let multisplashContainer = 'runeworks-multisplash-container'
  let multisplashLoaders   = 'runeworks-multisplash-loaders'
  let CSSIdentifier        = 'runeworks-multisplash-CSS'
  let splashGIF            = './assets/daidai-pony.gif'
  let caretColor           = 'rgba( 71, 52, 199, 1.00)'
  let titleText            = 'loading'
  let splash64             = runeworks.splash64

  let multisplashWidth  = 60 // %
  let labelFactor       = 0.09
  let textFactor        = 0.08
  let ponyImageFactor   = 0.11

  let splashImageFactor = 0.5
  let splashDelay       =  600
  let fadeOutDelay      = 1750
  let dotColor          = 'rgba( 144, 144, 144, 1.00 )'
  // In-memory variables
  let ponyWidth, trackLength;
  // Computational variables

  let sleep = function(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  let start = async function* (loaders, options) {
    parallels = []
    loaders.forEach(loader => {
      parallels.push({user: loader, progress: 0})
    })

    splashDelay  = !options ? splashDelay  : options?.splashDelay  ? options?.splashDelay  : splashDelay 
    fadeOutDelay = !options ? fadeOutDelay : options?.fadeOutDelay ? options?.fadeOutDelay : fadeOutDelay
  
    // Remove existing elements
    document.querySelector('#' + multisplashContainer)?.remove()
    document.querySelector('.' + CSSIdentifier)?.remove()
    // Add CSS
    addCSS(cssRules())
    // Add Markup   
    document.querySelector('body').insertAdjacentHTML('beforeend', markup)

    // Calculate the track length
    trackLength = window.innerWidth * (multisplashWidth - 100*labelFactor - 100*textFactor)/100

    // Figure out the Pony's width
    ponyWidth = window.innerWidth * ponyImageFactor

    let dimension = window.innerHeight * splashImageFactor
    let canvas    = document.querySelector('#runeworks-multisplash-canvas')
    let context   = canvas.getContext('2d')
    // Set Splash Image size
    canvas.setAttribute('style',`height: ${dimension}px; width: ${dimension}px;`)

    let x = 0, y = 0, w = canvas.width, h = canvas.height;
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Set Splash Image source
    let img = new Image()
    img.onload = function() {
      context.drawImage(img, x, y, w, h)
    }
    img.src = splash64

    // Animate the Title Text
    // await typeWriter( document.querySelector('#runeworks-multisplash-title'), titleText, 0, null)

    let dots = document.querySelector('div.dot-flashing')
    if (dots) { dots.classList.remove('runeworks-invisible') }

    // Suspend operations
    yield;

    document.querySelector('#runeworks-multisplash-container').classList.add('runeworks-multisplash-fadeOut')

    await sleep(fadeOutDelay)

    document.querySelector('#' + multisplashContainer)?.remove()
    document.querySelector('.' + CSSIdentifier)?.remove()
    
    return true
  }

  let update = function(obj) {
    parallels.forEach(loader => {
      if (obj[loader.user]) {
        loader.progress = obj[loader.user]
      }
    })
    displayUpdate()
    if (parallels.filter(loader => loader.progress < 100).length > 0) {
      return true
    } else {
      return false
    }
  }

  let displayUpdate = function() {
    // for every loader 
    // if they do not exist, create them
    // other wise, update the position 

    let container = document.querySelector('#' + multisplashLoaders)
    if (!container) {
      document.querySelector('#' + multisplashContainer).insertAdjacentHTML('beforeend',
       `<div id="${multisplashLoaders}" class="center"></div>`
      )
    }

    parallels.forEach(loader => {
      let ele = document.querySelector('#runeworks-loader-' + loader.user)

      if (!ele) {
        document.querySelector('#' + multisplashLoaders).insertAdjacentHTML('beforeend', 
        `<div id="runeworks-loader-${loader.user}" class="runeworks-loader-element">
          <div class="runeworks-loader-label">${loader.user}</div>
          <div class="runeworks-loader-progress">
            <div class="runeworks-loader-progress-line"></div>
            <div class="runeworks-loader-progress-pony"><img src="${splashGIF}" width="${ponyWidth}px"></img></div>
          </div>
          <div class="runeworks-loader-text">${loader.progress}%</div>
         </div>
        `)
      } else {
        document.querySelector('#runeworks-loader-' + loader.user + ' .runeworks-loader-text').innerHTML = loader.progress + '%'
        // update pony position
        let x = trackLength * loader.progress/100 + window.innerWidth * labelFactor
        document.querySelector('#runeworks-loader-' + loader.user + ' .runeworks-loader-progress-pony').setAttribute('style',
        `left: ${x}px;
        `)
      }
    })

  }
  
  let simulate = function() {
    let r = start([
      'legatus','smolprotecc','morti','wazir','jitcy'
    ])
    r.next()

    let timer = setInterval(function() {
      let input = {}
      parallels.forEach(loader => {
        let n  = Math.floor(random(0, 8))
            n += loader.progress
            n  = Math.min(100, n)
        input[loader.user] = n
      })
      let m = update(input)
      if (!m) {
        clearInterval(timer)
        r.next()
      }
    }, random(400, 970))
  }

  /* Random */
  let random = function(ceiling, min) {
     if (min && min > ceiling) { [ceiling, min] = [min, ceiling] }
     let c = ceiling || 1
     let m = min     || 0
     return (c - m) * Math.random() + m 
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
  <div id="runeworks-multisplash-container" class="center">
    <div id="runeworks-multisplash-background" class="center"></div>
    <canvas id="runeworks-multisplash-canvas" class="center" width="1024" height="1024"></canvas>
    <div id="runeworks-multisplash-title">
      ${titleText}<div aria-hidden="true" class="dot-flashing runeworks-invisible"></div>
    </div>
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
    #${multisplashContainer} {
      width     : 100%;
      height    : 100%;
      z-index   : 50;
    }
    #runeworks-multisplash-background {
      width     : 100%;
      height    : 100%;
      background  : rgba( 1, 1, 1, 1 );
    }
    #runeworks-multisplash-title {
      font-family : 'Poppins';
      font-size   : 50pt;
      color       : rgba( 231, 231, 231, 1.00 );
      white-space : nowrap;
      width       : 100%;
      text-align  : center;
      background     : inherit;
      mix-blend-mode : difference;
      background-clip: text;
      filter         :  grayscale(1) contrast(9);

      position    : absolute;
      left        : 50%;
      bottom      : 6%;
      transform   : translate( -50%, -50% );
    }
    .runeworks-multisplash-fadeOut {
      animation   : runeworks-multisplash-fading ${fadeOutDelay}ms ease-in;
      animation-fill-mode: forwards;
    }
    @keyframes runeworks-multisplash-fading {
       0% { opacity: 1; }
     100% { opacity: 0; }
    }
    
    #runeworks-multisplash-canvas {
      filter: opacity(0.55);
    }

    #${multisplashLoaders} {
      position    : relative;
      width : ${multisplashWidth}%;
    }
    .runeworks-loader-element {
      position    : relative;
      height : 2.4em;
      line-height: 2.4em;
      font-family : 'Poppins';
      font-size   : 20pt;
      color       : rgba( 231, 231, 231, 1.00 );
    }
    .runeworks-loader-element div {
      display     : inline-block;
    }
    .runeworks-loader-label {
      min-width   : ${window.innerWidth * labelFactor}px;
      max-width   : ${window.innerWidth * labelFactor}px;
          width   : ${window.innerWidth * labelFactor}px;
    }
    .runeworks-loader-text {
      position    : absolute;
      right       : 0%;
      text-align  : right;
      min-width   : ${window.innerWidth * textFactor}px;
      max-width   : ${window.innerWidth * textFactor}px;
          width   : ${window.innerWidth * textFactor}px;
    }
    .runeworks-loader-progress-pony {
      position    : absolute;
      transform   : translate( 0%, -67% ); /* if the gif were perfectly center, you could use 50% */
    }

    /* dot-pulse code */
    .runeworks-invisible {
      opacity: 0 !important;
    }
    /* https://codepen.io/nzbin/pen/GGrXbp */
    .dot-flashing {
      position: relative;
      left    : 15px;
      display : inline-block;
      width: 10px;
      height: 10px;
      border-radius: 5px;
      background-color: ${dotColor};
      color: ${dotColor};
      animation: dot-flashing 1s infinite linear alternate;
      animation-delay: 0.5s;
    }
    .dot-flashing::before, .dot-flashing::after {
      content: "";
      display: inline-block;
      position: absolute;
      top: 0;
    }
    .dot-flashing::before {
      left: -15px;
      width: 10px;
      height: 10px;
      border-radius: 5px;
      background-color: ${dotColor};
      color: ${dotColor};
      animation: dot-flashing 1s infinite alternate;
      animation-delay: 0s;
    }
    .dot-flashing::after {
      left: 15px;
      width: 10px;
      height: 10px;
      border-radius: 5px;
      background-color: ${dotColor};
      color: ${dotColor};
      animation: dot-flashing 1s infinite alternate;
      animation-delay: 1s;
    }

    @keyframes dot-flashing {
      0% {
        background-color: ${dotColor};
      }
      50%, 100% {
        background-color: rgba(152, 128, 255, 0.2);
      }
    }
    `
  }

  return {
    start : start,
    update: update,
    sim   : simulate,
  }
})()