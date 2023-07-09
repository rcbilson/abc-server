"use client";
import React, { useRef, useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import ABCJS from 'abcjs'

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
  const abcjsState = useRef();
  const [playing, setPlaying] = useState(false);
  const [audioSupported, setAudioSupported] = useState(true);
  const midiBuffer = useRef();

  useEffect(() => {
    abcjsState.current = ABCJS.renderAbc(
      'abcjs-result-' + uniqueNumber.current,
      abcNotation,
      parserParams,
      engraverParams,
      renderParams
    )[0];
  }, [abcNotation, parserParams, engraverParams, renderParams]);

  const onEndedCallback = () => {
    setPlaying(false);
  }

  const togglePlayback = async () => {
    if (!abcjsState.current) return;

    // This call involves instantiating an audio context, which you can only really do in a
    // click handler. So we assume that audio is supported but might discover after a click
    // that it is not.
    if (!ABCJS.synth.supportsAudio()) {
      setAudioSupported(false);
      return;
    }

    if (!playing) {
      try {
        midiBuffer.current = new ABCJS.synth.CreateSynth();

        // midiBuffer.init preloads and caches all the notes needed. There may be significant network traffic here.
        await midiBuffer.current.init({
                visualObj: abcjsState.current,
                options: {
                  onEnded: onEndedCallback
                }
        });
        // midiBuffer.prime actually builds the output buffer.
        await midiBuffer.current.prime();
        // At this point, everything slow has happened. midiBuffer.start will return very quickly and will start playing very quickly without lag.
        await midiBuffer.current.start();
        setPlaying(true);
      } catch(error) {
        console.warn("synth error", error);
      }
    } else { // !playing
      if (midiBuffer.current) {
        midiBuffer.current.stop();
      }
      setPlaying(false);
    }
  }

  let playbackButton = <p>Playback is not supported on this browser.</p>;
  if (audioSupported) {
    let playbackText = "Start playback";
    if (playing) {
      playbackText = "Stop playback";
    }
    playbackButton = <button onClick={togglePlayback}>{playbackText}</button>;
  }

  return (
    <div style={{ width: '100%' }}>
      <div id={'abcjs-result-' + uniqueNumber.current} style={{ width: '100%' }} />
      <div>{playbackButton}</div>
    </div>
  )
}

export default Abcjs
