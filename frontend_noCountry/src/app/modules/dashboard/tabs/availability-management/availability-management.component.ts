import { Component, OnInit, signal, ViewChild, TemplateRef, ViewContainerRef, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidatorFn, ValidationErrors, FormArray } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

// Services
import { AvailabilityService } from '../../../../core/services/availability/availability.service';

// Models
import { Availability, AvailabilityCreate } from '../../../../core/models/availability';
import { AuthService } from '../../../../core/auth/auth.service';
import { Doctor } from '../../../../core/models/doctor';
import { forkJoin } from 'rxjs';
import { AuthCurrentUser } from '../../../../core/models/auth';

@Component({
  selector: 'app-availability-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './availability-management.component.html',
  styleUrls: ['./availability-management.component.css']
})
export class AvailabilityManagementComponent implements OnInit, AfterViewInit {

  @ViewChild('availabilityModal') availabilityModal!: TemplateRef<any>;

  availabilityForm!: FormGroup;

  isSubmitting = signal(false);
  errorMsg = signal<string | null>(null);
  successMsg = signal<string | null>(null);
  timeSlots: string[] = [];

  weekDays = [
    { name: 'Lunes', value: 'monday' },
    { name: 'Martes', value: 'tuesday' },
    { name: 'Miércoles', value: 'wednesday' },
    { name: 'Jueves', value: 'thursday' },
    { name: 'Viernes', value: 'friday' },
    { name: 'Sábado', value: 'saturday' },
    { name: 'Domingo', value: 'sunday' },
  ];

  user: AuthCurrentUser | null = null;

  constructor(
    private fb: FormBuilder,
    private viewContainerRef: ViewContainerRef,
    private availabilityService: AvailabilityService,
    private authService: AuthService,
  ) {
    this.user = this.authService.getCurrentUser();

  }

  ngOnInit(): void {
    this.initForm();
    this.generateTimeSlots();
    this.getAvailabilities();
  }

  ngAfterViewInit(): void {
    this.setupFormArrayListeners();
  }

  availability: Availability[] = [];


