import { useEffect, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import './App.css';

const Recorder = () => {
  const webcamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const [capturing, setCapturing] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [videoUrl, setVideoUrl] = useState(null);

  useEffect(() => {
    if (webcamRef.current && webcamRef.current.video) {
      webcamRef.current.video.muted = true;
    }
  }, [webcamRef]);

  const handleStartCaptureClick = () => {
    setCapturing(true);
    setVideoUrl(null); 
    mediaRecorderRef.current = new MediaRecorder(webcamRef.current.stream, {
      mimeType: 'video/webm',
    });
    mediaRecorderRef.current.addEventListener(
      'dataavailable',
      handleDataAvailable
    );
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
      
    </div>
  );
};

export default Recorder;
