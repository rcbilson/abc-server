"use client";
import React, { useRef, useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import ABCJS from 'abcjs'
import 'abcjs/abcjs-audio.css'

interface AbcProps {
  abcNotation: string,
  parserParams?: any,
  engraverParams?: any,
  renderParams?: any
}

const defaultProps = {
  parserParams: {},
  engraverParams: { responsive: 'resize' },
  renderParams: { viewportHorizontal: true }
} satisfies Partial<AbcProps>

const Abcjs: React.FC<AbcProps> = (props: AbcProps) => {
  const propsWithDefaults = {
    ...defaultProps,
    ...props
  };
  const {abcNotation, parserParams, engraverParams, renderParams} = propsWithDefaults;

  const uniqueNumber = useRef(Date.now() + Math.random());
  const synthControl = useRef();

  useEffect(() => {
    const visualObj = ABCJS.renderAbc(
      'abcjs-result-' + uniqueNumber.current,
      abcNotation,
      parserParams,
      engraverParams,
      renderParams
    )[0];
    if (!synthControl.current) {
      const selector = "[id='abcjs-control-" + uniqueNumber.current + "']";
      synthControl.current = new ABCJS.synth.SynthController();
      synthControl.current.load(selector, null, {
        displayLoop: true,
        displayWarp: true,
        displayPlay: true,
        displayProgress: true,
        displayRestart: true
      });
    }
    synthControl.current.setTune(visualObj, false, {visualObj: visualObj});
  }, [abcNotation, parserParams, engraverParams, renderParams]);

  return (
    <div style={{ width: '100%' }}>
      <div id={'abcjs-result-' + uniqueNumber.current} style={{ width: '100%' }} />
      <div id={'abcjs-control-' + uniqueNumber.current} style={{ width: '100%' }} />
    </div>
  )
}

export default Abcjs
