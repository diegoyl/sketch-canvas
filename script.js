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


var x = "black",
    y = 4;

var blankSketch = true; // won't allow user to add the sketch if they haven't drawn anything

function init() {
     canvas = document.getElementById('myCanvas');
     ctx = canvas.getContext("2d");
     w = canvas.width;
     h = canvas.height;
     
     
     
    // used this Event Listener to help fix mouse position issues
    canvas.addEventListener("mousemove", function (e) {
        var mouseX2 = e.clientX;
        var mouseY2 = e.clientY;
        var status = document.getElementById('status');
        // status.innerHTML = mouseX2+" | "+mouseY2;
    });

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
    recordSequence();

    ctx.beginPath();
    ctx.moveTo(prevX, prevY);
    ctx.lineTo(currX, currY);
    ctx.strokeStyle = x;
    ctx.lineWidth = y;
    ctx.lineCap = "round";
    ctx.stroke();
    ctx.closePath();
}

function recordSequence () {
    //collecting sequential data in form of [ [x1,x2,...],[y1,y2,..],[t1,t2,...] ]
    var myInterval = setInterval(sequentialFunc,4000);
    
    function myStopFunction() {
        clearInterval(myInterval);
    }

    clearInterval(myInterval);

    function sequentialFunc(){
        console.log("running seq func");
        var newStroke = [[],[],[]]
        var seqX = "x";
        var seqY = "y";
        var seqT = "t";

        seqVector.push(newStroke);

    }
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

// adds picture of sketch to the interpolation bar and creates blank canvas
function addSketch() {
    canvas = document.getElementById('myCanvas');
    let dataURI = canvas.toDataURL();
    console.log(addCount);
    if (blankSketch == false) {
        if (addCount == 0) {
            sketch1.src = dataURI;
            sketchSequence1 = seqVector;
            seqVector = [];
        }
        else if (addCount == 1) {
            sketch2.src = dataURI;
        }
        if (addCount == 2) {
            sketch3.src = dataURI;
        }
        else if (addCount == 3) {
            sketch4.src = dataURI;
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

    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(coords_list));
    var downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", "test.json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  }


function findxy(res, e) {
    var scrolltop = this.scrollY;
    // scrollStatus.innerHTML = scrolltop;

    prevX = currX;
    prevY = currY;
    currX = e.clientX - canvas.offsetLeft;
    currY = e.clientY - canvas.offsetTop + scrolltop;
    mouseX = currX - prevX ;
    mouseY = currY - prevY;

    if (res == 'down') {

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
