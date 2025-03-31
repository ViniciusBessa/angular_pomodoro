import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Task } from '../models/task.model';

@Injectable({
  providedIn: 'root',
})
export class PomodoroService {
  tasksSubject: BehaviorSubject<Task[]> = new BehaviorSubject<Task[]>([]);
  selectedTask: number | null = null;

  constructor() {
    // Loading the tasks from the local storage
    let tasks = localStorage.getItem('tasks');

    if (tasks) {
      this.tasksSubject.next(JSON.parse(tasks));
    }

    // Every time the tasks are modified, call the saveTasks method
    this.tasksSubject.subscribe((_) => this.saveTasks());
  }

  saveTasks(): void {
    // Getting the tasks from the subject
    let tasks = this.tasksSubject.value;

    // Saving the tasks on the local storage
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }

  createTask(task: Task): void {
    let tasks = this.tasksSubject.value;

    // Adding the new task to the end of the array
    this.tasksSubject.next([...tasks, task]);
  }

  editTask(index: number, key: string, value: string | number): void {
    // Modifying only the task that must be edited
    this.tasksSubject.next(
      this.tasksSubject.value.map((task, i) => {
        if (i === index) {
          return { ...task, [key]: value };
        }
        return task;
      })
    );
  }

  removeTask(index: number): void {
    // Filtering out the task that must be removed
    this.tasksSubject.next(
      this.tasksSubject.value.filter((_, i) => i !== index)
    );
  }
}
