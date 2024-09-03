import{ useEffect, useRef, useState } from 'react';
import { Camera } from '@mediapipe/camera_utils';
import { FaceDetection } from '@mediapipe/face_detection';

export default function useFaceDetection(webcamRef) {
  const [faces,setFaces] = useState(0);

  useEffect(() => {

    const videoElement = webcamRef.current;

    const faceDetection = new FaceDetection({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${file}`,
    });

    faceDetection.setOptions({
      model: 'short',
      minDetectionConfidence: 0.5,
    });

    faceDetection.onResults((results) => {
      setFaces(results.detections.length)
      console.log(results)
    });

    const camera = new Camera(videoElement, {
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
  }, [webcamRef]);

  return {
    faces
  }
}

{/* <div>
      <video ref={videoRef} className="input_video" ></video>
      <p>Number of face detected: {faces}</p>
    </div> */}
