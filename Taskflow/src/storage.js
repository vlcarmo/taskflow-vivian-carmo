export const STORAGE_KEY = "taskflow.data.v1";
export const COLLECTIONS = ["projects", "stages", "tasks", "documents", "improvements", "history"];

export function emptyData() {
  return {
    schemaVersion: 1,
    updatedAt: null,
    projects: [],
    stages: [],
    tasks: [],
    documents: [],
    improvements: [],
    history: [],
  };
}

export function validateData(value) {
  if (!value || typeof value !== "object" || value.schemaVersion !== 1) {
    throw new Error("O arquivo não tem uma versão de dados Taskflow compatível.");
  }
  for (const collection of COLLECTIONS) {
    if (!Array.isArray(value[collection])) throw new Error(`A coleção “${collection}” está ausente ou inválida.`);
    const ids = new Set();
    for (const record of value[collection]) {
      if (!record || typeof record !== "object" || typeof record.id !== "string" || !record.id.trim()) {
        throw new Error(`Há um registro sem identificador válido em “${collection}”.`);
      }
      if (ids.has(record.id)) throw new Error(`Há identificadores repetidos em “${collection}”.`);
      ids.add(record.id);
    }
  }
  const projectIds = new Set(value.projects.map((item) => item.id));
  const taskIds = new Set(value.tasks.map((item) => item.id));
  const stageIds = new Set(value.stages.map((item) => item.id));
  for (const task of value.tasks) {
    if (!projectIds.has(task.projectId)) throw new Error("Há uma tarefa vinculada a um projeto inexistente.");
    if (!task.title || !["todo", "in_progress", "completed"].includes(task.status)) throw new Error("Há uma tarefa com título ou status inválido.");
    if (!Array.isArray(task.checklist) || !Array.isArray(task.comments) || !Array.isArray(task.dependencies)) throw new Error("Há dados de checklist, dependências ou comentários inválidos.");
    if (task.stageId && !stageIds.has(task.stageId)) throw new Error("Há uma tarefa vinculada a uma etapa inexistente.");
    if (task.dependencies.some((dependencyId) => !taskIds.has(dependencyId) || dependencyId === task.id)) throw new Error("Há uma dependência de tarefa inválida.");
  }
  for (const stage of value.stages) {
    if (!projectIds.has(stage.projectId)) throw new Error("Há uma etapa vinculada a um projeto inexistente.");
  }
  for (const improvement of value.improvements) {
    if (improvement.projectId && !projectIds.has(improvement.projectId)) throw new Error("Há uma melhoria vinculada a um projeto inexistente.");
  }
  for (const entry of value.history) {
    if (entry.taskId && !taskIds.has(entry.taskId)) throw new Error("Há um histórico vinculado a uma tarefa inexistente.");
  }
  return value;
}

export function loadData() {
  let raw;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch {
    throw new Error("O navegador não permitiu acessar o armazenamento local. Abra o Taskflow por http://localhost.");
  }
  if (!raw) return emptyData();
  try {
    return validateData(JSON.parse(raw));
  } catch (error) {
    if (error instanceof SyntaxError) throw new Error("Os dados locais estão corrompidos. Restaure um backup JSON válido.");
    throw error;
  }
}

export function saveData(data) {
  const snapshot = { ...data, updatedAt: new Date().toISOString() };
  validateData(snapshot);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  } catch (error) {
    if (error instanceof DOMException && error.name === "QuotaExceededError") {
      throw new Error("O armazenamento do navegador está cheio. Exporte um backup e remova dados que não precisa.");
    }
    throw new Error("Não foi possível salvar os dados neste navegador.");
  }
  return snapshot;
}
