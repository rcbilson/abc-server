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
  const audioContext = useRef();
  const midiBuffer = useRef();
  const [playing, setPlaying] = useState(false);
  const [paused, setPaused] = useState(false);
  const [audioError, setAudioError] = useState();
  const [abcjsState, setAbcjsState] = useState();

  useEffect(() => {
    setAbcjsState(ABCJS.renderAbc(
      'abcjs-result-' + uniqueNumber.current,
      abcNotation,
      parserParams,
      engraverParams,
      renderParams
    )[0]);
    midiBuffer.current = null;
  }, [abcNotation, parserParams, engraverParams, renderParams]);

  const midiBufferInit = async () => {
    if (!ABCJS.synth.supportsAudio()) {
      setAudioError("Playback is not supported on this browser.");
      return;
    }

    try {
      if (!audioContext.current) {
        audioContext.current = new AudioContext();
      }
      const synth = new ABCJS.synth.CreateSynth();

      // midiBuffer.init preloads and caches all the notes needed. There may be significant network traffic here.
      await synth.init({
        visualObj: abcjsState,
        options: {
          onEnded: onEndedCallback
        }
      });
      // midiBuffer.prime actually builds the output buffer.
      await synth.prime();
      midiBuffer.current = synth;
      setAudioError();
    } catch(error) {
      midiBuffer.current = undefined;
      setAudioError(error);
    }
  }

  const onEndedCallback = () => {
    if (!paused) {
      setPlaying(false);
    }
  }

  const onPlay = async () => {
    if (playing) return;
    if (!midiBuffer.current) {
      await midiBufferInit();
      if (!midiBuffer.current) {
        return;
      }
    }

    try {
      // At this point, everything slow has happened. midiBuffer.start will return very quickly and will start playing very quickly without lag.
      await midiBuffer.current.start();
      setPlaying(true);
      setPaused(false);
    } catch(error) {
      console.warn("synth error", error);
    }
  }

  const onStop = async () => {
    if (!playing) return;
    if (midiBuffer.current) {
      midiBuffer.current.stop();
    }
    setPlaying(false);
    setPaused(false);
  }

  const onPause = async () => {
    if (!playing || paused) return;
    if (midiBuffer.current) {
      midiBuffer.current.pause();
    }
    setPaused(true);
  }

  const onResume = async () => {
    if (!playing || !paused) return;
    if (midiBuffer.current) {
      midiBuffer.current.resume();
    }
    setPaused(false);
  }

  let playbackElements = [];
  if (audioError) {
    playbackElements.push(<p>{audioError}</p>);
  } else {
    if (!playing) {
      playbackElements.push(<button key="play" onClick={onPlay}>Play</button>);
    } else {
      playbackElements.push(<button key="stop" onClick={onStop}>Stop</button>);
      if (paused) {
        playbackElements.push(<button key="resume" onClick={onResume}>Resume</button>);
      } else {
        playbackElements.push(<button key="pause" onClick={onPause}>Pause</button>);
      }
    }
  }

  return (
    <div style={{ width: '100%' }}>
      <div id={'abcjs-result-' + uniqueNumber.current} style={{ width: '100%' }} />
      <div>{playbackElements}</div>
    </div>
  )
}

export default Abcjs
