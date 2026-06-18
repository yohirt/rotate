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

export default TaskPanel;
