/* eslint-disable no-unused-vars */
/* eslint-disable react/no-unescaped-entities */
import React, { useEffect, useState, useRef } from "react";
import Recorder from "../../Recoder";
import { Canvas } from "@react-three/fiber";
import { Avatar } from "../Avatar";
import { Environment, OrbitControls } from "@react-three/drei";
import PitchDetector from "../PitchDetection/PitchDetection";
import PitchFinder from "pitchfinder";
import "./ques.css";

const LOW_PITCH_THRESHOLD = 17000;

const Question = () => {
  const [response, setResponse] = useState(0);
  const [doneResponse, setDoneResponse] = useState([]);
  const [done, setDone] = useState(false);
  const [allChat, setAllChat] = useState([]);
  const [text, setText] = useState(false);
  //   const [speech, setSpeech] = useState("");
  const [next, setNext] = useState(false);
  const [speechDone, setSpeechDone] = useState(false);
  const [unsupported, setUnsupported] = useState(false);
  const [disable, setDisable] = useState(false);

  // Pitch detection state
  const [pitch, setPitch] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [warning, setWarning] = useState("");
  const [data, setData] = useState({
    labels: ["Pitch"],
    datasets: [
      {
        label: "Detected Pitch (Hz)",
        data: [0],
        backgroundColor: "rgba(75,192,192,0.6)",
        borderColor: "rgba(75,192,192,1)",
        borderWidth: 0,
      },
    ],
  });

  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const microphoneRef = useRef(null);
  const scriptProcessorRef = useRef(null);

  const questions = [
    "Tell me about yourself?",
    "Why is the role of Frontend/Backend developer important?",
    "How do you ensure the security of sensitive data in a web application?",
    "Describe the process of making a responsive web application. What tools or frameworks do you prefer?",
    "How do you design a RESTful API? What are the best practices you follow?",
    "How do you handle cross-browser compatibility issues? Can you share an example from your experience?",
    "What are the key differences between CSS Grid and Flexbox, and when would you use one over the other?",
  ];

  const detector = PitchFinder.YIN();

  const detectPitch = (event) => {
    const buffer = event.inputBuffer.getChannelData(0);
    const pitch = detector(buffer);
    if (pitch) {
      const roundedPitch = Math.round(pitch);
      setPitch(roundedPitch);
      updateGraph(roundedPitch);
      setWarning(
        roundedPitch < LOW_PITCH_THRESHOLD
          ? "Please speak in a higher pitch."
          : ""
      );
    } else {
      setPitch(null);
      setWarning("");
    }
  };

  const updateGraph = (pitchValue) => {
    setData((prevData) => ({
      ...prevData,
      datasets: [
        {
          ...prevData.datasets[0],
          data: [pitchValue],
        },
      ],
    }));
  };

  const startListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      const scriptProcessor = audioContext.createScriptProcessor(2048, 1, 1);

      microphone.connect(analyser);
      analyser.connect(scriptProcessor);
      scriptProcessor.connect(audioContext.destination);

      scriptProcessor.onaudioprocess = detectPitch;

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      microphoneRef.current = microphone;
      scriptProcessorRef.current = scriptProcessor;

      setIsListening(true);
    } catch (err) {
      if (err.name === "NotAllowedError") {
        alert("Microphone access is required for pitch detection.");
      } else {
        console.error("Error accessing microphone", err);
      }
    }
  };

  const stopListening = () => {
    if (scriptProcessorRef.current) {
      scriptProcessorRef.current.onaudioprocess = null;
      scriptProcessorRef.current.disconnect();
    }
    if (microphoneRef.current) microphoneRef.current.disconnect();
    if (analyserRef.current) analyserRef.current.disconnect();
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }

    scriptProcessorRef.current = null;
    microphoneRef.current = null;
    analyserRef.current = null;
    audioContextRef.current = null;

    setIsListening(false);
    setPitch(null);
    setWarning("");
  };

  const handleStartStop = () => {
    isListening ? stopListening() : startListening();
  };

  useEffect(() => {
    if (done) {
      setAllChat((prev) => [...prev, { response: doneResponse }]);
    }
  }, [done]);

  useEffect(() => {
    if ("speechSynthesis" in window && text) {
      const utterance = new SpeechSynthesisUtterance(questions[response]);
      speechSynthesis.speak(utterance);
      utterance.onend = () => {
        setDisable(false);
        setSpeechDone(true);
        setText(false);
        setNext(false);
        setAllChat((prev) => [...prev, { question: questions[response] }]);
      };
    } else if (!("speechSynthesis" in window)) {
      alert("Sorry, your browser does not support text-to-speech.");
    }
  }, [text]);

  const nextQuestion = () => {
    if (response < questions.length - 1) {
      setResponse(response + 1);
      setNext(true);
    } else {
      alert("Thank you for your time. We will get back to you soon.");
    }
  };

  if (unsupported) {
    return (
      <span style={{ fontSize: "20px" }}>
        Browser doesn't support speech recognition. Please use Chrome or Edge.
      </span>
    );
  }

  return (
    <>
      {/* <h1 style={{padding:"0 0 0 20px"}}>{questions[response]}</h1> */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-evenly",
          padding: "0px 30px 0 30px",
          height: "100vh",
        }}
      >
        <div className="leftSide">
          <div className="top">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                flexDirection: "column",
              }}
            >
              <Canvas
                camera={{ position: [0, 2, 10], fov: 50 }}
                style={{ height: "375px", backgroundColor: "whitesmoke" }}
              >
                <OrbitControls />
                <Avatar
                  position={[0, -1.5, 9]}
                  scale={2}
                  text={text ? questions[response] : ""}
                />
                <Environment preset="sunset" />
              </Canvas>
              <span style={{ padding: "50px 0 0 0" }}>Interviewer</span>
            </div>
            <div style={{ width: "600px" }}>
              {response !== questions.length ? (
                <div>
                  <Recorder
                    setDoneResponse={setDoneResponse}
                    setDone={setDone}
                    response={response}
                    setText={setText}
                    next={next}
                    setNext={setNext}
                    nextQuestion={nextQuestion}
                    speechDone={speechDone}
                    setSpeechDone={setSpeechDone}
                    setUnsupported={setUnsupported}
                    setDisable={setDisable}
                    disable={disable}
                    handleStartStop={handleStartStop}
                  />
                </div>
              ) : (
                <h1>Thank you...</h1>
              )}
              <p>{doneResponse}</p>
            </div>
          </div>
          <div
            style={{
              width: "400px",
              height: "200px",
            }}
          >
            <PitchDetector
              handleStartStop={handleStartStop}
              isListening={isListening}
              warning={warning}
              data={data}
            />
          </div>

          <div style={{ textAlign: "center" }}>
            {warning && (
              <div
                style={{ marginTop: "10px", color: "red", fontSize: "18px" }}
              >
                {warning}
              </div>
            )}
          </div>
        </div>

        <div
          style={{
            border: "1px solid white",
            borderRadius: "5px",
            width: "350px ",
            height: "85% ",
            overflowY: "scroll",
            marginTop: "50px",
          }}
        >
          {allChat &&
            allChat.map((item, index) => (
              <div key={index} style={{ padding: "10px 10px 0 10px" }}>
                <div>
                  {item.question && (
                    <span
                      style={{
                        backgroundColor: "white",
                        color: "black",
                        borderRadius: "10px",
                        padding: "5px 10px",
                      }}
                    >
                      {item.question}
                    </span>
                  )}
                </div>
                <div style={{ display: "flex", justifyContent: "end" }}>
                  {item.response && (
                    <span
                      style={{
                        textAlign: "right",
                        backgroundColor: "white",
                        color: "black",
                        borderRadius: "10px",
                        padding: "5px 10px",
                      }}
                    >
                      {item.response}
                    </span>
                  )}
                </div>
              </div>
            ))}
        </div>
      </div>
    </>
  );
};

export default Question;
