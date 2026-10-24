import { loadData, saveData, validateData } from "./storage.js";

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const page = $("#page-content");
const modal = $("#modal");
const modalContent = $("#modal-content");
const searchInput = $("#global-search");
const state = { data: null, route: "dashboard", search: "", filterProject: "all", filterAssignee: "all" };

const ROUTES = {
  dashboard: "Visão geral", projects: "Projetos", kanban: "Quadro Kanban",
  documents: "Documentos", improvements: "Melhorias", calendar: "Calendário", backup: "Backup e dados",
};
const STATUS = { todo: "A fazer", in_progress: "Em andamento", completed: "Concluída" };
const PRIORITY = { low: "Baixa", medium: "Normal", high: "Alta", critical: "Urgente" };
const PRIORITY_CLASS = { low: "priority-low", medium: "priority-medium", high: "priority-high", critical: "priority-critical" };
const today = () => { const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 10); };
const uid = () => crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
const escapeHTML = (value = "") => String(value).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const text = (value = "") => escapeHTML(value).replace(/\n/g, "<br>");
const formatDate = (value) => value ? new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`)) : "Sem prazo";
const projectById = (id) => state.data.projects.find((project) => project.id === id);
const taskById = (id) => state.data.tasks.find((task) => task.id === id);
const projectTasks = (id) => state.data.tasks.filter((task) => task.projectId === id);
const projectProgress = (id) => { const tasks = projectTasks(id); return tasks.length ? Math.round(tasks.filter((task) => task.status === "completed").length / tasks.length * 100) : 0; };
const isOverdue = (task) => task.status !== "completed" && task.dueDate && task.dueDate < today();
const visibleBySearch = (value) => !state.search || String(value).toLowerCase().includes(state.search.toLowerCase());
const projectOptions = (selected = "") => state.data.projects.map((p) => `<option value="${p.id}" ${p.id === selected ? "selected" : ""}>${escapeHTML(p.name)}</option>`).join("");
const priorityOptions = (selected = "medium") => Object.entries(PRIORITY).map(([value, label]) => `<option value="${value}" ${value === selected ? "selected" : ""}>${label}</option>`).join("");
const statusOptions = (selected = "todo") => Object.entries(STATUS).map(([value, label]) => `<option value="${value}" ${value === selected ? "selected" : ""}>${label}</option>`).join("");

function toast(message, type = "success") {
  const item = document.createElement("div");
  item.className = `toast toast-${type}`;
  item.textContent = message;
  $("#toast-region").append(item);
  window.setTimeout(() => item.remove(), 3400);
}

function persist(message = "Alterações salvas neste navegador.") {
  try {
    state.data = saveData(state.data);
    toast(message);
    render();
  } catch (error) {
    toast(error.message, "error");
  }
}

function pageHeading(title, description, action = "") {
  return `<div class="page-heading"><div><div class="eyebrow">TASKFLOW / ${escapeHTML(ROUTES[state.route].toUpperCase())}</div><h1>${title}</h1><p>${description}</p></div>${action}</div>`;
}

function taskCard(task, compact = false) {
  const project = projectById(task.projectId);
  const checklistDone = task.checklist.filter((item) => item.done).length;
  const dueClass = isOverdue(task) ? "due-overdue" : task.dueDate === today() ? "due-today" : "";
  return `<article class="task-card ${compact ? "task-card-compact" : ""}" draggable="true" data-task-id="${task.id}" aria-label="${escapeHTML(task.title)}">
    <div class="task-card-top"><span class="priority-dot ${PRIORITY_CLASS[task.priority] || "priority-medium"}" title="Prioridade ${PRIORITY[task.priority] || "Normal"}"></span><span class="task-project">${escapeHTML(project?.name || "Projeto removido")}</span><button class="card-more" data-action="edit-task" data-id="${task.id}" aria-label="Editar tarefa">•••</button></div>
    <button class="task-title" data-action="edit-task" data-id="${task.id}">${escapeHTML(task.title)}</button>
    ${task.description ? `<p class="task-description">${escapeHTML(task.description)}</p>` : ""}
    <div class="task-card-bottom"><span class="task-assignee">${task.assignee ? `<span class="avatar">${escapeHTML(task.assignee.trim().slice(0, 1).toUpperCase())}</span>${escapeHTML(task.assignee)}` : `<span class="muted">Sem responsável</span>`}</span><span class="task-meta">${task.checklist.length ? `<span title="Checklist">☑ ${checklistDone}/${task.checklist.length}</span>` : ""}<span class="${dueClass}">◷ ${formatDate(task.dueDate)}</span></span></div>
  </article>`;
}

function emptyState(icon, title, description, action = "") {
  return `<div class="empty-state"><span class="empty-icon">${icon}</span><h3>${title}</h3><p>${description}</p>${action}</div>`;
}

function renderDashboard() {
  const tasks = state.data.tasks;
  const overdue = tasks.filter(isOverdue);
  const completed = tasks.filter((t) => t.status === "completed");
  const pending = tasks.filter((t) => t.status !== "completed");
  const activeProjects = state.data.projects.filter((p) => p.status !== "completed");
  const upcoming = tasks.filter((t) => t.status !== "completed" && t.dueDate && t.dueDate >= today()).sort((a, b) => a.dueDate.localeCompare(b.dueDate)).slice(0, 5);
  const projects = activeProjects.slice(0, 4);
  return `${pageHeading("Bom dia. <span class=\"heading-accent\">Aqui está seu trabalho.</span>", "Acompanhe projetos, prazos e o que precisa de atenção.", `<button class="button button-primary" data-action="new-task">＋ Nova tarefa</button>`)}
    <div class="metrics-grid">
      <div class="metric-card"><span class="metric-icon metric-indigo">▦</span><span class="metric-label">Total de tarefas</span><strong>${tasks.length}</strong><small>em todos os projetos</small></div>
      <div class="metric-card"><span class="metric-icon metric-green">✓</span><span class="metric-label">Concluídas</span><strong>${completed.length}</strong><small>${tasks.length ? Math.round(completed.length / tasks.length * 100) : 0}% do total</small></div>
      <div class="metric-card"><span class="metric-icon metric-amber">◷</span><span class="metric-label">Em aberto</span><strong>${pending.length}</strong><small>tarefas em andamento</small></div>
      <div class="metric-card"><span class="metric-icon metric-red">!</span><span class="metric-label">Atrasadas</span><strong>${overdue.length}</strong><small>precisam de atenção</small></div>
    </div>
    <div class="dashboard-grid"><section class="panel project-panel"><div class="panel-heading"><div><h2>Projetos em andamento</h2><p>Progresso calculado pelas tarefas concluídas.</p></div><a class="text-link" href="#projects">Ver projetos <span>→</span></a></div>
      ${projects.length ? `<div class="project-list">${projects.map((project) => { const count = projectTasks(project.id).length; const progress = projectProgress(project.id); return `<article class="project-row"><div class="project-symbol">${escapeHTML(project.name.slice(0, 1).toUpperCase())}</div><div class="project-main"><button data-action="edit-project" data-id="${project.id}" class="project-name">${escapeHTML(project.name)}</button><span>${count} ${count === 1 ? "tarefa" : "tarefas"}</span></div><div class="project-progress"><div class="progress-track"><span style="width:${progress}%"></span></div><small>${progress}%</small></div></article>`; }).join("")}</div>` : emptyState("▦", "Comece pelo primeiro projeto", "Crie um projeto para organizar tarefas, prazos e documentos.", `<button class="button button-secondary" data-action="new-project">Criar projeto</button>`)}
    </section><section class="panel attention-panel"><div class="panel-heading"><div><h2>Próximos prazos</h2><p>Tarefas abertas com data de entrega.</p></div><a class="text-link" href="#calendar">Calendário →</a></div>
      ${upcoming.length ? `<div class="due-list">${upcoming.map((task) => `<div class="due-row"><span class="due-date-box ${task.dueDate === today() ? "due-today" : ""}"><strong>${new Intl.DateTimeFormat("pt-BR", { day: "2-digit", timeZone: "UTC" }).format(new Date(`${task.dueDate}T00:00:00Z`))}</strong><small>${new Intl.DateTimeFormat("pt-BR", { month: "short", timeZone: "UTC" }).format(new Date(`${task.dueDate}T00:00:00Z`)).replace(".", "")}</small></span><div class="due-task-info"><button data-action="edit-task" data-id="${task.id}">${escapeHTML(task.title)}</button><small>${escapeHTML(projectById(task.projectId)?.name || "")}${task.assignee ? ` · ${escapeHTML(task.assignee)}` : ""}</small></div><span class="priority-tag ${PRIORITY_CLASS[task.priority]}">${PRIORITY[task.priority]}</span></div>`).join("")}</div>` : emptyState("◷", "Sem prazos próximos", "Tarefas abertas com data de entrega aparecem aqui.")}
    </section></div>
    <section class="panel activity-panel"><div class="panel-heading"><div><h2>Tarefas que precisam de atenção</h2><p>Atrasos identificados automaticamente pela data de entrega.</p></div><a class="text-link" href="#kanban">Abrir quadro →</a></div>${overdue.length ? `<div class="attention-tasks">${overdue.slice(0, 4).map((t) => taskCard(t, true)).join("")}</div>` : `<div class="all-clear"><span>✓</span><div><strong>Nenhuma tarefa atrasada</strong><small>Seus prazos estão em dia.</small></div></div>`}</section>`;
}

function renderProjects() {
  const projects = state.data.projects.filter((p) => visibleBySearch(`${p.name} ${p.description}`));
  return `${pageHeading("Projetos", "Organize o trabalho da equipe em iniciativas claras.", `<button class="button button-primary" data-action="new-project">＋ Novo projeto</button>`)}
    ${projects.length ? `<div class="project-grid">${projects.map((project) => { const tasks = projectTasks(project.id); const done = tasks.filter((t) => t.status === "completed").length; const progress = projectProgress(project.id); return `<article class="project-card"><div class="project-card-heading"><div class="project-symbol">${escapeHTML(project.name.slice(0, 1).toUpperCase())}</div><button class="card-more" data-action="edit-project" data-id="${project.id}" aria-label="Editar ${escapeHTML(project.name)}">•••</button></div><button class="project-card-title" data-action="edit-project" data-id="${project.id}">${escapeHTML(project.name)}</button><p>${escapeHTML(project.description || "Sem descrição adicionada.")}</p><div class="project-card-meta"><span class="status-pill status-${project.status}">${project.status === "completed" ? "Concluído" : project.status === "paused" ? "Pausado" : "Ativo"}</span><span>${done}/${tasks.length} concluídas</span></div><div class="progress-track"><span style="width:${progress}%"></span></div><div class="project-card-footer"><small>${progress}% concluído</small><button class="text-link" data-action="open-project-board" data-id="${project.id}">Ver tarefas →</button></div></article>`; }).join("")}</div>` : emptyState("▦", state.data.projects.length ? "Nenhum projeto encontrado" : "Seu espaço começa aqui", state.data.projects.length ? "Tente outro termo de busca." : "Crie um projeto e reúna as tarefas relacionadas em um só lugar.", `<button class="button button-primary" data-action="new-project">＋ Criar projeto</button>`)} `;
}

function renderKanban() {
  const projects = state.data.projects;
  const tasks = state.data.tasks.filter((task) => visibleBySearch(`${task.title} ${task.description} ${task.assignee} ${projectById(task.projectId)?.name || ""}`) && (state.filterProject === "all" || task.projectId === state.filterProject) && (state.filterAssignee === "all" || task.assignee === state.filterAssignee));
  const assignees = [...new Set(state.data.tasks.map((task) => task.assignee).filter(Boolean))].sort();
  return `${pageHeading("Quadro Kanban", "Visualize o fluxo e mova tarefas entre as etapas.", `<button class="button button-primary" data-action="new-task">＋ Nova tarefa</button>`)}
    <div class="board-toolbar"><label class="filter-control"><span>Projeto</span><select id="project-filter"><option value="all">Todos os projetos</option>${projects.map((p) => `<option value="${p.id}" ${state.filterProject === p.id ? "selected" : ""}>${escapeHTML(p.name)}</option>`).join("")}</select></label><label class="filter-control"><span>Responsável</span><select id="assignee-filter"><option value="all">Todos</option>${assignees.map((name) => `<option ${state.filterAssignee === name ? "selected" : ""}>${escapeHTML(name)}</option>`).join("")}</select></label><span class="board-total">${tasks.length} ${tasks.length === 1 ? "tarefa" : "tarefas"}</span></div>
    ${projects.length ? `<div class="kanban-board">${Object.entries(STATUS).map(([status, label]) => { const lane = tasks.filter((task) => task.status === status); return `<section class="kanban-lane" data-lane="${status}"><header class="lane-header"><div><span class="lane-indicator lane-${status}"></span><h2>${label}</h2><span class="lane-count">${lane.length}</span></div><button class="icon-button add-lane-task" data-action="new-task" data-status="${status}" aria-label="Adicionar em ${label}">＋</button></header><div class="lane-cards" data-drop-status="${status}">${lane.length ? lane.map((task) => taskCard(task)).join("") : `<div class="lane-empty">Solte tarefas aqui</div>`}</div></section>`; }).join("")}</div>` : emptyState("☷", "Crie um projeto primeiro", "Toda tarefa precisa estar vinculada a um projeto.", `<button class="button button-primary" data-action="new-project">Criar projeto</button>`)}`;
}

function renderDocuments() {
  const docs = state.data.documents.filter((doc) => visibleBySearch(`${doc.title} ${doc.category} ${doc.content} ${projectById(doc.projectId)?.name || ""}`));
  return `${pageHeading("Documentos de processo", "Procedimentos e instruções de trabalho em um só lugar.", `<button class="button button-primary" data-action="new-document">＋ Novo documento</button>`)}
    ${docs.length ? `<div class="document-grid">${docs.map((doc) => `<article class="document-card"><div class="document-card-top"><span class="document-icon">▤</span><button class="card-more" data-action="edit-document" data-id="${doc.id}" aria-label="Editar documento">•••</button></div><span class="document-category">${escapeHTML(doc.category || "Processo")}</span><button class="document-title" data-action="edit-document" data-id="${doc.id}">${escapeHTML(doc.title)}</button><p>${escapeHTML((doc.content || "").slice(0, 180))}${doc.content?.length > 180 ? "…" : ""}</p><div class="document-footer"><span>${doc.projectId ? escapeHTML(projectById(doc.projectId)?.name || "") : "Geral"}</span><small>Atualizado ${formatDate(doc.updatedAt || doc.createdAt)}</small></div></article>`).join("")}</div>` : emptyState("▤", "Nenhum documento por aqui", "Registre procedimentos e instruções usados pela equipe.", `<button class="button button-primary" data-action="new-document">＋ Criar documento</button>`)}`;
}

function renderImprovements() {
  const items = state.data.improvements.filter((item) => visibleBySearch(`${item.title} ${item.problem} ${item.action} ${item.assignee}`));
  const statuses = { open: "Aberta", in_progress: "Em andamento", completed: "Concluída" };
  return `${pageHeading("Melhoria contínua", "Registre problemas e acompanhe as ações propostas.", `<button class="button button-primary" data-action="new-improvement">＋ Nova iniciativa</button>`)}
    ${items.length ? `<div class="improvement-list">${items.map((item) => `<article class="improvement-card"><div class="improvement-marker">↗</div><div class="improvement-body"><div class="improvement-top"><span class="eyebrow">${item.projectId ? escapeHTML(projectById(item.projectId)?.name || "Projeto") : "INICIATIVA"}</span><button class="card-more" data-action="edit-improvement" data-id="${item.id}" aria-label="Editar iniciativa">•••</button></div><button class="improvement-title" data-action="edit-improvement" data-id="${item.id}">${escapeHTML(item.title)}</button><div class="improvement-details"><p><strong>Problema</strong> ${escapeHTML(item.problem || "Não informado")}</p><p><strong>Ação proposta</strong> ${escapeHTML(item.action || "Não informada")}</p>${item.cause ? `<p><strong>Causa</strong> ${escapeHTML(item.cause)}</p>` : ""}</div><div class="improvement-footer"><span class="status-pill status-${item.status}">${statuses[item.status] || "Aberta"}</span><span>${item.assignee ? `Responsável: ${escapeHTML(item.assignee)}` : "Sem responsável"}</span><span>Prazo: ${formatDate(item.dueDate)}</span></div></div></article>`).join("")}</div>` : emptyState("↗", "Nenhuma iniciativa registrada", "Transforme problemas identificados em ações acompanháveis.", `<button class="button button-primary" data-action="new-improvement">＋ Registrar melhoria</button>`)}`;
}

function renderCalendar() {
  const tasks = state.data.tasks.filter((task) => task.dueDate && visibleBySearch(`${task.title} ${task.assignee} ${projectById(task.projectId)?.name || ""}`)).sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  const groups = new Map();
  for (const task of tasks) { if (!groups.has(task.dueDate)) groups.set(task.dueDate, []); groups.get(task.dueDate).push(task); }
  return `${pageHeading("Calendário de prazos", "Veja as entregas organizadas por data.", `<button class="button button-primary" data-action="new-task">＋ Nova tarefa</button>`)}
    ${groups.size ? `<div class="calendar-list">${[...groups.entries()].map(([date, items]) => `<section class="calendar-day"><div class="calendar-date"><strong>${new Intl.DateTimeFormat("pt-BR", { day: "2-digit", timeZone: "UTC" }).format(new Date(`${date}T00:00:00Z`))}</strong><span>${new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${date}T00:00:00Z`))}</span></div><div class="calendar-events">${items.map((task) => `<article class="calendar-event ${isOverdue(task) ? "event-overdue" : ""}"><span class="priority-dot ${PRIORITY_CLASS[task.priority]}"></span><div><button data-action="edit-task" data-id="${task.id}">${escapeHTML(task.title)}</button><small>${escapeHTML(projectById(task.projectId)?.name || "")}${task.assignee ? ` · ${escapeHTML(task.assignee)}` : ""}</small></div><span class="status-pill status-${task.status}">${STATUS[task.status]}</span></article>`).join("")}</div></section>`).join("")}</div>` : emptyState("▦", "Nenhum prazo agendado", "Adicione uma data de entrega a uma tarefa para vê-la aqui.", `<button class="button button-primary" data-action="new-task">Criar tarefa</button>`)}`;
}

