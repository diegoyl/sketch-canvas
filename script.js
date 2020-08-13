var canvas, ctx, flag = false,
    prevX = 0,
    currX = 0,
    prevY = 0,
    currY = 0,
    dot_flag = false,
    sketchSequence1 = 0,
    sketchSequence2 = 0,
    sketchSequence3 = 0,
    sketchSequence4 = 0,
    absStroke,
    absVector;

const intervalTime = 10; //interval in milliseconds for recording points of stroke
const timerText = document.getElementById("title");
let intervalID;
var blankSketch = true; // won't allow user to add the sketch if they haven't drawn anything

// drawing style
var x = "rgb(254,254,254)",
    y = 4;


function init() {
     canvas = document.getElementById('myCanvas');
     ctx = canvas.getContext("2d");
     w = canvas.width;
     h = canvas.height;

     absVector = [];

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

function findxy(res, e) {
    var scrolltop = this.scrollY;

    prevX = currX;
    prevY = currY;
    currX = e.clientX - canvas.offsetLeft;
    currY = e.clientY - canvas.offsetTop + scrolltop;

    if (res == 'down') {
        // tracks vector with absolute x and y
        let xArray = [];
        let yArray = [];
        
        absStroke = [xArray, yArray];

        let absX;
        let absY;
        let absT = 0; //for debugging timer

        intervalID = setInterval(function () {
            // absVector
            absT += 1;
            absX = currX;
            absY = currY;

            xArray.push(absX);
            yArray.push(absY);

            timerText.innerHTML = absT+" | "+absX+","+absY; //for debugging timer

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
        }
    }
    if (res == 'up' || res == "out") {
        if (flag == true) {
            clearInterval(intervalID);
            timerText.innerHTML = "Sketch Canvas";

            //absVector
            absVector.push(absStroke);
        }
        flag = false;
    }

    if (res == 'move') {
        if (flag) {
            draw();
        }
    }

}

var addCount = 0 // keeps track of how many sketches have been added so it can't be pressed once it reaches max.
var absDataStorage = [];
var relDataStorage = [];
var absSeqDataStr = false;
var relSeqDataStr = false;

function addSketch() {
    // displays sketch, erases canvas
    // in the future will need to store data somewhere and feed data into interpolation model or something else
    if (blankSketch == false) {
        // checks that something has been drawn so that blankSketches aren't added
        // could also add more restrictions here (minimum amount of points?...)
        // currently only supports adding a max of 4 sketches

        canvas = document.getElementById('myCanvas');
        let dataURI = canvas.toDataURL(); // png for displaying sketch on website
        let sketchInput = ctx.getImageData(0, 0, w, h);
        console.log(sketchInput);

        // converting absVector into relVector with relative distances and pen states
        let relVector = abs2relConverter(absVector);
        // console.log("AbsVec:"+absVector);
        // console.log("RelVec:"+relVector);

        // saving vector arrays as JSONs and storing it (currently just being stored in an array)
        absSeqDataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(absVector));
        relSeqDataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(relVector));
        absDataStorage.push(absSeqDataStr);
        relDataStorage.push(relSeqDataStr);

        // if (addCount == 0) {
        //     sketch1.src = dataURI; 
        // }
        // else if (addCount == 1) {
        //     sketch2.src = dataURI;
        // }
        // if (addCount == 2) {
        //     sketch3.src = dataURI;
        // }
        // else if (addCount == 3) {
        //     sketch4.src = dataURI;
        // }
        // else if (addCount > 3) {
        //     alert('You can only add up to 4 sketches. Press "Clear All" to start over.');
        // }
        // erase();
        // blankSketch = true;
        // addCount = addCount + 1;

        // resetting vector
        absVector = [];

        // model prediction
        makePrediction(dataURI);
        savePNG(sketchInput);
    }
    else if (blankSketch == true) {
        alert("You can't add an empty sketch")
    }
}

