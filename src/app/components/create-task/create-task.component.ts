import { Component, inject, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { PomodoroService } from '../../services/pomodoro.service';

@Component({
  selector: 'app-create-task',
  imports: [ReactiveFormsModule],
  templateUrl: './create-task.component.html',
  styleUrl: './create-task.component.css',
})
export class CreateTaskComponent implements OnInit {
  // Injecting the PomodoroService for managing tasks
  private pomodoroService = inject(PomodoroService);

  // Form and state variables
  form!: FormGroup;
  isFormEnabled = false;

  // Lifecycle hook
  ngOnInit(): void {
    this.loadForm();
  }

  // Toggles the visibility of the form
  OnToggleForm(): void {
    this.isFormEnabled = !this.isFormEnabled;
  }

  // Initializes the form with validation rules
  private loadForm(): void {
    this.form = new FormGroup({
      description: new FormControl<string>('', [
        Validators.required, // Description is required
        Validators.minLength(3), // Minimum length of 3 characters
        Validators.maxLength(50), // Maximum length of 50 characters
      ]),
      totalPomodoros: new FormControl<number>(1, [
        Validators.required, // Total pomodoros is required
        Validators.min(1), // Minimum value of 1
        Validators.max(10), // Maximum value of 10
      ]),
    });
  }

  // Handles form submission
  OnSubmit(): void {
    if (!this.form.valid) {
      return; // Exit if the form is invalid
    }

    // Extract values from the form
    const { description, totalPomodoros } = this.form.value;

    // Create a new task using the PomodoroService
    this.pomodoroService.createTask({
      description,
      totalPomodoros,
      currentPomodoros: 0, // Initialize currentPomodoros to 0
    });

    // Reset the form and close it
    this.loadForm();
    this.OnToggleForm();
  }
}
