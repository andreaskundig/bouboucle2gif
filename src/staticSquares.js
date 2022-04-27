module.exports = function(size){
    const lineDataTemplate = 
          {
              "start": 1535794058252,
              "last": 146,
              "beat": 50,
              "lifetime": 50,
              "color": "#FF3F9F",
              "multiPeriod": 1,
              "strokeWidth": 6,
              "times": [0],
              "segments": [[3.936676281800395, 5.9717377495107655]
                          ]
          };

    const makeLine = (o)=>{
        if(o.segments){
            o.times = o.segments.map(()=>0);
        };
        return Object.assign({}, lineDataTemplate,o);
    };
    const offs = (segments, off)=>{
        off = off || [0,0];
        return segments.map(seg => [seg[0]+off[0], seg[1]+off[1]]);
    };

    const makeSquare = (width,height, off, color) =>{
        lineDataTemplate.color = color ||lineDataTemplate.color;
        return [
            makeLine({segments:offs([[0,0],[width,height]], off)}),
            makeLine({segments:offs([[0,0],[0,height]], off)}),
            makeLine({segments:offs([[width,0],[width,height]], off)}),
            makeLine({segments:offs([[width,height], [0,height]], off)}),
            makeLine({segments:offs([[0,height],[width,0]], off)}),
            makeLine({segments:offs([[width,0],[0,0]], off)}),
        ];
    };

    const makeSquares = (width, height)=>{
        const offsets = [...Array(20).keys()].map(o => o*50);
        //               0      1       2     3        4        5
        const colors = ['red','white','pink','white','yellow', 'white'];
        return offsets.map((o,i)=>{
            const color = colors[i % colors.length];
            return makeSquare(width, height, [o,o], color);
        }).reduce((acc,squares)=> acc.concat(squares) ,[]);
    };
    const width = size.width;
    const height = size.height;

    
    return {
        "width": width,
        "height": height,
        "speed": 1,
        "lineData": makeSquares(width,height)

        // "lineData": makeSquare(width,height,[0,0],'red')
        .concat(makeSquare(width,height,[688,664],'green'))
        ,
        "backgroundColor": "rgb(100,100,100)"
    };
};