function renderBackup() {
  const counts = { projects: state.data.projects.length, tasks: state.data.tasks.length, documents: state.data.documents.length, improvements: state.data.improvements.length };
  return `${pageHeading("Backup e dados", "Exporte uma cópia dos seus dados ou restaure um backup Taskflow.")}
    <div class="backup-layout"><section class="panel backup-main"><div class="backup-icon">⤓</div><div class="eyebrow">CÓPIA LOCAL</div><h2>Seus dados ficam neste navegador</h2><p>Exporte um arquivo JSON para guardar uma cópia ou transferir seus dados. O arquivo inclui projetos, etapas, tarefas, checklists, comentários, documentos, melhorias e histórico.</p><div class="backup-summary"><div><strong>${counts.projects}</strong><span>projetos</span></div><div><strong>${counts.tasks}</strong><span>tarefas</span></div><div><strong>${counts.documents}</strong><span>documentos</span></div><div><strong>${counts.improvements}</strong><span>melhorias</span></div></div><button class="button button-primary" data-action="export-backup">↓ Exportar backup JSON</button></section>
    <section class="panel restore-panel"><span class="restore-icon">↥</span><h2>Restaurar um backup</h2><p>A importação substitui os dados atuais deste navegador. Confira o arquivo e exporte uma cópia antes de continuar.</p><label class="button button-secondary file-button">Escolher arquivo JSON<input id="backup-file" type="file" accept="application/json,.json"></label><small class="muted">O arquivo precisa ser um backup Taskflow válido, versão 1.</small></section></div>
    <div class="notice-card"><span>ⓘ</span><p><strong>Importante sobre armazenamento local</strong><br>Os dados ficam no navegador e no computador em que foram criados. Eles não são sincronizados automaticamente com outros computadores. Guarde o arquivo exportado em um local aprovado pela empresa.</p></div>`;
}

