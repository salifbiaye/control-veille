'use client'

import { useState } from 'react'
import { Plus, Check, X, Clock, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Task {
  id: string
  title: string
  description?: string
  status: 'pending' | 'in_progress' | 'completed'
  priority: 'low' | 'medium' | 'high'
  createdAt: Date
  dueDate?: Date
}

const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Mettre à jour la documentation',
    description: 'Ajouter les nouvelles fonctionnalités de l\'API',
    status: 'pending',
    priority: 'medium',
    createdAt: new Date('2024-01-15'),
    dueDate: new Date('2024-01-20')
  },
  {
    id: '2',
    title: 'Optimiser les performances',
    description: 'Réduire le temps de chargement du dashboard',
    status: 'in_progress',
    priority: 'high',
    createdAt: new Date('2024-01-14'),
    dueDate: new Date('2024-01-18')
  },
  {
    id: '3',
    title: 'Corriger le bug d\'authentification',
    description: 'Problème avec les sessions expirées',
    status: 'completed',
    priority: 'high',
    createdAt: new Date('2024-01-13'),
  },
  {
    id: '4',
    title: 'Ajouter les tests unitaires',
    description: 'Couverture de code minimale de 80%',
    status: 'pending',
    priority: 'low',
    createdAt: new Date('2024-01-16'),
    dueDate: new Date('2024-01-25')
  }
]

const priorityColors = {
  low: 'bg-primary/10 text-primary border-primary/20',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  high: 'bg-red-100 text-red-800 border-red-200'
}

const statusIcons = {
  pending: Clock,
  in_progress: AlertCircle,
  completed: Check
}

export function TaskManager() {
  const [tasks, setTasks] = useState<Task[]>(mockTasks)
  const [filter, setFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all')
  const [showAddForm, setShowAddForm] = useState(false)
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'medium' as 'low' | 'medium' | 'high' })

  const filteredTasks = tasks.filter(task =>
    filter === 'all' || task.status === filter
  )

  const handleAddTask = () => {
    if (!newTask.title.trim()) return

    const task: Task = {
      id: Date.now().toString(),
      title: newTask.title,
      description: newTask.description,
      status: 'pending',
      priority: newTask.priority,
      createdAt: new Date()
    }

    setTasks([task, ...tasks])
    setNewTask({ title: '', description: '', priority: 'medium' })
    setShowAddForm(false)
  }

  const handleUpdateStatus = (taskId: string, newStatus: Task['status']) => {
    setTasks(tasks.map(task =>
      task.id === taskId ? { ...task, status: newStatus } : task
    ))
  }

  const handleDeleteTask = (taskId: string) => {
    setTasks(tasks.filter(task => task.id !== taskId))
  }

  const stats = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    completed: tasks.filter(t => t.status === 'completed').length
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total</p>
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
              <span className="text-xs font-medium">{stats.total}</span>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">En attente</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">En cours</p>
              <p className="text-2xl font-bold text-primary">{stats.inProgress}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-primary" />
          </div>
        </div>

        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Terminées</p>
              <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
            </div>
            <Check className="w-8 h-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Filters and Add Button */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {(['all', 'pending', 'in_progress', 'completed'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                filter === status
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              )}
            >
              {status === 'all' && 'Toutes'}
              {status === 'pending' && 'En attente'}
              {status === 'in_progress' && 'En cours'}
              {status === 'completed' && 'Terminées'}
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nouvelle tâche
        </button>
      </div>

      {/* Add Task Form */}
      {showAddForm && (
        <div className="bg-card rounded-lg border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Nouvelle tâche</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Titre
              </label>
              <input
                type="text"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Titre de la tâche..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Description
              </label>
              <textarea
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                rows={3}
                placeholder="Description de la tâche..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Priorité
              </label>
              <select
                value={newTask.priority}
                onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as 'low' | 'medium' | 'high' })}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="low">Basse</option>
                <option value="medium">Moyenne</option>
                <option value="high">Haute</option>
              </select>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleAddTask}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Ajouter
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tasks List */}
      <div className="space-y-3">
        {filteredTasks.map((task) => {
          const StatusIcon = statusIcons[task.status]
          return (
            <div key={task.id} className="bg-card rounded-lg border p-4">
              <div className="flex items-start gap-3">
                <div className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                  task.status === 'completed' ? 'bg-green-100' :
                    task.status === 'in_progress' ? 'bg-primary/10' : 'bg-yellow-100'
                )}>
                  <StatusIcon className={cn(
                    'w-5 h-5',
                    task.status === 'completed' ? 'text-green-600' :
                      task.status === 'in_progress' ? 'text-primary' : 'text-yellow-600'
                  )} />
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className={cn(
                        'font-medium text-foreground',
                        task.status === 'completed' && 'line-through text-muted-foreground'
                      )}>
                        {task.title}
                      </h4>
                      {task.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {task.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <span className={cn(
                          'px-2 py-1 rounded-full text-xs font-medium border',
                          priorityColors[task.priority]
                        )}>
                          {task.priority === 'low' && 'Basse'}
                          {task.priority === 'medium' && 'Moyenne'}
                          {task.priority === 'high' && 'Haute'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {task.createdAt.toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 ml-4">
                      {task.status !== 'completed' && (
                        <button
                          onClick={() => handleUpdateStatus(task.id, 'completed')}
                          className="p-1.5 rounded hover:bg-green-100 text-green-600 transition-colors"
                          title="Marquer comme terminée"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                      {task.status === 'pending' && (
                        <button
                          onClick={() => handleUpdateStatus(task.id, 'in_progress')}
                          className="p-1.5 rounded hover:bg-primary/10 text-primary transition-colors"
                          title="Démarrer"
                        >
                          <AlertCircle className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="p-1.5 rounded hover:bg-red-100 text-red-600 transition-colors"
                        title="Supprimer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}

        {filteredTasks.length === 0 && (
          <div className="text-center py-12">
            <div className="w-12 h-12 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
              <Clock className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">Aucune tâche trouvée</p>
          </div>
        )}
      </div>
    </div>
  )
}
