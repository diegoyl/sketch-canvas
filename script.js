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
    absVector,
    canvas2,
    ctx2;

const intervalTime = 10; //interval in milliseconds for recording points of stroke
const timerText = document.getElementById("title");
let intervalID;
var blankSketch = true; // won't allow user to add the sketch if they haven't drawn anything

// drawing style
var x = "rgba(0,0,0,1)",
    y = 4;


function init() {
     canvas = document.getElementById('myCanvas');
     ctx = canvas.getContext("2d");
     w = canvas.width;
     h = canvas.height;
     fillCanvas();

    //  SETTING UP PREDICTION CANVAS
     canvas2 = document.getElementById('predCanvas');
     ctx2 = canvas2.getContext("2d");

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
    fillCanvas();
}
// clears the current sketch and removes all added sketches
function eraseAll() {
    var m = confirm("Want to clear all your sketches?");
    if (m) {
        fillCanvas();
        sketch1.src = "https://i.ya-webdesign.com/images/blank-png-1.png";
        sketch2.src = "https://i.ya-webdesign.com/images/blank-png-1.png";
        sketch3.src = "https://i.ya-webdesign.com/images/blank-png-1.png";
        sketch4.src = "https://i.ya-webdesign.com/images/blank-png-1.png";
        addCount = 0
    }
}
function fillCanvas() {
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, w, h);    
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
function CNNpredict() {
    resetResults();
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
            // console.log("0: "+data[i + 0]);
            // console.log("1: "+data[i + 1]);
            // console.log("2: "+data[i + 2]);
            // console.log("3: "+data[i + 3]);
        }
        console.log("onload inp: "+input);
        console.log("onload len: "+input.length);
        CNNpredict2(input);
    };
    pred.src = canvas.toDataURL('image/png');
}   


function CNNpredict2(input) {
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

    var tensorData = outPred.dataSync();
    console.log("tensor data "+tensorData)
    var predictDisplay = tensorData[0];

    output.innerHTML = predictDisplay;
    
    erase();
}



// makes prediction from added Sketch
function VAEpredict() { 
    resetResults();
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
        VAEpredict2(input);
    };
    pred.src = canvas.toDataURL('image/png');
}   

function VAEpredict2(input) {
    // teste = tf.tensor([[-0.03005229 , 0.02860937 , 0.06479363 ,-0.00289215 ,-0.0616348 ,  0.02338343,
    //     -0.03934336 ,-0.08602308 , 0.18989778 ]], [1,9])
    
    teste = [-0.36047292,  0.80789363,  0.48131144, -1.02407718,  2.40988064, -0.88771844,
        0.247859,   -0.55779624, -0.47024077];

    teste = [-2.08542681, -0.47914732,  1.53509092, -0.97853041, -1.57959282, -1.188151,
       -0.55057764, -1.55801702, -0.54232752];

    teste = tf.tensor([teste], [1,9]);
    
    teste.reshape = [1,9];

    input =  teste;
    var testd = decoder.predict(teste);
    var output = document.getElementById("predictionVAE");

    output.innerHTML = testd;
    console.log(testd.shape);
    
    TensorToImage(testd);
    erase();
}

function TensorToImage(tensor) {
    var values = tensor.dataSync();
    var rgbdata = Array.from(values);
    rgbdata_reshaped = reshapeArray(rgbdata, 72, 3);
    var hgt = 72;
    var wdt = 72;
    var scale = 3;
    var r,g,b;

    console.log("adding blue");
    for(var i=0; i< hgt; i++){ 
        for(var j=0; j< wdt; j++){ 
            r = 255*rgbdata_reshaped[i][j][0]; 
            g = 255*rgbdata_reshaped[i][j][1]; 
            b = 255*rgbdata_reshaped[i][j][2]; 
            let color = "rgba("+r+","+g+","+b+", 1)";
            ctx2.fillStyle = color;  
            ctx2.fillRect( j*scale, i*scale, scale, scale); 
        } 
    }  
}

function reshapeArray(array, wd, channels) {
    var arr1 = [];
    for(var i=0; i< array.length; i+=channels){ 
        let newArray = [];
        for(var j=0; j< channels; j++){ 
            newArray.push(array[i+j]);
        }
        arr1.push(newArray);
    }
    var arr2 = [];
    for(var i=0; i< arr1.length; i+=wd){ 
        let newArray = [];
        for(var j=0; j< wd; j++){ 
            newArray.push(arr1[i+j]);
        }
        arr2.push(newArray);
    }
    return arr2
}

function BOTHpredict() {
    CNNpredict();
    VAEpredict();
}
function resetResults() {
    var output1 = document.getElementById("prediction");
    var output2 = document.getElementById("predictionVAE");
    output1.innerHTML = "";
    output2.innerHTML = "";
}



// function TensorToImage2(tensor) {
//     console.log("start tensor to image");
//     //get the tensor shape
//     const [width, height] = tensor.shape;
//     //create a buffer array
//     const buffer = new Uint8ClampedArray(width * height * 4);
//     //create an Image data var 
//     const imageData = new ImageData(width, height);
//     //get the tensor values as data
//     const data = tensor.dataSync();
//     //map the values to the buffer
//     var i = 0;
//     for(var y = 0; y < height; y++) {
//         for(var x = 0; x < width; x++) {
//             var pos = (y * width + x) * 4;      // position in buffer based on x and y
//             buffer[pos  ] = data[i];             // some R value [0, 255]
//             buffer[pos+1] = data[i+1];           // some G value
//             buffer[pos+2] = data[i+2];           // some B value
//             buffer[pos+3] = 255;                // set alpha channel
//             i+=3;
//         }
//     }f
//     //set the buffer to the image data
//     imageData.data.set(buffer);
//     //show the image on canvas
//     document.getElementById("predict-img").src = imageData;
//     // ctx.putImageData(imageData, 0, 0);
// };



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

