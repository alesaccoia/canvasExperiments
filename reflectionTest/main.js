var animationFrameInstalled = false;
var canvas, ctx;
var mouseX, mouseY;
var lastCalledTime;
var fps;
var fpsMeter;
var borders = [];

var totalSize;

var paintGray = true;
var lastChangePaint;

var density = 5;


function getEmittingSide(extrapolated) {
  if (extrapolated < canvas.width) {
    return 0;
  } else if (extrapolated < (canvas.width + canvas.height)) {
    return 1;
  } else if (extrapolated < (canvas.width + canvas.width + canvas.height)) {
    return 2;
  } else {
    return 3;
  }
}

function randomIntFromInterval(min,max)
{
    return Math.floor(Math.random()*(max-min+1)+min);
}

window.onload = window.onresize = function() {
  canvas = document.getElementById("mainCanvas");
  fpsMeter = document.getElementById("fpsMeter");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  totalSize = (canvas.width* 2 +  canvas.height * 2);
  ctx = canvas.getContext("2d");
  
  function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
    };
  }
  
  mouseX = Math.random() * canvas.width;
  mouseY = Math.random() * window.innerHeight;
  
  canvas.addEventListener('mousemove', function(evt) {
    var mousePos = getMousePos(canvas, evt);
    mouseX = mousePos.x;
    mouseY = mousePos.y;
  }, false);

  borders = [];
//  borders = new Array();
  for (var i = 0; i < canvas.width; ++i) {
    var x,y;
    var extrapolated = (i / (canvas.width)) * totalSize;
    if (extrapolated < canvas.width) {
      x = canvas.width - extrapolated;
      y = canvas.height;
    } else if (extrapolated < (canvas.width + canvas.height)) {
      x = 0;
      y = canvas.height - (extrapolated - canvas.width);
    } else if (extrapolated < (canvas.width + canvas.width + canvas.height)) {
      x = extrapolated - (canvas.width + canvas.height);
      y = 0;
    } else {
      x = canvas.width;
      y = extrapolated - (canvas.width + canvas.width + canvas.height);
    }
    borders.push({ x: x, y:y});
    
  }

  if (!animationFrameInstalled) {
    window.requestAnimationFrame(draw);
    animationFrameInstalled = true;
  }
  console.log(canvas.width + ' ' + canvas.height);
}


function drawLine() {

  if (mouseX == null) {
    return;
  }
  
  var a = borders[Math.round(mouseX)];
  var extrapolated = (mouseX / (canvas.width)) * totalSize;
  
  var thisSide = getEmittingSide(extrapolated);
  var newSide = thisSide + Math.round(Math.random() * 2) + 1;
  newSide = newSide % 4;
  var b;
  switch (newSide) {
    case 0:
      b = {x: Math.random() * canvas.width, y: canvas.height};
      break;
    case 1:
      b = {x: 0, y: Math.random() * canvas.height};
      break;
    case 2:
      b = {x: Math.random() * canvas.width, y: 0};
      break;
    case 3:
      b = {x: canvas.width, y: Math.random() * canvas.height};
      break;
  }
  
  if (paintGray) {
    var length = Math.sqrt((b.x - a.x) * (b.x - a.x) + (b.y - a.y) * (b.y - a.y));
    var grad= ctx.createLinearGradient(0, 0, 0, length);
  
    var startGrey = Math.round(Math.random() * 255);
    var endGrey = Math.round(Math.random() * 255);
  
    var colorStart = "rgba("+startGrey+","+startGrey+","+startGrey+",0.1)";
    var colorEnd = "rgba("+endGrey+","+endGrey+","+endGrey+",0.1)";
  
    grad.addColorStop(0, colorStart);
    grad.addColorStop(1, colorEnd);
    ctx.strokeStyle = grad;
  } else {
    ctx.strokeStyle= "rgba(247,37,135,0.1)";
  }
  
  /*
  console.log(mouseX);
  console.log(extrapolated);
  console.log(thisSide);
  console.log(newSide);
  console.log(a);
  console.log(b);
  console.log(length);
  */
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(a.x,a.y);
  ctx.lineTo(b.x, b.y);
  ctx.stroke();
  

}

function draw() {

  for (var i = 0; i < density; ++i) {
    drawLine();
  }
  
  
  window.requestAnimationFrame(draw);
  
  if(!lastCalledTime) {
     lastCalledTime = Date.now();
     lastChangePaint = Date.now();
     fps = 0;
     return;
  }
  delta = (Date.now() - lastCalledTime)/1000;
  lastCalledTime = Date.now();
  fps = 1/delta;
  fpsMeter.innerHTML = Math.round(fps) + ' FPS';
  
  if (lastChangePaint + 2000 < Date.now()) {
    lastChangePaint = Date.now();
    paintGray = paintGray ? false : true;
  }
  
  
  
}