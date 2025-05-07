import { useState } from "react";
import { TaskWithStats } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

interface TaskCardProps {
  task: TaskWithStats;
  onEdit: (task: TaskWithStats) => void;
}

export default function TaskCard({ task, onEdit }: TaskCardProps) {
  const [isMarking, setIsMarking] = useState(false);
  const { toast } = useToast();
  
  // Get today's date in ISO format (YYYY-MM-DD)
  const today = new Date().toISOString().split('T')[0];
  
  // Check if the task is already marked as complete today
  const todayCompletion = task.completions.find(c => c.date === today);
  const isCompletedToday = todayCompletion?.completed || false;
  
  const handleMarkComplete = async () => {
    try {
      setIsMarking(true);
      
      // Toggle completion status for today
      await apiRequest("POST", `/api/tasks/${task.id}/completions`, {
        date: today,
        completed: !isCompletedToday
      });
      
      // Invalidate queries to refetch data
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      
      toast({
        title: !isCompletedToday ? "Task marked as complete" : "Task marked as incomplete",
        description: !isCompletedToday ? "Keep up the good work!" : "You can try again later",
      });
    } catch (error) {
      console.error("Error marking task", error);
      toast({
        title: "Error",
        description: "Failed to update task completion status",
        variant: "destructive"
      });
    } finally {
      setIsMarking(false);
    }
  };
  
  // Prepare the last 7 days data for display
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const completion = task.completions.find(c => c.date === dateStr);
    return {
      date: dateStr,
      completed: completion?.completed || false
    };
  }).reverse();
  
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center">
          <div className="mr-4">
            <div className={`${task.color} h-12 w-1 rounded-full`}></div>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-medium text-gray-900">{task.name}</h3>
            <p className="text-sm text-gray-500">{task.description}</p>
            <div className="mt-3 flex items-center">
              <div className="text-sm text-gray-500 mr-2">Completion:</div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="h-2.5 rounded-full bg-green-500" 
                  style={{ width: `${task.completionRate}%` }}
                ></div>
              </div>
              <span className="ml-2 text-sm text-gray-500">{task.completionRate}%</span>
            </div>
          </div>
        </div>
        
        <div className="mt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <svg 
                className="text-orange-500 h-5 w-5 mr-1" 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 20 20" 
                fill="currentColor"
              >
                <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium">{task.currentStreak} day streak</span>
            </div>
            <div className="flex items-center">
              <svg 
                className="text-purple-500 h-5 w-5 mr-1" 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 20 20" 
                fill="currentColor"
              >
                <path d="M5 3a1 1 0 000 2c5.523 0 10 4.477 10 10a1 1 0 102 0C17 8.373 11.627 3 5 3z" />
                <path d="M4 9a1 1 0 011-1 7 7 0 017 7 1 1 0 11-2 0 5 5 0 00-5-5 1 1 0 01-1-1z" />
              </svg>
              <span className="text-sm font-medium">{task.longestStreak} days best</span>
            </div>
          </div>
        </div>
        
        <div className="mt-4 text-xs text-gray-500">Last 7 days:</div>
        <div className="mt-1 flex justify-between space-x-1">
          {last7Days.map((day, index) => (
            <div 
              key={index}
              className={`w-8 h-8 rounded-md flex items-center justify-center ${
                day.completed 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-400'
              }`}
            >
              {day.completed ? (
                <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              )}
            </div>
          ))}
        </div>
        
        <div className="mt-5 flex justify-between">
          <button 
            onClick={handleMarkComplete}
            disabled={isMarking}
            className={`inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white ${
              isCompletedToday 
                ? 'bg-gray-600 hover:bg-gray-700'
                : 'bg-primary hover:bg-primary/90'
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary`}
          >
            {isMarking ? (
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : isCompletedToday ? (
              <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
            {isCompletedToday ? "Undo Complete" : "Mark Complete"}
          </button>
          
          <div className="flex space-x-2">
            <button 
              onClick={() => onEdit(task)}
              className="inline-flex items-center p-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
