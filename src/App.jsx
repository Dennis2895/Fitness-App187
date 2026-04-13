import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Bell,
  CalendarDays,
  Check,
  Dumbbell,
  Flame,
  Trophy,
  BarChart3,
  RotateCcw
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip
} from "recharts";

const PLAN = {
  A: {
    name: "Workout A",
    studioDays: ["Montag", "Mittwoch", "Freitag"],
    exercises: [
      { name: "Kniebeugen / Beinpresse", reps: "4 x 5–8" },
      { name: "Bankdrücken", reps: "4 x 5–8" },
      { name: "Schulterdrücken", reps: "3 x 6–10" },
      { name: "Klimmzüge / Latziehen", reps: "4 x 8–12" },
      { name: "Rudern (Kabel/Maschine)", reps: "3 x 8–12" },
      { name: "Cardio", reps: "max 10.min" },
      { name: "Seitheben", reps: "3 x 12–15" },
      { name: "Trizeps Pushdown", reps: "2–3 x 10–12" },
      { name: "Hanging Leg Raises", reps: "3 x 10–15" },
      { name: "Cable Crunch", reps: "3 x 12–15" }
    ]
  },
  B: {
    name: "Workout B",
    studioDays: ["Dienstag", "Donnerstag", "Samstag"],
    exercises: [
      { name: "Beinpresse / Lunges", reps: "3 x 8–12" },
      { name: "Cardio", reps: "max 10.min" },
      { name: "Beinbeuger Maschine", reps: "3 x 10–15" },
      { name: "Latziehen (eng)", reps: "3 x 10–12" },
      { name: "Rudern (andere Variante)", reps: "3 x 10–12" },
      { name: "Schrägbankdrücken (Kurzhantel)", reps: "3 x 8–12" },
      { name: "Seitheben", reps: "3 x 12–15" },
      { name: "Face Pulls", reps: "3 x 12–15" },
      { name: "Cable Pull Throughs", reps: "3 x 12–15" },
      { name: "Bizeps Curls", reps: "2–3 x 10–12" },
      { name: "Trizeps Pushdown", reps: "2–3 x 10–12" },
    ]
  }
};

const STORAGE_KEY = "fitness-split-app-vite-v1";
const WEEKDAYS = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];

function createInitialState() {
  return {
    activeSplit: "A",
    checks: { A: {}, B: {} },
    completedWorkouts: { A: 0, B: 0 },
    remindersEnabled: false,
    workoutHistory: []
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...createInitialState(), ...JSON.parse(raw) } : createInitialState();
  } catch {
    return createInitialState();
  }
}

function todayText() {
  return WEEKDAYS[new Date().getDay()];
}

function ProgressBar({ value }) {
  return (
    <div className="progress-shell">
      <div className="progress-fill" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}

function SectionCard({ children, className = "" }) {
  return <section className={`glass-card ${className}`.trim()}>{children}</section>;
}

function Button({ children, onClick, disabled = false, secondary = false, icon = null }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`button ${secondary ? "button-secondary" : "button-primary"} ${disabled ? "button-disabled" : ""}`.trim()}
    >
      {icon}
      <span>{children}</span>
    </button>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      aria-pressed={checked}
      className={`toggle ${checked ? "toggle-on" : ""}`.trim()}
      onClick={() => onChange(!checked)}
    >
      <span className="toggle-knob" />
    </button>
  );
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="tooltip-card">
      <div className="tooltip-title">{label}</div>
      <div className="tooltip-value">{payload[0].value} Workouts</div>
    </div>
  );
}

