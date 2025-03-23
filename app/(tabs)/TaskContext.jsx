import React, { createContext, useState, useContext } from 'react';

// Create the context
const TaskContext = createContext();

// Create a provider component
export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);

  // Function to add a new task
  const addTask = (task) => {
    const newTask = {
      id: Date.now().toString(),
      task: task.task || 'No task name',
      tag: task.category,
      color: task.category === 'Work' ? '#FF0000' : 
             task.category === 'Personal' ? '#00FF00' : 
             task.category === 'Meeting' ? '#0000FF' : '#999999',
      selectedBoxes: task.timeSlots.join(', '),
      totalTime: task.timeSlots.length * 0.5, // Each slot is 30 minutes
      timestamp: new Date().toLocaleString()
    };
    
    setTasks(prevTasks => [...prevTasks, newTask]);
  };

  // Function to clear all tasks
  const clearTasks = () => {
    setTasks([]);
  };

  return (
    <TaskContext.Provider value={{ tasks, addTask, clearTasks }}>
      {children}
    </TaskContext.Provider>
  );
};

// Custom hook to use the task context
export const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
};