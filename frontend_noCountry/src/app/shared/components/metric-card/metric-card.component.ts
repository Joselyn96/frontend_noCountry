import { Component, Input } from '@angular/core';
import { LucideAngularModule, Users, UserCheck, Calendar, Activity, TrendingUp } from 'lucide-angular';
import { StatData } from '../../interfaces/stat-data.interface';

@Component({
  selector: 'app-metric-card',
  imports: [LucideAngularModule],
  templateUrl: './metric-card.component.html',
  styleUrl: './metric-card.component.css'
})
export class MetricCardComponent {
 @Input() stats: StatData[] = [];
 // ← NECESARIO: Importar los iconos
  readonly iconMap = {
    'users': Users,
    'user-check': UserCheck,
    'calendar': Calendar,
    'activity': Activity,
    'trending-up': TrendingUp
  };

  // ← NECESARIO: Método para obtener el icono
  getIcon(name: string) {
    return this.iconMap[name as keyof typeof this.iconMap] || Users;
  }

}
