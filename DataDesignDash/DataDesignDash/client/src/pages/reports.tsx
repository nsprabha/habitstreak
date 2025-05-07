import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { TaskWithStats } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import CalendarHeatmap from "@/components/ui/calendar-heatmap";

export default function Reports() {
  const { data: tasks, isLoading, error } = useQuery<TaskWithStats[]>({
    queryKey: ["/api/tasks"],
    staleTime: 1000 * 60, // 1 minute
  });
  
  if (isLoading) {
    return (
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">Reports</h1>
        <div className="space-y-6">
          <Card className="animate-pulse">
            <CardContent className="p-6 h-80">
              <div className="h-6 bg-gray-300 rounded w-1/4 mb-4"></div>
              <div className="h-4 bg-gray-300 rounded w-2/3 mb-8"></div>
              <div className="grid grid-cols-7 gap-2 mb-4">
                {Array.from({ length: 7 }).map((_, i) => (
                  <div key={i} className="h-4 bg-gray-300 rounded"></div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: 35 }).map((_, i) => (
                  <div key={i} className="aspect-square bg-gray-200 rounded"></div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Card className="animate-pulse">
              <CardContent className="p-6 h-64">
                <div className="h-6 bg-gray-300 rounded w-1/3 mb-6"></div>
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="w-full h-6 bg-gray-300 rounded"></div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card className="animate-pulse">
              <CardContent className="p-6 h-64">
                <div className="h-6 bg-gray-300 rounded w-1/3 mb-6"></div>
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex justify-between">
                      <div className="w-1/3 h-6 bg-gray-300 rounded"></div>
                      <div className="flex space-x-2">
                        <div className="w-16 h-6 bg-gray-300 rounded"></div>
                        <div className="w-16 h-6 bg-gray-300 rounded"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">Reports</h1>
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
      </div>
    );
  }
  
  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Reports</h1>
      
      <div className="space-y-6">
        {/* Calendar Heatmap */}
        {tasks && tasks.length > 0 ? (
          <CalendarHeatmap tasks={tasks} />
        ) : (
          <Card className="bg-gray-50">
            <CardContent className="p-10 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">No calendar data yet</h3>
              <p className="mt-1 text-gray-500">Add some tasks and complete them to see your data here.</p>
            </CardContent>
          </Card>
        )}
        
        {tasks && tasks.length > 0 && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {/* Task Performance */}
            <Card>
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Task Performance</h3>
              </div>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {tasks.map(task => (
                    <div key={task.id} className="mb-4">
                      <span className="text-sm font-medium text-gray-700">{task.name}</span>
                      <div className="flex items-center justify-between">
                        <div className="mt-1 w-full bg-gray-200 rounded-full h-2.5 mr-2">
                          <div 
                            className={`h-2.5 rounded-full ${task.color}`}
                            style={{ width: `${task.completionRate}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-500">{task.completionRate}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {/* Streak Summary */}
            <Card>
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Streak Summary</h3>
              </div>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {tasks.map(task => (
                    <div key={task.id} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">{task.name}</span>
                      <div className="flex items-center space-x-2">
                        <div className={`bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs flex items-center ${task.currentStreak === 0 ? 'bg-gray-100 text-gray-800' : ''}`}>
                          <svg className="h-3 w-3 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                          </svg>
                          <span>{task.currentStreak} days</span>
                        </div>
                        <div className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs flex items-center">
                          <svg className="h-3 w-3 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M5 3a1 1 0 000 2c5.523 0 10 4.477 10 10a1 1 0 102 0C17 8.373 11.627 3 5 3z" />
                            <path d="M4 9a1 1 0 011-1 7 7 0 017 7 1 1 0 11-2 0 5 5 0 00-5-5 1 1 0 01-1-1z" />
                          </svg>
                          <span>{task.longestStreak} days</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
