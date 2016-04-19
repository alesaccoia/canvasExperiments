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

function toDegrees(radians) {
 return radians * (180/Math.PI);
}


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
  
  canvas.addEventListener('click', function(evt) {
    var mousePos = getMousePos(canvas, evt);
    mouseX = mousePos.x;
    mouseY = mousePos.y;
    console.log("Dsads");
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
  
  for (charIt in charsOutlines) {
    for (outlineIt in charsOutlines[charIt]) {
      for (pointIt in charsOutlines[charIt][outlineIt]) {
        charsOutlines[charIt][outlineIt][pointIt].x += 100;
        charsOutlines[charIt][outlineIt][pointIt].y += 100;
      }
    }
  }

}


function drawLine() {

  if (mouseX == null) {
    return;
  }
  
  var a;
  
  if (Math.random() < 0.8) {
    a = borders[Math.round(mouseX)];
  } else {
    a = borders[Math.round(Math.random() * canvas.width / 2)];
  }

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
  
  // start iterating for intersections
  
  var startPoint = {x: a.x, y: a.y};
  var endPoint = {x: b.x, y: b.y};
  
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(startPoint.x,startPoint.y);
  
  var nrIntersections = 0;
  var maxIntersections = 10;
  var hasIntersectedAnything = false;
  var exitLoop = false;
  var intersectionSegment;
  while (!exitLoop && nrIntersections < maxIntersections) {  
    var intersectionResult, tempResult;
    var hasIntersected = false;
    var minDistance = 1000000;
    // iterate on all segments
    for (charIt in charsOutlines) {
      for (outlineIt in charsOutlines[charIt]) {
        for (var pointIt = 0; pointIt < charsOutlines[charIt][outlineIt].length; ++pointIt) {
          var currentSegmentStart = charsOutlines[charIt][outlineIt][pointIt];
          var nextIndex;
          if (pointIt == (charsOutlines[charIt][outlineIt].length - 1)) {
            nextIndex = 0;
          } else {
            nextIndex = pointIt + 1;
          }
          var currentSegmentEnd = charsOutlines[charIt][outlineIt][nextIndex];
          tempResult = checkLineIntersection(startPoint.x,startPoint.y,endPoint.x,endPoint.y,currentSegmentStart.x,currentSegmentStart.y,currentSegmentEnd.x,currentSegmentEnd.y);
          if (tempResult.onLine1 && tempResult.onLine2) {
            var dist = distanceBetweenPoints(startPoint.x,startPoint.y,tempResult.x,tempResult.y);
            if (dist > 0.5 && dist < minDistance) {
              minDistance = dist;
              intersectionResult = tempResult;
              intersectionSegment = {segStart: currentSegmentStart, segEnd: currentSegmentEnd};
              hasIntersected = true;
            }
          }
        }
      }
    }
  
    if (!hasIntersected) {
      exitLoop = true;
    } else {
      
      // draw to the intersection
      ctx.lineTo(intersectionResult.x, intersectionResult.y);
      
      //
      // compute reflected angle
      var angleA = Math.atan2(endPoint.y - startPoint.y, endPoint.x - startPoint.x);
      var angleB = Math.atan2(intersectionSegment.segEnd.y - intersectionSegment.segStart.y, intersectionSegment.segEnd.x - intersectionSegment.segStart.x);
      var normalToSegment = angleB + Math.PI / 2;
      var normalInVectorDirection = angleB - Math.PI / 2;
      var angleIncident = normalInVectorDirection - angleA;
      var angleReflected = normalToSegment + angleIncident;
/*
      console.log("start = " + startPoint.x + ' ' + startPoint.y);
      console.log("end = " + endPoint.x + ' ' + endPoint.y);
      console.log("intersection start= " + intersectionSegment.segStart.x + ' ' + intersectionSegment.segStart.y);
      console.log("intersection end= " + intersectionSegment.segEnd.x + ' ' + intersectionSegment.segEnd.y);
      console.log("normalToSegment = " + normalToSegment);
      console.log("normalInVectorDirection = " + normalInVectorDirection);
      console.log("angleA= " + angleA);
      console.log("angleB= " + angleB);
      console.log("angleIncident " + angleIncident);
      console.log("angleReflected " + angleReflected);
      console.log("-----");
      
      */
      startPoint.x = intersectionResult.x;
      startPoint.y = intersectionResult.y;
      endPoint.x = startPoint.x + Math.cos(angleReflected) * 2000;
      endPoint.y = startPoint.y + Math.sin(angleReflected) * 2000;
      hasIntersectedAnything = true;
      ++nrIntersections;
    }
    
    
  }
  
  if (hasIntersectedAnything) {
    ctx.strokeStyle= "rgba(247,37,135,0.1)";
  } else {
    var length = Math.sqrt((b.x - a.x) * (b.x - a.x) + (b.y - a.y) * (b.y - a.y));
    var grad= ctx.createLinearGradient(0, 0, 0, length);

    var startGrey = Math.round(Math.random() * 255);
    var endGrey = Math.round(Math.random() * 255);

    var colorStart = "rgba("+startGrey+","+startGrey+","+startGrey+",0.1)";
    var colorEnd = "rgba("+endGrey+","+endGrey+","+endGrey+",0.1)";

    grad.addColorStop(0, colorStart);
    grad.addColorStop(1, colorEnd);
    ctx.strokeStyle = grad;
  }
  if (exitLoop || nrIntersections < maxIntersections)
    ctx.lineTo(endPoint.x, endPoint.y);
  
  ctx.stroke();
  
  /*
  console.log(mouseX);
  console.log(extrapolated);
  console.log(thisSide);
  console.log(newSide);
  console.log(a);
  console.log(b);
  console.log(length);
  */

  

}

// for debug only
function drawCharacters() {
  ctx.lineWidth = 1;
  ctx.strokeStyle= "#fff";
  for (charIt in charsOutlines) {
    ctx.beginPath();
    for (outlineIt in charsOutlines[charIt]) {
      var startPt = charsOutlines[charIt][outlineIt][0];
//      startPt.x += 100;
//      startPt.y += 100;
      ctx.moveTo(startPt.x,startPt.y);
      for (var pointIt = 1; pointIt < charsOutlines[charIt][outlineIt].length; ++pointIt) {
//        console.log(charsOutlines[charIt][outlineIt][pointIt]);
        var newPoint = charsOutlines[charIt][outlineIt][pointIt];
//        newPoint.x += 100;
//        newPoint.y += 100;
        ctx.lineTo(newPoint.x, newPoint.y);
      }
      ctx.lineTo(startPt.x, startPt.y);
    }
    ctx.stroke();
  }
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