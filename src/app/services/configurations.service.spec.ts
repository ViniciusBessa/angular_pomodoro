import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ConfigurationsService } from './configurations.service';

describe('ConfigurationsService', () => {
  let service: ConfigurationsService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConfigurationsService);
  });

  it('should be created', () => {
    // Verifies that the service is created successfully
    expect(service).toBeTruthy();
  });

  it('should initialize with default durations', () => {
    // Ensures the service initializes with default Pomodoro, short break, and long break durations
    expect(service.pomodoroDurationSubject.value).toBe(30); // Default Pomodoro duration
    expect(service.shortBreakDurationSubject.value).toBe(5); // Default short break duration
    expect(service.longBreakDurationSubject.value).toBe(15); // Default long break duration
  });

  it('should update the Pomodoro duration', () => {
    // Ensures that the Pomodoro duration can be updated
    service.setPomodoroDuration(40);
    expect(service.pomodoroDurationSubject.value).toBe(40);
  });

  it('should update the short break duration', () => {
    // Ensures that the short break duration can be updated
    service.setShortBreakDuration(10);
    expect(service.shortBreakDurationSubject.value).toBe(10);
  });

  it('should update the long break duration', () => {
    // Ensures that the long break duration can be updated
    service.setLongBreakDuration(20);
    expect(service.longBreakDurationSubject.value).toBe(20);
  });
});