function render() {
  if (!ROUTES[state.route]) state.route = "dashboard";
  $("#current-section").textContent = ROUTES[state.route];
  $$(".main-nav a, .sidebar-bottom > a").forEach((link) => link.classList.toggle("active", link.dataset.route === state.route));
  $("#nav-task-count").textContent = state.data.tasks.length;
  $("#header-create").innerHTML = state.route === "kanban" ? "＋ <span>Nova tarefa</span>" : "＋ <span>Novo projeto</span>";
  const renderer = { dashboard: renderDashboard, projects: renderProjects, kanban: renderKanban, documents: renderDocuments, improvements: renderImprovements, calendar: renderCalendar, backup: renderBackup }[state.route];
  page.innerHTML = renderer();
}

function showModal(title, body, submitLabel = "Salvar") {
  modalContent.innerHTML = `<form class="modal-form" id="entity-form"><header class="modal-header"><div><div class="eyebrow">TASKFLOW</div><h2 id="modal-title">${title}</h2></div><button type="button" class="icon-button" data-action="close-modal" aria-label="Fechar">×</button></header><div class="modal-body">${body}</div><footer class="modal-footer"><button type="button" class="button button-secondary" data-action="close-modal">Cancelar</button><button type="submit" class="button button-primary">${submitLabel}</button></footer></form>`;
  modal.showModal();
  $(".modal-body input:not([type=hidden]), .modal-body textarea, .modal-body select")?.focus();
}

