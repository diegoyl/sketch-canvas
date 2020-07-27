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
let relStroke = [0,0, 1,0,0];
let upX;
let upY;
const intervalTime = 400; //interval in milliseconds for recording points of stroke

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

let lastSketch;
// adds picture of sketch to the interpolation bar and creates blank canvas
function addSketch() {
    canvas = document.getElementById('myCanvas');
    let dataURI = canvas.toDataURL();
    console.log(addCount);
    
    // saving absVector array as JSON
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
            lastSketch = absVector;
        }
        else if (addCount == 1) {
            sketch2.src = dataURI;
            sketchSequence2 = seqDataStr;
            lastSketch = absVector;
        }
        if (addCount == 2) {
            sketch3.src = dataURI;
            sketchSequence3 = seqDataStr;
            lastSketch = absVector;
        }
        else if (addCount == 3) {
            sketch4.src = dataURI;
            sketchSequence4 = seqDataStr;
            lastSketch = absVector;
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
    relStroke = [0,0, 1,0,0];

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
    currX2 = currX;
    currY2 = currY;

    if (res == 'down') {
        // tracks vector with absolute x and y
        let xArray = [];
        let yArray = [];
        let tArray = [];
        
        absStroke = [xArray, yArray, tArray];

        let absX;
        let absY;
        let absT = 0;

        // tracks vector with relative x, y and pen states
        if (blankSketch == true) {
            relVector.push(relStroke);
        } 


        intervalID = setInterval(function () {
            // absVector
            absT += 1;
            absX = currX;
            absY = currY;

            xArray.push(absX);
            yArray.push(absY);
            tArray.push(absT);

            // relVector
            prevX2 = currX2;
            prevY2 = currY2;
            currX2 = e.clientX - canvas.offsetLeft;
            currY2 = e.clientY - canvas.offsetTop + scrolltop;
            mouseX2 = currX2 - prevX2;
            mouseY2 = currY2 - prevY2;

            relX = mouseX2;
            relY = mouseY2;
            relStroke = [relX, relY, 1, 0, 0];
            relVector.push(relStroke);
            console.log("XY:"+currX+","+currY);
            
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
            absVector.push(absStroke);


            
            console.log("ARRAY:"+relVector);
            lastPoint = relVector.pop();
            console.log("last point:"+lastPoint);
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

