import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Task } from '../models/task.model';

@Injectable({
  providedIn: 'root',
})
export class PomodoroService {
  // Subjects to manage tasks and the selected task
  tasksSubject: BehaviorSubject<Task[]> = new BehaviorSubject<Task[]>([]);
  selectedTaskSubject: BehaviorSubject<number | null> = new BehaviorSubject<
    number | null
  >(null);

  constructor() {
    // Load tasks from local storage on initialization
    const tasks = localStorage.getItem('tasks');
    if (tasks) {
      this.tasksSubject.next(JSON.parse(tasks));
    }

    // Automatically save tasks to local storage whenever they are modified
    this.tasksSubject.subscribe(() => this.saveTasks());
  }

  // Saves the current tasks to local storage
  private saveTasks(): void {
    const tasks = this.tasksSubject.value;
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }

  // Selects a task by its index
  selectTask(index: number): void {
    this.selectedTaskSubject.next(index);
  }

  // Creates a new task and adds it to the task list
  createTask(newTask: Task): void {
    const tasks = this.tasksSubject.value;
    this.tasksSubject.next([...tasks, newTask]);
  }

  // Edits an existing task at the specified index
  editTask(index: number, updatedTask: Task): void {
    this.tasksSubject.next(
      this.tasksSubject.value.map((task, i) =>
        i === index ? updatedTask : task
      )
    );

    if (index === this.selectedTaskSubject.value) {
      this.selectTask(index);
    }
  }

  // Removes a task at the specified index
  removeTask(index: number): void {
    if (index === this.selectedTaskSubject.value) {
      this.selectedTaskSubject.next(null);
    }
    this.tasksSubject.next(
      this.tasksSubject.value.filter((_, i) => i !== index)
    );
  }

  // Progresses the selected task by incrementing its currentPomodoros
  progressSelectedTask(): void {
    const index = this.selectedTaskSubject.value!;
    const task = this.tasksSubject.value[index];

    if (task.currentPomodoros === task.totalPomodoros - 1) {
      // If the task is complete, remove it and clear the selection
      this.removeTask(index);
      this.selectedTaskSubject.next(null);
    } else {
      // Otherwise, increment the currentPomodoros count
      this.editTask(index, {
        ...task,
        currentPomodoros: task.currentPomodoros + 1,
      });
    }
  }
}
