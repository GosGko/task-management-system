import { useEffect, useState } from 'react';
import { createTask, deleteTask, getTasks, updateTask } from '../api';
import { StatusFilter, Task, TaskInput, TaskStatus } from '../types';
import { FilterBar } from './FilterBar';
import { StatusMessage } from './StatusMessage';
import { TaskForm } from './TaskForm';
import { TaskList } from './TaskList';

export function TaskManager() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [formMode, setFormMode] = useState<'closed' | 'create' | 'edit'>('closed');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [busyTaskId, setBusyTaskId] = useState<string | null>(null);

  async function loadTasks() {
    setLoading(true);
    setError(null);

    try {
      const data = await getTasks();
      setTasks(data);
    } catch (loadError) {
      const message = loadError instanceof Error ? loadError.message : 'Failed to load tasks.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadTasks();
  }, []);

  const visibleTasks = tasks.filter((task) => {
    const matchesStatus = statusFilter === 'ALL' || task.status === statusFilter;
    const matchesSearch = task.title.toLowerCase().includes(search.trim().toLowerCase());
    return matchesStatus && matchesSearch;
  });

  function openCreateForm() {
    setFormMode('create');
    setEditingTask(null);
    setFormError(null);
    setNotice(null);
  }

  function openEditForm(task: Task) {
    setFormMode('edit');
    setEditingTask(task);
    setFormError(null);
    setNotice(null);
  }

  function closeForm() {
    if (submitting) {
      return;
    }
    setFormMode('closed');
    setEditingTask(null);
    setFormError(null);
  }

  async function handleSubmit(input: TaskInput) {
    setSubmitting(true);
    setFormError(null);

    try {
      if (formMode === 'edit' && editingTask) {
        const updated = await updateTask(editingTask.id, input);
        setTasks((current) => current.map((task) => (task.id === updated.id ? updated : task)));
        setNotice('Task updated.');
      } else {
        const created = await createTask(input);
        setTasks((current) => [created, ...current]);
        setNotice('Task created.');
      }

      setFormMode('closed');
      setEditingTask(null);
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : 'Could not save the task.';
      setFormError(message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleStatusChange(task: Task, status: TaskStatus) {
    setBusyTaskId(task.id);
    setError(null);
    setNotice(null);

    try {
      const updated = await updateTask(task.id, {
        title: task.title,
        description: task.description,
        status,
        priority: task.priority,
        due_date: task.due_date,
      });
      setTasks((current) => current.map((item) => (item.id === updated.id ? updated : item)));
    } catch (statusError) {
      const message = statusError instanceof Error ? statusError.message : 'Could not change the status.';
      setError(message);
    } finally {
      setBusyTaskId(null);
    }
  }

  async function handleDelete(task: Task) {
    const confirmed = window.confirm(`Delete "${task.title}"?`);
    if (!confirmed) {
      return;
    }

    setBusyTaskId(task.id);
    setError(null);
    setNotice(null);

    try {
      await deleteTask(task.id);
      setTasks((current) => current.filter((item) => item.id !== task.id));
      if (editingTask?.id === task.id) {
        setFormMode('closed');
        setEditingTask(null);
      }
      setNotice('Task deleted.');
    } catch (deleteError) {
      const message = deleteError instanceof Error ? deleteError.message : 'Could not delete the task.';
      setError(message);
    } finally {
      setBusyTaskId(null);
    }
  }

  return (
    <div className="page">
      <header className="page-header">
        <p className="eyebrow">Task Management System</p>
        <h1>Tasks</h1>
        <p className="lede">Create tasks, set a priority and due date, then move them from to do to done.</p>
      </header>

      <FilterBar
        search={search}
        status={statusFilter}
        onSearchChange={setSearch}
        onStatusChange={setStatusFilter}
        onCreate={openCreateForm}
        createDisabled={submitting || formMode === 'create'}
      />

      <StatusMessage message={notice} tone="success" />
      <StatusMessage message={error} tone="error" onRetry={loadTasks} retryDisabled={loading} />

      {formMode !== 'closed' && (
        <TaskForm
          key={editingTask?.id ?? 'create'}
          mode={formMode}
          initialTask={editingTask}
          submitting={submitting}
          error={formError}
          onSubmit={handleSubmit}
          onCancel={closeForm}
        />
      )}

      {loading ? (
        <p className="loading-state">Loading tasks...</p>
      ) : error && tasks.length === 0 ? null : (
        <TaskList
          tasks={visibleTasks}
          hasAnyTasks={tasks.length > 0}
          busyTaskId={busyTaskId}
          onEdit={openEditForm}
          onDelete={handleDelete}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
}
