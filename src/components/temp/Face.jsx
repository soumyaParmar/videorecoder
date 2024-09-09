import{ useEffect, useRef, useState } from 'react';
// import { Camera } from '@mediapipe/camera_utils';
// import { FaceDetection } from '@mediapipe/face_detection';
// import * as drawingUtils from '@mediapipe/drawing_utils';

const MultipleFaceDetectionComponent = () => {
  const videoRef = useRef(null);
  const [faces,setFaces] = useState(0);

  useEffect(() => {
    const videoElement = videoRef.current;

    const faceDetection = new window.FaceDetection({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${file}`,
    });

    faceDetection.setOptions({
      model: 'short',
      minDetectionConfidence: 0.5,
    });

    faceDetection.onResults((results) => {
      setFaces(results.detections.length)
    });

    const camera = new window.Camera(videoElement, {
      onFrame: async () => {
        await faceDetection.send({ image: videoElement });
      },
      width: 1280,
      height: 720,
    });

    camera.start();

    return () => {
      camera.stop();
      faceDetection.close();
    };
  }, []);

  return (
    <div>
      <video ref={videoRef} className="input_video" ></video>
      <p>Number of face detected: {faces}</p>
    </div>
  );
};

export default MultipleFaceDetectionComponent;
