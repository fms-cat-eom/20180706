let genRing = ( _props ) => {
  let props = Object.assign( {
    R: 1.0,
    r: 0.5,
    height: 0.5,
    div: 16
  }, _props );

  const R = Math.abs( props.R );
  const r = Math.min( Math.max( props.r, 0.0 ), R );
  const h = props.height / 2; // h
  const N = Math.max( props.div, 3 );

  let sinTable = [];
  let cosTable = [];
  for ( let i = 0; i < N; i ++ ) {
    const phase = i / N;
    sinTable[ i ] = Math.sin( 2.0 * Math.PI * phase );
    cosTable[ i ] = Math.sin( 2.0 * Math.PI * ( phase + 0.25 ) );
  }

  let sin = ( i ) => sinTable[ i % N ];
  let cos = ( i ) => cosTable[ i % N ];

  let pos = [];
  let nor = [];
  let ind = [];

  { // outside
    const i0 = pos.length / 3;
    const n = N * 2;
    for ( let ix = 0; ix < N; ix ++ ) {
      ind.push(
        i0 + ix * 2, i0 + ( ix * 2 + 2 ) % n, i0 + ( ix * 2 + 3 ) % n,
        i0 + ix * 2, i0 + ( ix * 2 + 3 ) % n, i0 + ix * 2 + 1
      );
      pos.push(
        R * sin( ix ), -h, R * cos( ix ),
        R * sin( ix ),  h, R * cos( ix )
      );
      nor.push(
        sin( ix ), 0.0, cos( ix ),
        sin( ix ), 0.0, cos( ix )
      );
    }
  }

  { // inside
    const i0 = pos.length / 3;
    const n = N * 2;
    for ( let ix = 0; ix < N; ix ++ ) {
      ind.push(
        i0 + ix * 2, i0 + ( ix * 2 + 2 ) % n, i0 + ( ix * 2 + 3 ) % n,
        i0 + ix * 2, i0 + ( ix * 2 + 3 ) % n, i0 + ix * 2 + 1
      );
      pos.push(
        r * sin( ix ),  h, r * cos( ix ),
        r * sin( ix ), -h, r * cos( ix )
      );
      nor.push(
        sin( ix ), 0.0, cos( ix ),
        sin( ix ), 0.0, cos( ix )
      );
    }
  }

  { // top
    const i0 = pos.length / 3;
    const n = N * 2;
    for ( let ix = 0; ix < N; ix ++ ) {
      ind.push(
        i0 + ix * 2, i0 + ( ix * 2 + 2 ) % n, i0 + ( ix * 2 + 3 ) % n,
        i0 + ix * 2, i0 + ( ix * 2 + 3 ) % n, i0 + ix * 2 + 1
      );
      pos.push(
        R * sin( ix ), h, R * cos( ix ),
        r * sin( ix ), h, r * cos( ix )
      );
      nor.push(
        0.0, 1.0, 0.0,
        0.0, 1.0, 0.0
      );
    }
  }

  { // bottom
    const i0 = pos.length / 3;
    const n = N * 2;
    for ( let ix = 0; ix < N; ix ++ ) {
      ind.push(
        i0 + ix * 2, i0 + ( ix * 2 + 2 ) % n, i0 + ( ix * 2 + 3 ) % n,
        i0 + ix * 2, i0 + ( ix * 2 + 3 ) % n, i0 + ix * 2 + 1
      );
      pos.push(
        r * sin( ix ), -h, r * cos( ix ),
        R * sin( ix ), -h, R * cos( ix )
      );
      nor.push(
        0.0, -1.0, 0.0,
        0.0, -1.0, 0.0
      );
    }
  }

  return {
    position: pos,
    normal: nor,
    index: ind
  };
};

module.exports = genRing;