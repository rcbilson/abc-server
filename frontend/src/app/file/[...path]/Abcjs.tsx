"use client";
import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import abcjsObj from 'abcjs'

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

  const [uniqueNumber, _] = useState(Date.now() + Math.random());

  useEffect(() => {
    abcjsObj.renderAbc(
      'abcjs-result-' + uniqueNumber,
      abcNotation,
      parserParams,
      engraverParams,
      renderParams
    )
  }, [abcNotation, parserParams, engraverParams, renderParams]);

  return (
    <div style={{ width: '100%' }}>
      <div id={'abcjs-result-' + uniqueNumber} style={{ width: '100%' }} />
    </div>
  )
}

export default Abcjs
