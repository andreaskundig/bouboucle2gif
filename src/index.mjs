//fooling gifshot...
// const jsdom = require("jsdom");
// const doc = jsdom.jsdom();
// global.Worker = require('webworker-threads').Worker;
// global.window  = doc.defaultView;
// global.document = window.document;
// window.Worker = Worker;

import GIFEncoder from 'gifencoder';
import fs from 'fs';
import paper from 'paper';
import makeLooper from '@andreaskundig/looper';
import staticSquares from './staticSquares.js';
import canvaspkg from 'canvas';

const { createCanvas, Canvas } = canvaspkg;

// var animationsCollections = require('./src/js/animationsCollections.js');

// const animationsPath = `src/static/animations/`;
const readGalleryJson = galleryName => {
    const path = `${animationsPath}/${galleryName}/${galleryName}.json`;
    return JSON.parse(fs.readFileSync(path, 'utf8'));
};

const drawAnimationGifEncoder = () => {
    var encoder = new GIFEncoder(320, 240);
    // stream the results as they are available into myanimated.gif
    encoder.createReadStream().pipe(fs.createWriteStream('gifencoder.gif'));

    encoder.start();
    encoder.setRepeat(0);   // 0 for repeat, -1 for no-repeat
    encoder.setDelay(500);  // frame delay in ms
    encoder.setQuality(10); // image quality. 10 is default.

    // use node-canvas
    var canvas = createCanvas(320, 240);
    var ctx = canvas.getContext('2d');

    // red rectangle
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(0, 0, 320, 240);
    encoder.addFrame(ctx);

    // green rectangle
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(0, 0, 320, 240);
    encoder.addFrame(ctx);

    // blue rectangle
    ctx.fillStyle = '#0000ff';
    ctx.fillRect(0, 0, 320, 240);
    encoder.addFrame(ctx);

    encoder.finish();

    console.log('saved gifencoder.gif');
};


const drawWithPaper = () => {
    
    var canvas = createCanvas(320, 240);
    const ps = new paper.PaperScope();
    ps.setup(canvas);
    var path = new ps.Path.Circle(new ps.Point(0, 0), 35);
    path.strokeColor = 'red';
    path.fillColor = 'red';
    var start = new paper.Point(0, 0);
    var ctx = canvas.getContext('2d');
    ps.view.draw();

    
    // console.log(ctx.getImageData(0,0,1,1).data);
    
    saveCanvasToPNGFile('test', ps, (p,f) => console.log(p,f));

    // console.log(ps.view.element);
    
    const out = fs.createWriteStream(__dirname + '/test2.png');
    const stream = ps.view.element.createPNGStream();
    stream.pipe(out);
};

const drawGifWithPaper = () => {
    
    var encoder = new GIFEncoder(320, 240);
    // stream the results as they are available into myanimated.gif
    encoder.createReadStream().pipe(fs.createWriteStream('anim.gif'));

    encoder.start();
    encoder.setRepeat(0);   // 0 for repeat, -1 for no-repeat
    encoder.setDelay(500);  // frame delay in ms
    encoder.setQuality(10); // image quality. 10 is default.

    // use node-canvas
    var canvas = createCanvas(320, 240);
    var ctx = canvas.getContext('2d');

    // blue rectangle
    console.log(ctx.getImageData(0,0,1,1));
    ctx.fillStyle = '#0000ff';
    ctx.fillRect(0, 0, 320, 240);
    console.log(ctx.getImageData(0,0,1,1));
    encoder.addFrame(ctx);


    const ps = new paper.PaperScope();
    ps.setup(canvas);

    const ctx2 = ps.view.element.getContext('2d');
    // Create a Paper.js Path to draw a line into it:
    var path = new ps.Path();
    // Give the stroke a color
    path.strokeColor = 'red';
    var start = new paper.Point(0, 0);
    // Move to start and draw a line from there
    path.moveTo(start);
    // Note that the plus operator on Point objects does not work
    // in JavaScript. Instead, we need to call the add() function:
    path.lineTo(start.add([ 200, 150 ]));
    // Draw the view now:
    ps.view.draw();
    console.log(ctx2.getImageData(0,0,1,1));
    
    encoder.addFrame(ctx2);
    
    encoder.finish();

    console.log('saved pgifencoder2.gif');
};

