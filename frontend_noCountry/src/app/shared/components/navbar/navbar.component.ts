import { Component, inject, Input } from '@angular/core';

@Component({
  selector: 'app-navbar',
  imports: [],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  @Input() panelTitle: string = 'Panel de Administración'; // texto por defecto
  @Input() userRole: string = 'Admin'; // rol del usuario
  @Input() userSubtitle: string = 'Administrador'; // subtitulo del usuario

  }
