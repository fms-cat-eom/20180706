#define PI 3.14159265
#define TAU 6.28318531
#define saturate(i) clamp(i,0.,1.)

// ------

precision highp float;

varying vec3 vPos;
varying vec3 vNor;
varying float vLife;
varying float vSize;

uniform vec3 color;
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
  float emit = 0.1 + 2.0 * vSize;
  float len = length( gl_PointCoord.xy - 0.5 );
  float shape = smoothstep( 0.5, 0.4, len );

  gl_FragColor = vec4(
    emit * vec3( 1.0, 0.1, 0.3 ),
    shape
  );
}