function abs2relConverter(absvec) {
    var i, j;
    var oldX = 0;
    var oldY = 0;
    var newX, newY, deltaX, deltaY, arrLength, xArray, yArray, currStroke, centerX, centerY, newPoint, endPoint;
    var convertedVec = [[0,0,1,0,0]];
    
    for (i = 0; i < absvec.length; i++) {
        currStroke = absvec[i];
        xArray = currStroke[0];
        yArray = currStroke[1];
        arrLength = xArray.length;
        for (j = 0; j < arrLength; j++) {
            // stores coords of first point of sketch used to normalize data to start at 0,0
            if (i+j == 0) {
                var centerX = xArray[0];
                var centerY = yArray[0];
            }
            else {
                newX = xArray[j] - centerX;
                newY = yArray[j] - centerY;

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
        convertedVec.push(endPoint);
    }
    // changing final point to p3 state
    endPoint = convertedVec.pop();
    endPoint.splice(2,3, 0, 0, 1);
    convertedVec.push(endPoint);
    return convertedVec;
}

// clears only the current sketch
function erase() {
    ctx.clearRect(0, 0, w, h);
    blankSketch = true;
}
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


// model stuff
var encoder;
var decoder;
var model;
var model2;


// tf.loadLayersModel("encoder/encoder.json").then(function(enc) {
//     encoder = enc;
//     console.log("loaded encoder");
//     console.log(encoder);
//    });
tf.loadLayersModel("decoder/decoder.json").then(function(dec) {
    decoder = dec;
    console.log("loaded decoder");
    console.log(decoder);
   });
tf.loadLayersModel("decoder/decoder.json").then(function(mod) {
    model2 = mod;
    console.log("loaded model2");
    console.log(model2);
});


tf.loadLayersModel("new-model/model.json").then(function(model) {
    window.model = model;
    console.log("modelllll loaded");
   });


// var teste = [[-0.03005229 , 0.02860937 , 0.06479363 ,-0.00289215 ,-0.0616348 ,  0.02338343,
//     -0.03934336 ,-0.08602308 , 0.18989778 ]]

    
// predicts performance (integer)    
function model2Predict() {
    
    var pred = new Image();
    pred.onload = function() {
        ctx.drawImage(pred, 0, 0, 224, 224);
        data = ctx.getImageData(0, 0, 224, 224).data;
        document.getElementById("predict-img").src = canvas.toDataURL();
        var input = [];
        for(var i = 0; i < data.length; i += 4) {
        input.push(data[i + 0] / 255);
        input.push(data[i + 1] / 255);
        input.push(data[i + 2] / 255);
        }
        console.log("onload inp: "+input);
        console.log("onload len: "+input.length);
        CNNpredict(input);
    };
    pred.src = canvas.toDataURL('image/png');
}   


function CNNpredict(input) {  
    var count = 0;
    for(var i = 0; i < input.length; ++i){
        if(input[i] == 1)
            count++;
    }    
    console.log("ID: "+ count);
    console.log("predict inp: "+input);
    reshaped_input = tf.reshape(input, [1,224,224,3]);
    console.log("reshape inp: "+reshaped_input);
      
    var outPred = model.predict(reshaped_input);
    var output = document.getElementById("prediction");
    output.innerHTML = outPred;
}



// makes prediction from added Sketch
function makePrediction(sketchInput) { 
    // teste = reshape(teste, [72, 72,3]);
    // teste[0] /= 255;

    teste = tf.tensor([[-0.03005229 , 0.02860937 , 0.06479363 ,-0.00289215 ,-0.0616348 ,  0.02338343,
        -0.03934336 ,-0.08602308 , 0.18989778 ]], [1,9])

    teste.reshape = [1,9];
    let testd = decoder.predict(teste);
    console.log(testd);

    var predictImg = document.getElementById("predict-img");

    // var img = tf.encodePng(testd);
    // predictImg.src = img;
    // 3, 5, 8
    // plt.imshow(testd[a])
    console.log("teste:");
    console.log(teste);
    console.log("testd:");
    console.log(testd);
    var output = document.getElementById("prediction2");
    output.innerHTML = testd;
}   




// for downloads
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

function saveAbs() {
    if (absSeqDataStr != false) {
        var dataStr = absSeqDataStr;
        var downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href",     dataStr);
        downloadAnchorNode.setAttribute("download", "absVector.json");
        document.body.appendChild(downloadAnchorNode); // required for firefox
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    } 
}
function saveRel() {
    if (relSeqDataStr != false){
        var dataStr = relSeqDataStr;
        var downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href",     dataStr);
        downloadAnchorNode.setAttribute("download", "relVector.json");
        document.body.appendChild(downloadAnchorNode); // required for firefox
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    }
}

function savePNG(img) {
    var dataStr = img;
    var downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", "handsketch.png");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

