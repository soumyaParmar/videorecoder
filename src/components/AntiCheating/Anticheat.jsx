import { useEffect, useRef, useState } from "react";
import "./anti.css";
import { useNavigate } from "react-router-dom";
import MultipleFaceDetectionComponent from "../temp/Face";
import { useScreenRecorder } from "../../custom/Hooks/useScreenRecorder";
// import Facedetection from "../Facedetection/Facedetection";

const Anticheat = () => {
  const [isExtendedScreen, setIsExtendedScreen] = useState(false);
  const [cameraPermission, setCameraPermission] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [allPermission, setAllPermission] = useState(false);
  const {startRecording} = useScreenRecorder();
  const router = useNavigate();
  const webcam = useRef(null);

  useEffect(() => {
    setInterval(()=>{
      if (window.screen.isExtended) {
        setIsExtendedScreen(true);
      }else{
        setIsExtendedScreen(false);
      }
    },1000)
    if ( cameraPermission && isFullScreen) { //!isExtendedScreen &&
      setAllPermission(true);
    } else {
      setAllPermission(false);
    }
    getCameraPermission();

  }, [isExtendedScreen, cameraPermission, isFullScreen]);

  useEffect(() => {
    startRecording();
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        alert("The application requires fullscreen mode to operate");
        setIsFullScreen(false); // Update fullscreen state
      } else {
        setIsFullScreen(true); // Update fullscreen state
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

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
      } else {
        setCameraPermission(false);
      }
    } catch (error) {
      setCameraPermission(false);
    }
  };

  const handleFullscreen = () => {
    // if (!isFullScreen) {
      document.documentElement.requestFullscreen();
      // setIsFullScreen(true);
    // }
  };

  const handleExitFullscreen = () => {
    document.exitFullscreen();
    // setIsFullScreen(false);
    console.log("you exit")
  };

  const handleTestStart = () => {
    router("/test_screen");
  };

  return (
    <div className="per_body h-[30rem] mx-auto w-[70rem] mt-[7rem] flex justify-between">
      <div className=" flex flex-col justify-between p-8 bg-slate-900">
        <div>
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
        </div>

        {allPermission ? (
          <>
            <button className="start_btn" onClick={handleTestStart}>
              Start Test
            </button>
          </>
        ) : (
          <>
            <button className="req_btn">All permission required</button>
          </>
        )}
      </div>

      {cameraPermission && (
        <div>
          <MultipleFaceDetectionComponent />
        </div>
      )}
    </div>
  );
};

export default Anticheat;
