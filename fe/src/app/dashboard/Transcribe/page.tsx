import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const Transcribe: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [context, setContext] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [transcription, setTranscription] = useState("");

  useEffect(() => {
    let progressInterval: NodeJS.Timeout;
    if (loading) {
      progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev < 85) {
            return prev + (85 / (15 * 10)); // Increase over 3 seconds
          }
          return prev;
        });
      }, 100);
    }
    return () => clearInterval(progressInterval);
  }, [loading]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setTranscription(""); // Clear previous transcription
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setTranscription("Please select a file first!");
      return;
    }

    setLoading(true);
    setProgress(0);
    setTranscription(""); // Clear previous transcription
    
    const formData = new FormData();
    formData.append("file", file);
    formData.append("context", context);

    try {
      const response = await fetch("http://127.0.0.1:5000/transcribe", {
        method: "POST",
        body: formData,
      });
      const text = await response.text();
      
      // Animate progress from 85 to 99
      const finalProgress = setInterval(() => {
        setProgress(prev => {
          if (prev < 99) {
            return prev + (14 / (1.6 * 10)); // Increase remaining 14% over 1.6 seconds
          }
          return prev;
        });
      }, 100);

      // Wait for animation to complete before showing content
      setTimeout(() => {
        clearInterval(finalProgress);
        setProgress(100);
        setTranscription(text);
        setLoading(false);
      }, 1600);

    } catch (error) {
      console.error("Error:", error);
      setLoading(false);
    }
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([transcription], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = "transcription.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
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
        <h1 style={{ textAlign: "center", marginBottom: "1.5rem" }}>Audio Transcription</h1>
        <div style={{
          backgroundColor: "#fff",
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          padding: "16px"
        }}>
          <div style={{ marginBottom: "10px" }}>
            <textarea
              placeholder="Optional context..."
              value={context}
              onChange={(e) => setContext(e.target.value)}
              style={{ 
                width: "calc(100% - 20px)", // Full width minus padding
                height: "40px", // Reduced height
                padding: "10px", 
                borderRadius: "4px", 
                marginBottom: "10px",
                resize: "none" // Prevents manual resizing
              }}
            ></textarea>
          </div>
          <div style={{ marginBottom: "10px" }}>
            <label><strong>Select Audio File:</strong></label>
            <input type="file" onChange={handleFileChange} accept="audio/*" style={{ marginLeft: "10px" }} />
          </div>
          <button
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
            onClick={handleUpload}
            disabled={loading}
          >
            {loading ? "Transcribing..." : "Upload & Transcribe"}
          </button>

          {(loading || progress === 100) && (
            <div style={{ marginTop: "20px" }}>
              <div style={{ 
                width: "100%", 
                height: "20px", 
                backgroundColor: "#e9ecef",
                borderRadius: "10px",
                overflow: "hidden"
              }}>
                <div style={{
                  width: `${progress}%`,
                  height: "100%",
                  backgroundColor: "#6c757d",
                  transition: "width 0.3s ease",
                  backgroundImage: progress === 100 ? "none" : `linear-gradient(
                    45deg,
                    rgba(255, 255, 255, 0.15) 25%,
                    transparent 25%,
                    transparent 50%,
                    rgba(255, 255, 255, 0.15) 50%,
                    rgba(255, 255, 255, 0.15) 75%,
                    transparent 75%,
                    transparent
                  )`,
                  backgroundSize: "1rem 1rem",
                  animation: progress === 100 ? "none" : "progress-bar-stripes 1s linear infinite"
                }} />
              </div>
              <p style={{ textAlign: "center", marginTop: "5px" }}>{Math.round(progress)}%</p>
            </div>
          )}

          {!loading && transcription && (
            <div style={{ marginTop: "20px" }}>
              <p style={{ 
                backgroundColor: "#f9f9f9", 
                padding: "10px", 
                borderRadius: "4px",
                whiteSpace: "pre-wrap"
              }}>
                <strong>Transcription:</strong> {transcription}
              </p>
              <button
                onClick={handleDownload}
                style={{
                  padding: "10px 20px",
                  borderRadius: "4px",
                  backgroundColor: "#28a745",
                  color: "#fff",
                  border: "none",
                  cursor: "pointer",
                  marginTop: "10px",
                  transition: "background-color 0.3s ease"
                }}
                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#218838")}
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#28a745")}
              >
                Download Transcription
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Transcribe;