// == load some modules ========================================================
const UltraCat = require( '../libs/ultracat' );
const MathCat = require( '../libs/mathcat' );
const Xorshift = require( '../libs/xorshift' );
const genOctahedron = require( '../geoms/octahedron.js' );
const glslify = require( 'glslify' );

// == roll the dice ============================================================
const seed = 13789056789;
let xorshift = new Xorshift( seed );

module.exports = ( glCatPath, automaton ) => {
  // == prepare gl context =====================================================
  let glCat = glCatPath.glCat;
  let gl = glCat.gl;

  // == prepare vbos ===========================================================
  const oct = genOctahedron( { div: 1.0 } );
  const vboPos = glCat.createVertexbuffer( oct.position );
  const vboNor = glCat.createVertexbuffer( oct.normal );
  const vboOrigin = glCat.createVertexbuffer();
  const ibo = glCat.createIndexbuffer( oct.index );
  const iboLine = glCat.createIndexbuffer( UltraCat.triIndexToLineIndex( oct.index ) );

  const rad = 2.0;
  let origins = [
    [  rad,  0.0,  0.0 ],
    [ -rad,  0.0,  0.0 ],
    [  0.0,  rad,  0.0 ],
    [  0.0, -rad,  0.0 ],
    [  0.0,  0.0,  rad ],
    [  0.0,  0.0, -rad ]
  ];
  let originsPos = [
    [  rad,  0.0,  0.0 ],
    [ -rad,  0.0,  0.0 ],
    [  0.0,  rad,  0.0 ],
    [  0.0, -rad,  0.0 ],
    [  0.0,  0.0,  rad ],
    [  0.0,  0.0, -rad ]
  ];
  let originsVel = [
    [  0.0,  0.0,  0.0 ],
    [  0.0,  0.0,  0.0 ],
    [  0.0,  0.0,  0.0 ],
    [  0.0,  0.0,  0.0 ],
    [  0.0,  0.0,  0.0 ],
    [  0.0,  0.0,  0.0 ]
  ];

  // ------

  glCatPath.add( {
    shuffle: {
      vert: glslify( '../shaders/shuffle.vert' ),
      frag: glslify( '../shaders/shade.frag' ),
      blend: [ gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA ],
      func: ( path, params ) => {
        // == initialize the dice, if it needs =================================
        if ( automaton.progress % 1.0 === 0.0 ) {
          xorshift.set( seed );
          origins = [
            [  rad,  0.0,  0.0 ],
            [ -rad,  0.0,  0.0 ],
            [  0.0,  rad,  0.0 ],
            [  0.0, -rad,  0.0 ],
            [  0.0,  0.0,  rad ],
            [  0.0,  0.0, -rad ]
          ];
        }

        // == shuffle ==========================================================
        if ( automaton.clock.frame % 30.0 === 0.0 ) {
          UltraCat.shuffleArrayD( origins, () => xorshift.gen() );
        }

        // == update ===========================================================
        let arr = [];
        for ( let i = 0; i < origins.length; i ++ ) {
          // damped spring!!
          const k = 200.0;
          originsVel[ i ] = MathCat.vecAdd(
            originsVel[ i ],
            MathCat.vecScale( automaton.deltaTime, MathCat.vecSub(
              MathCat.vecScale( -k, MathCat.vecSub( originsPos[ i ], origins[ i ] ) ),
              MathCat.vecScale( 2.0 * Math.sqrt( k ), originsVel[ i ] )
            ) )
          );
          originsPos[ i ] = MathCat.vecAdd(
            originsPos[ i ],
            MathCat.vecScale( automaton.deltaTime, originsVel[ i ] )
          );
          arr.push( ...originsPos[ i ] );
        }

        glCat.setVertexbuffer( vboOrigin, arr, gl.DYNAMIC_DRAW );

        // == draw =============================================================
        glCat.attribute( 'pos', vboPos, 3 );
        glCat.attribute( 'nor', vboNor, 3 );
        glCat.attribute( 'origin', vboOrigin, 3, 1 );

        let matM = MathCat.mat4Identity();
        matM = MathCat.mat4Apply( MathCat.mat4RotateX( automaton.progress * Math.PI ), matM );
        matM = MathCat.mat4Apply( MathCat.mat4RotateZ( automaton.progress * Math.PI * 2.0 ), matM );
        glCat.uniformMatrix4fv( 'matM', matM );

        glCat.uniform1f( 'size', 0.8 );
        glCat.uniform3fv( 'color', [ 0.06, 0.08, 0.1 ] );

        let ext = glCat.getExtension( 'ANGLE_instanced_arrays' );
        gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, ibo );
        ext.drawElementsInstancedANGLE( gl.TRIANGLES, ibo.length, gl.UNSIGNED_SHORT, 0, origins.length );
        gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, null );
      }
    },

    shuffleLines: {
      vert: glslify( '../shaders/shuffle.vert' ),
      frag: glslify( '../shaders/color.frag' ),
      blend: [ gl.SRC_ALPHA, gl.ON ],
      func: ( path, params ) => {
        glCat.attribute( 'pos', vboPos, 3 );
        glCat.attribute( 'nor', vboNor, 3 );
        glCat.attribute( 'origin', vboOrigin, 3, 1 );

        let matM = MathCat.mat4Identity();
        matM = MathCat.mat4Apply( MathCat.mat4RotateX( automaton.progress * Math.PI ), matM );
        matM = MathCat.mat4Apply( MathCat.mat4RotateZ( automaton.progress * Math.PI * 2.0 ), matM );
        glCat.uniformMatrix4fv( 'matM', matM );

        glCat.uniform1f( 'size', 1.1 );
        glCat.uniform3fv( 'color', [ 4.0, 0.4, 1.2 ] );

        let ext = glCat.getExtension( 'ANGLE_instanced_arrays' );
        gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, iboLine );
        ext.drawElementsInstancedANGLE( gl.LINES, iboLine.length, gl.UNSIGNED_SHORT, 0, origins.length );
        gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, null );
      }
    }
  } );
};