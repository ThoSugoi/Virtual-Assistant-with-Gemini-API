import React, { useState } from "react";

const TextToSpeech: React.FC = () => {
  const [text, setText] = useState("");

  const handleSpeak = () => {
    if (!text.trim()) return; // Kiểm tra nếu không có văn bản
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US"; // Thiết lập ngôn ngữ
    utterance.rate = 1; // Tốc độ giọng nói
    utterance.pitch = 1; // Cao độ giọng nói
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div>
      <h1>Text-to-Speech</h1>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type something here..."
      />
      <button onClick={handleSpeak}>Speak</button>
    </div>
  );
};

export default TextToSpeech; 