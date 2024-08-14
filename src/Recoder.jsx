/* eslint-disable react/prop-types */
/* eslint-disable react/no-unescaped-entities */
import { useEffect, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import './App.css';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
// import isAndroid from './isAndroid';
// import SpeechRecognitionTest from './Android';

const Recorder = (props) => {
  const { setDoneResponse,setDone,response,setText,next,setNext,nextQuestion,speechDone,setSpeechDone,setUnsupported } = props
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
  }, [webcamRef,next]);

  useEffect(() => {
    if (listening) {
      setFinalTranscript(transcript);
      setDoneResponse(transcript)
    }
  }, [transcript, listening]);

  useEffect(()=>{
    setCapturing(false);
    setRecordedChunks([]);
    setVideoUrl(null);
    setFinalTranscript("");
  },[response])

  useEffect(()=>{
    if(speechDone){
      handleStartCaptureClick();
    }
  },[speechDone])

  const handleStartCaptureClick = () => {
    setCapturing(true);
    setVideoUrl(null);
    resetTranscript();
    setFinalTranscript("");
    setDone(false)
    setNext(false);
    if(webcamRef.current && webcamRef.current.stream){
      mediaRecorderRef.current = new MediaRecorder(webcamRef.current.stream, {
        mimeType: 'video/webm',
      });
      mediaRecorderRef.current.addEventListener('dataavailable', handleDataAvailable);
      SpeechRecognition.startListening({ continuous: true });
      mediaRecorderRef.current.start();
    }
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
    setDone(true);
    setText(false);
    setNext(false);
    setSpeechDone(false);
  };

  const handleSave = () => {
    if (recordedChunks.length) {
      const blob = new Blob(recordedChunks, {
        type: 'video/webm',
      });
      const url = URL.createObjectURL(blob);
      setVideoUrl(url);
      setRecordedChunks([]);
      setNext(false);
      setSpeechDone(false);
    }
  };
  const startSpeech = ()=>{
    setText(true);
  }

  const handleNext = () =>{
    nextQuestion();
    setFinalTranscript("");
    startSpeech();
  }

  if (!browserSupportsSpeechRecognition) {
    setUnsupported(true);
  }

  // if(isAndroid){
  //   return (
  //     <SpeechRecognitionTest/>
  //   )
  // }

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
      <div style={{display:'flex', gap:'10px',paddingTop:'50px'}}>
      {capturing ? (
        <button onClick={handleStopCaptureClick} style={{bottom:0,left:'50%'}}>Stop</button>
      ) : (
        recordedChunks.length > 0 || videoUrl ? (
          <button onClick={startSpeech}>Try Again</button>
        ) : (
          <button onClick={startSpeech} style={{bottom:0}}>Start</button>
        )
      )}
      {recordedChunks.length > 0 && (
        <button onClick={handleSave}>Watch Preview</button>
      )}
      {!capturing && 
      <button onClick={handleNext}>Next</button>
    }
      </div>
    </div>
  );
};

export default Recorder;
