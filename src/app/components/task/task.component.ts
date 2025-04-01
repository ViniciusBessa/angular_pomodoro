import { Component, inject, input } from '@angular/core';
import { Task } from '../../models/task.model';
import { PomodoroService } from '../../services/pomodoro.service';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'app-task',
  imports: [ReactiveFormsModule],
  templateUrl: './task.component.html',
  styleUrl: './task.component.css',
})
export class TaskComponent {
  // Injecting the PomodoroService for managing tasks
  private pomodoroService = inject(PomodoroService);

  // Input properties to receive data from the parent component
  task = input.required<Task>(); // The task object
  index = input.required<number>(); // The index of the task in the list

  // State variables
  isEditing = false; // Tracks whether the task is in editing mode
  editingForm!: FormGroup; // Form group for handling task editing

  // Initializes the form with the current task's data
  loadForm(): void {
    this.editingForm = new FormGroup(
      {
        // Form control for the task description with validation rules
        newDescription: new FormControl<string>(this.task().description, [
          Validators.required, // Description is required
          Validators.minLength(3), // Minimum length of 3 characters
          Validators.maxLength(50), // Maximum length of 50 characters
        ]),
        // Form control for the current number of pomodoros with validation rules
        newCurrentPomodoros: new FormControl<number>(
          this.task().currentPomodoros,
          [Validators.required, Validators.min(0)] // Must be a non-negative number
        ),
        // Form control for the total number of pomodoros with validation rules
        newTotalPomodoros: new FormControl<number>(this.task().totalPomodoros, [
          Validators.required, // Total pomodoros is required
          Validators.max(10), // Maximum value of 10
        ]),
      },
      {
        validators: [
          this.totalPomodorosGreaterThanCurrent(),
          this.currentPomodorosLowerThanTotal(),
        ],
      }
    );
  }

  // Toggles the editing mode and initializes the form if entering edit mode
  OnToggleEditing(): void {
    this.isEditing = !this.isEditing;

    if (this.isEditing) {
      this.loadForm(); // Load the form with the current task data
    }
  }

  OnSelectTask(): void {
    this.pomodoroService.selectTask(this.index());
  }

  // Deletes the task by calling the PomodoroService
  OnDeleteTask(): void {
    this.pomodoroService.removeTask(this.index()); // Removes the task at the given index
  }

  // Submits the edited task data
  OnSubmit(): void {
    if (!this.editingForm.valid) {
      return; // Exit if the form is invalid
    }

    // Extract values from the form
    const { newDescription, newCurrentPomodoros, newTotalPomodoros } =
      this.editingForm.value;

    // Update the task using the PomodoroService
    this.pomodoroService.editTask(this.index(), {
      description: newDescription, // Updated description
      currentPomodoros: newCurrentPomodoros, // Updated current pomodoros
      totalPomodoros: newTotalPomodoros, // Updated total pomodoros
    });

    // Exit editing mode
    this.OnToggleEditing();
  }

  // Validator to ensure totalPomodoros > currentPomodoros
  private totalPomodorosGreaterThanCurrent(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const currentPomodoros = control.get('newCurrentPomodoros')?.value;
      const totalPomodoros = control.get('newTotalPomodoros')?.value;

      if (
        currentPomodoros != null &&
        totalPomodoros != null &&
        totalPomodoros <= currentPomodoros
      ) {
        return { totalLessThanOrEqualToCurrent: true }; // Validation error
      }
      return null; // Valid
    };
  }

  // Validator to ensure currentPomodoros < totalPomodoros
  private currentPomodorosLowerThanTotal(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const currentPomodoros = control.get('newCurrentPomodoros')?.value;
      const totalPomodoros = control.get('newTotalPomodoros')?.value;

      if (
        currentPomodoros != null &&
        totalPomodoros != null &&
        currentPomodoros >= totalPomodoros
      ) {
        return { currentGreaterThanOrEqualToTotal: true }; // Validation error
      }
      return null; // Valid
    };
  }
}
