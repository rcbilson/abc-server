"use client";
import React, { useRef, useEffect } from 'react'
import ABCJS from 'abcjs'
import 'abcjs/abcjs-audio.css'

interface AbcProps {
  abcNotation: string,
  parserParams?: ABCJS.AbcVisualParams 
}

const defaultProps = {
  parserParams: {
    responsive: 'resize',
    viewportHorizontal: true
  }
} satisfies Partial<AbcProps>

const Abcjs: React.FC<AbcProps> = (props: AbcProps) => {
  const propsWithDefaults = {
    ...defaultProps,
    ...props
  };
  const {abcNotation, parserParams} = propsWithDefaults;

  const uniqueNumber = useRef(Date.now() + Math.random());
  const synthControl = useRef<ABCJS.SynthObjectController>();

  useEffect(() => {
    const selector = "[id='abcjs-control-" + uniqueNumber.current + "']";
    synthControl.current = new ABCJS.synth.SynthController();
    synthControl.current.load(selector, null, {
      displayLoop: true,
      displayWarp: true,
      displayPlay: true,
      displayProgress: true,
      displayRestart: true
    });
  }, []);

  useEffect(() => {
    const visualObj = ABCJS.renderAbc(
      'abcjs-result-' + uniqueNumber.current,
      abcNotation,
      parserParams
    )[0];
    if (synthControl.current) {
      synthControl.current.setTune(visualObj, false);
    }
  }, [abcNotation, parserParams]);

  return (
    <div style={{ width: '100%' }}>
      <div id={'abcjs-result-' + uniqueNumber.current} style={{ width: '100%' }} />
      <div id={'abcjs-control-' + uniqueNumber.current} style={{ width: '100%' }} />
    </div>
  )
}

export default Abcjs
