class Art1 {
  constructor(options) {

    if (typeof THREE === 'undefined') {
      return console.error('Three.js has not been loaded.');
    }

    this.container = document.getElementById( 'container' );
    this.name = options.name;
    this.init();
  }
  init() {
    

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 1000 );
    this.camera.position.x = 15;
    this.camera.position.y = 16;
    this.camera.position.z = 13;

    this.camera.lookAt(this.scene.position);

    this.shaderAttributes = {
      position: null,
      colors: null,
      pSizeArr: null,
      pOpacityArr: null
    };
    this.dimensions = {
      nodeSize: 3
    };

    this.renderer = new THREE.WebGLRenderer( { antialias: true } );
    this.renderer.setClearColor(0xffffff, 1.0);
    this.renderer.setPixelRatio( window.devicePixelRatio );
    this.renderer.setSize( window.innerWidth, window.innerHeight );

    this.stats = new Stats();
    this.stats.setMode(0); // 0: fps, 1: ms, 2: mb

    this.orbit = new THREE.OrbitControls(this.camera, this.renderer.domElement);
    this.orbit.maxDistance = 1000;
    this.orbit.minDistance = 10;
    this.orbit.zoomSpeed = 0.5;
    this.orbit.autoRotate = false;

    this.stats.domElement.style.position = 'absolute';
    this.stats.domElement.style.top = '0px';

    this.container.appendChild( this.renderer.domElement );

    // this.addFloor();
    this.addEye();

    // window.addEventListener( 'resize', this.onWindowResize.bind(this), false );
    // window.addEventListener( 'mousedown', this.onMouseDown.bind(this), false );
    // window.addEventListener( 'mouseup', this.onMouseUp.bind(this), false );
    // window.addEventListener( 'mousemove', this.onMouseMove.bind(this), false );

    
    document.body.appendChild( this.stats.domElement );

    this.renderer.render(this.scene, this.camera);
    this.render();
  }
  addFloor() {
      var floorGeometry = new THREE.PlaneGeometry(10, 10, 20, 20);
      var floorMaterial = new THREE.MeshPhongMaterial();
      floorMaterial.map = THREE.ImageUtils.loadTexture('../assets/textures/floor_2-1024x1024.png');
      floorMaterial.map.wrapS = floorMaterial.map.wrapT = THREE.RepeatWrapping;
      floorMaterial.map.repeat.set(8, 8);
      var floorMesh = new THREE.Mesh(floorGeometry, floorMaterial);
      floorMesh.receiveShadow = true;
      floorMesh.rotation.x = -0.5 * Math.PI;
      this.scene.add(floorMesh);
  }
  addEye() {

    let eyeGeom = new THREE.SphereGeometry(this.dimensions.nodeSize, 20, 20);
    let eyeMat = new THREE.MeshPhongMaterial();

    let onEyeTextureLoaded = () => {
      console.log(eyeMat);
      let eye = new THREE.Mesh(eyeGeom, eyeMat);
      eye.position.x = 0;
      eye.position.y = 0;
      eye.position.z = 0;

      this.scene.add(eye);
    };

    
    eyeMat.map = new THREE.TextureLoader().load('../assets/textures/eyes/green-1024.png', onEyeTextureLoaded.bind(this));
    eyeMat.shading = THREE.SmoothShading;
    eyeMat.transparent = false;
    // eyeMat.map.wrapS = eyeMat.map.wrapT = THREE.RepeatWrapping;
    // eyeMat.map.repeat.set(4, 4);
    // eyeMat.side = THREE.DoubleSide;
    eyeMat.depthWrite = false;
    // eyeMat.color = new THREE.Color(0xff0000);

    let light = new THREE.AmbientLight( 0xffffff ); // soft white light
    this.scene.add(light);
  }
  addEyes() {

    const NUM_POINTS = 10;
    const NODE_SIZE = 10;

    this.pointsGeometry = new THREE.BufferGeometry();

    this.shaderAttributes.position = new Float32Array(NUM_POINTS * 3); // three components per vertex
    this.shaderAttributes.colors = new Float32Array(NUM_POINTS * 3);
    this.shaderAttributes.pSizeArr = new Float32Array(NUM_POINTS);
    this.shaderAttributes.pOpacityArr = new Float32Array(NUM_POINTS);

    for (var i = 0; i < NUM_POINTS; i++) {

      let x = i * 20;
      let y = i * 20;
      let z = 0;

      this.shaderAttributes.colors[i * 3] = 255;
      this.shaderAttributes.colors[i * 3 + 1] = 255;
      this.shaderAttributes.colors[i * 3 + 2] = 0;

      this.shaderAttributes.position[i * 3] = x;
      this.shaderAttributes.position[i * 3 + 1] = y;
      this.shaderAttributes.position[i * 3 + 2] = z;

      this.shaderAttributes.pSizeArr[i] = NODE_SIZE;
      this.shaderAttributes.pOpacityArr[i] = 1;// Math.random() / 4 + 0.5;
    }

    this.pointsGeometry.addAttribute( 'position', new THREE.BufferAttribute( this.shaderAttributes.position, 3 ) );
    this.pointsGeometry.addAttribute( 'color', new THREE.BufferAttribute( this.shaderAttributes.colors, 3 ) );
    this.pointsGeometry.addAttribute( 'pSize', new THREE.BufferAttribute( this.shaderAttributes.pSizeArr, 1 ) );
    this.pointsGeometry.addAttribute( 'pOpacity', new THREE.BufferAttribute( this.shaderAttributes.pOpacityArr, 1 ) );

    // we'll get the basic shader stuff, so we don't have to define all the uniforms oursevles
    let basicShader = THREE.ShaderLib['points'];
    this.shaderUniforms = THREE.UniformsUtils.merge([basicShader.uniforms]);
    this.shaderUniforms['map'].value = new THREE.TextureLoader().load( '../assets/textures/eyes/blue-1024.jpg' );
    this.shaderUniforms['size'].value = 100;

    this.shaderUniforms['diffuse'].value = new THREE.Color(0xffffff);

    // Create a shadermaterial and add our shaders and our attributes and uniforms
    let pointCloudMaterial = new THREE.ShaderMaterial({
      uniforms: this.shaderUniforms,
      transparent: true,
      blending: THREE.AdditiveBlending,
      vertexShader: document.getElementById('vertexShader').text,
      fragmentShader: document.getElementById('fragmentShader').text
    });

    this.pointCloud = new THREE.Points(this.pointsGeometry, this.pointCloudMaterial);
    this.pointCloud.sizeAttenuation = true;

    this.scene.add(this.pointCloud);
  }
  resize(event) {

  }
  mousedown(event) {

  }
  mouseup(event) {

  }
  mousemove(event) {

  }
  render() {

    requestAnimationFrame(this.render.bind(this));

    this.renderer.render(this.scene, this.camera);
    this.stats.update();
    this.orbit.update();
  }
}

export default Art1;


