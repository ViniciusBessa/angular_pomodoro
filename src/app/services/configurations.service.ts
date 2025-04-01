import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ConfigurationsService {
  // Subjects to manage configuration settings
  themeSubject: BehaviorSubject<string>; // Tracks the current theme (light or dark)
  pomodoroDurationSubject: BehaviorSubject<number>; // Tracks the Pomodoro duration
  shortBreakDurationSubject: BehaviorSubject<number>; // Tracks the short break duration
  longBreakDurationSubject: BehaviorSubject<number>; // Tracks the long break duration

  constructor() {
    // Initialize the theme from local storage or default to 'dark'
    this.themeSubject = new BehaviorSubject<string>(
      localStorage.getItem('theme') || 'dark'
    );

    // Initialize the Pomodoro duration from local storage or default to 30 minutes
    this.pomodoroDurationSubject = new BehaviorSubject<number>(
      Number(localStorage.getItem('pomodoroDuration')) || 30
    );

    // Initialize the short break duration from local storage or default to 30 minutes
    this.shortBreakDurationSubject = new BehaviorSubject<number>(
      Number(localStorage.getItem('shortBreakDuration')) || 30
    );

    // Initialize the long break duration from local storage or default to 30 minutes
    this.longBreakDurationSubject = new BehaviorSubject<number>(
      Number(localStorage.getItem('longBreakDuration')) || 30
    );
  }

  // Toggles the theme between light and dark
  changeTheme(): void {
    const newTheme = this.themeSubject.value === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', newTheme); // Save the new theme to local storage
    this.themeSubject.next(newTheme); // Update the theme subject
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
}
