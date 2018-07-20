#define HUGE 9E16
#define PI 3.14159265
#define V vec3(0.,1.,-1.)
#define saturate(i) clamp(i,0.,1.)
#define lofi(i,m) (floor((i)/(m))*(m))

// ------

attribute vec3 pos;
attribute vec3 nor;
attribute vec3 origin;

uniform vec2 resolution;
uniform float size;
uniform vec3 color;

varying vec3 vPos;
varying vec3 vNor;
varying vec3 vCol;

uniform mat4 matP;
uniform mat4 matV;
uniform mat4 matM;

// ------

void main() {
  vec4 p = matM * vec4( pos * size + origin, 1.0 );
  vPos = p.xyz;

  mat4 matN = matM;
  matN[ 0 ] = normalize( matN[ 0 ] );
  matN[ 1 ] = normalize( matN[ 1 ] );
  matN[ 2 ] = normalize( matN[ 2 ] );
  matN[ 3 ] = vec4( 0.0, 0.0, 0.0, 1.0 );
  vNor = ( matN * vec4( nor, 1.0 ) ).xyz;

  vec4 outPos = matP * matV * p;
  outPos.x /= resolution.x / resolution.y;
  
  gl_Position = outPos;

  vCol = color;
}