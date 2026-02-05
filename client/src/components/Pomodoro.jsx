import React, { useState, useEffect } from "react";

const Pomodoro = () => {
  const [sessionLength, setSessionLength] = useState(25); // minutes
  const [time, setTime] = useState(sessionLength * 60);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let timer;
    if (isRunning && time > 0) {
      timer = setInterval(() => {
        setTime((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRunning, time]);

  // Update timer when session length changes
  useEffect(() => {
    setTime(sessionLength * 60);
  }, [sessionLength]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleStartPause = () => setIsRunning(!isRunning);
  const handleReset = () => {
    setIsRunning(false);
    setTime(sessionLength * 60);
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Pomodoro Timer</h1>

      <div style={styles.timer}>{formatTime(time)}</div>

      <div style={styles.controls}>
        <label style={styles.label}>
          Session Length:
          <input
            type="number"
            min="1"
            max="60"
            value={sessionLength}
            onChange={(e) => setSessionLength(Number(e.target.value))}
            style={styles.input}
          />
          minutes
        </label>
      </div>

      <div style={styles.buttons}>
        <button style={styles.button} onClick={handleStartPause}>
          {isRunning ? "Pause" : "Start"}
        </button>
        <button style={styles.button} onClick={handleReset}>Reset</button>
      </div>
    </div>
  );
};

const styles = {
  container: { display: "flex", flexDirection: "column", alignItems: "center", height: "100vh", justifyContent: "center", background: "linear-gradient(135deg, #ff9a9e, #fad0c4)" },
  title: { fontSize: "2rem", marginBottom: "20px" },
  timer: { fontSize: "4rem", fontWeight: "bold", marginBottom: "20px", background: "#fff", padding: "20px 40px", borderRadius: "10px" },
  controls: { marginBottom: "20px" },
  label: { fontSize: "1rem", marginRight: "10px" },
  input: { width: "60px", padding: "5px", marginLeft: "10px" },
  buttons: { display: "flex", gap: "10px" },
  button: { padding: "10px 20px", border: "none", borderRadius: "5px", background: "#333", color: "#fff", cursor: "pointer" }
};

export default Pomodoro;
