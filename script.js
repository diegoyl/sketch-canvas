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
    seqVector = [];


const timerText = document.getElementById("title");
let intervalID;
let newStroke;

var x = "black",
    y = 4;

var blankSketch = true; // won't allow user to add the sketch if they haven't drawn anything

function init() {
     canvas = document.getElementById('myCanvas');
     ctx = canvas.getContext("2d");
     w = canvas.width;
     h = canvas.height;

     let seqVector = [];

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
    
    // saving seqVector array as JSON
    var seqDataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(seqVector));

    if (blankSketch == false) {
        if (addCount == 0) {
            sketch1.src = dataURI;
            sketchSequence1 = seqDataStr;
            lastSketch = seqVector;
            seqVector = [];
        }
        else if (addCount == 1) {
            sketch2.src = dataURI;
            sketchSequence2 = seqDataStr;
            lastSketch = seqVector;
            seqVector = [];
        }
        if (addCount == 2) {
            sketch3.src = dataURI;
            sketchSequence3 = seqDataStr;
            lastSketch = seqVector;
            seqVector = [];
        }
        else if (addCount == 3) {
            sketch4.src = dataURI;
            sketchSequence4 = seqDataStr;
            lastSketch = seqVector;
            seqVector = [];
        }
        else if (addCount > 3) {
            alert('You can only add up to 4 sketches. Press "Clear All" to start over.');
        }
        erase();
        blankSketch = true;
        addCount = addCount + 1;
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
    mouseX = currX - prevX ;
    mouseY = currY - prevY;

    if (res == 'down') {
        let xArray = [];
        let yArray = [];
        let tArray = [];
        
        newStroke = [xArray, yArray, tArray];

        let seqX;
        let seqy;
        let seqT = 0;

        intervalID = setInterval(function () {
            seqT += 1;
            seqX = currX;
            seqY = currY;

            xArray.push(seqX);
            yArray.push(seqY);
            tArray.push(seqT);

            timerText.innerHTML = seqT+" | "+seqX+","+seqY;
        }, 10);


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
            timerText.innerHTML = "reset";
            seqVector.push(newStroke)
            console.log("seqVec: "+seqVector)
            console.log(seqVector.length+" | "+newStroke.length)
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

