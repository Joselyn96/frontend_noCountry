import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { MetricCardComponent } from '../../../shared/components/metric-card/metric-card.component';
import { StatData } from '../../../shared/interfaces/stat-data.interface';
import { UsersManagementComponent } from './tabs/users-management/users-management.component';
import { RolesPermissionsComponent } from './tabs/roles-permissions/roles-permissions.component';
import { NotificationsConfigComponent } from './tabs/notifications-config/notifications-config.component';
import { SystemSettingsComponent } from './tabs/system-settings/system-settings.component';

type TabValue = 'users' | 'roles' | 'notifications' | 'settings';
type Tab = { label: string; value: TabValue };
@Component({
  selector: 'app-admin',
  imports: [NavbarComponent, MetricCardComponent, CommonModule, UsersManagementComponent, RolesPermissionsComponent, NotificationsConfigComponent, SystemSettingsComponent],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
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
    { label: 'Usuarios', value: 'users' },
    { label: 'Roles', value: 'roles' },
    { label: 'Notif.', value: 'notifications' },
    { label: 'Sistema', value: 'settings' } // opcional
  ] as const satisfies ReadonlyArray<Tab>;

  activeTab: TabValue = 'users';

  setActive(value: TabValue) {
    this.activeTab = value;
  }
}
