'use client';
import { useState, useEffect } from 'react'
import useServerSentEvents from './useServerSentEvents'
import Abcjs from "./Abcjs";

export default function Music(params: { path: string }) {
  let body = (<p>"nothing yet..."</p>);
  const segments = params.path.split("/");
  segments[0] = "subscribe"
  const newpath = segments.join("/");
  const data = useServerSentEvents(process.env.NEXT_PUBLIC_SERVER_URL + newpath);
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
