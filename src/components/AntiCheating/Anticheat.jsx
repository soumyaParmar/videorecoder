import { useEffect, useRef, useState } from "react";
import './anti.css'
import { useNavigate } from "react-router-dom";

const Anticheat = () => {
  const [isExtendedScreen, setIsExtendedScreen] = useState(false);
  const [cameraPermission, setCameraPermission] = useState(false);
  const [allTestPassed, setAllTestPassed] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const router = useNavigate();
  const webcam = useRef(null);
  useEffect(() => {
    if (window.screen.isExtended) {
      setIsExtendedScreen(true);
    }
    getCameraPermission();
  });

  const getCameraPermission = async () => {
    try {
      const videoStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      if (videoStream.active) {
        setCameraPermission(true);
        if (webcam.current) {
          webcam.current.srcObject = videoStream;
        }
      }
    } catch (error) {
      setCameraPermission(false);
    }
  };

  const handleFullscreen = () => {
    if (!isFullScreen) {
      document.documentElement.requestFullscreen();
    }
    setIsFullScreen(true);
  };

  const handleExitFullscreen = () => {
    document.exitFullscreen();
    setIsFullScreen(false);
  };

  const handleTestStart = () =>{
    router('/test_screen')
  }

  return (
    <div className="per_body">
      {!isFullScreen ? (
        <button className="button" onClick={handleFullscreen}>
          Allow full screen
        </button>
      ) : (
        <button className="button" onClick={handleExitFullscreen}>
          Do not all full screen <span>This will end the test</span>
        </button>
      )}
      {isExtendedScreen ? (
        <p>Second screen found</p>
      ) : (
        <p>Do not have second screen</p>
      )}
      {cameraPermission ? (
        <p>Camera and microphone access granted</p>
      ) : (
        <p>Camera and microphone access not granted</p>
      )}
      {cameraPermission && (
        <video
          autoPlay
          playsInline
          muted
          ref={webcam}
          id="webcam"
          style={{ position: "absolute", right: "50px", top: "50px", width: "500px" }}
        />
      )}
      <button className="start_btn" onClick={handleTestStart}>Start Test</button>
    </div>
  );
};

export default Anticheat;
