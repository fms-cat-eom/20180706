#define PI 3.14159265
#define TAU 6.28318531
#define saturate(i) clamp(i,0.,1.)

// ------

precision highp float;

varying vec3 vPos;
varying float vLife;
varying float vSize;
varying float vIsOkayToDraw;

uniform vec3 cameraPos;
uniform float cameraNear;
uniform float cameraFar;
uniform vec3 lightPos;

// ------

vec3 catColor( float _p ) {
  return 0.5 + 0.5 * vec3(
    cos( _p ),
    cos( _p + PI / 3.0 * 2.0 ),
    cos( _p + PI / 3.0 * 4.0 )
  );
}

mat2 rotate2D( float _t ) {
  return mat2( cos( _t ), sin( _t ), -sin( _t ), cos( _t ) );
}

// ------

void main() {
  if ( vIsOkayToDraw < 0.5 ) { discard; }

  float emit = 0.2 + 4.0 * vSize;
  vec3 color = vec3( 1.0, 0.1, 0.3 );

  gl_FragColor = vec4(
    emit * color,
    1.0
  );
}