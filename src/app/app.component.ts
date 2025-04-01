import { Component, inject, Signal } from '@angular/core';
import { Task } from './models/task.model';
import { PomodoroService } from './services/pomodoro.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { TaskComponent } from './components/task/task.component';
import { CreateTaskComponent } from './components/create-task/create-task.component';
import { TimerComponent } from './components/timer/timer.component';
import { ConfigurationsService } from './services/configurations.service';
import { SettingsComponent } from './components/settings/settings.component';

@Component({
  selector: 'app-root',
  imports: [
    TaskComponent,
    CreateTaskComponent,
    TimerComponent,
    SettingsComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  private pomodoroService = inject(PomodoroService);
  tasks: Signal<Task[] | undefined> = toSignal(
    this.pomodoroService.tasksSubject
  );
}