function field(label, name, value = "", options = {}) {
  const { type = "text", required = false, placeholder = "", hint = "", maxLength, rows = 3 } = options;
  const attr = `${required ? "required" : ""} ${maxLength ? `maxlength="${maxLength}"` : ""}`;
  const input = type === "textarea" ? `<textarea name="${name}" rows="${rows}" placeholder="${escapeHTML(placeholder)}" ${attr}>${escapeHTML(value)}</textarea>` : `<input type="${type}" name="${name}" value="${escapeHTML(value)}" placeholder="${escapeHTML(placeholder)}" ${attr}>`;
  return `<label class="form-field"><span>${label}${required ? " <b>*</b>" : ""}</span>${input}${hint ? `<small>${hint}</small>` : ""}</label>`;
}

function selectField(label, name, optionsHTML, selected = "") {
  return `<label class="form-field"><span>${label}</span><select name="${name}">${optionsHTML}</select></label>`;
}

function openProjectForm(id = "") {
  const project = id ? projectById(id) : null;
  const status = project?.status || "active";
  const stageNames = project ? state.data.stages.filter((stage) => stage.projectId === project.id).map((stage) => stage.name).join("\n") : "";
  showModal(project ? "Editar projeto" : "Novo projeto", `${field("Nome do projeto", "name", project?.name || "", { required: true, placeholder: "Ex.: Melhoria do atendimento", maxLength: 100 })}${field("Descrição", "description", project?.description || "", { type: "textarea", placeholder: "Qual resultado este projeto busca?" })}${field("Etapas", "stageNames", stageNames, { type: "textarea", placeholder: "Uma etapa por linha: Planejamento\\nExecução\\nValidação", rows: 3, hint: "Opcional. As tarefas podem ser vinculadas a uma etapa." })}${selectField("Status", "status", `<option value="active" ${status === "active" ? "selected" : ""}>Ativo</option><option value="paused" ${status === "paused" ? "selected" : ""}>Pausado</option><option value="completed" ${status === "completed" ? "selected" : ""}>Concluído</option>`, status)}<input type="hidden" name="entityId" value="${project?.id || ""}"><input type="hidden" name="entityType" value="project">${project ? `<button type="button" class="button button-danger-outline modal-delete" data-action="delete-project" data-id="${project.id}">Excluir projeto e suas tarefas</button>` : ""}`);
}

