import { Component, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
  selector: 'app-notifications-config',
  imports: [CommonModule, FormsModule],
  templateUrl: './notifications-config.component.html',
  styleUrl: './notifications-config.component.css'
})
export class NotificationsConfigComponent {
  isEditMode = false;
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

  constructor(private elementRef: ElementRef) {}

  toggleEditMode(): void {
    this.isEditMode = !this.isEditMode;
    // Cerrar dropdowns al salir del modo edición
    if (!this.isEditMode) {
      this.showEmailDropdown = false;
      this.showSmsDropdown = false;
    }
  }

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
    // Aquí iría la lógica para enviar el email
  }

  sendTestSms(): void {
    console.log('Enviando SMS de prueba a:', this.testPhone);
    // Aquí iría la lógica para enviar el SMS
  }

  configureIntegrations(): void {
    console.log('Configurando integraciones...');
    // Aquí iría la lógica para configurar integraciones
  }

  saveConfiguration(): void {
    console.log('Guardando configuración...');
    console.log('Email notifications:', this.emailNotifications);
    console.log('SMS notifications:', this.smsNotifications);
    console.log('Calendar integrations:', this.calendarIntegrations);
    console.log('Email reminder:', this.selectedEmailReminder);
    console.log('SMS reminder:', this.selectedSmsReminder);
    
    // Aquí iría la lógica para guardar en el backend
    this.isEditMode = false;
  }

  cancel(): void {
    console.log('Cancelando cambios...');
    // Aquí podrías revertir los cambios si guardas un backup
    this.isEditMode = false;
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
}
