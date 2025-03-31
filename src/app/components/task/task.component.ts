import { Component, inject, input, OnInit } from '@angular/core';
import { Task } from '../../models/task.model';
import { PomodoroService } from '../../services/pomodoro.service';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-task',
  imports: [ReactiveFormsModule],
  templateUrl: './task.component.html',
  styleUrl: './task.component.css',
})
export class TaskComponent {
  private pomodoroService = inject(PomodoroService);
  task = input.required<Task>();
  index = input.required<number>();
  isEditing = false;
  editingForm!: FormGroup;

  loadForm(): void {
    this.editingForm = new FormGroup({
      newDescription: new FormControl<string>(this.task().description),
      currentPomodoros: new FormControl<number>(this.task().currentPomodoros),
      totalPomodoros: new FormControl<number>(this.task().totalPomodoros),
    });
  }

  OnToggleEditing(): void {
    this.isEditing != this.isEditing;

    if (this.isEditing) {
      this.loadForm();
    }
  }

  OnDeleteTask(): void {
    this.pomodoroService.removeTask(this.index());
  }

  OnSubmit(): void {
    this.OnToggleEditing();
  }
}
