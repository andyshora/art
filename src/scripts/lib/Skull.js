const SAMPLE_RATE = 6;

class Skull {
  constructor(options) {

    if (typeof d3 === 'undefined') {
      return console.error('D3.js has not been loaded.');
    }

    this.positions = [];
    this.points = [];

    this.container = document.getElementById('container');
    this.name = options.name;
    this.frameNum = 0;
    this.init();
    this.drawSkull();
    this.render();

    this.dimensions = {
      width: 800,
      height: 800
    };
  }
  init() {
    this.svgContainer = d3.select(this.container).append('svg');
  }
  render() {

    this.frameNum++;

    const STEP = 4;

    // check if positions need moving
    for (var i = 0; i < this.positions.length; i++) {
      let p = this.positions[i];
      let c = this.points[i];

      if (p.x0 !== p.x) {
        // move 1 step towards target position
        let diff = p.x - p.x0;
        let newX = ~~(diff > 0 ? p.x0 + STEP : p.x0 - STEP);

        if (Math.abs(diff) < STEP) {
          newX = p.x;
        }

        c.attr('cx', newX);
        p.x0 = newX;
      }

      if (p.y0 !== p.y) {
        // move 1 step towards target position
        let diff = p.y - p.y0;
        let newY = ~~(diff > 0 ? p.y0 + STEP : p.y0 - STEP);

        if (Math.abs(diff) < STEP) {
          newY = p.y;
        }

        c.attr('cy', newY);
        p.y0 = newY;
      }
    }

    requestAnimationFrame(this.render.bind(this));
  }
  drawSkull() {
    let skull = this.svgContainer.append('g').attr('transform', 'translate(0,0)');

    let canvas = document.createElement('canvas');
    
    let img = document.createElement('img');
    img.src = '/assets/images/skull.jpg';
    img.onload = () => {

      this.svgContainer.attr('width', this.dimensions.width);
      this.svgContainer.attr('height', this.dimensions.height);

      // invisible canvas stuff
      canvas.width = img.width;
      canvas.height = img.height;

      let ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      let imgData = ctx.getImageData(0, 0, img.width, img.height);
      this.pixels = imgData.data;

      let imgWidth = img.width;
      let imgHeight = img.height;

      let n = 0;

      for (var i = 0; i < imgHeight; i+=SAMPLE_RATE) {
        for (var j = 0; j < imgWidth; j+=SAMPLE_RATE) {

          let offsetY = imgWidth * 4 * i;

          let r = this.pixels[offsetY + (j * 4)];        
          let g = this.pixels[offsetY + (j * 4) + 1];
          let b = this.pixels[offsetY + (j * 4) + 2];
          let a = this.pixels[offsetY + (j * 4) + 3];

          let p = {
            x0: ~~(Math.random() * imgWidth),
            y0: ~~(Math.random() * imgHeight),
            sourceX: j,
            sourceY: i,
            x: j - (SAMPLE_RATE / 2),
            y: i - (SAMPLE_RATE / 2),
            r: SAMPLE_RATE / 2
          };

          let circle = skull.append('circle')
            .attr('cx', p.x0)
            .attr('cy', p.y0)
            .attr('r', p.r)
            .attr('class', d => {
              const numberedClass = `skull-point--${n % 3}`;
              return r < 200 ? `skull-point skull-point--active`: `skull-point`;
            });

          this.positions.push(p);
          this.points.push(circle);

          n++;
        }
      }

      console.log('this.positions', this.positions);

    };



    canvas.appendChild(img);
  }
  
}

export default Skull;


