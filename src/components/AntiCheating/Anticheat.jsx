import { useEffect, useRef, useState } from "react";
import './anti.css';
import { useNavigate } from "react-router-dom";
import MultipleFaceDetectionComponent from "../temp/Face";
// import Facedetection from "../Facedetection/Facedetection";

const Anticheat = () => {
  const [isExtendedScreen, setIsExtendedScreen] = useState(false);
  const [cameraPermission, setCameraPermission] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [allPermission,setAllPermission] = useState(false)
  const router = useNavigate();
  const webcam = useRef(null);

  useEffect(() => {
    if (window.screen.isExtended) {
      setIsExtendedScreen(true);
    }
    if(!isExtendedScreen && cameraPermission && isFullScreen){
      setAllPermission(true)
    }else{
      setAllPermission(false)
    }
    getCameraPermission();
  }, [isExtendedScreen,cameraPermission,isFullScreen]);

  

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
      }else{
        setCameraPermission(false);
      }
    } catch (error) {
      setCameraPermission(false);
    }
  };

  const handleFullscreen = () => {
    if (!isFullScreen) {
      document.documentElement.requestFullscreen();
      setIsFullScreen(true);
    }
  };

  const handleExitFullscreen = () => {
    document.exitFullscreen();
    setIsFullScreen(false);
  };

  const handleTestStart = () => {
    router('/test_screen');
  };

  return (
    <div className="per_body">
      {!isFullScreen ? (
        <button className="button" onClick={handleFullscreen}>
          Allow full screen
        </button>
      ) : (
        <button className="button" onClick={handleExitFullscreen}>
          Exit full screen
        </button>
      )}
      {isExtendedScreen ? (
        <p>Second screen found</p>
      ) : (
        <p>No second screen detected</p>
      )}
      {cameraPermission ? (
        <p>Camera and microphone access granted</p>
      ) : (
        <p>Camera and microphone access not granted</p>
      )}
      {cameraPermission && (
        <div style={{position:"absolute" , right:'50px', top:'50px'}}>
          <MultipleFaceDetectionComponent/>
        </div>
      )}
      {
        allPermission ? (
          <>
            <button className="start_btn" onClick={handleTestStart}>Start Test</button>
          </>
        ):(
          <>
            <button className="req_btn">All permission required</button>
          </>
        )
      }
    </div>
  );
};

export default Anticheat;
