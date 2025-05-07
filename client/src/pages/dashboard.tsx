import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { TaskWithStats } from "@shared/schema";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import TaskCard from "@/components/task-card";
import NewTaskDialog from "@/components/new-task-dialog";
import EditTaskDialog from "@/components/edit-task-dialog";

export default function Dashboard() {
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [showEditTaskModal, setShowEditTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskWithStats | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: tasks, isLoading, error } = useQuery<TaskWithStats[]>({
    queryKey: ["/api/tasks"],
    staleTime: 1000 * 60, // 1 minute
  });
  
  const handleEditTask = (task: TaskWithStats) => {
    setSelectedTask(task);
    setShowEditTaskModal(true);
  };
  
  const handleCloseEditModal = () => {
    setShowEditTaskModal(false);
    setSelectedTask(null);
  };
  
  // Filter tasks based on search query
  const filteredTasks = tasks?.filter(task => 
    task.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  // Calculate stats
  const totalTasks = tasks?.length || 0;
  const completedToday = tasks?.filter(task => {
    const today = new Date().toISOString().split('T')[0];
    const todayCompletion = task.completions.find(c => c.date === today);
    return todayCompletion && todayCompletion.completed;
  }).length || 0;
  
  const tasksWithStreak = tasks?.filter(task => task.currentStreak > 0).length || 0;
  
  const longestStreak = tasks?.reduce((max, task) => {
    return Math.max(max, task.longestStreak);
  }, 0) || 0;
  
  const longestStreakTask = tasks?.find(task => task.longestStreak === longestStreak)?.name || "";
  
  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <div className="mt-4 md:mt-0 w-full md:w-auto">
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2"
              placeholder="Search tasks..."
            />
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500 font-medium">Total Tasks</div>
                <div className="text-3xl font-semibold">{totalTasks}</div>
              </div>
              <div className="bg-primary/10 text-primary p-3 rounded-full">
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500 font-medium">Completed Today</div>
                <div className="text-3xl font-semibold">{completedToday}/{totalTasks}</div>
              </div>
              <div className="bg-green-100 text-green-600 p-3 rounded-full">
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <div className="text-sm text-gray-600 mt-2">
              {totalTasks > 0 && (
                <span>
                  {Math.round((completedToday / totalTasks) * 100)}% completion rate
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500 font-medium">Current Streaks</div>
                <div className="text-3xl font-semibold">{tasksWithStreak}</div>
              </div>
              <div className="bg-orange-100 text-orange-600 p-3 rounded-full">
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
                </svg>
              </div>
            </div>
            <div className="text-sm text-green-600 mt-2">
              {tasksWithStreak > 0 && `${tasksWithStreak} active streak${tasksWithStreak !== 1 ? 's' : ''}`}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500 font-medium">Longest Streak</div>
                <div className="text-3xl font-semibold">{longestStreak} days</div>
              </div>
              <div className="bg-purple-100 text-purple-600 p-3 rounded-full">
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
            </div>
            <div className="text-sm text-gray-500 mt-2">
              {longestStreakTask}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Task List */}
      <h2 className="text-lg font-medium text-gray-900 mb-4">Your Tasks</h2>
      
      {isLoading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => (
            <Card key={i} className="opacity-50">
              <CardContent className="p-6 h-64 animate-pulse">
                <div className="flex items-center space-x-4">
                  <div className="w-1 h-12 bg-gray-300 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="mt-4 space-y-3">
                  <div className="h-2 bg-gray-300 rounded"></div>
                  <div className="flex justify-between items-center">
                    <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                    <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                  </div>
                  <div className="flex justify-between space-x-1">
                    {[1, 2, 3, 4, 5, 6, 7].map(i => (
                      <div key={i} className="w-8 h-8 bg-gray-300 rounded-md"></div>
                    ))}
                  </div>
                  <div className="flex justify-between mt-4">
                    <div className="h-8 bg-gray-300 rounded w-1/2"></div>
                    <div className="flex space-x-2">
                      <div className="h-8 w-8 bg-gray-300 rounded-md"></div>
                      <div className="h-8 w-8 bg-gray-300 rounded-md"></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 text-red-600">
              <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-medium">Error loading tasks</h3>
            </div>
            <p className="mt-2 text-red-500">
              There was a problem loading your tasks. Please try again later.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Refresh Page
            </button>
          </CardContent>
        </Card>
      ) : filteredTasks?.length === 0 ? (
        <Card className="bg-gray-50">
          <CardContent className="p-10 text-center">
            {searchQuery ? (
              <>
                <svg className="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" />
                </svg>
                <h3 className="mt-2 text-lg font-medium text-gray-900">No matching tasks found</h3>
                <p className="mt-1 text-gray-500">Try adjusting your search query.</p>
                <button
                  onClick={() => setSearchQuery("")}
                  className="mt-4 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  Clear Search
                </button>
              </>
            ) : (
              <>
                <svg className="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <h3 className="mt-2 text-lg font-medium text-gray-900">No tasks yet</h3>
                <p className="mt-1 text-gray-500">Get started by creating a new task to track.</p>
                <button
                  onClick={() => setShowNewTaskModal(true)}
                  className="mt-4 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  <svg className="-ml-0.5 mr-1.5 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create New Task
                </button>
              </>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTasks?.map(task => (
            <TaskCard 
              key={task.id} 
              task={task}
              onEdit={handleEditTask}
            />
          ))}
        </div>
      )}

      {/* Dialogs */}
      <NewTaskDialog
        open={showNewTaskModal}
        onClose={() => setShowNewTaskModal(false)}
      />
      
      <EditTaskDialog
        open={showEditTaskModal}
        onClose={handleCloseEditModal}
        task={selectedTask}
      />
    </div>
  );
}
