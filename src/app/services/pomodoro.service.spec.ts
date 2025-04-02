import { TestBed } from '@angular/core/testing';
import { PomodoroService } from './pomodoro.service';
import { Task } from '../models/task.model';

describe('PomodoroService', () => {
  let service: PomodoroService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(PomodoroService);
  });

  it('should be created', () => {
    // Verifies that the service is created successfully
    expect(service).toBeTruthy();
  });

  it('should initialize with an empty task list', () => {
    // Ensures the service initializes with an empty task list
    service.tasksSubject.subscribe((tasks) => {
      expect(tasks.length).toBe(0);
    });
  });

  it('should create a new task', () => {
    // Ensures that a new task can be created
    const newTask: Task = {
      description: 'New Task',
      currentPomodoros: 0,
      totalPomodoros: 5,
    };

    service.createTask(newTask);

    service.tasksSubject.subscribe((tasks) => {
      expect(tasks.length).toBe(1);
      expect(tasks[0]).toEqual(newTask);
    });
  });

  it('should edit an existing task', () => {
    // Ensures that an existing task can be edited
    const initialTask: Task = {
      description: 'Initial Task',
      currentPomodoros: 0,
      totalPomodoros: 5,
    };

    service.createTask(initialTask);

    const updatedTask: Task = {
      description: 'Updated Task',
      currentPomodoros: 2,
      totalPomodoros: 6,
    };

    service.editTask(0, updatedTask);

    service.tasksSubject.subscribe((tasks) => {
      expect(tasks[0]).toEqual(updatedTask);
    });
  });

  it('should remove a task', () => {
    // Ensures that a task can be removed
    const task: Task = {
      description: 'Task to Remove',
      currentPomodoros: 0,
      totalPomodoros: 5,
    };

    service.createTask(task);
    service.removeTask(0);

    service.tasksSubject.subscribe((tasks) => {
      expect(tasks.length).toBe(0);
    });
  });

  it('should progress the selected task', () => {
    // Ensures that the currentPomodoros of the selected task is incremented
    const task: Task = {
      description: 'Task to Progress',
      currentPomodoros: 0,
      totalPomodoros: 5,
    };

    service.createTask(task);
    service.selectedTaskSubject.next(0);

    service.progressSelectedTask();

    service.tasksSubject.subscribe((tasks) => {
      expect(tasks[0].currentPomodoros).toBe(1);
    });
  });

  it('should not progress a task if no task is selected', () => {
    // Ensures that no task is progressed if no task is selected
    const task: Task = {
      description: 'Task to Progress',
      currentPomodoros: 0,
      totalPomodoros: 5,
    };

    service.createTask(task);
    service.selectedTaskSubject.next(null);

    service.progressSelectedTask();

    expect(service.tasksSubject.value[0].currentPomodoros).toBe(0);
  });

  it('should not progress a task beyond its totalPomodoros', () => {
    // Ensures that a task cannot be progressed beyond its totalPomodoros
    const task: Task = {
      description: 'Task to Limit Progress',
      currentPomodoros: 5,
      totalPomodoros: 5,
    };

    service.createTask(task);
    service.selectedTaskSubject.next(0);

    service.progressSelectedTask();

    service.tasksSubject.subscribe((tasks) => {
      expect(tasks.length).toBe(0); // Should not exceed totalPomodoros
    });
  });
});
