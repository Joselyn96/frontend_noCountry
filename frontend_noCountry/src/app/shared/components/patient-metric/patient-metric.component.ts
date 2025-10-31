import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, LucideIconData, Calendar, Link, Users, UserCheck, Activity, TrendingUp, Info, MonitorPlay } from 'lucide-angular';
import { AppointmentResponse } from '../../../modules/dashboard/tabs/appointment-management/appointment-management.component';
import { StatData } from '../../interfaces/stat-data.interface';

// Extendemos AppointmentResponse para incluir virtualUrl para la visualización en esta tarjeta
interface NextAppointmentDisplay extends AppointmentResponse {
  virtualUrl?: string; // URL opcional para consultas virtuales
  bgColor?: string;
  iconColor?: string;
}

@Component({
  selector: 'app-patient-metric',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './patient-metric.component.html',
  styleUrl: './patient-metric.component.css'
})
export class PatientMetricComponent {
  @Input() stats: StatData[] = [];
  @Input() nextAppointment: NextAppointmentDisplay | null = null;

  private iconMap: { [key: string]: LucideIconData } = {
    'calendar': Calendar,
    'link': Link,
    'users': Users,
    'user-check': UserCheck,
    'activity': Activity,
    'trending-up': TrendingUp,
    'info': Info,
    'monitor-play': MonitorPlay,
  };

  getIcon(iconName: string): LucideIconData {
    return this.iconMap[iconName] || this.iconMap['info'];
  }
}
