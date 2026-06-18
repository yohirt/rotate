import { useState, useEffect } from "react";
import "./App.css";

const initialTasks = [
  {
    id: 1,
    title: "Przygotuj śniadanie",
    icon: "🥣",
    time: "07:30 - 08:00",
    description: "Przygotuj zdrowe i pożywne śniadanie na dobry początek dnia.",
    done: false,
    subtasks: [
      { id: 1, title: "Wyjmij składniki", done: true },
      { id: 2, title: "Przygotuj produkty", done: true },
      { id: 3, title: "Zrób kanapki / posiłek", done: false },
      { id: 4, title: "Sprzątnij kuchnię", done: false },
    ],
  },
  {
    id: 2,
    title: "Trening",
    icon: "🏃",
    time: "08:30 - 09:00",
    description: "Krótki trening poranny lub rozciąganie.",
    done: false,
    subtasks: [
      { id: 1, title: "Rozgrzewka", done: false },
      { id: 2, title: "Ćwiczenia główne", done: false },
      { id: 3, title: "Rozciąganie", done: false },
    ],
  },
  {
    id: 3,
    title: "Praca projektowa",
    icon: "💻",
    time: "09:30 - 12:00",
    description: "Praca nad aktualnym projektem lub zadaniami programistycznymi.",
    done: false,
    subtasks: [
      { id: 1, title: "Sprawdź listę zadań", done: false },
      { id: 2, title: "Zrób najważniejsze zadanie", done: false },
      { id: 3, title: "Zapisz postęp", done: false },
    ],
  },
  {
    id: 4,
    title: "Przerwa na lunch",
    icon: "🍴",
    time: "13:00 - 13:30",
    description: "Odpoczynek i posiłek.",
    done: false,
    subtasks: [],
  },
  {
    id: 5,
    title: "Nauka",
    icon: "📖",
    time: "15:00 - 16:00",
    description: "Czas na naukę, powtórkę albo rozwój osobisty.",
    done: false,
    subtasks: [
      { id: 1, title: "Wybierz temat", done: false },
      { id: 2, title: "Przerób materiał", done: false },
      { id: 3, title: "Zrób notatkę", done: false },
    ],
  },
  {
    id: 6,
    title: "Wieczorny relaks",
    icon: "🌿",
    time: "20:00 - 21:00",
    description: "Zakończenie dnia i chwila odpoczynku.",
    done: false,
    subtasks: [],
  },
];
// Klucz do localStorage dla zadań - można rozszerzyć o datę, by mieć osobne dane na każdy dzień
const TASKS_STORAGE_KEY = "rotate.tasks.v1";

