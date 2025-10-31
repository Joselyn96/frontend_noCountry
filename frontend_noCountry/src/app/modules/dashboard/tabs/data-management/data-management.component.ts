import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthCurrentUser } from '../../../../core/models/auth';
import { Doctor } from '../../../../core/models/doctor';
import { Patient } from '../../../../core/models/patient';
import { AuthService } from '../../../../core/auth/auth.service';
import { UserService } from '../../../../core/services/user/user.service';

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

  constructor(
    private elementRef: ElementRef, 
    private authService: AuthService,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.originalUser = JSON.parse(JSON.stringify(this.currentUser)); // Deep copy
    
    console.log('Current user:', this.currentUser);
    if (this.currentUser?.role === 'paciente') {
      const patient = this.currentUser.data as Patient;
      this.fecha = this.formatDateForInput(patient.dateOfBirth);
      console.log('Fecha de nacimiento del paciente:', this.fecha);
    }
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
        alert('Por favor, selecciona una imagen en formato PNG o JPG.');
      }
    }
  }

  async confirmImageChange(): Promise<void> {
    if (!this.selectedFile || !this.hasImageChanges) {
      return;
    }

    this.isUploadingImage = true;
    console.log('Subiendo imagen:', this.selectedFile.name);

  this.userService.updateUserImage(this.selectedFile).subscribe({
    next: (resp) => {
      const body = resp.body as { result?: { urlImage?: string } } | null;
      const newUrl = body?.result?.urlImage;

      if (this.currentUser && newUrl) {
        // rompe caché para que el navegador muestre la nueva
        this.currentUser.urlImage = `${newUrl}?t=${Date.now()}`;
      }

      // limpiar estado temporal
      this.selectedFile = null;
      this.imagePreviewUrl = null;
      this.hasImageChanges = false;

      console.log('Imagen actualizada exitosamente');
      alert('Imagen de perfil actualizada correctamente');
    },
    error: (error) => {
      console.error('Error al actualizar imagen:', error);
      alert('Error al actualizar la imagen. Por favor, intenta nuevamente.');
    },
    complete: () => {
      this.isUploadingImage = false;
    }
  });
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
    try {
      console.log('Guardando datos de usuario:', this.currentUser);
      
      // Si es paciente, actualizar fecha de nacimiento
      if (this.currentUser.role === 'paciente' && this.fecha) {
        const patient = this.currentUser.data as Patient;
        patient.dateOfBirth = new Date(this.fecha);
      }

      // Aquí llamarías a tu servicio para actualizar los datos
      // await this.userService.updateUserData(this.currentUser);
      
      // Actualizar el backup
      this.originalUser = JSON.parse(JSON.stringify(this.currentUser));
      this.hasDataChanges = false;
      this.isEditMode = false;
      
      console.log('Datos actualizados exitosamente');
      alert('Información personal actualizada correctamente');
      
    } catch (error) {
      console.error('Error al actualizar datos:', error);
      alert('Error al actualizar la información. Por favor, intenta nuevamente.');
    } finally {
      this.isSavingData = false;
    }
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
    
    console.log('Cambios cancelados');
  }

  validateUserData(): boolean {
    if (!this.currentUser) return false;

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!this.currentUser.email || !emailRegex.test(this.currentUser.email)) {
      alert('Por favor, ingresa un email válido');
      return false;
    }

    // Validar campos requeridos
    if (!this.currentUser.firstName || !this.currentUser.lastName) {
      alert('Nombre y apellido son obligatorios');
      return false;
    }

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

// import { CommonModule } from '@angular/common';
// import { Component, ElementRef, HostListener, OnInit } from '@angular/core';
// import { FormsModule } from '@angular/forms';
// import { AuthCurrentUser } from '../../../../core/models/auth';
// import { Doctor } from '../../../../core/models/doctor';
// import { Patient } from '../../../../core/models/patient';
// import { AuthService } from '../../../../core/auth/auth.service';

// interface EmailNotification {
//   id: string;
//   label: string;
//   description: string;
//   checked: boolean;
// }

// interface SmsNotification {
//   id: string;
//   label: string;
//   description: string;
//   checked: boolean;
// }

// interface CalendarIntegration {
//   id: string;
//   name: string;
//   description: string;
//   checked: boolean;
// }

// interface SelectOption {
//   value: string;
//   label: string;
// }

