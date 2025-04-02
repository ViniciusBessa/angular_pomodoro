import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { TaskComponent } from './task.component';
import { PomodoroService } from '../../services/pomodoro.service';
import { Task } from '../../models/task.model';
import { BehaviorSubject } from 'rxjs';
import { signal, InputSignal } from '@angular/core';

describe('TaskComponent', () => {
  let component: TaskComponent;
  let fixture: ComponentFixture<TaskComponent>;
  let pomodoroServiceMock: jasmine.SpyObj<PomodoroService>;
  let mockTask: Task;

  beforeEach(async () => {
    // Mocking PomodoroService with spy methods and a mock tasksSubject
    pomodoroServiceMock = jasmine.createSpyObj(
      'PomodoroService',
      ['removeTask', 'editTask'],
      {
        tasksSubject: new BehaviorSubject<Task[]>([
          { description: 'Test', currentPomodoros: 0, totalPomodoros: 8 },
        ]),
      }
    );

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, TaskComponent], // Importing required modules and the standalone component
      providers: [{ provide: PomodoroService, useValue: pomodoroServiceMock }], // Providing the mocked service
    }).compileComponents();

    fixture = TestBed.createComponent(TaskComponent);
    component = fixture.componentInstance;

    // Mock task data
    mockTask = {
      description: 'Test',
      currentPomodoros: 0,
      totalPomodoros: 8,
    };

    // Mock input properties using Angular signals
    component.task = signal(mockTask) as unknown as InputSignal<Task>;
    component.index = signal(0) as unknown as InputSignal<number>;

    fixture.detectChanges();
  });

  it('should create the component', () => {
    // Verifies that the TaskComponent is created successfully
    expect(component).toBeTruthy();
  });

  it('should initialize the form with task data', () => {
    // Ensures the form is initialized with the correct values from the task input
    component.loadForm();
    expect(component.editingForm.value).toEqual({
      newDescription: mockTask.description,
      newCurrentPomodoros: mockTask.currentPomodoros,
      newTotalPomodoros: mockTask.totalPomodoros,
    });
  });

  it('should validate required fields', () => {
    // Ensures that required validators work for all form fields
    component.loadForm();
    component.editingForm.patchValue({
      newDescription: '',
      newCurrentPomodoros: null,
      newTotalPomodoros: null,
    });
    expect(
      component.editingForm.get('newDescription')?.hasError('required')
    ).toBeTrue();
    expect(
      component.editingForm.get('newCurrentPomodoros')?.hasError('required')
    ).toBeTrue();
    expect(
      component.editingForm.get('newTotalPomodoros')?.hasError('required')
    ).toBeTrue();
  });

  it('should validate minlength and maxlength for description', () => {
    // Ensures that the description field respects minlength and maxlength validators
    component.loadForm();
    component.editingForm.patchValue({
      newDescription: 'Te', // Too short
    });
    expect(
      component.editingForm.get('newDescription')?.hasError('minlength')
    ).toBeTrue();

    component.editingForm.patchValue({
      newDescription: 'T'.repeat(51), // Too long
    });
    expect(
      component.editingForm.get('newDescription')?.hasError('maxlength')
    ).toBeTrue();
  });

  it('should validate min and max for currentPomodoros and totalPomodoros', () => {
    // Ensures that the currentPomodoros and totalPomodoros fields respect min and max validators
    component.loadForm();
    component.editingForm.patchValue({
      newCurrentPomodoros: -1, // Below minimum
      newTotalPomodoros: 11, // Above maximum
    });
    expect(
      component.editingForm.get('newCurrentPomodoros')?.hasError('min')
    ).toBeTrue();
    expect(
      component.editingForm.get('newTotalPomodoros')?.hasError('max')
    ).toBeTrue();
  });

  it('should validate that totalPomodoros is greater than currentPomodoros', () => {
    // Ensures that the custom validator totalPomodorosGreaterThanCurrent works
    component.loadForm();
    component.editingForm.patchValue({
      newCurrentPomodoros: 5,
      newTotalPomodoros: 4,
    });
    expect(component.editingForm.valid).toBeFalse();
    expect(
      component.editingForm.errors?.['totalLessThanOrEqualToCurrent']
    ).toBeTrue();
  });

  it('should validate that currentPomodoros is less than totalPomodoros', () => {
    // Ensures that the custom validator currentPomodorosLowerThanTotal works
    component.loadForm();
    component.editingForm.patchValue({
      newCurrentPomodoros: 6,
      newTotalPomodoros: 5,
    });
    expect(component.editingForm.valid).toBeFalse();
    expect(
      component.editingForm.errors?.['currentGreaterThanOrEqualToTotal']
    ).toBeTrue();
  });

  it('should call OnSubmit and update the task', () => {
    // Simulates submitting the form and ensures the task is updated via PomodoroService
    component.loadForm();
    component.editingForm.patchValue({
      newDescription: 'Updated Task',
      newCurrentPomodoros: 3,
      newTotalPomodoros: 6,
    });

    component.OnSubmit();

    expect(pomodoroServiceMock.editTask).toHaveBeenCalledWith(0, {
      description: 'Updated Task',
      currentPomodoros: 3,
      totalPomodoros: 6,
    });
  });

  it('should call OnDeleteTask and remove the task', () => {
    // Simulates deleting the task and ensures the PomodoroService is called
    component.OnDeleteTask();
    expect(pomodoroServiceMock.removeTask).toHaveBeenCalledWith(0);
  });

  it('should toggle editing mode', () => {
    // Ensures that the editing mode is toggled correctly
    expect(component.isEditing).toBeFalse();
    component.OnToggleEditing();
    expect(component.isEditing).toBeTrue();
  });

  it('should render error messages for invalid form fields', () => {
    // Ensures that error messages are displayed for invalid form fields
    component.loadForm();
    component.editingForm.patchValue({
      newDescription: '',
      newCurrentPomodoros: -1,
      newTotalPomodoros: 11,
    });

    component.isEditing = true;

    // Mark all controls as touched to trigger validation messages
    component.editingForm.get('newDescription')?.markAsTouched();
    component.editingForm.get('newCurrentPomodoros')?.markAsTouched();
    component.editingForm.get('newTotalPomodoros')?.markAsTouched();

    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;

    const descriptionError = compiled.querySelectorAll('div.text-red-500')[0];
    expect(descriptionError.textContent).toContain('Description is required.');

    const currentPomodorosError =
      compiled.querySelectorAll('div.text-red-500')[1];
    expect(currentPomodorosError.textContent).toContain(
      'Completed Pomodoros must be at least 0.'
    );

    const totalPomodorosError =
      compiled.querySelectorAll('div.text-red-500')[2];
    expect(totalPomodorosError.textContent).toContain(
      'Total Pomodoros cannot exceed 10.'
    );
  });
});
