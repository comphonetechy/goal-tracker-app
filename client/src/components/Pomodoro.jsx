import React, { useState, useEffect } from "react";

const Pomodoro = () => {
  const [workTime, setWorkTime] = useState(25);
  const [shortBreak, setShortBreak] = useState(5);
  const [longBreak, setLongBreak] = useState(15);

  const [mode, setMode] = useState("work"); // work | short | long
  const [time, setTime] = useState(workTime * 60);
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

  useEffect(() => {
    if (mode === "work") setTime(workTime * 60);
    if (mode === "short") setTime(shortBreak * 60);
    if (mode === "long") setTime(longBreak * 60);
  }, [workTime, shortBreak, longBreak, mode]);

  const handleSessionEnd = () => {
    setIsRunning(false);

    if (mode === "work") {
      const next = sessionCount + 1;
      setSessionCount(next);

      if (next % 4 === 0) {
        setMode("long");
        setTime(longBreak * 60);
      } else {
        setMode("short");
        setTime(shortBreak * 60);
      }
    } else {
      setMode("work");
      setTime(workTime * 60);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s
      .toString()
      .padStart(2, "0")}`;
  };

  const totalTime =
    mode === "work"
      ? workTime * 60
      : mode === "short"
      ? shortBreak * 60
      : longBreak * 60;

  const progress = ((totalTime - time) / totalTime) * 100;

  return (
    <div style={styles.container(mode)}>
      <h1>Pomodoro</h1>

      <div style={styles.modeRow}>
        <span style={mode === "work" ? styles.active : styles.mode}>Pomodoro</span>
        <span style={mode === "short" ? styles.active : styles.mode}>Short Break</span>
        <span style={mode === "long" ? styles.active : styles.mode}>Long Break</span>
      </div>

      <div style={styles.timer}>{formatTime(time)}</div>

      <div style={styles.progressBar}>
        <div style={{ ...styles.progressFill, width: `${progress}%` }} />
      </div>

      <button style={styles.mainButton} onClick={() => setIsRunning(!isRunning)}>
        {isRunning ? "PAUSE" : "START"}
      </button>

      <div style={styles.settings}>
        <label>
          Work:
          <input type="number" value={workTime} min="1" onChange={(e) => setWorkTime(+e.target.value)} /> min
        </label>
        <label>
          Short:
          <input type="number" value={shortBreak} min="1" onChange={(e) => setShortBreak(+e.target.value)} /> min
        </label>
        <label>
          Long:
          <input type="number" value={longBreak} min="1" onChange={(e) => setLongBreak(+e.target.value)} /> min
        </label>
      </div>

      <p>#{sessionCount + 1}</p>
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
    fontFamily: "Arial",
  }),
  modeRow: { display: "flex", gap: "15px", marginBottom: "20px" },
  mode: { opacity: 0.6 },
  active: { fontWeight: "bold", textDecoration: "underline" },
  timer: { fontSize: "6rem", marginBottom: "20px" },
  progressBar: { width: "300px", height: "8px", background: "rgba(255,255,255,.3)", marginBottom: "20px" },
  progressFill: { height: "100%", background: "#fff" },
  mainButton: { padding: "12px 50px", fontSize: "1.2rem", borderRadius: "8px", border: "none", cursor: "pointer" },
  settings: { display: "flex", gap: "10px", marginTop: "20px" }
};

export default Pomodoro;
