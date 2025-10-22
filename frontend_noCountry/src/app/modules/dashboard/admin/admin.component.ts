import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { MetricCardComponent } from '../../../shared/components/metric-card/metric-card.component';
import { StatData } from '../../../shared/interfaces/stat-data.interface';
import { RolesPermissionsComponent } from './tabs/roles-permissions/roles-permissions.component';
import { SystemSettingsComponent } from './tabs/system-settings/system-settings.component';
import { PatientsManagementComponent } from './tabs/patients-management/patients-management.component';
import { DoctorsManagementComponent } from './tabs/doctors-management/doctors-management.component';

type TabValue = 'doctors' | 'roles' | 'patients' | 'settings';
type Tab = { label: string; value: TabValue };
@Component({
  selector: 'app-admin',
  imports: [NavbarComponent, MetricCardComponent, CommonModule, PatientsManagementComponent, DoctorsManagementComponent, RolesPermissionsComponent, SystemSettingsComponent],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css',
  standalone: true
})
export class AdminComponent {
  stats: StatData[] = [
    { 
      title: 'Total Usuarios', 
      value: '1,247', 
      change: '+12% vs mes anterior', 
      bgColor: 'bg-blue-100', 
      iconColor: 'text-blue-600',
      icon: 'users'
    },
    { 
      title: 'Médicos Activos', 
      value: '89', 
      change: '+5 este mes', 
      bgColor: 'bg-blue-100', 
      iconColor: 'text-blue-600',
      icon: 'user-check'
    },
    { 
      title: 'Citas Hoy', 
      value: '342', 
      change: '+18% vs ayer', 
      bgColor: 'bg-blue-100', 
      iconColor: 'text-blue-600',
      icon: 'calendar'
    },
    { 
      title: 'Teleconsultas', 
      value: '156', 
      change: '45% del total', 
      bgColor: 'bg-blue-100', 
      iconColor: 'text-blue-600',
      icon: 'activity'
    }
  ];

  tabs = [
    { label: 'Pacientes', value: 'patients' },
    { label: 'Doctores', value: 'doctors' },
    { label: 'Roles', value: 'roles' },
    { label: 'Sistema', value: 'settings' } // opcional
  ] as const satisfies ReadonlyArray<Tab>;

  activeTab: TabValue = 'patients';

  setActive(value: TabValue) {
    this.activeTab = value;
  }
}
