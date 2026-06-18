export const TASKS_STORAGE_KEY = "rotate.tasks.v1";

export function loadTasks(fallbackTasks) {
  try {
    const storedTasks = localStorage.getItem(TASKS_STORAGE_KEY);
    if (!storedTasks) {
      return fallbackTasks;
    }

    const parsedTasks = JSON.parse(storedTasks);
    return Array.isArray(parsedTasks) ? parsedTasks : fallbackTasks;
  } catch {
    return fallbackTasks;
  }
}

export function saveTasks(tasks) {
  localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
}
