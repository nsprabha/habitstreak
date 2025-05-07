import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { TaskWithStats } from "@shared/schema";

interface EditTaskDialogProps {
  open: boolean;
  onClose: () => void;
  task: TaskWithStats | null;
}

export default function EditTaskDialog({ open, onClose, task }: EditTaskDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("bg-blue-500");
  const [resetStreak, setResetStreak] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (task) {
      setName(task.name);
      setDescription(task.description || "");
      setColor(task.color);
      setResetStreak(false);
    }
  }, [task]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!task) return;
    
    if (name.trim() === "") {
      toast({
        title: "Error",
        description: "Task name is required",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      await apiRequest("PUT", `/api/tasks/${task.id}`, {
        name,
        description,
        color
      });
      
      if (resetStreak) {
        // Reset streak by creating a new completion for today as incomplete
        const today = new Date().toISOString().split('T')[0];
        await apiRequest("POST", `/api/tasks/${task.id}/completions`, {
          date: today,
          completed: false
        });
      }
      
      // Refresh the task list
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      
      toast({
        title: "Success",
        description: "Task updated successfully"
      });
      
      onClose();
    } catch (error) {
      console.error("Error updating task:", error);
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!task) return;
    
    if (!confirm("Are you sure you want to delete this task? This action cannot be undone.")) {
      return;
    }
    
    try {
      setIsDeleting(true);
      
      await apiRequest("DELETE", `/api/tasks/${task.id}`, undefined);
      
      // Refresh the task list
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      
      toast({
        title: "Success",
        description: "Task deleted successfully"
      });
      
      onClose();
    } catch (error) {
      console.error("Error deleting task:", error);
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (!task) return null;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
          <DialogDescription>
            Make changes to your task or habit.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="col-span-3"
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="color" className="text-right">
                Color
              </Label>
              <Select 
                value={color} 
                onValueChange={setColor}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a color" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bg-blue-500">
                    <div className="flex items-center">
                      <div className="w-4 h-4 rounded-full bg-blue-500 mr-2"></div>
                      <span>Blue</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="bg-green-500">
                    <div className="flex items-center">
                      <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
                      <span>Green</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="bg-purple-500">
                    <div className="flex items-center">
                      <div className="w-4 h-4 rounded-full bg-purple-500 mr-2"></div>
                      <span>Purple</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="bg-orange-500">
                    <div className="flex items-center">
                      <div className="w-4 h-4 rounded-full bg-orange-500 mr-2"></div>
                      <span>Orange</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="bg-red-500">
                    <div className="flex items-center">
                      <div className="w-4 h-4 rounded-full bg-red-500 mr-2"></div>
                      <span>Red</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="reset-streak" className="text-right">
                Reset Streak
              </Label>
              <div className="flex items-center space-x-2 col-span-3">
                <Switch 
                  id="reset-streak" 
                  checked={resetStreak}
                  onCheckedChange={setResetStreak}
                />
                <Label htmlFor="reset-streak">Reset current streak to zero</Label>
              </div>
            </div>
          </div>
          
          <div className="flex justify-between">
            <Button 
              type="button" 
              variant="destructive" 
              onClick={handleDelete}
              disabled={isSubmitting || isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete Task"}
            </Button>
            
            <DialogFooter className="sm:justify-end">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                disabled={isSubmitting || isDeleting}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting || isDeleting}
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
