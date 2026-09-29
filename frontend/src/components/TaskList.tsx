import { Task, TaskStatus } from '../types';
import { TaskCard } from './TaskCard';

interface TaskListProps {
  tasks: Task[];
  hasAnyTasks: boolean;
  busyTaskId: string | null;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onStatusChange: (task: Task, status: TaskStatus) => void;
}

export function TaskList({
  tasks,
  hasAnyTasks,
  busyTaskId,
  onEdit,
  onDelete,
  onStatusChange,
}: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="empty-state">
        <h2>{hasAnyTasks ? 'No matching tasks' : 'No tasks yet'}</h2>
        <p>
          {hasAnyTasks
            ? 'Try a different title or status filter.'
            : 'Create your first task with the New task button.'}
        </p>
      </div>
    );
  }

  return (
    <div className="task-list">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          busy={busyTaskId === task.id}
          onEdit={onEdit}
          onDelete={onDelete}
          onStatusChange={onStatusChange}
        />
      ))}
    </div>
  );
}
