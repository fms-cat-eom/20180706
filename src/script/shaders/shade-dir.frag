#define saturate(i) clamp(i,0.,1.)

precision highp float;

varying vec3 vPos;
varying vec3 vNor;
varying vec4 vCol;

uniform vec3 cameraPos;
uniform vec3 lightDir;

// ------

void main() {
  vec3 ld = normalize( lightDir );
  vec3 dif = vCol.xyz * (
    saturate( mix( 0.5, 1.0, dot( -vNor, ld ) ) )
  );

  float depth = length( vPos - cameraPos );

  gl_FragColor = vec4( dif, 1.0 );
}