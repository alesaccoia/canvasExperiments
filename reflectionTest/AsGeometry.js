
function findAngle(p0,p1,p2) {
  var a = Math.pow(p1.x-p0.x,2) + Math.pow(p1.y-p0.y,2),
      b = Math.pow(p1.x-p2.x,2) + Math.pow(p1.y-p2.y,2),
      c = Math.pow(p2.x-p0.x,2) + Math.pow(p2.y-p0.y,2);
  return Math.acos( (a+b-c) / Math.sqrt(4*a*b) );
}

function normalizeAngleBetween0AndPi(angle) {
  while (angle > Math.PI) {
    angle -= Math.PI;
  }
  while (angle < 0) {
    angle += Math.PI;
  }
  return angle;
}

function checkLineIntersection(line1StartX, line1StartY, line1EndX, line1EndY, line2StartX, line2StartY, line2EndX, line2EndY) {
    // if the lines intersect, the result contains the x and y of the intersection (treating the lines as infinite) and booleans for whether line segment 1 or line segment 2 contain the point
    var denominator, a, b, numerator1, numerator2, result = {
        x: null,
        y: null,
        onLine1: false,
        onLine2: false,
        angle: null
    };
    denominator = ((line2EndY - line2StartY) * (line1EndX - line1StartX)) - ((line2EndX - line2StartX) * (line1EndY - line1StartY));
    if (denominator == 0) {
        return result;
    }
    a = line1StartY - line2StartY;
    b = line1StartX - line2StartX;
    numerator1 = ((line2EndX - line2StartX) * a) - ((line2EndY - line2StartY) * b);
    numerator2 = ((line1EndX - line1StartX) * a) - ((line1EndY - line1StartY) * b);
    a = numerator1 / denominator;
    b = numerator2 / denominator;

    // if we cast these lines infinitely in both directions, they intersect here:
    result.x = line1StartX + (a * (line1EndX - line1StartX));
    result.y = line1StartY + (a * (line1EndY - line1StartY));
/*
        // it is worth noting that this should be the same as:
        x = line2StartX + (b * (line2EndX - line2StartX));
        y = line2StartX + (b * (line2EndY - line2StartY));
        */
    // if line1 is a segment and line2 is infinite, they intersect if:
    if (a > 0 && a < 1) {
        result.onLine1 = true;
    }
    // if line2 is a segment and line1 is infinite, they intersect if:
    if (b > 0 && b < 1) {
        result.onLine2 = true;
    }
    
    // if line1 and line2 are segments, they intersect if both of the above are true
    return result;
};

function distanceBetweenPoints(aPointX, aPointY, bPointX, bPointY) {
  return Math.sqrt((aPointX - bPointX) * (aPointX - bPointX) + (aPointY - bPointY) * (aPointY - bPointY));
}

function dotProduct(a,b) {
  return a.x*b.x + a.y*b.y;
}