import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthCurrentUser } from '../../../../core/models/auth';
import { Doctor } from '../../../../core/models/doctor';
import { Patient } from '../../../../core/models/patient';
import { AuthService } from '../../../../core/auth/auth.service';
import { UserService } from '../../../../core/services/user/user.service';
import { PatientService } from '../../../../core/services/patient/patient.service';
import { DoctorService } from '../../../../core/services/doctor/doctor.service';
import { SpecialtyService } from '../../../../core/services/specialty/specialty.service';
import { firstValueFrom } from 'rxjs';

interface EmailNotification {
  id: string;
  label: string;
  description: string;
  checked: boolean;
}

interface SmsNotification {
  id: string;
  label: string;
  description: string;
  checked: boolean;
}

interface CalendarIntegration {
  id: string;
  name: string;
  description: string;
  checked: boolean;
}

interface SelectOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-data-management',
  imports: [CommonModule, FormsModule],
  templateUrl: './data-management.component.html',
  styleUrl: './data-management.component.css',
})

export class DataManagementComponent implements OnInit {
  isEditMode = false;
  currentUser: AuthCurrentUser | null = null;
  originalUser: AuthCurrentUser | null = null; // Backup para cancelar cambios
  
  // Control de cambios pendientes
  hasImageChanges = false;
  hasDataChanges = false;
  
  // Estados de carga
  isUploadingImage = false;
  isSavingData = false;

  emailNotifications: EmailNotification[] = [
    {
      id: 'email-appointment-reminder',
      label: 'Recordatorio de citas',
      description: 'Enviar recordatorio antes de la cita',
      checked: true
    },
    {
      id: 'email-appointment-confirmation',
      label: 'Confirmación de citas',
      description: 'Enviar confirmación al agendar',
      checked: true
    },
    {
      id: 'email-results',
      label: 'Resultados de laboratorio',
      description: 'Notificar cuando hay resultados disponibles',
      checked: true
    },
    {
      id: 'email-prescriptions',
      label: 'Recetas médicas',
      description: 'Enviar recetas por email',
      checked: true
    }
  ];

  smsNotifications: SmsNotification[] = [
    {
      id: 'sms-appointment-reminder',
      label: 'Recordatorio de citas',
      description: 'Enviar SMS antes de la cita',
      checked: true
    },
    {
      id: 'sms-appointment-confirmation',
      label: 'Confirmación de citas',
      description: 'Enviar SMS al agendar',
      checked: false
    },
    {
      id: 'sms-urgent',
      label: 'Notificaciones urgentes',
      description: 'SMS para alertas importantes',
      checked: true
    }
  ];

  calendarIntegrations: CalendarIntegration[] = [
    {
      id: 'google-calendar',
      name: 'Google Calendar',
      description: 'Sincronizar con Google Calendar',
      checked: true
    },
    {
      id: 'microsoft-outlook',
      name: 'Microsoft Outlook',
      description: 'Sincronizar con Outlook Calendar',
      checked: false
    },
    {
      id: 'apple-calendar',
      name: 'Apple Calendar',
      description: 'Sincronizar con iCal',
      checked: false
    }
  ];

  emailReminderOptions: SelectOption[] = [
    { value: '1', label: '1 hora antes' },
    { value: '2', label: '2 horas antes' },
    { value: '6', label: '6 horas antes' },
    { value: '12', label: '12 horas antes' },
    { value: '24', label: '24 horas antes' },
    { value: '48', label: '48 horas antes' }
  ];

  smsReminderOptions: SelectOption[] = [
    { value: '1', label: '1 hora antes' },
    { value: '2', label: '2 horas antes' },
    { value: '4', label: '4 horas antes' },
    { value: '6', label: '6 horas antes' }
  ];

  selectedEmailReminder: string = '24';
  selectedSmsReminder: string = '2';
  testEmail: string = '';
  testPhone: string = '';

  showEmailDropdown = false;
  showSmsDropdown = false;

  fecha: string | null = null;
  
