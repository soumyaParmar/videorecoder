import { useEffect, useRef, useState } from 'react';
import { Camera } from '@mediapipe/camera_utils';
import { FaceDetection } from '@mediapipe/face_detection';

const withFaceDetection = (WrappedComponent) => {
  const WithFaceDetection = (props) => {
    const videoRef = useRef(null);
    const [faces, setFaces] = useState(0);

    useEffect(() => {
      if (videoRef.current) {
        const videoElement = videoRef.current;

        const faceDetection = new FaceDetection({
          locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${file}`,
        });

        faceDetection.setOptions({
          model: 'short',
          minDetectionConfidence: 0.5,
        });

        faceDetection.onResults((results) => {
          setFaces(results.detections.length);
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
      }
    }, [videoRef]);

    return (
      <div>
        <WrappedComponent faces={faces} videoRef={videoRef} {...props} />
        <video ref={videoRef} style={{ display: 'none' }}></video>
      </div>
    );
  };
  return WithFaceDetection;
};

export default withFaceDetection;
