import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { TaskWithStats } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export default function Analytics() {
  const { data: tasks } = useQuery<TaskWithStats[]>({
    queryKey: ["/api/tasks"],
    staleTime: 1000 * 60, // 1 minute
  });
  
  const [question, setQuestion] = useState("");
  
  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Analytics</h1>
      
      <Card className="mb-6">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Habit Query Builder</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">Translate your questions into insights about your habits.</p>
        </div>
        <CardContent className="p-6">
          <div className="mb-4">
            <Label htmlFor="question" className="block text-sm font-medium text-gray-700">
              Ask a question about your habits
            </Label>
            <div className="mt-1">
              <Textarea
                id="question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                rows={3}
                placeholder="e.g. Which habits have I completed consistently in the last week?"
                className="resize-none"
              />
            </div>
          </div>
          <Button>
            <svg className="h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
            Generate Insights
          </Button>
        </CardContent>
        <div className="bg-gray-50 px-4 py-5 sm:p-6 border-t border-gray-200">
          <Label className="text-sm font-medium text-gray-700 mb-2">
            Habit Analysis
          </Label>
          <div className="bg-white border border-gray-200 rounded-md p-4 text-sm text-gray-600">
            {question ? (
              "Ask a question to generate insights about your habits."
            ) : (
              "Example insights will appear here. Ask a specific question about your habits to get started."
            )}
          </div>
        </div>
      </Card>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Card>
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Custom Report Builder</h3>
          </div>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="report-name">Report Name</Label>
                <Input
                  id="report-name"
                  placeholder="Weekly Habits Summary"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label className="mb-2 block">Select Habits</Label>
                <div className="space-y-2">
                  {tasks?.map(task => (
                    <div key={task.id} className="flex items-center space-x-2">
                      <Checkbox id={`task-${task.id}`} />
                      <Label htmlFor={`task-${task.id}`}>{task.name}</Label>
                    </div>
                  ))}
                  
                  {(!tasks || tasks.length === 0) && (
                    <div className="text-gray-500 text-sm">
                      No tasks available. Create some tasks first.
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <Label className="mb-2 block">Date Range</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start-date" className="sr-only">Start Date</Label>
                    <Input
                      type="date"
                      id="start-date"
                    />
                  </div>
                  <div>
                    <Label htmlFor="end-date" className="sr-only">End Date</Label>
                    <Input
                      type="date"
                      id="end-date"
                    />
                  </div>
                </div>
              </div>
              
              <Button className="w-full" disabled={!tasks || tasks.length === 0}>
                <svg className="h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Generate Report
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Habit Insights</h3>
          </div>
          <CardContent className="p-6">
            {tasks && tasks.length > 0 ? (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-100 rounded-md">
                  <h4 className="font-medium text-green-800">Best Performing Habit</h4>
                  <p className="text-green-700 mt-1">
                    {tasks.sort((a, b) => b.completionRate - a.completionRate)[0]?.name} 
                    <span className="text-sm ml-1">
                      ({tasks.sort((a, b) => b.completionRate - a.completionRate)[0]?.completionRate}% completion)
                    </span>
                  </p>
                </div>
                
                <div className="p-4 bg-yellow-50 border border-yellow-100 rounded-md">
                  <h4 className="font-medium text-yellow-800">Needs Improvement</h4>
                  <p className="text-yellow-700 mt-1">
                    {tasks.sort((a, b) => a.completionRate - b.completionRate)[0]?.name}
                    <span className="text-sm ml-1">
                      ({tasks.sort((a, b) => a.completionRate - b.completionRate)[0]?.completionRate}% completion)
                    </span>
                  </p>
                </div>
                
                <div className="p-4 bg-blue-50 border border-blue-100 rounded-md">
                  <h4 className="font-medium text-blue-800">Longest Current Streak</h4>
                  <p className="text-blue-700 mt-1">
                    {tasks.sort((a, b) => b.currentStreak - a.currentStreak)[0]?.name}
                    <span className="text-sm ml-1">
                      ({tasks.sort((a, b) => b.currentStreak - a.currentStreak)[0]?.currentStreak} days)
                    </span>
                  </p>
                </div>
                
                <div className="p-4 bg-purple-50 border border-purple-100 rounded-md">
                  <h4 className="font-medium text-purple-800">All-Time Best Streak</h4>
                  <p className="text-purple-700 mt-1">
                    {tasks.sort((a, b) => b.longestStreak - a.longestStreak)[0]?.name}
                    <span className="text-sm ml-1">
                      ({tasks.sort((a, b) => b.longestStreak - a.longestStreak)[0]?.longestStreak} days)
                    </span>
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center p-6">
                <svg className="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No habit data</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Start tracking your habits to see insights here.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
