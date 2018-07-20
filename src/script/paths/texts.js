// == load some modules ========================================================
const Xorshift = require( '../libs/xorshift' );
const glslify = require( 'glslify' );

// == roll the dice ============================================================
const seed = 218351414;
let xorshift = new Xorshift( seed );

// == define some particle related constants ===================================
const particlePixels = 1;
const particlesSqrt = 4;
const particles = particlesSqrt * particlesSqrt;

module.exports = ( glCatPath, automaton, width, height ) => {
  // == prepare gl context =====================================================
  let glCat = glCatPath.glCat;
  let gl = glCat.gl;

  // == prepare canvas =========================================================
  const spriteSize = 64;
  const sheetSize = spriteSize * 16;
  let canvas = document.createElement( 'canvas' );
  canvas.width = sheetSize;
  canvas.height = sheetSize;
  let context = canvas.getContext( '2d' );

  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillStyle = '#fff';

  context.clearRect( 0, 0, width, height );

  let textureSheet = glCat.createTexture();

  let font = `${spriteSize * 0.9}px Exo`;
  document.fonts.load( font ).then( () => {
    context.font = font;
    for ( let i = 0; i < 256; i ++ ) {
      let char = String.fromCharCode( i );
      let x = ( ( i % 16 ) + 0.5 ) * spriteSize;
      let y = ( Math.floor( i / 16 ) + 0.5 ) * spriteSize;
      context.fillText( char, x, y );
    }
    glCat.setTexture( textureSheet, canvas );
  } );

  // == prepare vbos ===========================================================
  const vboQuad = glCat.createVertexbuffer( [ -1, -1, 1, -1, -1, 1, 1, 1 ] );

  const vboParticleUV = glCat.createVertexbuffer( ( () => {
    let ret = [];
    for ( let i = 0; i < particles; i ++ ) {
      let ix = i % particlesSqrt;
      let iy = Math.floor( i / particlesSqrt );

      ret.push( ix * particlePixels );
      ret.push( iy );
    }
    return ret;
  } )() );

  // == random textures ========================================================
  const textureRandomSize = 32;
  const textureRandomUpdate = ( _tex ) => {
    glCat.setTextureFromArray( _tex, textureRandomSize, textureRandomSize, ( () => {
      let len = textureRandomSize * textureRandomSize * 4;
      let ret = new Uint8Array( len );
      for ( let i = 0; i < len; i ++ ) {
        ret[ i ] = Math.floor( xorshift.gen() * 256.0 );
      }
      return ret;
    } )() );
  };

  let textureRandomStatic = glCat.createTexture();
  glCat.textureWrap( textureRandomStatic, gl.REPEAT );
  textureRandomUpdate( textureRandomStatic );

  let textureRandom = glCat.createTexture();
  glCat.textureWrap( textureRandom, gl.REPEAT );

  glCatPath.add( {
    textsComputeReturn: {
      width: particlesSqrt * particlePixels,
      height: particlesSqrt,
      vert: glslify( '../shaders/quad.vert' ),
      frag: glslify( '../shaders/return.frag' ),
      blend: [ gl.ONE, gl.ZERO ],
      clear: [ 0.0, 0.0, 0.0, 0.0 ],
      framebuffer: true,
      float: true,
      func: ( path, params ) => {
        glCat.attribute( 'p', vboQuad, 2 );
        glCat.uniformTexture( 'sampler0', glCatPath.fb( 'textsCompute' ).texture, 0 );
        gl.drawArrays( gl.TRIANGLE_STRIP, 0, 4 );
      }
    },

    textsCompute: {
      width: particlesSqrt * particlePixels,
      height: particlesSqrt,
      vert: glslify( '../shaders/quad.vert' ),
      frag: glslify( '../shaders/texts-compute.frag' ),
      blend: [ gl.ONE, gl.ZERO ],
      clear: [ 0.0, 0.0, 0.0, 0.0 ],
      framebuffer: true,
      float: true,
      func: ( path, params ) => {
        if ( automaton.progress % 1.0 === 0.0 ) {
          xorshift.set( seed );
        }
        textureRandomUpdate( textureRandom );

        glCat.attribute( 'p', vboQuad, 2 );

        glCat.uniform1f( 'particlesSqrt', particlesSqrt );
        glCat.uniform1f( 'particlePixels', particlePixels );

        glCat.uniformTexture( 'samplerPcompute', glCatPath.fb( 'textsComputeReturn' ).texture, 0 );
        glCat.uniformTexture( 'samplerRandom', textureRandom, 1 );

        gl.drawArrays( gl.TRIANGLE_STRIP, 0, 4 );
      }
    },

    textsRender: {
      vert: glslify( '../shaders/texts-render.vert' ),
      frag: glslify( '../shaders/texts-render.frag' ),
      blend: [ gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA ],
      depthWrite: false,
      depthTest: false,
      func: ( path, params ) => {
        glCat.attribute( 'computeUV', vboParticleUV, 2 );

        glCat.uniform1f( 'particlesSqrt', particlesSqrt );
        glCat.uniform1f( 'particlePixels', particlePixels );

        glCat.uniform2fv( 'resolutionPcompute', [ particlesSqrt * particlePixels, particlesSqrt ] );
        glCat.uniformTexture( 'samplerSheet', textureSheet, 0 );
        glCat.uniformTexture( 'samplerPcompute', glCatPath.fb( 'textsCompute' ).texture, 1 );

        glCat.uniform3fv( 'color', [ 1.0, 1.3, 1.2 ] );

        gl.drawArrays( gl.POINTS, 0, particles );
      }
    },
  } );
};