import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { TaskWithStats } from "@shared/schema";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, getDay, subMonths, addMonths } from "date-fns";

interface CalendarHeatmapProps {
  tasks: TaskWithStats[];
}

export default function CalendarHeatmap({ tasks }: CalendarHeatmapProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const days = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const dateRange = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    // Calculate starting offset (0 = Sunday, 1 = Monday, etc.)
    const startOffset = getDay(monthStart);
    
    // Create array of dates with padding for alignment
    const calendarDays = Array(startOffset).fill(null);
    
    // Add actual days
    dateRange.forEach(date => {
      const dateStr = format(date, "yyyy-MM-dd");
      
      // For each day, find completions across all tasks
      const dayCompletions = tasks.map(task => {
        const completion = task.completions.find(c => c.date === dateStr);
        return {
          taskId: task.id,
          color: task.color,
          completed: completion?.completed || false
        };
      });
      
      calendarDays.push({
        date,
        dateStr,
        completions: dayCompletions
      });
    });
    
    return calendarDays;
  }, [currentMonth, tasks]);
  
  const handlePrevMonth = () => {
    setCurrentMonth(prev => subMonths(prev, 1));
  };
  
  const handleNextMonth = () => {
    setCurrentMonth(prev => addMonths(prev, 1));
  };
  
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <h3 className="text-lg font-medium leading-6 text-gray-900">Task Completion Calendar</h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">Visual representation of your habit completion history.</p>
      </div>
      
      <div className="px-4 py-5 sm:p-6">
        <div className="mb-4 flex justify-between items-center">
          <Button 
            variant="outline" 
            size="icon"
            onClick={handlePrevMonth}
          >
            <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </Button>
          <h4 className="text-lg font-medium text-gray-900">
            {format(currentMonth, "MMMM yyyy")}
          </h4>
          <Button 
            variant="outline" 
            size="icon"
            onClick={handleNextMonth}
          >
            <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </Button>
        </div>
        
        <div className="grid grid-cols-7 gap-2 mb-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
            <div key={day} className="text-center text-xs font-medium text-gray-500 p-1">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => (
            <div 
              key={index} 
              className={`aspect-ratio-1/1 border rounded p-1 ${
                day === null 
                  ? "border-transparent" 
                  : "border-gray-200"
              }`}
            >
              {day !== null && (
                <div className="h-full flex flex-col">
                  <div className="text-xs text-gray-500">
                    {format(day.date, "d")}
                  </div>
                  
                  <div className="flex flex-wrap mt-auto justify-center gap-1">
                    {day.completions.map((completion, i) => (
                      <div 
                        key={i}
                        className={`w-2 h-2 rounded-full ${
                          completion.completed 
                            ? completion.color.replace("bg-", "") 
                            : "bg-gray-200"
                        }`}
                        title={completion.completed ? "Completed" : "Not completed"}
                      ></div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div className="flex justify-center space-x-8 mt-4">
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-green-100 mr-2"></div>
            <span className="text-sm text-gray-600">Completed</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-gray-200 mr-2"></div>
            <span className="text-sm text-gray-600">Not Completed</span>
          </div>
        </div>
      </div>
    </div>
  );
}
