/* eslint-disable react/prop-types */
/* eslint-disable react/no-unescaped-entities */
import { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import "./App.css";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import PlayCircleFilledWhiteIcon from '@mui/icons-material/PlayCircleFilledWhite';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import PreviewIcon from '@mui/icons-material/Preview';
import StopCircleIcon from '@mui/icons-material/StopCircle';
import ReplayIcon from '@mui/icons-material/Replay';
// import isAndroid from './isAndroid';
// import SpeechRecognitionTest from './Android';

const Recorder = (props) => {
  const {
    setDoneResponse,
    setDone,
    response,
    setText,
    next,
    nextQuestion,
    speechDone,
    setSpeechDone,
    setUnsupported,
    disable,
    setDisable,
    setNext
  } = props;

  const webcamRef = useRef(null);
  const mediaRecorderRef = useRef(null)
  const [capturing, setCapturing] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [videoUrl, setVideoUrl] = useState(null);
  // const [finalTranscript, setFinalTranscript] = useState("");
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  useEffect(() => {
    if (webcamRef.current && webcamRef.current.video) {
      webcamRef.current.video.muted = true;
    }
  }, [webcamRef, next]);

  useEffect(() => {
    if (listening) {
      // setFinalTranscript(transcript);
      setDoneResponse(transcript);
    }
  }, [transcript, listening]);

  useEffect(() => {
    setCapturing(false);
    setRecordedChunks([]);
    setVideoUrl(null);
    // setFinalTranscript("");
  }, [response]);

  useEffect(() => {
    if (speechDone) {
      handleStartCaptureClick();
    }
  }, [speechDone,webcamRef]);

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
      const blob = new Blob(recordedChunks, { type: "video/webm" });
      const url = URL.createObjectURL(blob); 

      setVideoUrl(url); 

      setRecordedChunks([]);
    }
    SpeechRecognition.stopListening();
    setCapturing(false);
    setDone(true);
    setText(false);
    setSpeechDone(false);
    if (webcamRef.current && webcamRef.current.video) {
      webcamRef.current.video.muted = true; // Mute audio on stop
    }

    props.handleStartStop();
  };

  const handleStartCaptureClick = () => {
    setCapturing(true);
    setVideoUrl(null);
    resetTranscript();
    // setFinalTranscript("");
    setDoneResponse("");
    setDone(false);
    setNext(false);
    if (webcamRef.current && webcamRef.current.stream) {
      mediaRecorderRef.current = new MediaRecorder(webcamRef.current.stream, {
        mimeType: "video/webm",
      });
      mediaRecorderRef.current.addEventListener(
        "dataavailable",
        handleDataAvailable
      );
      SpeechRecognition.startListening({ continuous: true });
      mediaRecorderRef.current.start();
    }
  };

  const handleSave = () => {
    if (recordedChunks.length) {
      const blob = new Blob(recordedChunks, {
        type: "video/webm",
      });
      const url = URL.createObjectURL(blob);
      setVideoUrl(url);
      setRecordedChunks([]);
      setSpeechDone(false);
    }
  };
  const startSpeech = () => {
    setDisable(true);
    setText(true);
    setNext(true)
    props.handleStartStop();
  };

  const restartSpeech = () =>{
    setVideoUrl(null);
    setCapturing(false);
    setDoneResponse('');
    setRecordedChunks([]);
    // props.handleStartStop();

  }

  const handleNext = () => {
    nextQuestion();
    // setFinalTranscript("");
    setDoneResponse("");
    startSpeech();
  };

  if (!browserSupportsSpeechRecognition) {
    setUnsupported(true);
  }

  // if(isAndroid){
  //   return (
  //     <SpeechRecognitionTest/>
  //   )
  // }

  return (
    <div className="webCam">
      {videoUrl ? (
        <div>
          <h3>Preview:</h3>
          <video src={videoUrl} controls />
        </div>
      ) : (
        <Webcam audio={true} ref={webcamRef} />
      )}
      <div style={{ display: "flex", gap: "10px", paddingTop: "50px" }}>
        {capturing && !disable ? (
          <button
            onClick={handleStopCaptureClick}
            style={{ bottom: 0, left: "50%" }}
            className="btn"
          >
            <StopCircleIcon fontSize='large'/>
            <p style={{fontSize:'12px'}}>Stop</p>
          </button>
        ) : (!disable && recordedChunks.length > 0) || videoUrl ? (
          <button onClick={restartSpeech} className="btn"><ReplayIcon fontSize='large'/><p style={{fontSize:'12px'}}>Re-Try</p></button> //retry
        ) : (
          !disable && (
            <button onClick={startSpeech} style={{ bottom: 0 }} className="btn">
              <PlayCircleFilledWhiteIcon fontSize='large'/>
              <p style={{fontSize:'12px'}}>Start</p>
            </button>
          )
        )}
        {recordedChunks.length > 0 && !disable && (
          <button onClick={handleSave} className="btn"><PreviewIcon fontSize='large'/><p style={{fontSize:'12px'}}>Preview</p></button>
        )}
        {!capturing && !disable && <button onClick={handleNext} className="btn"><ArrowForwardIosIcon fontSize='large'/><p style={{fontSize:'12px'}}>Next</p></button>}
      </div>
    </div>
  );
};

export default Recorder;
