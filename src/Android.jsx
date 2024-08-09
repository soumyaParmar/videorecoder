import  { useState, useEffect } from 'react';

const SpeechRecognitionTest = () => {
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    // Check if the browser supports SpeechRecognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Your browser doesn't support speech recognition. Please use Chrome or another supported browser.");
      return;
    }

    // Initialize Web Speech API
    const recognition = new SpeechRecognition();
    recognition.continuous = true; // Keep recognizing even when user pauses
    recognition.interimResults = true; // Show results even before final result
    recognition.lang = 'en-US'; // Set the language to English (you can customize this)

    recognition.onresult = (event) => {
      const interimTranscript = Array.from(event.results)
        .map(result => result[0].transcript)
        .join('');
      setTranscript(interimTranscript);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
    };

    if (isListening) {
      recognition.start();
    } else {
      recognition.stop();
    }

    // Cleanup on component unmount
    return () => {
      recognition.stop();
    };
  }, [isListening]);

  const toggleListening = () => {
    setIsListening(prevState => !prevState);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Speech Recognition Test</h1>
      <button onClick={toggleListening} style={{ fontSize: '16px', padding: '10px', marginBottom: '10px' }}>
        {isListening ? 'Stop Listening' : 'Start Listening'}
      </button>
      <p><strong>Transcript:</strong> {transcript}</p>
    </div>
  );
};

export default SpeechRecognitionTest;
