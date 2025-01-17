import React, { useState } from "react";

interface SpeechToTextProps {
  onTranscript: (transcript: string) => void;
}

// Extend the Window interface to include SpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const SpeechToText: React.FC<SpeechToTextProps> = ({ onTranscript }) => {
  const [isListening, setIsListening] = useState(false);

  const startListening = () => {
    const recognition =
      new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = "en-US"; // Set language
    recognition.interimResults = false; // Only final results

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event: any) => {
      const result = event.results[0][0].transcript;
      onTranscript(result); // Send transcript to parent component
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error: ", event.error);
    };

    recognition.onend = () => setIsListening(false);

    recognition.start(); // Start listening
  };

  return (
    <div>
      <button
        onClick={startListening}
        disabled={isListening}
        style={{
          padding: "10px 20px",
          borderRadius: "4px",
          backgroundColor: "#17a2b8", // Changed to cyan color
          color: "#fff",
          border: "none",
          cursor: "pointer",
          transition: "background-color 0.3s ease",
        }}
        onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#138496")} // Darker cyan on hover
        onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#17a2b8")}
      >
        {isListening ? "Listening..." : "Start Listening"}
      </button>
    </div>
  );
};

export default SpeechToText;