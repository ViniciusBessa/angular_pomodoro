import { Component, inject, OnInit, Signal } from '@angular/core';
import { Task } from './models/task.model';
import { PomodoroService } from './services/pomodoro.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { TaskComponent } from './components/task/task.component';
import { CreateTaskComponent } from './components/create-task/create-task.component';

@Component({
  selector: 'app-root',
  imports: [TaskComponent, CreateTaskComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  private pomodoroService = inject(PomodoroService);
  tasks: Signal<Task[] | undefined> = toSignal(
    this.pomodoroService.tasksSubject
  );
}