function saveCanvasToPNGFile(filename, paper, callback)
{
    filename += ".png";
    var fullpath = __dirname + '/'+filename;

    // Saving the canvas to a file.
    const out = fs.createWriteStream(fullpath);
    const stream = paper.view.element.pngStream();

    stream.on('data', function(chunk) {
        out.write(chunk);
    });

    stream.on('end', function() {
        console.log('saved png '+filename);
        callback( fullpath, filename );
    });

}

function saveCanvasToJPGFile(filename, callback)
{
    filename += ".jpg";
    var fullpath = __dirname + '/'+filename;

    // Saving the canvas to a file.
    const out = fs.createWriteStream(fullpath);
    const stream = paper.view.element.jpegStream({quality: 100});

    stream.on('data', function(chunk) {
        out.write(chunk);
    });

    stream.on('end', function() {
        console.log('saved jpeg '+filename);
        callback( fullpath, filename );
    });

}

const makeCircles = (looper, width, height) => {
    const cOps = {lifetime: 50, beat: 500, strokeWidth: 6};
    const cCenter = {x: width / 2, y: height / 2 };
    const cRadius = 10;
    const cSpeed = 0.05;
    const cLData =looper.makeCircleLineData(cOps, cCenter,cRadius, cSpeed);
    return {width: width, height: height, lineData: [cLData]};
};

const resizeAnimation = (animData, aSize) => {
    if(!aSize){
        return;
    }
    const zoom = aSize.width/animData.width;
    const oldCenter = [animData.width/2, animData.height/2];
    const newCenter = [aSize.width/2, aSize.height /2];
    let dCenter = newCenter.map((c,i)=> c - oldCenter[i]);
    dCenter = [0,0];
    animData.lineData.forEach(lineD => {
        const segs = lineD.segments.map(([x,y])=> [x*zoom + dCenter[0],
                                                   y*zoom + dCenter[1]]);
        lineD.segments = segs;
        lineD.strokeWidth = lineD.strokeWidth * zoom;
    });
    animData.width = aSize.width;
    animData.height = aSize.height;
    
};

const offsetAnimation =(animData, offset)=>{
    animData.lineData.forEach(lineD => {
        const segs = lineD.segments.map(([x,y])=> [x + offset[0],
                                                   y + offset[1]]);
        lineD.segments = segs;
    });
};
      
      
const drawAnimation = async (animData, destinationFile) => {
    
    console.time('draw animation');
    const size = animData || {width:110, height:110};
    var canvas = createCanvas(size.width, size.height);
    const graphics = {canvas: canvas, paper:paper};
    const looper = makeLooper({graphics: graphics});

    //TODO find out why calling scale() in importData fucks up the center
    looper.importData(animData, size);

    // looper.redrawAllLines(0);
    // saveCanvasToPNGFile('anim',looper._ps, (p,f) => console.log(p,f));
    
    var encoder = new GIFEncoder(size.width, size.height);
    destinationFile = destinationFile || 'anim.gif';
    encoder.createReadStream().pipe(fs.createWriteStream(destinationFile));

    const frameDelay = 50;
    encoder.start();
    encoder.setRepeat(0);   // 0 for repeat, -1 for no-repeat
    encoder.setDelay(frameDelay);  // frame delay in ms
    encoder.setQuality(10); // image quality. 10 is default.
    const view = looper._ps.view;
    const ctx = view.element.getContext('2d');
    let duration = 6000;
    if(animData.author != 'June'){
        // this never terminates for June's premiere bouboucle
        duration =   looper.findShortestLoop();
    }
    console.log('duration', duration); 
    for(var time = 0; time < duration; time += frameDelay ){
        looper.redrawAllLines(time);
        encoder.addFrame(ctx);
    }

    // red rectangle
    // ctx.fillStyle = '#ff0000';
    // ctx.fillRect(size.width/2 - 5 , size.height/2 - 5, 10, 10);
    // encoder.addFrame(ctx);
    
    console.log(destinationFile);
    encoder.finish();
    console.timeEnd('draw animation');
};

const readAnimationFile = (file) => {
    let animObject;
    const load = o => animObject = o;
    const animCode = fs.readFileSync(file, 'utf-8');
    eval(animCode);
    return animObject;
};

const writeAnimationFile =(animation, fileName)=>{
    const code = `load(${JSON.stringify(animation)})`;
    fs.writeFileSync(fileName, code);
};
      

const makeGifPath = (animData, directory, dim) =>{
    const file = animationsCollections.makeAnimationFileName(animData,
                                                             'gif', dim);
    return `${directory}/${file}`;
};


