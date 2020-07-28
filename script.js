var canvas, ctx, flag = false,
    prevX = 0,
    currX = 0,
    prevY = 0,
    currY = 0,
    dot_flag = false,
    state1 = 0,
    state2 = 0,
    state3 = 0,
    coords_list = [],
    sketchSequence1 = 0,
    sketchSequence2 = 0,
    sketchSequence3 = 0,
    sketchSequence4 = 0,
    absVector = [];
    relVector = [];
    


const timerText = document.getElementById("title");
let intervalID;
let absStroke;
let relPoint = [0,0, 1,0,0];
let upX;
let upY;
const intervalTime = 10; //interval in milliseconds for recording points of stroke

var x = "black",
    y = 4;

var blankSketch = true; // won't allow user to add the sketch if they haven't drawn anything

function init() {
     canvas = document.getElementById('myCanvas');
     ctx = canvas.getContext("2d");
     w = canvas.width;
     h = canvas.height;

     let absVector = [];

     canvas.addEventListener("mousemove", function (e) {
         findxy('move', e)
     }, false);
     canvas.addEventListener("mousedown", function (e) {
         findxy('down', e)
     }, false);
     canvas.addEventListener("mouseup", function (e) {
         findxy('up', e)
     }, false);
     canvas.addEventListener("mouseout", function (e) {
         findxy('out', e)
     }, false);
 }

function draw() {
    ctx.beginPath();
    ctx.moveTo(prevX, prevY);
    ctx.lineTo(currX, currY);
    ctx.strokeStyle = x;
    ctx.lineWidth = y;
    ctx.lineCap = "round";
    ctx.stroke();
    ctx.closePath();
}


// clears only the current sketch
function erase() {
    ctx.clearRect(0, 0, w, h);
    blankSketch = true;
}

var addCount = 0 // keeps track of how many sketches have been added so it can't be pressed once it reaches max.

// clears the current sketch and removes all added sketches
function eraseAll() {
    var m = confirm("Want to clear all your sketches?");
    if (m) {
        ctx.clearRect(0, 0, w, h);
        sketch1.src = "https://i.ya-webdesign.com/images/blank-png-1.png";
        sketch2.src = "https://i.ya-webdesign.com/images/blank-png-1.png";
        sketch3.src = "https://i.ya-webdesign.com/images/blank-png-1.png";
        sketch4.src = "https://i.ya-webdesign.com/images/blank-png-1.png";
        addCount = 0
    }
}

function abs2relConverter(absvec) {
    var i;
    var j;
    var oldX = 0;
    var oldY = 0;
    var newX;
    var newY;
    var deltaX;
    var deltaY;
    var arrLength;
    var xArray;
    var yArray;
    var stroke;
    var centerX;
    var centerY;
    var newPoint;
    var endPoint;
    var convertedVec = [[0,0,1,0,0]];
    console.log("ABS LEN:"+absvec.length);
    for (i = 0; i < absvec.length; i++) {
        stroke = absvec[i];
        console.log("stroke:"+stroke);
        xArray = stroke[0];
        yArray = stroke[1];
        arrLength = xArray.length;
        console.log("stroke LEN:"+arrLength);
        for (j = 0; j < arrLength; j++) {
            // stores coords of first point of sketch used to normalize data to start at 0,0
            if (i+j == 0) {
                var centerX = xArray[0];
                var centerY = yArray[0];
            }
            else {
                newX = xArray[j] - centerX;
                newY = yArray[j] - centerY;
                console.log("newXY:"+newX+","+newY);

                deltaX = newX - oldX;
                deltaY = newY - oldY;

                newPoint = [deltaX,deltaY, 1,0,0];
                convertedVec.push(newPoint);

                oldX = newX;
                oldY = newY;
            }
        }
        // changing last point of stroke to p2 state
        endPoint = convertedVec.pop();
        endPoint.splice(2,3, 0, 1, 0);
        convertedVec.push(lastPoint);
    }
    // changing final point to p3 state
    endPoint = convertedVec.pop();
    endPoint.splice(2,3, 0, 0, 1);
    convertedVec.push(lastPoint);
    
    return convertedVec;
}


