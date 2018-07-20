#define PARTICLE_LIFE_LENGTH 1.0

#define HUGE 9E16
#define PI 3.14159265
#define TAU 6.283185307
#define V vec3(0.,1.,-1.)
#define saturate(i) clamp(i,0.,1.)
#define lofi(i,m) (floor((i)/(m))*(m))
#define lofir(i,m) (floor((i)/(m)+.5)*(m))

// ------

precision highp float;

uniform float time;
uniform float progress;
uniform float automatonLength;

uniform float particlesSqrt;
uniform float particlePixels;

uniform float totalFrame;
uniform bool init;
uniform float deltaTime;
uniform vec2 resolution;

uniform sampler2D samplerPcompute;
uniform sampler2D samplerRandom;

// ------

vec2 vInvert( vec2 _uv ) {
  return vec2( 0.0, 1.0 ) + vec2( 1.0, -1.0 ) * _uv;
}

// ------

float fractSin( float i ) {
  return fract( sin( i ) * 1846.42 );
}

vec4 random( vec2 _uv ) {
  return texture2D( samplerRandom, _uv );
}

#pragma glslify: prng = require( ./prng );

// ------

void main() {
  vec2 uv = gl_FragCoord.xy / resolution;
  vec2 puv = vec2( ( floor( gl_FragCoord.x / particlePixels ) * particlePixels + 0.5 ) / resolution.x, uv.y );
  float number = ( ( gl_FragCoord.x - 0.5 ) / particlePixels ) + ( ( gl_FragCoord.y - 0.5 ) * particlesSqrt );
  float mode = mod( gl_FragCoord.x, particlePixels );
  vec2 dpix = vec2( 1.0 ) / resolution;

  float dt = deltaTime;

  // == prepare some vars for fuck around particles ============================
  vec4 seed = texture2D( samplerRandom, puv );
  prng( seed );

  vec4 pos = texture2D( samplerPcompute, puv );

  float timing = mix( 0.0, PARTICLE_LIFE_LENGTH, number / particlesSqrt / particlesSqrt );
  timing += lofi( time, PARTICLE_LIFE_LENGTH );

  if ( time - deltaTime + PARTICLE_LIFE_LENGTH < timing ) {
    timing -= PARTICLE_LIFE_LENGTH;
  }

  // == initialize particles ===================================================
  if ( time - deltaTime < timing && timing <= time ) {
    dt = time - timing;

    pos.xy = 2.0 * vec2(
      prng( seed ) - 0.5,
      prng( seed ) - 0.5
    );
    pos.xy = lofir( pos.xy, 1.0 / 6.0 );
    pos.z = 33.0 + floor( prng( seed ) * 64.0 );

    pos.w = 1.0; // life
  } else {
    // do nothing
  }

  // == update particles =======================================================
  pos.x += prng( seed ) < 0.01 ? 0.03 : 0.0;
  pos.w -= dt / PARTICLE_LIFE_LENGTH;

  gl_FragColor = pos;
}