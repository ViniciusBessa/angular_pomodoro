import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { CreateTaskComponent } from './create-task.component';
import { PomodoroService } from '../../services/pomodoro.service';
import { By } from '@angular/platform-browser';

describe('CreateTaskComponent', () => {
  let component: CreateTaskComponent;
  let fixture: ComponentFixture<CreateTaskComponent>;
  let pomodoroServiceMock: jasmine.SpyObj<PomodoroService>;

  beforeEach(async () => {
    // Mocking PomodoroService
    pomodoroServiceMock = jasmine.createSpyObj('PomodoroService', [
      'createTask',
    ]);

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, CreateTaskComponent], // Importing required modules and the standalone component
      providers: [{ provide: PomodoroService, useValue: pomodoroServiceMock }], // Providing the mocked service
    }).compileComponents();

    fixture = TestBed.createComponent(CreateTaskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    // Verifies that the CreateTaskComponent is created successfully
    expect(component).toBeTruthy();
  });

  it('should initialize the form with default values', () => {
    // Ensures the form is initialized with default values
    expect(component.form.value).toEqual({
      description: '',
      totalPomodoros: 1,
    });
  });

  it('should validate required fields', () => {
    // Ensures that required validators work for all form fields
    component.form.patchValue({
      description: '',
      totalPomodoros: null,
    });
    expect(component.form.get('description')?.hasError('required')).toBeTrue();
    expect(
      component.form.get('totalPomodoros')?.hasError('required')
    ).toBeTrue();
  });

  it('should validate minlength and maxlength for description', () => {
    // Ensures that the description field respects minlength and maxlength validators
    component.form.patchValue({
      description: 'Te', // Too short
    });
    expect(component.form.get('description')?.hasError('minlength')).toBeTrue();

    component.form.patchValue({
      description: 'T'.repeat(51), // Too long
    });
    expect(component.form.get('description')?.hasError('maxlength')).toBeTrue();
  });

  it('should validate min and max for totalPomodoros', () => {
    // Ensures that the totalPomodoros field respects min and max validators
    component.form.patchValue({
      totalPomodoros: -1, // Below minimum
    });
    expect(component.form.get('totalPomodoros')?.hasError('min')).toBeTrue();

    component.form.patchValue({
      totalPomodoros: 11, // Above maximum
    });
    expect(component.form.get('totalPomodoros')?.hasError('max')).toBeTrue();
  });

  it('should call OnSubmit and add a new task', () => {
    // Simulates submitting the form and ensures the task is added via PomodoroService
    component.form.patchValue({
      description: 'New Task',
      totalPomodoros: 5,
    });

    component.OnSubmit();

    expect(pomodoroServiceMock.createTask).toHaveBeenCalledWith({
      description: 'New Task',
      currentPomodoros: 0,
      totalPomodoros: 5,
    });
  });

  it('should reset the form after submission', () => {
    // Ensures the form is reset after a successful submission
    component.form.patchValue({
      description: 'New Task',
      totalPomodoros: 5,
    });

    component.OnSubmit();

    expect(component.form.value).toEqual({
      description: '',
      totalPomodoros: 1,
    });
  });

  it('should render error messages for invalid form fields', () => {
    // Ensures that error messages are displayed for invalid form fields
    component.form.patchValue({
      description: '',
      totalPomodoros: -1,
    });

    component.isFormEnabled = true;

    // Mark all controls as touched to trigger validation messages
    component.form.get('description')?.markAsTouched();
    component.form.get('totalPomodoros')?.markAsTouched();

    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;

    const descriptionError = compiled.querySelectorAll('div.text-red-500')[0];
    expect(descriptionError.textContent).toContain('Description is required.');

    const totalPomodorosError =
      compiled.querySelectorAll('div.text-red-500')[1];
    expect(totalPomodorosError.textContent).toContain(
      'Number of Pomodoros must be at least 1.'
    );
  });

  it('should toggle the form visibility when OnToggleForm is called', () => {
    // Ensures that the form visibility is toggled correctly
    expect(component.isFormEnabled).toBeFalse();
    component.OnToggleForm();
    expect(component.isFormEnabled).toBeTrue();
  });
});