function App() {
  const [tasks, setTasks] = useState(() => {
    const storedTasks = localStorage.getItem(TASKS_STORAGE_KEY);
      return storedTasks ? JSON.parse(storedTasks) : initialTasks;
  });
  
  const [activeIndex, setActiveIndex] = useState(0);
  const [showSubWheel, setShowSubWheel] = useState(false);

  const activeTask = tasks[activeIndex];

  const completedTasks = tasks.filter((task) => task.done).length;
  const progress = Math.round((completedTasks / tasks.length) * 100);

  useEffect(() => {
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);


  function finishTask() {
    setTasks((prevTasks) =>
      prevTasks.map((task, index) =>
        index === activeIndex ? { ...task, done: true } : task
      )
    );

    setShowSubWheel(false);

    setActiveIndex((prevIndex) => {
      const nextIndex = prevIndex + 1;
      return nextIndex >= tasks.length ? 0 : nextIndex;
    });
  }

  function toggleSubtask(subtaskId) {
    setTasks((prevTasks) =>
      prevTasks.map((task, index) => {
        if (index !== activeIndex) return task;

        return {
          ...task,
          subtasks: task.subtasks.map((subtask) =>
            subtask.id === subtaskId
              ? { ...subtask, done: !subtask.done }
              : subtask
          ),
        };
      })
    );
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="logo">
          <span className="logo-mark"></span>
          <strong>rotate.ma</strong>
        </div>

        <nav className="menu">
          <button className="active">🏠 Dzisiaj</button>
          <button>🔁 Moje cykle</button>
          <button>📅 Kalendarz</button>
          <button>📊 Statystyki</button>
          <button>🕘 Historia</button>
          <button>⚙️ Ustawienia</button>
        </nav>

        <div className="user-box">
          <div className="avatar">R</div>
          <div>
            <strong>Rafał</strong>
            <small>aktywny cykl</small>
          </div>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <span>Mój cykl:</span>
            <strong> Codzienna rutyna</strong>
          </div>

          <div className="topbar-actions">
            <span>📅 Środa, 22 maja</span>
            <button>🔔</button>
            <button>⋮</button>
          </div>
        </header>

        <section className="content">
          <div className="wheel-area">
            <TaskWheel
              tasks={tasks}
              activeIndex={activeIndex}
              setActiveIndex={setActiveIndex}
            />

            <div className="progress-card">
              <div className="progress-title">
                <span>Postęp cyklu</span>
                <strong>{progress}%</strong>
              </div>

              <div className="progress-bar">
                <div style={{ width: `${progress}%` }}></div>
              </div>

              <small>
                {completedTasks} z {tasks.length} zadań wykonane
              </small>
            </div>
          </div>

          <TaskPanel
            task={activeTask}
            finishTask={finishTask}
            toggleSubtask={toggleSubtask}
            showSubWheel={showSubWheel}
            setShowSubWheel={setShowSubWheel}
          />
        </section>

        {showSubWheel && activeTask.subtasks.length > 0 && (
          <section className="subtask-section">
            <h2>Podzadania jako koło</h2>
            <SubtaskWheel subtasks={activeTask.subtasks} />
          </section>
        )}
      </main>
    </div>
  );
}

function TaskWheel({ tasks, activeIndex, setActiveIndex }) {
  const angleStep = 360 / tasks.length;

  return (
    <div className="task-wheel">
      <div
        className="wheel-rotator"
        style={{
          transform: `rotate(${-activeIndex * angleStep}deg)`,
        }}
      >
        {tasks.map((task, index) => {
          const angle = index * angleStep;

          return (
            <button
              key={task.id}
              className={`wheel-item ${
                index === activeIndex ? "active" : ""
              } ${task.done ? "done" : ""}`}
              style={{
                transform: `rotate(${angle}deg) translate(0, -210px) rotate(${
                  -angle + activeIndex * angleStep
                }deg)`,
              }}
              onClick={() => setActiveIndex(index)}
            >
              <span className="task-number">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="task-icon">{task.icon}</span>
              <strong>{task.title}</strong>
            </button>
          );
        })}
      </div>

      <div className="wheel-center">
        <small>AKTUALNE ZADANIE</small>
        <h1>{tasks[activeIndex].title}</h1>
        <p>{tasks[activeIndex].time}</p>
      </div>
    </div>
  );
}

function TaskPanel({
  task,
  finishTask,
  toggleSubtask,
  showSubWheel,
  setShowSubWheel,
}) {
  const completedSubtasks = task.subtasks.filter((subtask) => subtask.done).length;

  return (
    <aside className="task-panel">
      <div className="panel-icon">{task.icon}</div>

      <h2>{task.title}</h2>

      <div className="meta">
        <span>⏱️ 30 min</span>
        <span>🔁 Codziennie</span>
      </div>

      <p className="description">{task.description}</p>

      <hr />

      <div className="subtask-header">
        <strong>Podzadania</strong>
        <span>
          {completedSubtasks} / {task.subtasks.length} wykonane
        </span>
      </div>

      {task.subtasks.length > 0 ? (
        <ul className="subtask-list">
          {task.subtasks.map((subtask) => (
            <li key={subtask.id}>
              <button
                className={subtask.done ? "checked" : ""}
                onClick={() => toggleSubtask(subtask.id)}
              >
                {subtask.done ? "✓" : ""}
              </button>
              <span className={subtask.done ? "done-text" : ""}>
                {subtask.title}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="empty">To zadanie nie ma podzadań.</p>
      )}

      <div className="panel-actions">
        <button
          className="secondary"
          onClick={() => setShowSubWheel(!showSubWheel)}
          disabled={task.subtasks.length === 0}
        >
          Podzadania jako koło
        </button>

        <button className="primary" onClick={finishTask}>
          ✓ Zakończ zadanie
        </button>
      </div>
    </aside>
  );
}

function SubtaskWheel({ subtasks }) {
  const angleStep = 360 / subtasks.length;

  return (
    <div className="subtask-wheel">
      {subtasks.map((subtask, index) => {
        const angle = index * angleStep;

        return (
          <div
            key={subtask.id}
            className={`subtask-wheel-item ${subtask.done ? "done" : ""}`}
            style={{
              transform: `rotate(${angle}deg) translate(0, -130px) rotate(${-angle}deg)`,
            }}
          >
            <span>{subtask.done ? "✓" : "○"}</span>
            <strong>{subtask.title}</strong>
          </div>
        );
      })}

      <div className="subtask-center">🔄</div>
    </div>
  );
}

export default App;