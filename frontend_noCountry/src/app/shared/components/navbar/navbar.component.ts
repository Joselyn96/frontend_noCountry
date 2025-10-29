import { Component, inject, Input, OnInit } from '@angular/core';
import { AuthService } from '../../../core/auth/auth.service';
import { AuthCurrentUser } from '../../../core/models/auth';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit {
  @Input() panelTitle: string = 'Panel de Administración';

  user: AuthCurrentUser | null = null;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    const userAuth = this.authService.getCurrentUser();
    if (!userAuth) {
      this.authService.logout();
    } else {
      this.user = userAuth;
    }
  }

  get userInitials(): string {
    if (this.user && this.user.firstName && this.user.lastName) {
      return `${this.user.firstName[0]}${this.user.lastName[0]}`.toUpperCase();
    }
    return '';
  }

  get userRoleDisplay(): string {
    if (this.user && this.user.role) {
      return this.user.role.charAt(0).toUpperCase() + this.user.role.slice(1);
    }
    return '';
  }

  logout(): void {
    this.authService.logout();
  }

}