function checklistMarkup(items = []) {
  const list = items.length ? items : [{ id: uid(), text: "", done: false }];
  return `<div class="checklist-editor" id="checklist-editor">${list.map((item) => `<div class="check-row"><input type="checkbox" class="check-done" ${item.done ? "checked" : ""} aria-label="Item concluído"><input type="text" class="check-text" value="${escapeHTML(item.text)}" placeholder="Descreva uma etapa do checklist"><button type="button" class="remove-check" data-action="remove-check" aria-label="Remover item">×</button></div>`).join("")}</div><button type="button" class="text-link add-check" data-action="add-check">＋ Adicionar item</button>`;
}

function openTaskForm(id = "", status = "todo") {
  if (!state.data.projects.length) { toast("Crie um projeto antes de cadastrar uma tarefa.", "error"); openProjectForm(); return; }
  const task = id ? taskById(id) : null;
  const projectId = task?.projectId || (state.filterProject !== "all" ? state.filterProject : state.data.projects[0].id);
  const stages = state.data.stages.filter((stage) => stage.projectId === projectId);
  const comments = task?.comments || [];
  const commentsHTML = `${comments.length ? `<div class="existing-comments">${comments.map((comment) => `<div class="comment-item"><span class="avatar">${escapeHTML((comment.author || "U").slice(0, 1).toUpperCase())}</span><p>${escapeHTML(comment.text)}<small>${formatDate(comment.createdAt)}</small></p></div>`).join("")}</div>` : ""}${field("Adicionar comentário", "newComment", "", { placeholder: "Deixe uma atualização para a equipe", maxLength: 1000 })}`;
  const availableDependencies = state.data.tasks.filter((candidate) => candidate.id !== task?.id && candidate.projectId === projectId);
  const dependenciesHTML = availableDependencies.length ? `<div class="dependency-options">${availableDependencies.map((candidate) => `<label><input type="checkbox" class="dependency-check" value="${candidate.id}" ${(task?.dependencies || []).includes(candidate.id) ? "checked" : ""}><span>${escapeHTML(candidate.title)} <small>· ${STATUS[candidate.status]}</small></span></label>`).join("")}</div>` : `<small class="muted">Outras tarefas deste projeto podem ser definidas como dependências.</small>`;
  const history = task ? state.data.history.filter((entry) => entry.taskId === task.id).slice(0, 6) : [];
  const historyHTML = history.length ? `<div class="form-field"><span>Histórico recente</span><div class="existing-comments">${history.map((entry) => `<div class="history-item"><strong>${escapeHTML({ status: "Status", assignee: "Responsável", dueDate: "Prazo" }[entry.field] || entry.field)}</strong><span>${escapeHTML(String(entry.before || "—"))} → ${escapeHTML(String(entry.after || "—"))}</span><small>${new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(entry.createdAt))}</small></div>`).join("")}</div></div>` : "";
  showModal(task ? "Editar tarefa" : "Nova tarefa", `<div class="form-grid">${field("Título", "title", task?.title || "", { required: true, placeholder: "Descreva o resultado esperado", maxLength: 120 })}${selectField("Projeto", "projectId", projectOptions(projectId), projectId)}${selectField("Etapa", "stageId", `<option value="">Sem etapa</option>${stages.map((stage) => `<option value="${stage.id}" ${task?.stageId === stage.id ? "selected" : ""}>${escapeHTML(stage.name)}</option>`).join("")}`)}${selectField("Status", "status", statusOptions(task?.status || status), task?.status || status)}${selectField("Prioridade", "priority", priorityOptions(task?.priority || "medium"), task?.priority || "medium")}${field("Responsável", "assignee", task?.assignee || "", { placeholder: "Nome da pessoa" })}${field("Data de entrega", "dueDate", task?.dueDate || "", { type: "date" })}</div>${task ? field("Motivo da alteração do prazo", "dueDateReason", "", { placeholder: "Obrigatório quando mudar o prazo", maxLength: 300 }) : ""}${field("Descrição", "description", task?.description || "", { type: "textarea", placeholder: "Contexto e detalhes da tarefa", rows: 3 })}<div class="form-field"><span>Checklist</span>${checklistMarkup(task?.checklist || [])}<small>Marque os itens concluídos. Todos precisam estar marcados para concluir a tarefa.</small></div><div class="form-field"><span>Depende de</span>${dependenciesHTML}<small>Uma tarefa com dependências abertas não pode ser concluída.</small></div>${task ? `<div class="form-field"><span>Comentários</span>${commentsHTML}</div>${historyHTML}` : ""}<input type="hidden" name="entityId" value="${task?.id || ""}"><input type="hidden" name="entityType" value="task">${task ? `<button type="button" class="button button-danger-outline modal-delete" data-action="delete-task" data-id="${task.id}">Excluir tarefa</button>` : ""}`, task ? "Salvar alterações" : "Criar tarefa");
}

