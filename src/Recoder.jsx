/* eslint-disable react/no-unescaped-entities */
import { useEffect, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import './App.css';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import isAndroid from './isAndroid';
import SpeechRecognitionTest from './Android';

const Recorder = () => {
  const webcamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const [capturing, setCapturing] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [videoUrl, setVideoUrl] = useState(null);
  const [finalTranscript, setFinalTranscript] = useState("");
  const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();

  useEffect(() => {
    if (webcamRef.current && webcamRef.current.video) {
      webcamRef.current.video.muted = true;
    }
  }, [webcamRef]);

  useEffect(() => {
    if (listening) {
      setFinalTranscript(transcript); // Update the final transcript immediately as the user speaks
    }
  }, [transcript, listening]);

  const handleStartCaptureClick = () => {
    setCapturing(true);
    setVideoUrl(null);
    resetTranscript();
    setFinalTranscript(""); // Reset the final transcript
    mediaRecorderRef.current = new MediaRecorder(webcamRef.current.stream, {
      mimeType: 'video/webm',
    });
    mediaRecorderRef.current.addEventListener('dataavailable', handleDataAvailable);
    SpeechRecognition.startListening({ continuous: true });
    mediaRecorderRef.current.start();
  };

  const handleDataAvailable = ({ data }) => {
    if (data.size > 0) {
      setRecordedChunks((prev) => prev.concat(data));
    }
  };

  const handleStopCaptureClick = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
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
    return <span style={{ fontSize: "20px" }}>Browser doesn't support speech recognition.</span>;
  }

  if(isAndroid){
    return (
      <SpeechRecognitionTest/>
    )
  }

  return (
    <div className='webCam'>
      {videoUrl ? (
        <div>
          <h3>Preview:</h3>
          <video src={videoUrl} controls />
        </div>
      ) : (
        <Webcam audio={true} ref={webcamRef} />
      )}
      {capturing ? (
        <button onClick={handleStopCaptureClick}>Stop</button>
      ) : (
        recordedChunks.length > 0 || videoUrl ? (
          <button onClick={handleStartCaptureClick}>Try Again</button>
        ) : (
          <button onClick={handleStartCaptureClick}>Start</button>
        )
      )}
      {recordedChunks.length > 0 && (
        <button onClick={handleSave}>Watch Preview</button>
      )}
      <p>{finalTranscript ? finalTranscript : "error"}</p>
    </div>
  );
};

export default Recorder;
