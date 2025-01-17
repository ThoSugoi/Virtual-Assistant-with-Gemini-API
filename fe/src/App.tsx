import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import SpeechToText from "./components/SpeechToText";


const App: React.FC = () => {
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<{ user: string; bot: string }[]>([
    { user: "", bot: "Hello my master. How can I help you today?" }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingDots, setLoadingDots] = useState(".");
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcribingDots, setTranscribingDots] = useState(".");

  // Loading animation effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading) {
      interval = setInterval(() => {
        setLoadingDots(prev => {
          switch (prev) {
            case ".": return "..";
            case "..": return "...";
            case "...": return "..";
            default: return ".";
          }
        });
      }, 500);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  // Add another useEffect for transcribing animation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTranscribing) {
      interval = setInterval(() => {
        setTranscribingDots(prev => {
          switch (prev) {
            case ".": return "..";
            case "..": return "...";
            case "...": return "..";
            default: return ".";
          }
        });
      }, 500);
    }
    return () => clearInterval(interval);
  }, [isTranscribing]);

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    // Immediately add user message and loading state
    const userMessage = message;
    setMessage(""); // Clear input immediately
    setChatHistory(prev => [...prev, { user: userMessage, bot: loadingDots }]);
    setIsLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:5000/chatbot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: userMessage }),
      });
      const data = await response.json();

      // Update the last message with the actual response
      setChatHistory(prev => {
        const newHistory = [...prev];
        newHistory[newHistory.length - 1].bot = data.response;
        return newHistory;
      });

      // Convert response to speech
      const utterance = new SpeechSynthesisUtterance(data.response);
      utterance.lang = "en-US";
      utterance.rate = 1;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error("Error:", error);
      // Update the last message with error state if needed
      setChatHistory(prev => {
        const newHistory = [...prev];
        newHistory[newHistory.length - 1].bot = "Sorry, I encountered an error. Please try again.";
        return newHistory;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceRecording = async (duration: number, transcript: string) => {
    // Show transcribing animation immediately
    setIsTranscribing(true);
    setChatHistory(prev => [...prev, { 
      user: `🎤 Transcribing${transcribingDots}`, 
      bot: "" 
    }]);

    try {
      // After getting transcript, update the message
      setChatHistory(prev => {
        const newHistory = [...prev];
        newHistory[newHistory.length - 1] = {
          user: `🎤 "${transcript}" (${duration.toFixed(1)}s)`,
          bot: loadingDots
        };
        return newHistory;
      });
      setIsTranscribing(false);
      setIsLoading(true);

      // Send transcribed text to chatbot
      const response = await fetch("http://127.0.0.1:5000/chatbot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          message: transcript
        }),
      });
      const data = await response.json();

      // Update the last message with the actual response
      setChatHistory(prev => {
        const newHistory = [...prev];
        newHistory[newHistory.length - 1].bot = data.response;
        return newHistory;
      });

      // Play the response as speech
      const speech = new SpeechSynthesisUtterance(data.response);
      window.speechSynthesis.speak(speech);
    } catch (error) {
      console.error("Error:", error);
      setChatHistory(prev => {
        const newHistory = [...prev];
        newHistory[newHistory.length - 1] = {
          user: "🎤 Error transcribing audio",
          bot: "Sorry, I encountered an error. Please try again."
        };
        return newHistory;
      });
    } finally {
      setIsTranscribing(false);
      setIsLoading(false);
    }
  };

  const handleTranscript = (transcript: string) => {
    if (!transcript.trim()) return;

    // Immediately add user message and loading state
    setChatHistory(prev => [...prev, { user: transcript, bot: loadingDots }]);
    setIsLoading(true);

    // Send transcribed text to chatbot
    fetch("http://127.0.0.1:5000/chatbot", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: transcript }),
    })
      .then(response => response.json())
      .then(data => {
        setChatHistory(prev => {
          const newHistory = [...prev];
          newHistory[newHistory.length - 1].bot = data.response;
          return newHistory;
        });

        const speech = new SpeechSynthesisUtterance(data.response);
        window.speechSynthesis.speak(speech);
      })
      .catch(error => {
        console.error("Error:", error);
        setChatHistory(prev => {
          const newHistory = [...prev];
          newHistory[newHistory.length - 1].bot = "Sorry, I encountered an error. Please try again.";
          return newHistory;
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <div style={{ fontFamily: "Arial, sans-serif", backgroundColor: "#f0f2f5", minHeight: "100vh" }}>
      {/* Navbar */}
      <nav style={{ backgroundColor: "#343a40", display: "flex", padding: "1rem", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", marginRight: "20px" }}>
          <img 
            src="/logo.png" 
            alt="Logo" 
            style={{ height: "40px", marginRight: "10px" }} 
          />
          <span style={{ color: "#fff", fontSize: "1.2rem" }}>Virtual Assistant</span>
        </div>
        <div style={{ display: "flex", justifyContent: "center", flex: 1 }}>
          <Link to="/" style={{ color: "#fff", margin: "0 15px", textDecoration: "none" }}>Chatbot</Link>
          <Link to="/dashboard/transcribe" style={{ color: "#fff", margin: "0 15px", textDecoration: "none" }}>Transcribe</Link>
          <Link to="/dashboard/document_processing" style={{ color: "#fff", margin: "0 15px", textDecoration: "none" }}>Document Processing</Link>
        </div>
      </nav>

      <div style={{ maxWidth: "800px", margin: "2rem auto", padding: "1rem" }}>
        <h1 style={{ textAlign: "center", marginBottom: "1.5rem" }}>Chatbot</h1>
        <div style={{
          backgroundColor: "#fff",
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          padding: "16px",
          marginBottom: "20px"
        }}>
          <div style={{ 
            marginBottom: "20px", 
            maxHeight: "400px", 
            overflowY: "auto",
            padding: "10px",
            backgroundColor: "#f9f9f9",
            borderRadius: "4px"
          }}>
            {chatHistory.map((chat, index) => (
              <div key={index} style={{ marginBottom: "15px" }}>
                {chat.user && (
                  <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "8px" }}>
                    <p style={{ 
                      backgroundColor: "#e9ecef", 
                      color: "#000", 
                      padding: "8px 12px", 
                      borderRadius: "12px",
                      display: "inline-block",
                      maxWidth: "80%",
                      margin: 0,
                      wordWrap: "break-word"
                    }}>
                      {isTranscribing && index === chatHistory.length - 1 
                        ? `🎤 Transcribing${transcribingDots}`
                        : chat.user}
                    </p>
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "flex-start" }}>
                  <p style={{ 
                    backgroundColor: "#e9ecef", 
                    padding: "8px 12px", 
                    borderRadius: "12px",
                    display: "inline-block",
                    maxWidth: "80%",
                    margin: 0,
                    wordWrap: "break-word"
                  }}>
                    {isLoading && index === chatHistory.length - 1 ? loadingDots : chat.bot}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message"
              style={{
                flex: 1,
                padding: "10px",
                borderRadius: "4px",
                border: "1px solid #ced4da"
              }}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <button
              onClick={handleSendMessage}
              style={{
                padding: "10px 20px",
                borderRadius: "4px",
                backgroundColor: "#6c757d",
                color: "#fff",
                border: "none",
                cursor: "pointer",
                transition: "background-color 0.3s ease"
              }}
              onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#5a6268")}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#6c757d")}
            >
              Send
            </button>
            <SpeechToText onTranscript={handleTranscript} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