export default function App() {
  const [state, setState] = useState(loadState);
  const activePlan = PLAN[state.activeSplit];
  const today = todayText();
  const isGymDay = activePlan.studioDays.includes(today);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    if (state.remindersEnabled && "Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, [state.remindersEnabled]);

  useEffect(() => {
    if (!state.remindersEnabled || !("Notification" in window)) return;
    if (Notification.permission !== "granted") return;

    const key = `notified-${today}-${state.activeSplit}`;
    if (isGymDay && !sessionStorage.getItem(key)) {
      const timeout = window.setTimeout(() => {
        new Notification(`Heute ist ${activePlan.name}`, {
          body: `Studio-Tag: ${today}. Öffne Activity Gym und hake dein Training ab.`
        });
        sessionStorage.setItem(key, "1");
      }, 1200);

      return () => window.clearTimeout(timeout);
    }
  }, [activePlan.name, isGymDay, state.activeSplit, state.remindersEnabled, today]);

  const exerciseState = state.checks[state.activeSplit] || {};
  const totalExercises = activePlan.exercises.length;
  const completedExercises = activePlan.exercises.filter((_, index) => exerciseState[index]).length;
  const currentProgress = Math.round((completedExercises / totalExercises) * 100);
  const totalCompletedWorkouts = state.completedWorkouts.A + state.completedWorkouts.B;

  const splitProgress = useMemo(() => {
    const calc = (splitKey) => {
      const total = PLAN[splitKey].exercises.length;
      const completed = PLAN[splitKey].exercises.filter((_, index) => state.checks[splitKey]?.[index]).length;
      return Math.round((completed / total) * 100);
    };
    return { A: calc("A"), B: calc("B") };
  }, [state.checks]);

  const chartData = useMemo(
    () => [
      { name: "Split A", workouts: state.completedWorkouts.A },
      { name: "Split B", workouts: state.completedWorkouts.B }
    ],
    [state.completedWorkouts]
  );

  const recentHistory = [...state.workoutHistory].slice(-5).reverse();

  const toggleExercise = (index) => {
    setState((prev) => ({
      ...prev,
      checks: {
        ...prev.checks,
        [prev.activeSplit]: {
          ...prev.checks[prev.activeSplit],
          [index]: !prev.checks[prev.activeSplit]?.[index]
        }
      }
    }));
  };

  const resetSplit = () => {
    setState((prev) => ({
      ...prev,
      checks: {
        ...prev.checks,
        [prev.activeSplit]: {}
      }
    }));
  };

  const completeWorkout = () => {
    if (completedExercises !== totalExercises) return;

    setState((prev) => ({
      ...prev,
      completedWorkouts: {
        ...prev.completedWorkouts,
        [prev.activeSplit]: prev.completedWorkouts[prev.activeSplit] + 1
      },
      workoutHistory: [
        ...prev.workoutHistory,
        {
          split: prev.activeSplit,
          workoutName: PLAN[prev.activeSplit].name,
          date: new Date().toLocaleDateString("de-DE", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
          })
        }
      ],
      checks: {
        ...prev.checks,
        [prev.activeSplit]: {}
      }
    }));
  };

  return (
    <div className="app-shell">
      <div className="phone-frame">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.32 }}
        >
          <header className="top-header">
            <div>
              <div className="eyebrow">Dein Fitness Split</div>
              <h1 className="headline">Activity Gym</h1>
            </div>
            <div className="app-icon">
              <Flame size={24} />
            </div>
          </header>

          <SectionCard>
            <div className="row-between">
              <div>
                <div className="subtle-text">Heute</div>
                <div className="row-inline">
                  <CalendarDays size={16} />
                  <span>{today}</span>
                </div>
              </div>
              <div className="badge">{isGymDay ? "Studio-Tag" : "Regeneration"}</div>
            </div>
          </SectionCard>

          <div className="split-grid">
            {Object.keys(PLAN).map((key) => {
              const isActive = state.activeSplit === key;
              return (
                <button
                  key={key}
                  className={`split-card ${isActive ? "split-card-active" : ""}`.trim()}
                  onClick={() => setState((prev) => ({ ...prev, activeSplit: key }))}
                >
                  <div className="row-between">
                    <span className="split-label">Split {key}</span>
                    <Dumbbell size={16} />
                  </div>
                  <div className="split-name">{PLAN[key].name}</div>
                  <div className="split-days">{PLAN[key].studioDays.join(" • ")}</div>
                </button>
              );
            })}
          </div>

          <div className="stack">
            <SectionCard>
              <div className="row-between block-gap">
                <div className="section-title">Fortschritt {activePlan.name}</div>
                <div className="section-mini">{completedExercises}/{totalExercises}</div>
              </div>
              <ProgressBar value={currentProgress} />
              <div className="section-copy">{currentProgress}% der Übungen erledigt</div>
            </SectionCard>

            <div className="stats-grid">
              <SectionCard>
                <div className="stat-label"><Trophy size={16} /> Split A</div>
                <div className="stat-number">{state.completedWorkouts.A}</div>
                <div className="section-mini">Workouts abgeschlossen</div>
                <ProgressBar value={splitProgress.A} />
              </SectionCard>
              <SectionCard>
                <div className="stat-label"><Trophy size={16} /> Split B</div>
                <div className="stat-number">{state.completedWorkouts.B}</div>
                <div className="section-mini">Workouts abgeschlossen</div>
                <ProgressBar value={splitProgress.B} />
              </SectionCard>
            </div>

            <SectionCard>
              <div className="row-between">
                <div>
                  <div className="stat-label"><Bell size={16} /> Trainingserinnerung</div>
                  <div className="section-mini">Benachrichtigung an Studio-Tagen für den aktiven Split</div>
                </div>
                <Toggle
                  checked={state.remindersEnabled}
                  onChange={(checked) => setState((prev) => ({ ...prev, remindersEnabled: checked }))}
                />
              </div>
            </SectionCard>

            <SectionCard>
              <div className="chart-title"><BarChart3 size={18} /> Workout Historie</div>
              <div className="chart-wrap">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                    <XAxis dataKey="name" tick={{ fill: "#ffffff", fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} tick={{ fill: "#ffffff", fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(255,255,255,0.06)" }} />
                    <Bar dataKey="workouts" radius={[10, 10, 0, 0]} fill="#ffffff" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="history-box">
                <div className="history-title">Zuletzt gespeicherte Workouts</div>
                {recentHistory.length > 0 ? (
                  <div className="history-list">
                    {recentHistory.map((entry, index) => (
                      <div className="history-item" key={`${entry.date}-${entry.split}-${index}`}>
                        <div>
                          <div className="history-name">{entry.workoutName}</div>
                          <div className="history-sub">Split {entry.split}</div>
                        </div>
                        <div className="history-date">{entry.date}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="section-copy">Noch keine gespeicherten Workouts vorhanden.</div>
                )}
              </div>
            </SectionCard>

            <SectionCard>
              <div className="section-title">{activePlan.name} Übungen</div>
              <div className="exercise-list">
                {activePlan.exercises.map((exercise, index) => {
                  const done = !!exerciseState[index];
                  return (
                    <motion.button
                      key={exercise.name}
                      whileTap={{ scale: 0.985 }}
                      className={`exercise-item ${done ? "exercise-item-done" : ""}`.trim()}
                      onClick={() => toggleExercise(index)}
                    >
                      <div className="exercise-copy">
                        <div className="exercise-name">{exercise.name}</div>
                        <div className="exercise-reps">{exercise.reps}</div>
                      </div>
                      <div className={`check-pill ${done ? "check-pill-done" : ""}`.trim()}>
                        <Check size={16} />
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </SectionCard>

            <div className="button-grid">
              <Button onClick={resetSplit} secondary icon={<RotateCcw size={16} />}>
                Zurücksetzen
              </Button>
              <Button
                onClick={completeWorkout}
                disabled={completedExercises !== totalExercises}
                icon={<Check size={16} />}
              >
                Workout abschließen
              </Button>
            </div>

            <div className="footer-total">Gesamt abgeschlossene Workouts: {totalCompletedWorkouts}</div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