const drawOneGif = (file, gifSize) =>{
    gifSize = gifSize || gifSizes.w0910;
    // file = file || `${animationsPath}/bdfil2018/Zef__Lents-confettis.js`;
    var anim = file ? readAnimationFile(file) : staticSquares(gifSize.dim);
    var name = 'anim';
    var targetName = `${name}_${gifSize.dim.width}_${gifSize.dim.height}`;
    writeAnimationFile(anim, targetName+'.js');
    drawResizedAnimation(anim, targetName+'.gif', gifSize);
};

const drawResizedAnimation = (animCode, targetName, gifSize) =>{
    const sameWidth = animCode.width == gifSize.dim.width;
    const sameHeight = animCode.height == gifSize.dim.height;
    if( !sameWidth || !sameHeight) {
        resizeAnimation(animCode, gifSize.dim);
    }
    offsetAnimation(animCode, gifSize.offset);
    drawAnimation(animCode, targetName);
};

const drawAnimationFromDir = (animData, directory, gifSize) => {
    console.log('drawing', animData.title);
    const file = animationsCollections.makeAnimationFileName(animData);
    const inFilePath = `${directory}/${file}`;
    const outFilePath = makeGifPath(animData, directory, gifSize.dim);
    const animCode = readAnimationFile(inFilePath);
    drawResizedAnimation(animCode,outFilePath, gifSize);
};

const gifSizes ={ w2732: {dim:{width: 2732, height: 1923},
                          offset: [867,664]},
                  w1366: {dim:{width: 1366, height: 961},
                          offset: [185,182]},
		  // projecteur nec m260ws 1280 x 800 1.6
                  w1136: {dim:{width: 1136, height: 800},
                          offset: [70,101]},
		  // projecteur nec m350xs 1024 x 768 4/3
                  w1024: {dim:{width: 1024, height: 721},
                          offset: [14, 62]},
                  w0910: {dim:{width: 910, height: 642},
                          offset: [-44,22]},
                  w0455: {dim:{width: 455, height: 321},
                          offset: [-272,-138]},
                  w0225: {dim:{width: 225, height: 158},
                          offset: [-386,-220]},
                  w1024ipad:{dim:{"width":1024,
                                  "height":1286.33},
                             offset:[10,345]},
                  w0225ipad: {dim:{width: 225, height: 283},
                              offset: [-388,-158]}
                };
const oldmain = async () => {
    console.time('main');
    const start = new Date().getTime();
    try{
        const galleryName = process.argv[2] || 'bdfil2018';
        const gallery = readGalleryJson(galleryName);
        const galleryDir = `${animationsPath}/${galleryName}`;
        // const gifSize = gifSizes.w1366;//.w0225;//.w0455;//.w0910;
        // const gifSize = gifSizes.w0225;
        const gifSize = gifSizes.w0225ipad;
        // const gifSize = gifSizes.w1024ipad;
        // const gifSize = gifSizes.w1024;
        // const gifSize = gifSizes.w1136;
        gallery
            .filter(aDt=>!fs.existsSync(makeGifPath(aDt, galleryDir,
                                                    gifSize.dim)))
            // .filter((e,i) => i < 4)
            .forEach(animData => {
                drawAnimationFromDir(animData, galleryDir, gifSize);
            });

        // drawOneGif(`${galleryDir}/June__Premiere-bouboucle.js`,
        //            gifSize);
        // drawOneGif(`${galleryDir}/Charles-Chalas__Consoles-a-planetes.js`,
        //            gifSize);

        // drawOneGif(`${galleryDir}/1536824792046.js`,
        //           gifSize);
       // drawOneGif(null, gifSize);

    }catch(e){
        console.error(e);
    }
    console.timeEnd('main');
};
const main = async () => {
    console.time('main');
    const start = new Date().getTime();
    try{
        // const gifSize = gifSizes.w1366;//.w0225;//.w0455;//.w0910;
        // const gifSize = gifSizes.w0225;
        const gifSize = gifSizes.w0225ipad;
        // const gifSize = gifSizes.w1024ipad;
        // const gifSize = gifSizes.w1024;
        // const gifSize = gifSizes.w1136;

        drawOneGif(`examples/1536824792046.js`,
                  gifSize);
       // drawOneGif(null, gifSize);

    }catch(e){
        console.error(e);
    }
    console.timeEnd('main');
};

main();
