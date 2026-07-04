'use client';

import { AppLayout } from '@/components/layout/AppLayout';
import { Plus, MoreVertical, Calendar, Clock, MessageSquare, Paperclip, CheckSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/firebase/auth-context';

const columns = [
  { id: 'todo', title: 'To Do' },
  { id: 'in-progress', title: 'In Progress' },
  { id: 'review', title: 'In Review' },
  { id: 'done', title: 'Done' },
];

const priorityColors = {
  low: 'bg-zinc-100 text-zinc-700',
  medium: 'bg-blue-50 text-blue-700',
  high: 'bg-orange-50 text-orange-700',
  urgent: 'bg-red-50 text-red-700',
};

export default function ProjectsPage() {
  const { currentOrg, user } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [activeProject, setActiveProject] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      if (!currentOrg || !user) return;
      try {
        const token = await user.getIdToken();
        const res = await fetch('/api/v1/projects', { headers: {
          Authorization: `Bearer ${token}`,
          'x-organization-id': currentOrg.id,
        }});
        if (res.ok) {
          const json = await res.json();
          setProjects(json.data || []);
          if (json.data && json.data.length > 0) {
            setActiveProject(json.data[0]);
          }
        }
      } catch (error) {
        console.error('Failed to fetch projects', error);
      }
    };
    fetchProjects();
  }, [currentOrg, user]);

  useEffect(() => {
    const fetchTasks = async () => {
      if (!activeProject || !currentOrg || !user) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const token = await user.getIdToken();
        const res = await fetch(`/api/v1/tasks?projectId=${activeProject.id}`, { headers: {
          Authorization: `Bearer ${token}`,
          'x-organization-id': currentOrg.id,
        }});
        if (res.ok) {
          const json = await res.json();
          setTasks(json.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch tasks', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, [activeProject, currentOrg, user]);

  return (
    <AppLayout>
      <div className="h-full flex flex-col space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 flex-shrink-0">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
              {activeProject ? activeProject.name : 'Projects'}
            </h1>
            {activeProject && (
              <p className="text-sm text-zinc-500 mt-1">{activeProject.description || 'Manage tasks and workflows'}</p>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="flex -space-x-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-zinc-200 overflow-hidden">
                  <img src={`https://picsum.photos/seed/${i + 10}/100/100`} alt="User" />
                </div>
              ))}
            </div>
            <div className="w-px h-8 bg-zinc-200" />
            <button className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors">
              <Plus className="w-4 h-4" />
              New Task
            </button>
          </div>
        </div>

        {/* Kanban Board */}
        <div className="flex-1 overflow-x-auto">
          {!activeProject && !loading ? (
            <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-zinc-200 rounded-2xl bg-zinc-50/50">
              <CheckSquare className="w-8 h-8 text-zinc-400 mb-4" />
              <p className="text-zinc-600 font-medium">No active project</p>
              <button className="mt-4 px-4 py-2 bg-white border border-zinc-200 rounded-lg text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors">
                Create Project
              </button>
            </div>
          ) : (
            <div className="flex gap-6 min-w-max h-full pb-4">
              {columns.map((column) => {
                const columnTasks = tasks.filter(t => t.status === column.id);
                return (
                  <div key={column.id} className="w-80 flex flex-col bg-zinc-50/50 rounded-2xl border border-zinc-200/60 p-4">
                    <div className="flex items-center justify-between mb-4 px-1">
                      <h3 className="font-semibold text-zinc-900 flex items-center gap-2">
                        {column.title}
                        <span className="bg-zinc-200 text-zinc-600 px-2 py-0.5 rounded-full text-xs font-medium">
                          {columnTasks.length}
                        </span>
                      </h3>
                      <button className="text-zinc-400 hover:text-zinc-900 p-1 rounded hover:bg-zinc-100">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex-1 space-y-3 overflow-y-auto min-h-[150px]">
                      {columnTasks.map((task) => (
                        <div key={task.id} className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing group">
                          <div className="flex items-start justify-between mb-2">
                            <span className={cn(
                              "px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded border border-transparent",
                              priorityColors[task.priority as keyof typeof priorityColors] || priorityColors.medium
                            )}>
                              {task.priority}
                            </span>
                            <button className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-zinc-900 transition-opacity">
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </div>
                          
                          <h4 className="font-medium text-zinc-900 text-sm leading-snug mb-4">
                            {task.title}
                          </h4>

                          <div className="flex items-center justify-between text-zinc-500 text-xs">
                            <div className="flex items-center gap-3">
                              {task.dueDate && (
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-3.5 h-3.5" />
                                  <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}

                      <button className="w-full py-3 flex items-center justify-center gap-2 text-sm text-zinc-500 font-medium hover:bg-zinc-100 rounded-xl transition-colors border border-dashed border-zinc-300 hover:border-zinc-400">
                        <Plus className="w-4 h-4" />
                        Add Card
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
