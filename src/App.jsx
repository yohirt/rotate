import { useEffect, useState } from "react";
import TaskPanel from "./components/TaskPanel";
import TaskWheel from "./components/TaskWheel";
import SubtaskWheel from "./components/SubtaskWheel";
import { initialTasks } from "./data/initialTasks";
import {
  loadTasks,
  saveTasks,
  loadRunningSession,
  saveRunningSession,
  clearRunningSession,
} from "./utils/taskStorage";
import {
  createSession,
  endSession,
  addSessionToTask,
  getDailyDuration,
} from "./utils/sessionTracker";
import "./App.css";

const getLocalDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

function App() {
  const [bootstrap] = useState(() => {
    const initialTasksState = loadTasks(initialTasks);
    const storedRunningSession = loadRunningSession();

    const isStoredSessionValid = storedRunningSession
      ? initialTasksState.some(
          (task) => task.id === storedRunningSession.taskId && !task.done
        )
      : false;

    const resolvedRunningSession = isStoredSessionValid
      ? storedRunningSession
      : null;

    const resolvedActiveIndex = resolvedRunningSession
      ? initialTasksState.findIndex(
          (task) => task.id === resolvedRunningSession.taskId && !task.done
        )
      : initialTasksState.findIndex((task) => !task.done);

    const safeActiveIndex = resolvedActiveIndex >= 0 ? resolvedActiveIndex : 0;
    const defaultTask = initialTasksState[safeActiveIndex];

    const createdRunningSession =
      resolvedRunningSession || (defaultTask && !defaultTask.done
        ? {
            taskId: defaultTask.id,
            startTime: createSession(new Date()).startTime,
          }
        : null);

    return {
      initialTasksState,
      initialActiveIndex: safeActiveIndex,
      initialRunningSession: createdRunningSession,
      initialSessionStartTime: createdRunningSession
        ? new Date(createdRunningSession.startTime)
        : new Date(),
    };
  });

  const [tasks, setTasks] = useState(bootstrap.initialTasksState);
  const [activeIndex, setActiveIndex] = useState(bootstrap.initialActiveIndex);
  const [showSubWheel, setShowSubWheel] = useState(false);
  const [runningSession, setRunningSession] = useState(
    bootstrap.initialRunningSession
  );
  const [sessionStartTime, setSessionStartTime] = useState(
    bootstrap.initialSessionStartTime
  );

  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  useEffect(() => {
    if (runningSession) {
      saveRunningSession(runningSession);
      return;
    }

    clearRunningSession();
  }, [runningSession]);

  const stopRunningSession = (endedAt) => {
    if (!runningSession) {
      return;
    }

    setTasks((prevTasks) => {
      const taskIndex = prevTasks.findIndex((task) => task.id === runningSession.taskId);
      if (taskIndex === -1) {
        return prevTasks;
      }

      const startedSession = createSession(new Date(runningSession.startTime));
      const completedSession = endSession(startedSession, endedAt);

      return prevTasks.map((task, index) =>
        index === taskIndex ? addSessionToTask(task, completedSession) : task
      );
    });

    setRunningSession(null);
    clearRunningSession();
  };

  const startRunningSessionForTask = (taskId, startedAt) => {
    const startedSession = createSession(startedAt);
    const nextRunningSession = {
      taskId,
      startTime: startedSession.startTime,
    };

    setRunningSession(nextRunningSession);
    setSessionStartTime(startedAt);
  };

  const activeTask = tasks[activeIndex] ?? null;
  const completedTasks = tasks.filter((task) => task.done).length;
  const progress = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

  // Łączny czas zapisanych sesji z całego dnia (wszystkie taski)
  const today = getLocalDateKey(new Date());
  const dailyTotalSaved = tasks.reduce(
    (sum, task) => sum + getDailyDuration(task, today),
    0
  );
  const dailyTotalSavedForTask = activeTask
    ? getDailyDuration(activeTask, today)
    : 0;

  const selectTask = (nextIndex) => {
    if (nextIndex === activeIndex || nextIndex < 0 || nextIndex >= tasks.length) {
      return;
    }

    const now = new Date();
    if (runningSession) {
      stopRunningSession(now);
    }

    setActiveIndex(nextIndex);

    const nextTask = tasks[nextIndex];
    if (nextTask && !nextTask.done) {
      startRunningSessionForTask(nextTask.id, now);
    }
  };

  function finishTask() {
    if (!activeTask) {
      return;
    }

    const now = new Date();
    if (runningSession && runningSession.taskId === activeTask.id) {
      stopRunningSession(now);
    }

    setSessionStartTime(null);

    setTasks((prevTasks) =>
      prevTasks.map((task, index) =>
        index === activeIndex ? { ...task, done: true } : task
      )
    );

    setShowSubWheel(false);

    setActiveIndex((prevIndex) => {
      const nextIndex = prevIndex + 1;
      const normalizedIndex = nextIndex >= tasks.length ? 0 : nextIndex;
      return normalizedIndex;
    });
  }

  function toggleSubtask(subtaskId) {
    if (!activeTask) {
      return;
    }

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
              setActiveIndex={selectTask}
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

          {activeTask ? (
            <TaskPanel
              task={activeTask}
              finishTask={finishTask}
              toggleSubtask={toggleSubtask}
              showSubWheel={showSubWheel}
              setShowSubWheel={setShowSubWheel}
              sessionStartTime={sessionStartTime}
              dailyTotalSaved={dailyTotalSaved}
              dailyTotalSavedForTask={dailyTotalSavedForTask}
            />
          ) : (
            <aside className="task-panel">
              <h2>Brak zadań</h2>
              <p className="empty">Dodaj zadania, aby rozpocząć cykl.</p>
            </aside>
          )}
        </section>

        {showSubWheel && activeTask && activeTask.subtasks.length > 0 && (
          <section className="subtask-section">
            <h2>Podzadania jako koło</h2>
            <SubtaskWheel subtasks={activeTask.subtasks} />
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
