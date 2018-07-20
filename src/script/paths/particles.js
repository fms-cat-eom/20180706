// == load some modules ========================================================
const Xorshift = require( '../libs/xorshift' );
const glslify = require( 'glslify' );

// == roll the dice ============================================================
const seed = 1145141919810; // あのさぁ……
let xorshift = new Xorshift( seed );

// == define some particle related constants ===================================
const particlePixels = 2;
const particlesSqrt = 64;
const particles = particlesSqrt * particlesSqrt;

module.exports = ( glCatPath, automaton ) => {
  // == prepare gl context =====================================================
  let glCat = glCatPath.glCat;
  let gl = glCat.gl;

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
    particlesComputeReturn: {
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
        glCat.uniformTexture( 'sampler0', glCatPath.fb( 'particlesCompute' ).texture, 0 );
        gl.drawArrays( gl.TRIANGLE_STRIP, 0, 4 );
      }
    },

    particlesCompute: {
      width: particlesSqrt * particlePixels,
      height: particlesSqrt,
      vert: glslify( '../shaders/quad.vert' ),
      frag: glslify( '../shaders/particles-compute.frag' ),
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

        glCat.uniformTexture( 'samplerPcompute', glCatPath.fb( 'particlesComputeReturn' ).texture, 0 );
        glCat.uniformTexture( 'samplerRandom', textureRandom, 1 );

        gl.drawArrays( gl.TRIANGLE_STRIP, 0, 4 );
      }
    },

    particlesRender: {
      vert: glslify( '../shaders/particles-render.vert' ),
      frag: glslify( '../shaders/particles-render.frag' ),
      blend: [ gl.SRC_ALPHA, gl.ONE ],
      depthWrite: false,
      func: ( path, params ) => {
        glCat.attribute( 'computeUV', vboParticleUV, 2 );

        glCat.uniform1f( 'particlesSqrt', particlesSqrt );
        glCat.uniform1f( 'particlePixels', particlePixels );

        glCat.uniform2fv( 'resolutionPcompute', [ particlesSqrt * particlePixels, particlesSqrt ] );
        glCat.uniformTexture( 'samplerPcompute', glCatPath.fb( 'particlesCompute' ).texture, 1 );

        glCat.uniform3fv( 'color', [ 0.1, 2.0, 1.0 ] );

        gl.drawArrays( gl.POINTS, 0, particles );
      }
    },
  } );
};