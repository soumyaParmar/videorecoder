/* eslint-disable react/no-unescaped-entities */
import { useEffect, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import './App.css';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

const Recorder = () => {
  const webcamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const [capturing, setCapturing] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [videoUrl, setVideoUrl] = useState(null);
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  useEffect(() => {
    if (webcamRef.current && webcamRef.current.video) {
      webcamRef.current.video.muted = true;
    }
  }, [webcamRef]);

  const handleStartCaptureClick = () => {
    setCapturing(true);
    setVideoUrl(null); 
    resetTranscript();
    mediaRecorderRef.current = new MediaRecorder(webcamRef.current.stream, {
      mimeType: 'video/webm',
    });
    mediaRecorderRef.current.addEventListener(
      'dataavailable',
      handleDataAvailable
    );
    SpeechRecognition.startListening({ continuous: true })
    mediaRecorderRef.current.start();
  };

  const handleDataAvailable = ({ data }) => {
    if (data.size > 0) {
      setRecordedChunks((prev) => prev.concat(data));
    }
  };

  const handleStopCaptureClick = () => {
    mediaRecorderRef.current.stop();
    if (recordedChunks.length) {
      const blob = new Blob(recordedChunks, {
        type: 'video/webm',
      });
      const url = URL.createObjectURL(blob);
      setVideoUrl(url);
      setRecordedChunks([]);
    }
    SpeechRecognition.stopListening();
    setCapturing(false);
  };

  const handleSave = () => {
    if (recordedChunks.length) {
      const blob = new Blob(recordedChunks, {
        type: 'video/webm',
      });
      const url = URL.createObjectURL(blob);
      setVideoUrl(url);
      setRecordedChunks([]);
    }
  };

  if (!browserSupportsSpeechRecognition) {
    return <span style={{fontSize:"20px"}}>Browser doesn't support speech recognition.</span>;
  }

  return (
    <div className='webCam'>
      {videoUrl ? (
        <div>
          <h3>Preview:</h3>
          <video src={videoUrl} controls />
        </div>
      ):
      (
        <Webcam audio={true} ref={webcamRef} />
      )
      }
      {capturing ? (
        <button onClick={handleStopCaptureClick}>Stop</button>
      ) : (
        recordedChunks.length > 0 || videoUrl ? (
          <button onClick={handleStartCaptureClick}>Try Again</button>
        ):(
          <button onClick={handleStartCaptureClick}>Start</button>
        )
      )}
      {recordedChunks.length > 0 && (
        <button onClick={handleSave}>Watch Preview</button>
      )}
      {
        listening ? (
          <p>Listening...</p>
        ):(
          <p>{transcript}</p>
        )
      }
    </div>
  );
};

export default Recorder;