// @Component({
//   selector: 'app-data-management',
//   standalone: true,
//   imports: [CommonModule, FormsModule],
//   templateUrl: './data-management.component.html',
//   styleUrl: './data-management.component.css'
// })
// export class DataManagementComponent implements OnInit {
//   isEditMode = false;
//   currentUser: AuthCurrentUser | null = null;

//   emailNotifications: EmailNotification[] = [
//     {
//       id: 'email-appointment-reminder',
//       label: 'Recordatorio de citas',
//       description: 'Enviar recordatorio antes de la cita',
//       checked: true
//     },
//     {
//       id: 'email-appointment-confirmation',
//       label: 'Confirmación de citas',
//       description: 'Enviar confirmación al agendar',
//       checked: true
//     },
//     {
//       id: 'email-results',
//       label: 'Resultados de laboratorio',
//       description: 'Notificar cuando hay resultados disponibles',
//       checked: true
//     },
//     {
//       id: 'email-prescriptions',
//       label: 'Recetas médicas',
//       description: 'Enviar recetas por email',
//       checked: true
//     }
//   ];

//   smsNotifications: SmsNotification[] = [
//     {
//       id: 'sms-appointment-reminder',
//       label: 'Recordatorio de citas',
//       description: 'Enviar SMS antes de la cita',
//       checked: true
//     },
//     {
//       id: 'sms-appointment-confirmation',
//       label: 'Confirmación de citas',
//       description: 'Enviar SMS al agendar',
//       checked: false
//     },
//     {
//       id: 'sms-urgent',
//       label: 'Notificaciones urgentes',
//       description: 'SMS para alertas importantes',
//       checked: true
//     }
//   ];

//   calendarIntegrations: CalendarIntegration[] = [
//     {
//       id: 'google-calendar',
//       name: 'Google Calendar',
//       description: 'Sincronizar con Google Calendar',
//       checked: true
//     },
//     {
//       id: 'microsoft-outlook',
//       name: 'Microsoft Outlook',
//       description: 'Sincronizar con Outlook Calendar',
//       checked: false
//     },
//     {
//       id: 'apple-calendar',
//       name: 'Apple Calendar',
//       description: 'Sincronizar con iCal',
//       checked: false
//     }
//   ];

//   emailReminderOptions: SelectOption[] = [
//     { value: '1', label: '1 hora antes' },
//     { value: '2', label: '2 horas antes' },
//     { value: '6', label: '6 horas antes' },
//     { value: '12', label: '12 horas antes' },
//     { value: '24', label: '24 horas antes' },
//     { value: '48', label: '48 horas antes' }
//   ];

//   smsReminderOptions: SelectOption[] = [
//     { value: '1', label: '1 hora antes' },
//     { value: '2', label: '2 horas antes' },
//     { value: '4', label: '4 horas antes' },
//     { value: '6', label: '6 horas antes' }
//   ];

//   selectedEmailReminder: string = '24';
//   selectedSmsReminder: string = '2';
//   testEmail: string = '';
//   testPhone: string = '';

//   showEmailDropdown = false;
//   showSmsDropdown = false;

//   fecha: string | null = null;

//   constructor(private elementRef: ElementRef, private authService: AuthService) { }

//   ngOnInit(): void {
//     this.currentUser = this.authService.getCurrentUser();
//     console.log('Current user:', this.currentUser);
//     if (this.currentUser?.role === 'paciente') {
//       const patient = this.currentUser.data as Patient;
//       this.fecha = this.formatDateForInput(patient.dateOfBirth);
//       console.log('Fecha de nacimiento del paciente:', this.fecha);

//     }
//   }

//   formatDateForInput(date: Date | string): string {
//     const d = new Date(date);
//     return d.toISOString().split('T')[0];
//   }

//   get userInitials(): string {
//     if (this.currentUser && this.currentUser.firstName && this.currentUser.lastName) {
//       return `${this.currentUser.firstName[0]}${this.currentUser.lastName[0]}`.toUpperCase();
//     }
//     return '';
//   }

//   toggleEditMode(): void {
//     this.isEditMode = !this.isEditMode;
//     // Cerrar dropdowns al salir del modo edición
//     if (!this.isEditMode) {
//       this.showEmailDropdown = false;
//       this.showSmsDropdown = false;
//     }
//   }

