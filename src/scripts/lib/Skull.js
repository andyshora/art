const SAMPLE_RATE = 6;
const STEP = 2;

class Skull {
  constructor(options) {

    if (typeof d3 === 'undefined') {
      return console.error('D3.js has not been loaded.');
    }

    this.positions = [];
    this.points = [];

    this.dimensions = {
      width: 500,
      height: 500,
      radius: 6
    };

    this.container = document.getElementById('container');
    this.name = options.name;
    this.frameNum = 0;
    this.init();
    this.drawOuterBars();
    this.drawSkull();
    this.render();

    this.entryType = options.entryType;
    this.step = options.step;
    this.colorScale = chroma.scale(['rgb(255,0,0)', options.color]);

  }
  init() {
    this.svgContainer = d3.select(this.container).append('svg');
    this.lastFrameTime = 0;
  }
  render() {

    this.frameNum++;

    const ts = +new Date;
    // console.log((ts - this.lastFrameTime) - 16);

    this.lastFrameTime = ts;
    
    // skip every other frame to allow for 33ms processing time
    const doWork = true;// this.frameNum % 3 === 0;

    if (doWork) {
      // check if positions need moving
      for (var i = 0; i < this.positions.length; i++) {
        let p = this.positions[i];
        let c = this.points[i];

        if (p.x0 !== p.x) {
          // move 1 step towards target position
          let diff = p.x - p.x0;
          let newX = ~~(diff > 0 ? p.x0 + this.step : p.x0 - this.step);

          if (Math.abs(diff) < this.step) {
            newX = p.x;
          }

          // only update node if it's visible
          if (newX >= 0 && newX <= this.dimensions.width) {
            c.attr('cx', newX);
          }
          p.x0 = newX;
        }

        if (p.y0 !== p.y) {
          // move 1 step towards target position
          let diff = p.y - p.y0;
          let newY = ~~(diff > 0 ? p.y0 + this.step : p.y0 - this.step);

          if (Math.abs(diff) < this.step) {
            newY = p.y;
          }

          // only update node if it's visible
          if (newY >= 0 && newY <= this.dimensions.height) {
            c.attr('cy', newY);
            const colorScaleFactor = Math.abs(diff) < this.step ? 1 : 1 - (Math.abs(diff) / 500);

            let targetColor = this.colorScale(colorScaleFactor);
            c.style('fill', targetColor);
          }
          p.y0 = newY;
        }
      }
    }

    requestAnimationFrame(this.render.bind(this));

  }
  initPoints() {

    // invisible canvas stuff
    this.tempCanvas.width = this.sourceImg.width;
    this.tempCanvas.height = this.sourceImg.height;

    let ctx = this.tempCanvas.getContext('2d');
    ctx.drawImage(this.sourceImg, 0, 0);
    let imgData = ctx.getImageData(0, 0, this.sourceImg.width, this.sourceImg.height);
    this.pixels = imgData.data;

    let imgWidth = this.sourceImg.width;
    let imgHeight = this.sourceImg.height;

    // resize new canvas
    let ratio = imgWidth / imgHeight;
    this.dimensions.width = this.dimensions.height * ratio;
    this.svgContainer.attr('width', this.dimensions.width + 140);
    this.svgContainer.attr('height', this.dimensions.height + 40);

    const xOffset = (this.dimensions.width - imgWidth) / 2;

    // transform canvas
    this.skull.attr('transform', `translate(${xOffset},0)`);

    let n = 0;

    for (var i = imgHeight; i >= 0; i -= SAMPLE_RATE) {
      for (var j = 0; j < imgWidth; j += SAMPLE_RATE) {

        let offsetY = imgWidth * 4 * i;

        let r = this.pixels[offsetY + (j * 4)];        
        let g = this.pixels[offsetY + (j * 4) + 1];
        let b = this.pixels[offsetY + (j * 4) + 2];
        let a = this.pixels[offsetY + (j * 4) + 3];

        let targetX = (j / imgWidth) * this.dimensions.width;
        let targetY = (i / imgHeight) * this.dimensions.height;

        let yBoost = (Math.abs(j - (imgWidth / 2)) / imgWidth) * -200;

        let x0 = 0;
        let y0 = 0;

        switch (this.entryType) {
          case 1:
            x0 = targetX;
            y0 = targetY + imgHeight + yBoost + n - ~~(Math.random() * 10) * 10;
          break;
          case 2:
            x0 = (imgWidth / 2) + Math.sin(n * Math.PI / 180) * (imgWidth / 2);
            y0 = (imgHeight / 2) + Math.cos(n * Math.PI / 180) * (imgHeight / 2);
          break;
          case 3:
            x0 = ~~(Math.random() * imgWidth);
            y0 = ~~(Math.random() * imgHeight);
          break;
          default:
            x0 = 0;
            y0 = 0;
          break;
        }

        let p = {
          x0: x0,
          y0: y0,
          sourceX: targetX,
          sourceY: targetY,
          x: targetX - (this.dimensions.radius / 2),
          y: targetY - (this.dimensions.radius / 2),
          r: this.dimensions.radius / 2
        };

        let circle = this.skull.append('circle')
          .attr('cx', p.x0)
          .attr('cy', p.y0)
          .attr('r', p.r)
          .attr('class', d => {
            const numberedClass = `skull-point--${n % 3}`;
            return r < 200 ? `skull-point skull-point--active`: `skull-point`;
          });

        if (r < 200) {
          this.positions.push(p);
          this.points.push(circle);
          n++;
        }

        
      }
    }
  }
  interpolateSegmentPath(x, y, r, startAngle, endAngle) {
    return t =>  this.generateSvgSegment(x, y, r, startAngle, startAngle + ((endAngle - startAngle) * t));
  }
  generateSvgSegment(x, y, r, startAngle, endAngle) {

    startAngle *= (Math.PI / 180);
    endAngle *= (Math.PI / 180);

    if (startAngle > endAngle) {
      let s = startAngle;
      startAngle = endAngle;
      endAngle = s;
    }

    let largeArc = endAngle - startAngle <= Math.PI ? 0 : 1;

    return ['M', x, y, 'L', x + Math.cos(startAngle) * r, y - (Math.sin(startAngle) * r),
            'A', r, r, 0, largeArc, 0, x + Math.cos(endAngle) * r, y - (Math.sin(endAngle) * r)
           ].join(' ');
  }
  drawOuterBars() {
    this.bars = this.svgContainer.append('g').attr('transform', `translate(250,250)`);

    console.log('this.dimensions', this.dimensions);

    this.bars
      .append('path')
      .attr('fill', 'rgb(243,243,21)')
      // .attr('class', 'node-body__segment')
      .transition()
      .delay(200)
      .duration(2000)
      .attrTween('d', () => {

        // arc fans out
        return this.interpolateSegmentPath(0, 0, (this.dimensions.height / 2), 90, 90 - 359.99);
      });
  }
  drawSkull() {
    this.skull = this.svgContainer.append('g');

    this.tempCanvas = document.createElement('canvas');
    
    this.sourceImg = document.createElement('img');
    this.sourceImg.src = '/assets/images/skull.jpg';
    this.sourceImg.onload = this.initPoints.bind(this);

    this.tempCanvas.appendChild(this.sourceImg);
  }
  
}

export default Skull;


