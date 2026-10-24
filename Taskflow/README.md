# Taskflow

Aplicação web local para organizar projetos, tarefas, procedimentos e iniciativas de melhoria contínua. Construída com HTML, CSS e JavaScript sem dependências de aplicação ou serviços em nuvem.

## Executar

Abra um terminal nesta pasta e inicie um servidor estático local:

```powershell
py -m http.server 8000 --bind 127.0.0.1
```

Abra [http://localhost:8000](http://localhost:8000) no navegador. Encerre o servidor com `Ctrl+C`.

## O que já está disponível

- Dashboard com contagens, progresso de projetos, próximos prazos e tarefas atrasadas.
- Cadastro, edição e exclusão de projetos e tarefas.
- Quadro Kanban com arrastar e soltar, filtros por projeto e responsável.
- Checklist com validação antes de concluir uma tarefa, comentários e histórico de alterações de status, responsável e prazo.
- Cadastro e pesquisa de documentos de processo.
- Registro de problemas e iniciativas de melhoria contínua.
- Calendário de prazos em lista cronológica.
- Exportação e restauração de backup JSON versionado.
- Layout responsivo, navegação por teclado e armazenamento automático no navegador.

## Armazenamento e privacidade

Os dados ficam no `localStorage` do perfil de navegador em uso. Eles não são sincronizados entre computadores. Exporte backups JSON periodicamente e guarde-os em local autorizado pela empresa. A importação substitui os dados locais após validação e confirmação.

Não há autenticação real nesta versão. A aplicação é indicada para uso local em ambiente controlado; permissões de usuário exigiriam uma arquitetura com autenticação e armazenamento compartilhado.