function openDocumentForm(id = "") {
  const doc = id ? state.data.documents.find((item) => item.id === id) : null;
  showModal(doc ? "Editar documento" : "Novo documento", `<div class="form-grid">${field("Título", "title", doc?.title || "", { required: true, placeholder: "Ex.: Abertura de chamados", maxLength: 120 })}${field("Categoria", "category", doc?.category || "", { placeholder: "Ex.: Procedimento operacional" })}${selectField("Projeto relacionado", "projectId", `<option value="">Geral</option>${projectOptions(doc?.projectId || "")}`)}</div>${field("Conteúdo", "content", doc?.content || "", { type: "textarea", required: true, placeholder: "Descreva o processo ou as instruções...", rows: 10 })}<input type="hidden" name="entityId" value="${doc?.id || ""}"><input type="hidden" name="entityType" value="document">${doc ? `<button type="button" class="button button-danger-outline modal-delete" data-action="delete-document" data-id="${doc.id}">Excluir documento</button>` : ""}`);
}

function openImprovementForm(id = "") {
  const item = id ? state.data.improvements.find((entry) => entry.id === id) : null;
  const statuses = { open: "Aberta", in_progress: "Em andamento", completed: "Concluída" };
  const selected = item?.status || "open";
  showModal(item ? "Editar iniciativa" : "Nova iniciativa de melhoria", `<div class="form-grid">${field("Título", "title", item?.title || "", { required: true, placeholder: "Resumo da melhoria", maxLength: 120 })}${selectField("Projeto relacionado", "projectId", `<option value="">Geral</option>${projectOptions(item?.projectId || "")}`)}${field("Responsável", "assignee", item?.assignee || "", { placeholder: "Nome da pessoa" })}${field("Prazo", "dueDate", item?.dueDate || "", { type: "date" })}${selectField("Status", "status", Object.entries(statuses).map(([value, label]) => `<option value="${value}" ${value === selected ? "selected" : ""}>${label}</option>`).join(""), selected)}</div>${field("Problema identificado", "problem", item?.problem || "", { type: "textarea", placeholder: "O que precisa melhorar?", rows: 3 })}${field("Causa identificada ou hipótese", "cause", item?.cause || "", { type: "textarea", placeholder: "O que pode estar causando o problema?", rows: 2 })}${field("Ação proposta", "action", item?.action || "", { type: "textarea", placeholder: "Qual ação será realizada?", rows: 3 })}<input type="hidden" name="entityId" value="${item?.id || ""}"><input type="hidden" name="entityType" value="improvement">${item ? `<button type="button" class="button button-danger-outline modal-delete" data-action="delete-improvement" data-id="${item.id}">Excluir iniciativa</button>` : ""}`);
}

function closeModal() { if (modal.open) modal.close(); }

function submitEntity(form) {
  const formData = new FormData(form);
  const type = formData.get("entityType");
  const id = formData.get("entityId");
  const now = new Date().toISOString();
  if (type === "project") {
    const existing = id ? projectById(id) : null;
    const record = { id: existing?.id || uid(), name: String(formData.get("name")).trim(), description: String(formData.get("description") || "").trim(), status: formData.get("status"), createdAt: existing?.createdAt || now, updatedAt: now };
    if (!record.name) return toast("Informe o nome do projeto.", "error");
    if (existing) state.data.projects = state.data.projects.map((p) => p.id === id ? record : p); else state.data.projects.unshift(record);
    const requestedNames = [...new Set(String(formData.get("stageNames") || "").split(/\r?\n/).map((name) => name.trim()).filter(Boolean))];
    const oldStages = state.data.stages.filter((stage) => stage.projectId === record.id);
    const retained = requestedNames.map((name) => oldStages.find((stage) => stage.name.toLowerCase() === name.toLowerCase()) || { id: uid(), projectId: record.id, name, createdAt: now });
    const retainedIds = new Set(retained.map((stage) => stage.id));
    const removedIds = new Set(oldStages.filter((stage) => !retainedIds.has(stage.id)).map((stage) => stage.id));
    state.data.stages = [...state.data.stages.filter((stage) => stage.projectId !== record.id), ...retained];
    if (removedIds.size) state.data.tasks = state.data.tasks.map((task) => removedIds.has(task.stageId) ? { ...task, stageId: "" } : task);
    closeModal(); persist(existing ? "Projeto atualizado." : "Projeto criado."); return;
  }
  if (type === "task") {
    const existing = id ? taskById(id) : null;
    const checklist = $$(".check-row", form).map((row) => ({ id: uid(), text: $(".check-text", row).value.trim(), done: $(".check-done", row).checked })).filter((item) => item.text);
    const dependencies = $$(".dependency-check:checked", form).map((input) => input.value);
    const status = formData.get("status");
    if (status === "completed" && checklist.some((item) => !item.done)) return toast("Conclua todos os itens do checklist antes de finalizar a tarefa.", "error");
    const record = { id: existing?.id || uid(), projectId: String(formData.get("projectId")), stageId: String(formData.get("stageId") || ""), title: String(formData.get("title")).trim(), description: String(formData.get("description") || "").trim(), assignee: String(formData.get("assignee") || "").trim(), status, priority: formData.get("priority"), dueDate: String(formData.get("dueDate") || ""), checklist, dependencies, comments: existing?.comments || [], createdAt: existing?.createdAt || now, updatedAt: now };
    if (!record.title || !projectById(record.projectId)) return toast("Informe um título e um projeto válido.", "error");
    if (status === "completed" && dependencies.some((dependencyId) => taskById(dependencyId)?.status !== "completed")) return toast("Conclua as tarefas das quais esta atividade depende primeiro.", "error");
    const dueDateReason = String(formData.get("dueDateReason") || "").trim();
    if (existing && existing.dueDate !== String(formData.get("dueDate") || "") && !dueDateReason) return toast("Informe o motivo da alteração do prazo.", "error");
    if (existing) {
      for (const key of ["status", "assignee", "dueDate"]) if (existing[key] !== record[key]) state.data.history.unshift({ id: uid(), taskId: record.id, field: key, before: existing[key] || "", after: record[key] || "", reason: key === "dueDate" ? dueDateReason : "", createdAt: now });
      state.data.tasks = state.data.tasks.map((t) => t.id === id ? record : t);
    } else state.data.tasks.unshift(record);
    const comment = String(formData.get("newComment") || "").trim();
    if (comment) record.comments.push({ id: uid(), text: comment, author: record.assignee || "Usuário local", createdAt: now });
    closeModal(); persist(existing ? "Tarefa atualizada." : "Tarefa criada."); return;
  }
  if (type === "document") {
    const existing = id ? state.data.documents.find((doc) => doc.id === id) : null;
    const record = { id: existing?.id || uid(), title: String(formData.get("title")).trim(), category: String(formData.get("category") || "").trim(), content: String(formData.get("content") || "").trim(), projectId: String(formData.get("projectId") || ""), createdAt: existing?.createdAt || now, updatedAt: now };
    if (!record.title || !record.content) return toast("Preencha o título e o conteúdo do documento.", "error");
    if (existing) state.data.documents = state.data.documents.map((doc) => doc.id === id ? record : doc); else state.data.documents.unshift(record);
    closeModal(); persist(existing ? "Documento atualizado." : "Documento criado."); return;
  }
  if (type === "improvement") {
    const existing = id ? state.data.improvements.find((entry) => entry.id === id) : null;
    const record = { id: existing?.id || uid(), title: String(formData.get("title")).trim(), projectId: String(formData.get("projectId") || ""), assignee: String(formData.get("assignee") || "").trim(), dueDate: String(formData.get("dueDate") || ""), status: formData.get("status"), problem: String(formData.get("problem") || "").trim(), cause: String(formData.get("cause") || "").trim(), action: String(formData.get("action") || "").trim(), createdAt: existing?.createdAt || now, updatedAt: now };
    if (!record.title) return toast("Informe o título da iniciativa.", "error");
    if (existing) state.data.improvements = state.data.improvements.map((entry) => entry.id === id ? record : entry); else state.data.improvements.unshift(record);
    closeModal(); persist(existing ? "Iniciativa atualizada." : "Iniciativa registrada.");
  }
}

