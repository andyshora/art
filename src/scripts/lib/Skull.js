class Skull {
  constructor(options) {

    if (typeof d3 === 'undefined') {
      return console.error('D3.js has not been loaded.');
    }

    this.container = document.getElementById('container');
    this.name = options.name;
    this.init();
    this.drawSkull();
  }
  init() {
    this.svgContainer = d3.select(this.container).append('svg');
  }
  drawSkull() {
    let skull = this.svgContainer.append('g').attr('transform', 'translate(0,0)');

    let canvas = document.createElement('canvas');
    
    let img = document.createElement('img');
    img.src = '/assets/images/skull.jpg';
    img.onload = () => {
      console.log('img loaded');

      this.svgContainer.attr('height', img.height);
      this.svgContainer.attr('width', img.width);

      canvas.width = img.width;
      canvas.height = img.height;

      let ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      let imgData = ctx.getImageData(0, 0, img.width, img.height);

      this.pixels = imgData.data;
      const sampleRate = 2;

      let width = img.width;
      let height = img.height;

      for (var i = 0; i < height; i+=sampleRate) {
        for (var j = 0; j < width; j+=sampleRate) {

          let offsetY = width * 4 * i;

          let r = this.pixels[offsetY + (j * 4)];        
          let g = this.pixels[offsetY + (j * 4) + 1];
          let b = this.pixels[offsetY + (j * 4) + 2];
          let a = this.pixels[offsetY + (j * 4) + 3];

          let circleColor = r < 200 ? 'yellow' : 'black';

          let circle = skull.append('circle')
            .attr('cx', j - (sampleRate / 2))
            .attr('cy', i - (sampleRate / 2))
            .attr('r', sampleRate / 2)
            .attr('class', r < 200 ? 'skull-point skull-point--active': 'skull-point');


        }
      }

    };



    canvas.appendChild(img);
  }
  
}

export default Skull;


