/* eslint-disable react/no-unescaped-entities */
import { useEffect, useState } from "react";
import Recorder from "../../Recoder";
import { Canvas } from "@react-three/fiber";
import { Avatar } from "../Avatar";
import { Environment, OrbitControls } from "@react-three/drei";

const Question = () => {
  const [response, setResponse] = useState(0);
  const [doneResponse, setDoneResponse] = useState([]);
  const [done, setDone] = useState(false);
  const [allChat, setAllChat] = useState([]);
  const [text,setText] = useState(false);
//   const [speech, setSpeech] = useState("");
  const [next,setNext] = useState(false);
  const [speechDone,setSpeechDone] = useState(false);
  const [unsupported,setUnsupported] = useState(false);
  const [disable,setDisable] = useState(false);

  const questions = [
    "Tell me about your self?",
    "Why is the roll of Frontend/Backend developer?",
    "How do you ensure the security of sensitive data in a web application",
    "Describe the process of making a responsive web application. What tools or frameworks do you prefer",
    "How do you design a RESTful API? What are the best practices you follow?",
    "How do you handle cross-browser compatibility issues? Can you share an example from your experience",
    "What are the key differences between CSS Grid and Flexbox, and when would you use one over the other?",
  ];

  useEffect(() => {
    if (done) {
      setAllChat((prev) => [
        ...prev,
        { response: doneResponse },
      ]);
    }
  }, [done]);

  useEffect(()=>{
    // setSpeech(questions[response])
    if ('speechSynthesis' in window) {
        if(text){
            const utterance = new SpeechSynthesisUtterance(questions[response]);
            speechSynthesis.speak(utterance);
            utterance.onend = () =>{
                setDisable(false)
                setSpeechDone(true);
                setText(false);
                setNext(false);
                setAllChat((prev) => [
                    ...prev,
                    { question: questions[response] },
                  ]);
            }
        }
      } else {
        alert('Sorry, your browser does not support text-to-speech.');
      }
  },[text])

  const nextQuestion = () => {
    if (response !== questions.length - 1) {
      setResponse(response + 1);
      setNext(true)
    } else {
      alert("Thank you for your time we will get back to you soon.");
    }
  };

if(unsupported){
    return <span style={{ fontSize: "20px" }}>Browser doesn't support speech recognition. Please use Chrome or Edge</span>;
}

  return (
    <>
    {/* <h1 style={{padding:"0 0 0 20px"}}>{questions[response]}</h1> */}
    <div style={{ display: "flex",justifyContent:"space-evenly",padding:'150px 30px 0 30px'}}>
      <div style={{display:"flex",alignItems:'center',flexDirection:'column'}}>
        <Canvas camera={{ position: [0, 2, 10], fov: 50 }} style={{height:'375px',backgroundColor:'whitesmoke'}}>
          <OrbitControls />
          <Avatar
            position={[0, -1.5, 9]}
            scale={2}
            text={text ? questions[response] : ""}
          />
          <Environment preset="sunset" />
        </Canvas>
        <span style={{padding:'50px 0 0 0'}}>Interviewer</span>
      </div>
      <div style={{width:'600px'}}>
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
            />
          </div>
        ) : (
          <h1>Thank you...</h1>
        )}
        {/* <button onClick={nextQuestion} style={{bottom:0,right:"40%"}}>
          next
        </button> */}
        <p>{doneResponse}</p>
      </div>
      <div
        style={{
          border: "1px solid white",
          borderRadius: "5px",
          width: "350px ",
          height:'450px ',
          overflowY: "scroll",
        }}
      >
        {allChat &&
          allChat.map((item, index) => (
            <div key={index} style={{ padding: "10px 10px 0 10px" }}>
                <div>
                {item.question &&
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
                }
                </div>
                <div style={{display:"flex",justifyContent:'end'}}>
                {item.response && 
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
                }
                </div>
            </div>
          ))}
          
      </div>
    </div>
    </>
  );
};

export default Question;