  selectedFile: File | null = null;
  imagePreviewUrl: string | ArrayBuffer | null = null;

  // Mensajes de feedback
  errorMsg: string = '';
  successMsg: string = '';
  specialties = signal<{ id: number; name: string }[]>([]);

  constructor(
    private elementRef: ElementRef, 
    private authService: AuthService,
    private userService: UserService,
    private patientService: PatientService,
    private doctorService: DoctorService,
    private specialtyService: SpecialtyService
  ) { }

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    this.originalUser = JSON.parse(JSON.stringify(this.currentUser)); // Deep copy
    
    console.log('Current user:', this.currentUser);
    if (this.currentUser?.role === 'paciente') {
      const patient = this.currentUser.data as Patient;
      this.fecha = this.formatDateForInput(patient.dateOfBirth);
      console.log('Fecha de nacimiento del paciente:', this.fecha);
    }

    this.specialtyService.getAllSpecialty().subscribe({
      next: (response: any) => {
        console.log('Specialties loaded:', response);
        const body = response?.body ?? response;
        const data = body?.response?.data ?? body?.data ?? body;
        const list = Array.isArray(data) ? data.map((s: any) => ({ id: s.id ?? s._id ?? s.ID ?? 0, name: s.name ?? s.title ?? '' })) : [];
        this.specialties.set(list);
      },
      error: (err: any) => {
        console.error('Error loading specialties:', err);
      },
    });
  }

  formatDateForInput(date: Date | string): string {
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  }

  get userInitials(): string {
    if (this.currentUser && this.currentUser.firstName && this.currentUser.lastName) {
      return `${this.currentUser.firstName[0]}${this.currentUser.lastName[0]}`.toUpperCase();
    }
    return '';
  }

  toggleEditMode(): void {
    if (this.isEditMode) {
      // Cancelar edición
      this.cancelChanges();
    } else {
      // Activar edición
      this.isEditMode = true;
      this.originalUser = JSON.parse(JSON.stringify(this.currentUser)); // Backup
      this.errorMsg = '';
      this.successMsg = '';
    }
  }

  // ===== GESTIÓN DE IMAGEN =====
  
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      if (file.type.match(/image\/png/) || file.type.match(/image\/jpeg/)) {
        this.selectedFile = file;
        const reader = new FileReader();
        reader.onload = () => {
          this.imagePreviewUrl = reader.result;
          this.hasImageChanges = true;
        };
        reader.readAsDataURL(file);
      } else {
        console.error('Formato de archivo no válido. Solo se permiten PNG y JPG.');
        this.errorMsg = 'Por favor, selecciona una imagen en formato PNG o JPG.';
        setTimeout(() => this.errorMsg = '', 3000);
      }
    }
  }

  async confirmImageChange(): Promise<void> {
    if (!this.selectedFile || !this.hasImageChanges) {
      return;
    }

    this.isUploadingImage = true;
    this.errorMsg = '';
    this.successMsg = '';

    try {
      console.log('Subiendo imagen:', this.selectedFile.name);
      
      await this.userService.updateUserImage(this.selectedFile);
      
      // Actualizar la URL de la imagen en currentUser si el servicio retorna la nueva URL
      // if (this.currentUser && response.urlImage) {
      //   this.currentUser.urlImage = response.urlImage;
      // }
      
      // Limpiar estado temporal
      this.selectedFile = null;
      this.imagePreviewUrl = null;
      this.hasImageChanges = false;
      
      console.log('Imagen actualizada exitosamente');
      this.successMsg = 'Imagen de perfil actualizada correctamente';
      
      setTimeout(() => this.successMsg = '', 3000);
      
    } catch (error) {
      console.error('Error al actualizar imagen:', error);
      this.errorMsg = 'Error al actualizar la imagen. Por favor, intenta nuevamente.';
      setTimeout(() => this.errorMsg = '', 3000);
    } finally {
      this.isUploadingImage = false;
    }
  }

  cancelImageChange(): void {
    this.selectedFile = null;
    this.imagePreviewUrl = null;
    this.hasImageChanges = false;
  }

  // ===== GESTIÓN DE DATOS DE USUARIO =====

  onUserDataChange(): void {
    // Detectar si hay cambios en los datos
    this.hasDataChanges = JSON.stringify(this.currentUser) !== JSON.stringify(this.originalUser);
  }

  async confirmDataChanges(): Promise<void> {
    if (!this.currentUser || !this.hasDataChanges) {
      return;
    }

    // Validaciones
    if (!this.validateUserData()) {
      return;
    }

    this.isSavingData = true;
    this.errorMsg = '';
    this.successMsg = '';

    try {
      console.log('Guardando datos de usuario:', this.currentUser);
      
      if (this.currentUser.role === 'paciente' && this.isPatient(this.currentUser.data)) {
        // Actualizar paciente
        if (!this.fecha) {
          this.errorMsg = 'La fecha de nacimiento es obligatoria';
          return;
        }

        const patientUpdate = {
          firstName: this.currentUser.firstName,
          lastName: this.currentUser.lastName,
          phone: this.currentUser.phone || undefined,
          dateOfBirth: new Date(this.fecha),
          gender: this.currentUser.data.gender,
          nationality: this.currentUser.data.nationality
        };

        this.patientService.updatePatient(this.currentUser.data.id, patientUpdate).subscribe({
          next: () => {
            this.successMsg = 'Información personal actualizada correctamente';
            this.handleUpdateSuccess();
          },
          error: (err) => {
            console.error('Error al actualizar paciente:', err);
            this.errorMsg = 'Error al actualizar la información. Por favor, intenta nuevamente.';
            this.isSavingData = false;
          }
        });
        
      } else if (this.currentUser.role === 'medico' && this.isDoctor(this.currentUser.data)) {
        const specialtyName = (this.currentUser.data as Doctor).speciality; // "neurología"

        let spId: number= 0;
        const special = this.specialties();
        console.log(this.currentUser);

        for (const specialtyItem of special) {
          console.log(specialtyItem.name);
          console.log(specialtyName);
          if (specialtyItem.name === specialtyName) {
            console.log(`Especialidad encontrada: ${specialtyItem.name}`);
            spId = specialtyItem.id;
            break;
          }
        }

        console.log(`El ID de la especialidad '${specialtyName}' es: ${spId}`); 
        
        // Actualizar doctor
        const doctorUpdate = {
          id: this.currentUser.data.id,
          firstName: this.currentUser.firstName,
          lastName: this.currentUser.lastName,
          specialityId: spId,
          bio: this.currentUser.data.bio || undefined,
          phone: this.currentUser.phone || undefined
        };

        this.doctorService.updateDoctor(doctorUpdate).subscribe({
          next: () => {
            this.successMsg = 'Información personal actualizada correctamente';
            this.handleUpdateSuccess();
          },
          error: (err) => {
            console.error('Error al actualizar doctor:', err);
            this.errorMsg = 'Error al actualizar la información. Por favor, intenta nuevamente.';
            this.isSavingData = false;
          }
        });
      }
      
    } catch (error) {
      console.error('Error al actualizar datos:', error);
      this.errorMsg = 'Error al actualizar la información. Por favor, intenta nuevamente.';
      this.isSavingData = false;
    }
  }

  private handleUpdateSuccess(): void {
    // Actualizar el backup
    this.originalUser = JSON.parse(JSON.stringify(this.currentUser));
    this.hasDataChanges = false;
    this.isEditMode = false;
    this.isSavingData = false;
    
    console.log('Datos actualizados exitosamente');
    
    // Limpiar mensaje después de 3 segundos
    setTimeout(() => {
      this.successMsg = '';
      this.errorMsg = '';
    }, 3000);
  }

  cancelChanges(): void {
    // Restaurar datos originales
    if (this.originalUser) {
      this.currentUser = JSON.parse(JSON.stringify(this.originalUser));
      
      // Restaurar fecha si es paciente
      if (this.currentUser?.role === 'paciente') {
        const patient = this.currentUser.data as Patient;
        this.fecha = this.formatDateForInput(patient.dateOfBirth);
      }
    }
    
    // Cancelar cambios de imagen
    this.cancelImageChange();
    
    this.hasDataChanges = false;
    this.isEditMode = false;
    this.showEmailDropdown = false;
    this.showSmsDropdown = false;
    this.errorMsg = '';
    this.successMsg = '';
    
    console.log('Cambios cancelados');
  }

  validateUserData(): boolean {
    if (!this.currentUser) {
      this.errorMsg = 'No se encontró información del usuario';
      return false;
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!this.currentUser.email || !emailRegex.test(this.currentUser.email)) {
      this.errorMsg = 'Por favor, ingresa un email válido';
      return false;
    }

    // Validar campos requeridos
    if (!this.currentUser.firstName || !this.currentUser.lastName) {
      this.errorMsg = 'Nombre y apellido son obligatorios';
      return false;
    }

    // Validaciones específicas de paciente
    if (this.currentUser.role === 'paciente' && this.isPatient(this.currentUser.data)) {
      if (!this.fecha) {
        this.errorMsg = 'La fecha de nacimiento es obligatoria';
        return false;
      }
      if (!this.currentUser.data.gender) {
        this.errorMsg = 'El género es obligatorio';
        return false;
      }
      if (!this.currentUser.data.nationality) {
        this.errorMsg = 'La nacionalidad es obligatoria';
        return false;
      }
    }

    // Validaciones específicas de doctor
    // if (this.currentUser.role === 'medico' && this.isDoctor(this.currentUser.data)) {
    //   if (!this.currentUser.data.specialityId) {
    //     this.errorMsg = 'La especialidad es obligatoria';
    //     return false;
    //   }
    // }

    return true;
  }

  // ===== OTROS MÉTODOS =====

  toggleEmailNotification(id: string): void {
    if (!this.isEditMode) return;
    const notification = this.emailNotifications.find(n => n.id === id);
    if (notification) {
      notification.checked = !notification.checked;
    }
  }

  toggleSmsNotification(id: string): void {
    if (!this.isEditMode) return;
    const notification = this.smsNotifications.find(n => n.id === id);
    if (notification) {
      notification.checked = !notification.checked;
    }
  }

  toggleCalendarIntegration(id: string): void {
    if (!this.isEditMode) return;
    const integration = this.calendarIntegrations.find(i => i.id === id);
    if (integration) {
      integration.checked = !integration.checked;
    }
  }

  selectEmailOption(value: any): void {
    this.selectedEmailReminder = value;
    this.showEmailDropdown = false;
  }

  getSelectedLabel(): string {
    const selected = this.emailReminderOptions.find(opt => opt.value === this.selectedEmailReminder);
    return selected ? selected.label : 'Seleccionar';
  }

  selectSmsOption(value: any): void {
    this.selectedSmsReminder = value;
    this.showSmsDropdown = false;
  }

  getSelectedSmsLabel(): string {
    const selected = this.smsReminderOptions.find(opt => opt.value === this.selectedSmsReminder);
    return selected ? selected.label : 'Seleccionar';
  }

  sendTestEmail(): void {
    console.log('Enviando email de prueba a:', this.testEmail);
  }

  sendTestSms(): void {
    console.log('Enviando SMS de prueba a:', this.testPhone);
  }

  configureIntegrations(): void {
    console.log('Configurando integraciones...');
  }

  @HostListener('document:click', ['$event'])
  clickOutside(event: Event): void {
    if (!this.isEditMode) return;

    const target = event.target as HTMLElement;
    const clickedInsideDropdown = target.closest('.relative');

    if (!clickedInsideDropdown) {
      this.showEmailDropdown = false;
      this.showSmsDropdown = false;
    }
  }

  isPatient(data: any): data is Patient {
    return data && 'identification' in data && 'typeIdentification' in data;
  }

  isDoctor(data: any): data is Doctor {
    return data && 'speciality' in data && 'licenseNumber' in data;
  }
}