let lastSketch;
// adds picture of sketch to the interpolation bar and creates blank canvas
function addSketch() {
    canvas = document.getElementById('myCanvas');
    let dataURI = canvas.toDataURL();
    console.log(addCount);
    
    // saving absVector array as JSON

    abs2relVector = abs2relConverter(absVector);
    console.log("AbsVec:"+absVector);
    console.log("Abs2Rel:"+abs2relVector);

    var seqDataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(absVector));
    
    if (blankSketch == false) {
        // adding final p3 stroke to resVector
        
        lastPoint = relVector.pop();

        console.log("FINAL point:"+lastPoint);
        lastPoint.splice(2,3, 0, 0, 1);
        relVector.push(lastPoint);
        console.log("FINAL point edited:"+lastPoint);
        console.log("FINAL ARRAY:"+relVector);
            

        if (addCount == 0) {
            sketch1.src = dataURI;
            sketchSequence1 = seqDataStr;
            lastSketch = relVector;
        }
        else if (addCount == 1) {
            sketch2.src = dataURI;
            sketchSequence2 = seqDataStr;
            lastSketch = relVector;
        }
        if (addCount == 2) {
            sketch3.src = dataURI;
            sketchSequence3 = seqDataStr;
            lastSketch = relVector;
        }
        else if (addCount == 3) {
            sketch4.src = dataURI;
            sketchSequence4 = seqDataStr;
            lastSketch = relVector;
        }
        else if (addCount > 3) {
            alert('You can only add up to 4 sketches. Press "Clear All" to start over.');
        }
        erase();
        blankSketch = true;
        addCount = addCount + 1;

    // resetting vectors and initializing first point of relVector
    absVector = [];
    relVector = [];
    relPoint = [0,0, 1,0,0];

    }
    else if (blankSketch == true) {
        alert("You can't add an empty sketch")
    }

}

function downloadObjectAsJson(exportObj, exportName){
  var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj));
  var downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute("href",     dataStr);
  downloadAnchorNode.setAttribute("download", exportName + ".json");
  document.body.appendChild(downloadAnchorNode); // required for firefox
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
}

// Function for saving array - for mouse coordinates see prevX/Y and currX/Y
function save() {
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(lastSketch));
    var downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", "test.json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  }


function findxy(res, e) {
    var scrolltop = this.scrollY;

    prevX = currX;
    prevY = currY;
    currX = e.clientX - canvas.offsetLeft;
    currY = e.clientY - canvas.offsetTop + scrolltop;
    mouseX = currX - prevX;
    mouseY = currY - prevY;
    let relCurrX = currX;
    let relCurrY = currY;
    let relPrevX = relCurrX;
    let relPrevY = relCurrY;

    if (res == 'down') {
        // tracks vector with absolute x and y
        let xArray = [];
        let yArray = [];
        
        absStroke = [xArray, yArray];

        let absX;
        let absY;
        let absT = 0; //for debugging timer

        // tracks vector with relative x, y and pen states
        if (blankSketch == true) {
            // adds initial array of [0,0,1,0,0]
            relVector.push(relPoint);
        } 

        intervalID = setInterval(function () {
            
            // absVector
            absT += 1;
            absX = currX;
            absY = currY;

            xArray.push(absX);
            yArray.push(absY);

            // relVector
            relCurrX = currX;
            relCurrY = currY;
            console.log("prevXY:"+relPrevX+","+relPrevY);
            console.log("currXY:"+relCurrX+","+relCurrY);

            mouseX2 = relCurrX - relPrevX;
            mouseY2 = relCurrY - relPrevY;

            relX = mouseX2;
            relY = mouseY2;
            relPoint = [relX, relY, 1, 0, 0];
            relVector.push(relPoint);
            console.log("^changeXY:"+relX+","+relY);

            relPrevX = relCurrX;
            relPrevY = relCurrY;
            
            // text for debugging
            timerText.innerHTML = absT+" | "+absX+","+absY+" | "+relX+","+relY;

        }, intervalTime);


        flag = true;
        dot_flag = true;
        blankSketch = false;
        if (dot_flag) {
            ctx.beginPath();
            ctx.fillStyle = x;
            ctx.fillRect(currX, currY, y, y);
            ctx.closePath();
            dot_flag = false;
            state1 = 1;
            state2 = 0;
        }
    }
    if (res == 'up' || res == "out") {
        if (flag == true) {
            clearInterval(intervalID);
            timerText.innerHTML = "Sketch Canvas";

            //absVector
            absVector.push(absStroke);

            //relVector
            console.log("ARRAY:"+relVector);
            lastPoint = relVector.pop();
            console.log("last point:"+lastPoint);
            //changing pen state to p2 since the next point will not be connected
            lastPoint.splice(2,3, 0, 1, 0);
            relVector.push(lastPoint);
            console.log("last point edited:"+lastPoint);
            console.log("ARRAY2:"+relVector);
            
            // upX = currX;
            // upY = currY;
        }

        flag = false;
        state1 = 0;
        state2 = 1;
    }

    if (res == 'move') {
        if (flag) {
            draw();

        }
    }
    coords_list.push([mouseX, mouseY, state1, state2, state3]);
    // coords_list.push([currX,currY,prevX,prevY]);

}

