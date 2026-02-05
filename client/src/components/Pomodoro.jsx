import React, { useState, useEffect } from "react";

const Pomodoro = () => {
  const WORK_TIME = 25 * 60;
  const SHORT_BREAK = 5 * 60;
  const LONG_BREAK = 15 * 60;

  const [mode, setMode] = useState("work"); // work | short | long
  const [time, setTime] = useState(WORK_TIME);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);

  useEffect(() => {
    let timer;
    if (isRunning && time > 0) {
      timer = setInterval(() => {
        setTime((prev) => prev - 1);
      }, 1000);
    }

    if (time === 0) {
      handleSessionEnd();
    }

    return () => clearInterval(timer);
  }, [isRunning, time]);

  const handleSessionEnd = () => {
    setIsRunning(false);

    if (mode === "work") {
      const nextSession = sessionCount + 1;
      setSessionCount(nextSession);

      if (nextSession % 4 === 0) {
        setMode("long");
        setTime(LONG_BREAK);
      } else {
        setMode("short");
        setTime(SHORT_BREAK);
      }
    } else {
      setMode("work");
      setTime(WORK_TIME);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const totalTime =
    mode === "work" ? WORK_TIME : mode === "short" ? SHORT_BREAK : LONG_BREAK;

  const progress = ((totalTime - time) / totalTime) * 100;

  return (
    <div style={styles.container(mode)}>
      <h1 style={styles.title}>Pomodoro</h1>

      <div style={styles.modeRow}>
        <span style={mode === "work" ? styles.activeMode : styles.mode}>Pomodoro</span>
        <span style={mode === "short" ? styles.activeMode : styles.mode}>Short Break</span>
        <span style={mode === "long" ? styles.activeMode : styles.mode}>Long Break</span>
      </div>

      <div style={styles.timer}>{formatTime(time)}</div>

      <div style={styles.progressBar}>
        <div style={{ ...styles.progressFill, width: `${progress}%` }} />
      </div>

      <button style={styles.mainButton} onClick={() => setIsRunning(!isRunning)}>
        {isRunning ? "PAUSE" : "START"}
      </button>

      <button style={styles.resetButton} onClick={() => {
        setIsRunning(false);
        setMode("work");
        setTime(WORK_TIME);
        setSessionCount(0);
      }}>
        Reset
      </button>

      <p style={styles.sessionText}>#{sessionCount + 1}</p>
    </div>
  );
};

const styles = {
  container: (mode) => ({
    height: "100vh",
    background:
      mode === "work"
        ? "#d95550"
        : mode === "short"
        ? "#4c9195"
        : "#457ca3",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontFamily: "Arial, sans-serif",
  }),
  title: {
    fontSize: "2rem",
    marginBottom: "10px",
  },
  modeRow: {
    display: "flex",
    gap: "15px",
    marginBottom: "30px",
  },
  mode: {
    opacity: 0.6,
  },
  activeMode: {
    fontWeight: "bold",
    textDecoration: "underline",
  },
  timer: {
    fontSize: "6rem",
    fontWeight: "bold",
    marginBottom: "20px",
  },
  progressBar: {
    width: "300px",
    height: "8px",
    background: "rgba(255,255,255,0.3)",
    borderRadius: "5px",
    marginBottom: "30px",
  },
  progressFill: {
    height: "100%",
    background: "#fff",
    borderRadius: "5px",
  },
  mainButton: {
    padding: "15px 60px",
    fontSize: "1.2rem",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    marginBottom: "10px",
    background: "#fff",
    color: "#333",
  },
  resetButton: {
    background: "transparent",
    border: "none",
    color: "#fff",
    cursor: "pointer",
    marginTop: "10px",
  },
  sessionText: {
    marginTop: "20px",
    opacity: 0.7,
  },
};

export default Pomodoro;
