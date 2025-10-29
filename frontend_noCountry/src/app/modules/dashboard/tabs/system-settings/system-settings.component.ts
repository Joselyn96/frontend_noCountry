import { CommonModule } from '@angular/common';
import { Component, HostListener, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface SelectOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-system-settings',
  imports: [CommonModule, FormsModule],
  templateUrl: './system-settings.component.html',
  styleUrl: './system-settings.component.css'
})
export class SystemSettingsComponent {
  isEditMode = false;

  // General Settings
  systemName: string = 'MediConnect';
  selectedTimezone: string = 'europe-madrid';
  selectedLanguage: string = 'es';
  selectedDuration: string = '30';

  // Security Settings
  twoFactorEnabled: boolean = true;
  sessionTimeoutEnabled: boolean = true;
  encryptionEnabled: boolean = true;
  passwordMinLength: number = 8;
  sessionDuration: number = 60;

  // Dropdowns
  showTimezoneDropdown = false;
  showLanguageDropdown = false;
  showDurationDropdown = false;

  timezoneOptions: SelectOption[] = [
    { value: 'europe-madrid', label: 'Europa/Madrid (GMT+1)' },
    { value: 'europe-london', label: 'Europa/Londres (GMT+0)' },
    { value: 'america-newyork', label: 'América/Nueva York (GMT-5)' }
  ];

  languageOptions: SelectOption[] = [
    { value: 'es', label: 'Español' },
    { value: 'en', label: 'English' },
    { value: 'fr', label: 'Français' }
  ];

  durationOptions: SelectOption[] = [
    { value: '15', label: '15 minutos' },
    { value: '20', label: '20 minutos' },
    { value: '30', label: '30 minutos' },
    { value: '45', label: '45 minutos' },
    { value: '60', label: '60 minutos' }
  ];

  constructor(private elementRef: ElementRef) {}

  toggleEditMode(): void {
    this.isEditMode = !this.isEditMode;
    if (!this.isEditMode) {
      this.showTimezoneDropdown = false;
      this.showLanguageDropdown = false;
      this.showDurationDropdown = false;
    }
  }

  // Timezone
  selectTimezone(value: string): void {
    this.selectedTimezone = value;
    this.showTimezoneDropdown = false;
  }

  getSelectedTimezoneLabel(): string {
    const selected = this.timezoneOptions.find(opt => opt.value === this.selectedTimezone);
    return selected ? selected.label : 'Seleccionar';
  }

  // Language
  selectLanguage(value: string): void {
    this.selectedLanguage = value;
    this.showLanguageDropdown = false;
  }

  getSelectedLanguageLabel(): string {
    const selected = this.languageOptions.find(opt => opt.value === this.selectedLanguage);
    return selected ? selected.label : 'Seleccionar';
  }

  // Duration
  selectDuration(value: string): void {
    this.selectedDuration = value;
    this.showDurationDropdown = false;
  }

  getSelectedDurationLabel(): string {
    const selected = this.durationOptions.find(opt => opt.value === this.selectedDuration);
    return selected ? selected.label : 'Seleccionar';
  }

  // Security toggles
  toggleTwoFactor(): void {
    if (!this.isEditMode) return;
    this.twoFactorEnabled = !this.twoFactorEnabled;
  }

  toggleSessionTimeout(): void {
    if (!this.isEditMode) return;
    this.sessionTimeoutEnabled = !this.sessionTimeoutEnabled;
  }

  restoreDefaults(): void {
    this.systemName = 'MediConnect';
    this.selectedTimezone = 'europe-madrid';
    this.selectedLanguage = 'es';
    this.selectedDuration = '30';
    this.twoFactorEnabled = true;
    this.sessionTimeoutEnabled = true;
    this.passwordMinLength = 8;
    this.sessionDuration = 60;
    console.log('Valores restaurados a los predeterminados');
  }

  saveConfiguration(): void {
    console.log('Guardando configuración del sistema...');
    console.log({
      systemName: this.systemName,
      timezone: this.selectedTimezone,
      language: this.selectedLanguage,
      appointmentDuration: this.selectedDuration,
      twoFactor: this.twoFactorEnabled,
      sessionTimeout: this.sessionTimeoutEnabled,
      passwordMinLength: this.passwordMinLength,
      sessionDuration: this.sessionDuration
    });
    
    this.isEditMode = false;
  }

  @HostListener('document:click', ['$event'])
  clickOutside(event: Event): void {
    if (!this.isEditMode) return;
    
    const target = event.target as HTMLElement;
    const clickedInsideDropdown = target.closest('.relative');
    
    if (!clickedInsideDropdown) {
      this.showTimezoneDropdown = false;
      this.showLanguageDropdown = false;
      this.showDurationDropdown = false;
    }
  }
}
