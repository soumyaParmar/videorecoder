import { useRef, useEffect, useState } from "react";
import * as faceapi from "face-api.js";

const Facedetection = () => {
  const videoRef = useRef(null);
  const [numPeople, setNumPeople] = useState(0);

  useEffect(() => {
    const loadModels = async () => {
      // Load the models from the /models directory
      await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
      await faceapi.nets.faceLandmark68Net.loadFromUri("/models");
      await faceapi.nets.faceRecognitionNet.loadFromUri("/models");
      await faceapi.nets.faceExpressionNet.loadFromUri("/models");

      // Start video stream
      startVideo();
    };

    const startVideo = () => {
      if(videoRef.current){
        navigator.mediaDevices
        .getUserMedia({ video: {} })
        .then((stream) => {
          videoRef.current.srcObject = stream;
        })
        .catch((err) => console.error(err));
      }
    };

    loadModels();

    return () => {
      // Cleanup the video stream when the component unmounts
      const stream = videoRef.current?.srcObject;
      if (stream) {
        const tracks = stream.getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, []);

  const handleVideoOnPlay = () => {
    const video = videoRef.current;

    setInterval(async () => {
      // Detect all faces in the video stream
      const detections = await faceapi
        .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceExpressions();

      // Update the number of people detected
      setNumPeople(detections.length);

      // Optionally, you can draw the detections on the canvas (if you have one)
      // const displaySize = { width: video.videoWidth, height: video.videoHeight };
      // faceapi.matchDimensions(canvas, displaySize);
      // const resizedDetections = faceapi.resizeResults(detections, displaySize);
      // faceapi.draw.drawDetections(canvas, resizedDetections);
      // faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
      // faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
    }, 10);
  };

  return (
    <>
        <div>
          <video
            ref={videoRef}
            autoPlay
            muted
            onPlay={handleVideoOnPlay}
            style={{ display: "block", width: "100%" }}
          />
          <div>Number of people detected: {numPeople}</div>
        </div>
    </>
  );
};

export default Facedetection;
