'use client';
import { useState, useEffect } from 'react'
import useServerSentEvents from './useServerSentEvents'
import Abcjs from "./Abcjs";

export default function Music(params: { path: string }) {
  let body = (<p>"nothing yet..."</p>);
  //const data = useServerSentEvents('http://192.168.10.3:9000/' + params.path);
  const data = useServerSentEvents('http://100.89.200.9:9000/' + params.path);
  if (data) {
    body = (
      <Abcjs
        abcNotation={data}
        parserParams={{}}
        engraverParams={{ responsive: 'resize' }}
        renderParams={{ viewportHorizontal: true }}
      />
    )
  }

  return (
    <div>{body}</div>
  )
}
