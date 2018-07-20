#define saturate(i) clamp(i,0.,1.)

precision highp float;

varying vec3 vPos;
varying vec3 vNor;

uniform vec3 color;
uniform vec3 cameraPos;
uniform vec3 lightPos;

// ------

void main() {
  vec3 ld = normalize( vPos - lightPos );
  vec3 dif = 200.0 * color * (
    saturate( mix( 0.7, 1.0, dot( -vNor, ld ) ) )
    / pow( length( vPos - lightPos ), 2.0 )
  );

  float depth = length( vPos - cameraPos );

  gl_FragColor = vec4( dif, 1.0 );
}