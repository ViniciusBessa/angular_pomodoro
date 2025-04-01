import { Component, computed, inject, OnInit } from '@angular/core';
import { PomodoroService } from '../../services/pomodoro.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { Task } from '../../models/task.model';

@Component({
  selector: 'app-timer',
  imports: [],
  templateUrl: './timer.component.html',
  styleUrl: './timer.component.css',
})
export class TimerComponent implements OnInit {
  // Injecting the PomodoroService for managing tasks
  pomodoroService = inject(PomodoroService);

  // Signals
  tasks = toSignal(this.pomodoroService.tasksSubject);
  selectedTask = toSignal(this.pomodoroService.selectedTaskSubject);
  currentTask = computed(() => {
    if (this.selectedTask() != null) {
      return this.tasks()![this.selectedTask()!];
    }
    return null;
  });

  // Timer constants
  readonly POMODORO_TIME = 5; // 20 minutes
  readonly SHORT_BREAK_TIME = 2; // 5 minutes
  readonly LONG_BREAK_TIME = 3; // 10 minutes

  // Timer state variables
  intervalId: any;
  isTicking = false;
  currentTimerType = TimerType.POMODORO;
  timeLeft = this.getTimeRemaining();

  // Lifecycle hook
  ngOnInit(): void {
    // Subscribe to selectedTask changes and reset the timer to Pomodoro mode
    this.pomodoroService.selectedTaskSubject.subscribe(() =>
      this.OnSetTimer(TimerType.POMODORO)
    );
  }

  // Timer control methods
  OnSetTimer(timerType: TimerType): void {
    this.isTicking = false;
    this.currentTimerType = timerType;
    this.timeLeft = this.getTimeRemaining();
  }

  OnResumeTimer(): void {
    this.isTicking = true;
    this.intervalId = setInterval(() => {
      if (this.timeLeft === 0) {
        this.OnTimerFinished();
      } else {
        this.timeLeft -= 1;
      }
    }, 1000);
  }

  OnPauseTimer(): void {
    this.isTicking = false;
    clearInterval(this.intervalId);
  }

  OnTimerFinished(): void {
    clearInterval(this.intervalId);

    if (
      this.currentTimerType === TimerType.POMODORO &&
      this.currentTask() !== null
    ) {
      this.handlePomodoroCompletion();
    } else if (
      this.currentTimerType !== TimerType.POMODORO &&
      this.currentTask() !== null
    ) {
      this.OnSetTimer(TimerType.POMODORO);
      this.OnResumeTimer();
    } else {
      this.OnSetTimer(TimerType.POMODORO);
    }
  }

  // Handles the completion of a Pomodoro session
  private handlePomodoroCompletion(): void {
    const task = this.currentTask()!;
    this.pomodoroService.progressSelectedTask();

    if (this.shouldStartLongBreak(task)) {
      this.OnSetTimer(TimerType.LONG_BREAK);
      this.OnResumeTimer();
    } else if (this.shouldStartShortBreak(task)) {
      this.OnSetTimer(TimerType.SHORT_BREAK);
      this.OnResumeTimer();
    }
  }

  // Determines if a long break should start
  private shouldStartLongBreak(task: Task): boolean {
    return (
      task.currentPomodoros < task.totalPomodoros - 1 &&
      (task.currentPomodoros + 1) % 4 === 0
    );
  }

  // Determines if a short break should start
  private shouldStartShortBreak(task: Task): boolean {
    return (
      task.currentPomodoros < task.totalPomodoros - 1 &&
      (task.currentPomodoros + 1) % 4 !== 0
    );
  }

  // Helper method to get the remaining time based on the current timer type
  private getTimeRemaining(): number {
    switch (this.currentTimerType) {
      case TimerType.POMODORO:
        return this.POMODORO_TIME;
      case TimerType.SHORT_BREAK:
        return this.SHORT_BREAK_TIME;
      default:
        return this.LONG_BREAK_TIME;
    }
  }
}

// Enum for timer types
enum TimerType {
  POMODORO,
  SHORT_BREAK,
  LONG_BREAK,
}