function deleteRecord(type, id) {
  const labels = { project: "projeto e todas as tarefas vinculadas", task: "tarefa", document: "documento", improvement: "iniciativa" };
  if (!window.confirm(`Excluir ${labels[type]}? Esta ação não pode ser desfeita. Exporte um backup antes, se precisar.`)) return;
  if (type === "task") {
    state.data.tasks = state.data.tasks.filter((task) => task.id !== id).map((task) => ({ ...task, dependencies: task.dependencies.filter((dependencyId) => dependencyId !== id) }));
    state.data.history = state.data.history.filter((entry) => entry.taskId !== id);
  } else if (type === "project") {
    const taskIds = new Set(projectTasks(id).map((task) => task.id));
    state.data.projects = state.data.projects.filter((p) => p.id !== id);
    state.data.stages = state.data.stages.filter((s) => s.projectId !== id);
    state.data.tasks = state.data.tasks.filter((t) => t.projectId !== id);
    state.data.tasks = state.data.tasks.map((task) => ({ ...task, dependencies: task.dependencies.filter((dependencyId) => !taskIds.has(dependencyId)) }));
    state.data.history = state.data.history.filter((h) => !taskIds.has(h.taskId));
    state.data.documents = state.data.documents.map((d) => d.projectId === id ? { ...d, projectId: "" } : d);
    state.data.improvements = state.data.improvements.map((i) => i.projectId === id ? { ...i, projectId: "" } : i);
  } else if (type === "document") state.data.documents = state.data.documents.filter((doc) => doc.id !== id);
  else if (type === "improvement") state.data.improvements = state.data.improvements.filter((item) => item.id !== id);
  closeModal(); persist("Registro excluído.");
}

function exportBackup() {
  try {
    const data = loadData();
    const backup = { format: "taskflow-backup", schemaVersion: 1, exportedAt: new Date().toISOString(), data };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url; link.download = `taskflow-backup-${today()}.json`; link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast("Backup JSON exportado.");
  } catch (error) { toast(error.message, "error"); }
}

async function importBackup(file) {
  if (!file) return;
  let backup;
  try { backup = JSON.parse(await file.text()); }
  catch { toast("Não foi possível ler o JSON selecionado.", "error"); return; }
  if (backup?.format !== "taskflow-backup" || backup?.schemaVersion !== 1) { toast("Este arquivo não é um backup Taskflow compatível.", "error"); return; }
  try { validateData(backup.data); }
  catch (error) { toast(error.message, "error"); return; }
  if (!window.confirm("A importação substituirá os dados atuais deste navegador. Deseja continuar?")) return;
  try { state.data = saveData(backup.data); toast("Backup restaurado com sucesso."); render(); }
  catch (error) { toast(error.message, "error"); }
}

function handleAction(button) {
  const action = button.dataset.action;
  const id = button.dataset.id;
  if (action === "new-project") openProjectForm();
  else if (action === "edit-project") openProjectForm(id);
  else if (action === "new-task") openTaskForm("", button.dataset.status || "todo");
  else if (action === "edit-task") openTaskForm(id);
  else if (action === "new-document") openDocumentForm();
  else if (action === "edit-document") openDocumentForm(id);
  else if (action === "new-improvement") openImprovementForm();
  else if (action === "edit-improvement") openImprovementForm(id);
  else if (action === "delete-project") deleteRecord("project", id);
  else if (action === "delete-task") deleteRecord("task", id);
  else if (action === "delete-document") deleteRecord("document", id);
  else if (action === "delete-improvement") deleteRecord("improvement", id);
  else if (action === "close-modal") closeModal();
  else if (action === "export-backup") exportBackup();
  else if (action === "open-project-board") { state.filterProject = id; navigate("kanban"); }
  else if (action === "add-check") { const row = document.createElement("div"); row.className = "check-row"; row.innerHTML = `<input type="checkbox" class="check-done" aria-label="Item concluído"><input type="text" class="check-text" placeholder="Descreva uma etapa do checklist"><button type="button" class="remove-check" data-action="remove-check" aria-label="Remover item">×</button>`; $("#checklist-editor").append(row); $(".check-text", row).focus(); }
  else if (action === "remove-check") { const rows = $$(".check-row", $("#checklist-editor")); if (rows.length > 1) button.closest(".check-row").remove(); else { $(".check-text", button.closest(".check-row")).value = ""; $(".check-done", button.closest(".check-row")).checked = false; } }
}

