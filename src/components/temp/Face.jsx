import{ useEffect, useRef, useState } from 'react';
import { Camera } from '@mediapipe/camera_utils';
import { FaceDetection } from '@mediapipe/face_detection';
// import * as drawingUtils from '@mediapipe/drawing_utils';

const MultipleFaceDetectionComponent = () => {
  const videoRef = useRef(null);
//   const canvasRef = useRef(null);
  const [faces,setFaces] = useState(0);

  useEffect(() => {
    const videoElement = videoRef.current;
    // const canvasElement = canvasRef.current;
    // const canvasCtx = canvasElement.getContext('2d');

    const faceDetection = new FaceDetection({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${file}`,
    });

    faceDetection.setOptions({
      model: 'short',
      minDetectionConfidence: 0.5,
    });

    faceDetection.onResults((results) => {
    //   canvasCtx.save();
    //   canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    //   canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);
      setFaces(results.detections.length)

    //   if (results.detections.length > 0) {
    //     results.detections.forEach((detection) => {
    //       drawingUtils.drawRectangle(
    //         canvasCtx,
    //         detection.boundingBox,
    //         { color: 'blue', lineWidth: 4, fillColor: '#00000000' }
    //       );
    //       drawingUtils.drawLandmarks(
    //         canvasCtx,
    //         detection.landmarks,
    //         { color: 'red', radius: 5 }
    //       );
    //     });
    //   }

    //   canvasCtx.restore();
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
  }, []);

  return (
    <div>
      <video ref={videoRef} className="input_video" ></video>
      {/* <canvas ref={canvasRef} className="output_canvas" ></canvas> */}
      <p>Number of face detected: {faces}</p>
    </div>
  );
};

export default MultipleFaceDetectionComponent;
