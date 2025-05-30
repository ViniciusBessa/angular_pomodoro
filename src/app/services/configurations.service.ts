import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ConfigurationsService {
  // Subjects to manage configuration settings
  pomodoroDurationSubject: BehaviorSubject<number>; // Tracks the Pomodoro duration
  shortBreakDurationSubject: BehaviorSubject<number>; // Tracks the short break duration
  longBreakDurationSubject: BehaviorSubject<number>; // Tracks the long break duration

  constructor() {
    // Initialize the Pomodoro duration from local storage or default to 30 minutes
    this.pomodoroDurationSubject = new BehaviorSubject<number>(
      Number(localStorage.getItem('pomodoroDuration')) || 30
    );

    // Initialize the short break duration from local storage or default to 5 minutes
    this.shortBreakDurationSubject = new BehaviorSubject<number>(
      Number(localStorage.getItem('shortBreakDuration')) || 5
    );

    // Initialize the long break duration from local storage or default to 15 minutes
    this.longBreakDurationSubject = new BehaviorSubject<number>(
      Number(localStorage.getItem('longBreakDuration')) || 15
    );
  }

  // Sets the Pomodoro duration and updates the subject
  setPomodoroDuration(duration: number): void {
    localStorage.setItem('pomodoroDuration', duration.toString()); // Save to local storage
    this.pomodoroDurationSubject.next(duration); // Update the subject
  }

  // Sets the short break duration and updates the subject
  setShortBreakDuration(duration: number): void {
    localStorage.setItem('shortBreakDuration', duration.toString()); // Save to local storage
    this.shortBreakDurationSubject.next(duration); // Update the subject
  }

  // Sets the long break duration and updates the subject
  setLongBreakDuration(duration: number): void {
    localStorage.setItem('longBreakDuration', duration.toString()); // Save to local storage
    this.longBreakDurationSubject.next(duration); // Update the subject
  }

  // Resets the duration to default
  resetToDefaultDurations() {
    localStorage.clear();

    this.setPomodoroDuration(30);
    this.setShortBreakDuration(5);
    this.setLongBreakDuration(15);
  }
}
