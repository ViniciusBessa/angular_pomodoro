import { Component, computed, inject, OnInit } from '@angular/core';
import { PomodoroService } from '../../services/pomodoro.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { Task } from '../../models/task.model';
import { ConfigurationsService } from '../../services/configurations.service';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-timer',
  imports: [],
  templateUrl: './timer.component.html',
  styleUrl: './timer.component.css',
})
export class TimerComponent implements OnInit {
  // Injecting the PomodoroService for managing tasks
  pomodoroService = inject(PomodoroService);

  // Injecting the ConfigurationsService for managing the app's configs
  configurationsService = inject(ConfigurationsService);

  // Injecting the Title Service for setting the page's title
  titleService = inject(Title);

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
  pomodoroTime = toSignal(this.configurationsService.pomodoroDurationSubject);
  shortBreakTime = toSignal(
    this.configurationsService.shortBreakDurationSubject
  );
  longBreakTime = toSignal(this.configurationsService.longBreakDurationSubject);

  // Timer state variables
  intervalId: any = null;
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
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isTicking = false;
    this.currentTimerType = timerType;
    this.timeLeft = this.getTimeRemaining();
    this.titleService.setTitle(
      `${this.getCurrentTimerType}: ${this.getFormattedTime}`
    );
  }

  OnResumeTimer(): void {
    this.isTicking = true;
    this.intervalId = setInterval(() => {
      if (this.timeLeft === 0) {
        this.OnTimerFinished();
      } else {
        this.timeLeft -= 1;
        this.titleService.setTitle(
          `${this.getCurrentTimerType}: ${this.getFormattedTime}`
        );
      }
    }, 1000);
  }

  OnPauseTimer(): void {
    this.isTicking = false;
    clearInterval(this.intervalId);
  }

  OnTimerFinished(): void {
    clearInterval(this.intervalId);
    this.intervalId = null;

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
        return this.pomodoroTime()! * 60;
      case TimerType.SHORT_BREAK:
        return this.shortBreakTime()! * 60;
      default:
        return this.longBreakTime()! * 60;
    }
  }

  get getFormattedTime(): string {
    // Calculate the number of hours remaining
    const hours = Math.floor(this.timeLeft / 3600);

    // Calculate the number of minutes remaining and pad with leading zero if needed
    const minutes = Math.floor((this.timeLeft % 3600) / 60)
      .toString()
      .padStart(2, '0');

    // Calculate the number of seconds remaining and pad with leading zero if needed
    const seconds = Math.floor((this.timeLeft % 3600) % 60)
      .toString()
      .padStart(2, '0');

    // If there are hours remaining, include them in the formatted time
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes}:${seconds}`;
    }

    // Otherwise, return only minutes and seconds
    return `${minutes}:${seconds}`;
  }

  get getCurrentTimerType(): string {
    switch (this.currentTimerType) {
      case TimerType.POMODORO:
        return 'Pomodoro';
      case TimerType.SHORT_BREAK:
        return 'Short Break';
      default:
        return 'Long Break';
    }
  }
}

// Enum for timer types
enum TimerType {
  POMODORO,
  SHORT_BREAK,
  LONG_BREAK,
}
