import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { TimerComponent, TimerType } from './timer.component';
import { ConfigurationsService } from '../../services/configurations.service';
import { PomodoroService } from '../../services/pomodoro.service';
import { BehaviorSubject } from 'rxjs';
import { Task } from '../../models/task.model';

describe('TimerComponent', () => {
  let component: TimerComponent;
  let fixture: ComponentFixture<TimerComponent>;
  let pomodoroServiceMock: jasmine.SpyObj<PomodoroService>;
  let configurationsServiceMock: Partial<ConfigurationsService>;

  beforeEach(async () => {
    // Mocking PomodoroService
    pomodoroServiceMock = jasmine.createSpyObj(
      'PomodoroService',
      ['progressSelectedTask'],
      {
        tasksSubject: new BehaviorSubject<Task[]>([
          { description: 'Test', currentPomodoros: 0, totalPomodoros: 8 },
        ]),
        selectedTaskSubject: new BehaviorSubject<number | null>(0),
      }
    );

    // Mocking ConfigurationsService with BehaviorSubjects
    configurationsServiceMock = {
      pomodoroDurationSubject: new BehaviorSubject<number>(25),
      shortBreakDurationSubject: new BehaviorSubject<number>(5),
      longBreakDurationSubject: new BehaviorSubject<number>(15),
    };

    await TestBed.configureTestingModule({
      imports: [TimerComponent], // Use imports for standalone components
      providers: [
        { provide: PomodoroService, useValue: pomodoroServiceMock },
        { provide: ConfigurationsService, useValue: configurationsServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TimerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    // Verifies that the TimerComponent is created successfully
    expect(component).toBeTruthy();
  });

  it('should initialize with default timer values', () => {
    // Ensures the timer initializes with default durations
    expect(component.pomodoroTime()).toBe(25);
    expect(component.shortBreakTime()).toBe(5);
    expect(component.longBreakTime()).toBe(15);
    expect(component.timeLeft).toBe(component.pomodoroTime()! * 60);
  });

  it('should set the timer to Pomodoro mode on initialization', () => {
    // Verifies that the timer is set to Pomodoro mode when the component initializes
    spyOn(component, 'OnSetTimer');
    component.ngOnInit();
    expect(component.OnSetTimer).toHaveBeenCalledWith(
      component.currentTimerType
    );
  });

  it('should toggle the timer state when OnResumeTimer is called', fakeAsync(() => {
    // Simulates starting the timer and verifies that it decrements time
    component.OnResumeTimer();
    expect(component.isTicking).toBeTrue();
    tick(1000); // Simulates 1 second passing
    expect(component.timeLeft).toBe(component.pomodoroTime()! * 60 - 1);
    component.OnPauseTimer();
    expect(component.isTicking).toBeFalse();
  }));

  it('should reset the timer when OnSetTimer is called', () => {
    // Ensures that the timer resets correctly when switching to a different timer type
    component.OnSetTimer(TimerType.SHORT_BREAK);
    expect(component.currentTimerType).toBe(TimerType.SHORT_BREAK);
    expect(component.timeLeft).toBe(component.shortBreakTime()! * 60);
  });

  it('should handle timer completion and progress the task', fakeAsync(() => {
    // Simulates timer completion and verifies that the OnTimerFinished method is called
    spyOn(component, 'OnTimerFinished');
    component.timeLeft = 0;
    component.OnResumeTimer();
    tick(2000); // Simulates 2 seconds passing
    expect(component.OnTimerFinished).toHaveBeenCalled();
  }));

  it('should call progressSelectedTask when Pomodoro timer finishes', () => {
    // Verifies that the PomodoroService progresses the selected task when the Pomodoro timer finishes
    component.currentTimerType = TimerType.POMODORO;
    component.OnTimerFinished();
    expect(pomodoroServiceMock.progressSelectedTask).toHaveBeenCalled();
  });

  it('should switch to a break timer after Pomodoro completion', () => {
    // Ensures that the timer switches to a short break after completing a Pomodoro
    spyOn(component, 'OnSetTimer');
    component.currentTimerType = TimerType.POMODORO;
    component.OnTimerFinished();
    expect(component.OnSetTimer).toHaveBeenCalledWith(TimerType.SHORT_BREAK);
  });

  it('should format the time correctly', () => {
    // Verifies that the time is formatted correctly in HH:MM:SS or MM:SS format
    component.timeLeft = 3661; // 1 hour, 1 minute, 1 second
    expect(component.getFormattedTime).toBe('01:01:01');

    component.timeLeft = 61; // 1 minute, 1 second
    expect(component.getFormattedTime).toBe('01:01');

    component.timeLeft = 59; // 59 seconds
    expect(component.getFormattedTime).toBe('00:59');
  });

  it('should render the timer and buttons in the template', () => {
    // Ensures that the timer display and buttons are rendered in the template
    const compiled = fixture.nativeElement as HTMLElement;

    // Check timer display
    const timerDisplay = compiled.querySelectorAll('p')[0];
    expect(timerDisplay).toBeTruthy();
    expect(timerDisplay?.textContent).toContain(component.getFormattedTime);

    // Check start button
    const startButton = compiled.querySelectorAll('button')[3];
    expect(startButton).toBeTruthy();
  });

  it('should call OnResumeTimer when the start button is clicked', () => {
    // Simulates clicking the start button and verifies that OnResumeTimer is called
    spyOn(component, 'OnResumeTimer');
    const startButton =
      fixture.debugElement.nativeElement.querySelectorAll('button')[3];
    startButton.click();
    expect(component.OnResumeTimer).toHaveBeenCalled();
  });

  it('should call OnPauseTimer when the pause button is clicked', () => {
    // Simulates clicking the pause button and verifies that OnPauseTimer is called
    spyOn(component, 'OnPauseTimer');
    component.isTicking = true;
    fixture.detectChanges();
    const pauseButton =
      fixture.debugElement.nativeElement.querySelectorAll('button')[3];
    pauseButton.click();
    expect(component.OnPauseTimer).toHaveBeenCalled();
  });
});
