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

export default SubtaskWheel;