function navigate(route) {
  if (!ROUTES[route]) return;
  state.route = route; state.search = ""; searchInput.value = "";
  if (route !== "kanban") { state.filterProject = "all"; state.filterAssignee = "all"; }
  location.hash = route;
  render();
  page.focus({ preventScroll: true });
  closeSidebar();
}

function closeSidebar() { $("#sidebar").classList.remove("sidebar-open"); $("#sidebar-scrim").classList.remove("visible"); $("#menu-toggle").setAttribute("aria-expanded", "false"); }

document.addEventListener("click", (event) => {
  const nav = event.target.closest("[data-route]");
  if (nav) { event.preventDefault(); navigate(nav.dataset.route); return; }
  const button = event.target.closest("[data-action]");
  if (button) { handleAction(button); return; }
  if (event.target === modal) closeModal();
});

document.addEventListener("submit", (event) => {
  if (event.target.id === "entity-form") { event.preventDefault(); submitEntity(event.target); }
});

document.addEventListener("change", (event) => {
  if (event.target.id === "project-filter") { state.filterProject = event.target.value; render(); }
  if (event.target.id === "assignee-filter") { state.filterAssignee = event.target.value; render(); }
  if (event.target.id === "backup-file") { importBackup(event.target.files?.[0]); event.target.value = ""; }
  if (event.target.name === "projectId" && $("#entity-form [name=entityType]")?.value === "task") {
    const stageSelect = $("#entity-form [name=stageId]");
    const stages = state.data.stages.filter((stage) => stage.projectId === event.target.value);
    stageSelect.innerHTML = `<option value="">Sem etapa</option>${stages.map((stage) => `<option value="${stage.id}">${escapeHTML(stage.name)}</option>`).join("")}`;
  }
});

searchInput.addEventListener("input", () => { state.search = searchInput.value.trim(); render(); searchInput.focus(); searchInput.setSelectionRange(searchInput.value.length, searchInput.value.length); });
$("#header-create").addEventListener("click", () => state.route === "kanban" ? openTaskForm() : openProjectForm());
$("#menu-toggle").addEventListener("click", () => { const open = $("#sidebar").classList.toggle("sidebar-open"); $("#sidebar-scrim").classList.toggle("visible", open); $("#menu-toggle").setAttribute("aria-expanded", String(open)); });
$("#sidebar-scrim").addEventListener("click", closeSidebar);
window.addEventListener("hashchange", () => { const route = location.hash.slice(1); if (ROUTES[route] && route !== state.route) { state.route = route; state.search = ""; searchInput.value = ""; render(); closeSidebar(); } });

// Kanban drag and drop; status changes still pass through checklist validation.
document.addEventListener("dragstart", (event) => { const card = event.target.closest(".task-card"); if (card) { event.dataTransfer.setData("text/taskflow-id", card.dataset.taskId); event.dataTransfer.effectAllowed = "move"; card.classList.add("is-dragging"); } });
document.addEventListener("dragend", (event) => event.target.closest(".task-card")?.classList.remove("is-dragging"));
document.addEventListener("dragover", (event) => { const lane = event.target.closest("[data-drop-status]"); if (lane) { event.preventDefault(); lane.classList.add("drop-active"); } });
document.addEventListener("dragleave", (event) => { if (!event.target.closest("[data-drop-status]")?.contains(event.relatedTarget)) event.target.closest("[data-drop-status]")?.classList.remove("drop-active"); });
document.addEventListener("drop", (event) => {
  const lane = event.target.closest("[data-drop-status]");
  if (!lane) return;
  event.preventDefault(); lane.classList.remove("drop-active");
  const task = taskById(event.dataTransfer.getData("text/taskflow-id"));
  const status = lane.dataset.dropStatus;
  if (!task || task.status === status) return;
  if (status === "completed" && task.checklist.some((item) => !item.done)) { toast("Conclua o checklist antes de finalizar esta tarefa.", "error"); return; }
  if (status === "completed" && task.dependencies.some((dependencyId) => taskById(dependencyId)?.status !== "completed")) { toast("Conclua as tarefas das quais esta atividade depende primeiro.", "error"); return; }
  const previous = task.status; task.status = status; task.updatedAt = new Date().toISOString();
  state.data.history.unshift({ id: uid(), taskId: task.id, field: "status", before: previous, after: status, createdAt: task.updatedAt });
  persist("Status da tarefa atualizado.");
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !modal.open) closeSidebar();
  const typing = ["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName);
  if (!typing && event.key === "/") { event.preventDefault(); searchInput.focus(); }
  if (!typing && event.key.toLowerCase() === "n" && !modal.open) { event.preventDefault(); state.route === "kanban" ? openTaskForm() : openProjectForm(); }
});

try {
  state.data = loadData();
  const initialRoute = location.hash.slice(1);
  if (ROUTES[initialRoute]) state.route = initialRoute;
  render();
} catch (error) {
  page.innerHTML = `<div class="storage-error"><span>!</span><h1>Não foi possível abrir seus dados</h1><p>${escapeHTML(error.message)}</p><a class="button button-secondary" href="#backup">Ir para backup e dados</a><p class="muted">O conteúdo local não foi alterado. Você pode recuperar um backup JSON válido.</p></div>`;
  console.error(error);
}
