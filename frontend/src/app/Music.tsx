'use client';
import { useState, useEffect } from 'react'
import useServerSentEvents from './useServerSentEvents'
import Abcjs from "./Abcjs";

export default function Music() {
  let body = (<p>"nothing yet..."</p>);
  const data = useServerSentEvents('http://192.168.10.3:9000/file/tedeum/rehearsal-d.abc');
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
