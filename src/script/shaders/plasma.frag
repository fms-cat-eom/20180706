#define PI 3.14159265

// ------

precision highp float;

uniform float time;
uniform float progress;
uniform vec2 resolution;

// ------

void main() {
  vec2 uv = gl_FragCoord.xy / resolution;
  float ph = progress * PI * 2.0;

  float amp = 0.0;
  amp += sin( 20.0 * uv.x + ph );
  amp += sin( 8.0 * (
    ( uv.x - 0.5 ) * sin( ph * 2.0 ) +
    ( uv.y - 0.5 ) * sin( ph + 1.3 )
  ) + ph );
  vec2 c = 0.5 + 0.1 * vec2( sin( ph ), sin( ph * 2.0 + 4.0 ) );
  amp += sin( 20.0 * length( uv - c ) - ph * 3.0 );
  amp *= 2.0;

  gl_FragColor = 0.5 + 0.5 * vec4(
    sin( amp ),
    sin( amp + 1.0 ),
    sin( amp + 2.0 ),
    1.0
  );
}