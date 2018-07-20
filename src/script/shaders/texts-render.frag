#define PI 3.14159265
#define TAU 6.28318531
#define saturate(i) clamp(i,0.,1.)

// ------

precision highp float;

varying float vChar;
varying float vLife;

uniform vec3 color;
uniform float totalFrame;

uniform sampler2D samplerSheet;

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
  // blink
  if ( vLife < 0.1 && mod( totalFrame, 2.0 ) == 0.0 ) { discard; }

  vec2 uv = (
    vec2( mod( vChar, 16.0 ), floor( vChar / 16.0 ) ) / 16.0
    + gl_PointCoord / 16.0
  );
  float a = texture2D( samplerSheet, uv ).w;

  float curve = 0.5 + 0.6 * cos( PI * exp( 5.0 * ( vLife - 1.0 ) ) );
  if (
    curve < gl_PointCoord.y
    && abs( gl_PointCoord.x - 0.5 ) < 0.4
  ) {
    a = 1.0 - a;
  }

  gl_FragColor = vec4( color, a );
}