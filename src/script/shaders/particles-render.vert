#define HUGE 9E16
#define PI 3.141592654
#define TAU 6.283185307
#define V vec3(0.,1.,-1.)
#define saturate(i) clamp(i,0.,1.)
#define lofi(i,m) (floor((i)/(m))*(m))

// ------

attribute vec2 computeUV;

varying vec3 vPos;
varying float vLife;
varying float vSize;

uniform vec2 resolution;
uniform vec2 resolutionPcompute;
uniform mat4 matP;
uniform mat4 matV;

uniform sampler2D samplerPcompute;

#pragma glslify: noise = require( ./glsl-noise/simplex/4d );

// ------

mat2 rotate2D( float _t ) {
  return mat2( cos( _t ), sin( _t ), -sin( _t ), cos( _t ) );
}

void main() {
  vec2 puv = ( computeUV.xy + 0.5 ) / resolutionPcompute;
  vec2 dppix = vec2( 1.0 ) / resolutionPcompute;

  vec4 pos = texture2D( samplerPcompute, puv );
  vec4 vel = texture2D( samplerPcompute, puv + dppix * vec2( 1.0, 0.0 ) );

  vLife = pos.w;
  vPos = pos.xyz;
  vSize = sin( PI * ( 1.0 - vLife ) );

  float size = 0.04 * vSize;

  vec4 outPos = matP * matV * vec4( pos.xyz, 1.0 );
  outPos.x /= resolution.x / resolution.y;
  gl_Position = outPos;
  gl_PointSize = resolution.y * size / outPos.z;
}