//   toggleEmailNotification(id: string): void {
//     if (!this.isEditMode) return;
//     const notification = this.emailNotifications.find(n => n.id === id);
//     if (notification) {
//       notification.checked = !notification.checked;
//     }
//   }

//   toggleSmsNotification(id: string): void {
//     if (!this.isEditMode) return;
//     const notification = this.smsNotifications.find(n => n.id === id);
//     if (notification) {
//       notification.checked = !notification.checked;
//     }
//   }

//   toggleCalendarIntegration(id: string): void {
//     if (!this.isEditMode) return;
//     const integration = this.calendarIntegrations.find(i => i.id === id);
//     if (integration) {
//       integration.checked = !integration.checked;
//     }
//   }

//   selectEmailOption(value: any): void {
//     this.selectedEmailReminder = value;
//     this.showEmailDropdown = false;
//   }

//   getSelectedLabel(): string {
//     const selected = this.emailReminderOptions.find(opt => opt.value === this.selectedEmailReminder);
//     return selected ? selected.label : 'Seleccionar';
//   }

//   selectSmsOption(value: any): void {
//     this.selectedSmsReminder = value;
//     this.showSmsDropdown = false;
//   }

//   getSelectedSmsLabel(): string {
//     const selected = this.smsReminderOptions.find(opt => opt.value === this.selectedSmsReminder);
//     return selected ? selected.label : 'Seleccionar';
//   }

//   sendTestEmail(): void {
//     console.log('Enviando email de prueba a:', this.testEmail);
//     // Aquí iría la lógica para enviar el email
//   }

//   sendTestSms(): void {
//     console.log('Enviando SMS de prueba a:', this.testPhone);
//     // Aquí iría la lógica para enviar el SMS
//   }

//   configureIntegrations(): void {
//     console.log('Configurando integraciones...');
//     // Aquí iría la lógica para configurar integraciones
//   }

//   saveConfiguration(): void {
//     console.log('Guardando configuración...');
//     console.log('Email notifications:', this.emailNotifications);
//     console.log('SMS notifications:', this.smsNotifications);
//     console.log('Calendar integrations:', this.calendarIntegrations);
//     console.log('Email reminder:', this.selectedEmailReminder);
//     console.log('SMS reminder:', this.selectedSmsReminder);
//     console.log('User data:', this.currentUser);

//     if (this.selectedFile) {
//       console.log('Subiendo nueva imagen de perfil:', this.selectedFile.name);
//       // Aquí iría la lógica para subir el archivo al backend
//     }

//     // Aquí iría la lógica para guardar en el backend
//     this.isEditMode = false;
//   }

//   selectedFile: File | null = null;
//   imagePreviewUrl: string | ArrayBuffer | null = null;

//   cancel(): void {
//     console.log('Cancelando cambios...');
//     // Revertir cambios en la imagen
//     this.imagePreviewUrl = null;
//     this.selectedFile = null;
//     // Aquí podrías revertir los cambios si guardas un backup del currentUser
//     this.isEditMode = false;
//   }

//   onFileSelected(event: Event): void {
//     const input = event.target as HTMLInputElement;
//     if (input.files && input.files[0]) {
//       const file = input.files[0];
//       if (file.type.match(/image\/png/) || file.type.match(/image\/jpeg/)) {
//         this.selectedFile = file;
//         const reader = new FileReader();
//         reader.onload = () => {
//           this.imagePreviewUrl = reader.result;
//         };
//         reader.readAsDataURL(file);
//       } else {
//         console.error('Formato de archivo no válido. Solo se permiten PNG y JPG.');
//         // Opcional: mostrar un mensaje de error al usuario
//       }
//     }
//   }

//   @HostListener('document:click', ['$event'])
//   clickOutside(event: Event): void {
//     if (!this.isEditMode) return;

//     const target = event.target as HTMLElement;
//     const clickedInsideDropdown = target.closest('.relative');

//     if (!clickedInsideDropdown) {
//       this.showEmailDropdown = false;
//       this.showSmsDropdown = false;
//     }
//   }

//   isPatient(data: any): data is Patient {
//     return data && 'identification' in data && 'typeIdentification' in data;
//   }

//   isDoctor(data: any): data is Doctor {
//     return data && 'speciality' in data && 'licenseNumber' in data;
//   }
// }