  getAvailabilities(): void {
    this.availabilityService.getAllAvailabilitiesByDoctor(this.user!.data!.id).subscribe({
      next: (data) => {
        console.log(data);
        this.availability = data;
        this.patchFormWithExistingAvailabilities();
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  patchFormWithExistingAvailabilities(): void {
    if (!this.availability?.length) return;

    this.availabilitiesFormArray.controls.forEach(group => {
      const day = group.get('dayOfWeek')?.value;
      const existing = this.availability.find(a => a.day_of_week === day);

      if (existing) {
        group.patchValue({
          enabled: true,
          startTime: existing.start_time.substring(0, 5),
          endTime: existing.end_time.substring(0, 5),
          restStartTime: existing.rest_start_time?.substring(0, 5),
          restEndTime: existing.rest_end_time?.substring(0, 5),
          periodTime: existing.period_time
        });

        const controlsToEnable = ['startTime', 'endTime', 'restStartTime', 'restEndTime', 'periodTime'];
        controlsToEnable.forEach(c => group.get(c)?.enable());
      }
    });
  }


  initForm(): void {
    const user = this.authService.getCurrentUser();
    const dataUser: Doctor = user?.data as Doctor;
    this.availabilityForm = this.fb.group({
      doctorId: [dataUser.id, Validators.required],
      availabilities: this.fb.array(this.weekDays.map(day => this.createDayFormGroup(day.value)))
    });
  }

  createDayFormGroup(day: string): FormGroup {
    return this.fb.group({
      dayOfWeek: [day],
      enabled: [false],
      startTime: [{ value: '09:00', disabled: true }, [Validators.required]],
      endTime: [{ value: '17:00', disabled: true }, [Validators.required]],
      restStartTime: [{ value: '13:00', disabled: true }, [Validators.required]],
      restEndTime: [{ value: '14:00', disabled: true }, [Validators.required]],
      periodTime: [{ value: 30, disabled: true }, [Validators.required, Validators.min(15), this.multipleOf(15)]],
    }, {
      validators: [
        this.timeRangeValidator('startTime', 'endTime', 'timeRange'),
        this.timeRangeValidator('restStartTime', 'restEndTime', 'restTimeRange')
      ]
    });
  }

  get availabilitiesFormArray(): FormArray {
    return this.availabilityForm.get('availabilities') as FormArray;
  }

  setupFormArrayListeners(): void {
    this.availabilitiesFormArray.controls.forEach(group => {
      const enabledControl = group.get('enabled');
      enabledControl?.valueChanges.subscribe(isEnabled => {
        const controlsToToggle = ['startTime', 'endTime', 'restStartTime', 'restEndTime', 'periodTime'];
        controlsToToggle.forEach(name => {
          const control = group.get(name);
          if (isEnabled) {
            control?.enable();
          } else {
            control?.disable();
          }
        });
      });
    });
  }

  openAvailabilityModal(): void {
    this.errorMsg.set(null);
    this.successMsg.set(null);
    this.availabilityForm.reset();
    this.availabilitiesFormArray.controls.forEach(group => group.get('enabled')?.patchValue(false));
    this.viewContainerRef.createEmbeddedView(this.availabilityModal);
  }

  closeAllDialogs(): void {
    this.viewContainerRef.clear();
  }

  onSubmit(): void {
    if (this.availabilityForm.invalid) {
      this.availabilityForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMsg.set(null);
    this.successMsg.set(null);

    const formValue = this.availabilityForm.value;
    const bulkData: AvailabilityCreate[] = formValue.availabilities
      .filter((day: any) => day.enabled)
      .map((day: any) => ({
        doctor_id: formValue.doctorId,
        day_of_week: day.dayOfWeek,
        start_time: day.startTime,
        end_time: day.endTime,
        rest_start_time: day.restStartTime,
        rest_end_time: day.restEndTime,
        period_time: day.periodTime,
      }));

    if (bulkData.length === 0) {
      this.errorMsg.set('Debe habilitar y completar la información de al menos un día.');
      this.isSubmitting.set(false);
      return;
    }

    console.log("availabilities", this.availability);
    const resp = this.availability.map((availability) => 
      this.availabilityService.deleteAvailability(availability.id)
    )

    forkJoin(resp).subscribe({
      next: (rpt) => {
        console.log(rpt);
        console.log('Disponibilidades eliminadas con éxito.');
        this.successMsg.set('Disponibilidades eliminadas con éxito.');
        this.isSubmitting.set(false);
        // setTimeout(() => this.closeAllDialogs(), 2000);
      },
      error: (err) => {
        this.errorMsg.set(
          'Error al eliminar disponibilidades: ' +
          (err.error?.error || 'Ocurrió un error inesperado.')
        );
        this.isSubmitting.set(false);
      }
    });

    console.log("availabilities", bulkData);
    const requests = bulkData.map((availability) =>
      this.availabilityService.createAvailability(availability)
    );

    forkJoin(requests).subscribe({
      next: () => {
        console.log('Disponibilidades creadas con éxito.');
        this.successMsg.set('Disponibilidades creadas con éxito.');
        this.isSubmitting.set(false);
        // setTimeout(() => this.closeAllDialogs(), 2000);
      },
      error: (err) => {
        this.errorMsg.set(
          'Error al crear disponibilidades: ' +
          (err.error?.error || 'Ocurrió un error inesperado.')
        );
        this.isSubmitting.set(false);
      }
    });
    // this.availabilityService.createAvailability(bulkData).subscribe({
    //   next: () => {
    //     this.successMsg.set(`Disponibilidades creadas con éxito.`);
    //     this.isSubmitting.set(false);
    //     // setTimeout(() => this.closeAllDialogs(), 2000);
    //   },
    //   error: (err) => {
    //     this.errorMsg.set(`Error al crear las disponibilidades. ` + (err.error?.error || 'Ocurrió un error inesperado.'));
    //     this.isSubmitting.set(false);
    //   }
    // });
  }

  // --- Custom Validators ---
  multipleOf(factor: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      return control.value % factor === 0 ? null : { multipleOf: { factor } };
    };
  }

  timeRangeValidator(startControlName: string, endControlName: string, errorName: string): ValidatorFn {
    return (formGroup: AbstractControl): ValidationErrors | null => {
      const startControl = formGroup.get(startControlName);
      const endControl = formGroup.get(endControlName);
      if (!startControl || !endControl || !startControl.value || !endControl.value) return null;

      if (startControl.value >= endControl.value) {
        endControl.setErrors({ ...endControl.errors, [errorName]: true });
        return { [errorName]: true };
      } else {
        const errors = endControl.errors;
        if (errors && errors[errorName]) {
          delete errors[errorName];
          endControl.setErrors(Object.keys(errors).length > 0 ? errors : null);
        }
      }
      return null;
    };
  }

  generateTimeSlots(startHour: number = 0, endHour: number = 24): void {
    const slots: string[] = [];

    for (let hour = startHour; hour < endHour; hour++) {
      // Hora en punto
      const hourStr = hour.toString().padStart(2, '0');
      slots.push(`${hourStr}:00`);

      // Media hora
      slots.push(`${hourStr}:30`);
    }

    this.timeSlots = slots;
  }

  // formatTimeToAmPm(time: string): string {
  //   const [hours, minutes] = time.split(':').map(Number);
  //   const period = hours >= 12 ? 'PM' : 'AM';
  //   const displayHour = hours > 12 ? hours - 12 : (hours === 0 ? 12 : hours);
  //   return `${displayHour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${period}`;
  // }
}
