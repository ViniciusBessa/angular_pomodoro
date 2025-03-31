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
  private pomodoroService = inject(PomodoroService);
  form!: FormGroup;
  isFormEnabled = false;

  ngOnInit(): void {
    this.loadForm();
  }

  OnToggleForm(): void {
    this.isFormEnabled = !this.isFormEnabled;
  }

  private loadForm(): void {
    // Creating the form
    this.form = new FormGroup({
      description: new FormControl<string>('', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(50),
      ]),
      totalPomodoros: new FormControl<number>(0, [
        Validators.required,
        Validators.min(1),
        Validators.max(10),
      ]),
    });
  }

  OnSubmit(): void {
    // If the form is not valid, return
    if (!this.form.valid) {
      return;
    }

    // Creating a new task using the values in the form
    const { description, totalPomodoros } = this.form.value;
    this.pomodoroService.createTask({
      description,
      totalPomodoros,
      currentPomodoros: 0,
    });

    // Resetting and closing the form
    this.form.reset();
    this.OnToggleForm();
  }
}
