import { Component } from '@angular/core';

interface Role {
  id: number;
  name: string;
  description: string;
  users: number;
  color: string;
  icon: string;
}

interface Permission {
  id: number;
  name: string;
  module: string;
  icon: string;
  enabled: boolean;
}

@Component({
  selector: 'app-roles-permissions',
  imports: [],
  templateUrl: './roles-permissions.component.html',
  styleUrl: './roles-permissions.component.css'
})
export class RolesPermissionsComponent {
  roles: Role[] = [
    {
      id: 2,
      name: "Médico",
      description: "Gestión de pacientes y citas",
      users: 89,
      color: "bg-primary-blue",
      icon: "Users",
    },
    {
      id: 3,
      name: "Paciente",
      description: "Acceso a servicios médicos",
      users: 1155,
      color: "bg-primary-green",
      icon: "Users",
    },
  ];

  permissions: Permission[] = [
    { id: 1, name: "Gestionar usuarios", module: "Usuarios", icon: "Users", enabled: false },
    { id: 2, name: "Ver todas las citas", module: "Citas", icon: "Calendar", enabled: true },
    { id: 3, name: "Modificar citas", module: "Citas", icon: "Calendar", enabled: true },
    { id: 4, name: "Acceder historiales médicos", module: "Historiales", icon: "FileText", enabled: true },
    { id: 5, name: "Editar historiales médicos", module: "Historiales", icon: "FileText", enabled: true },
    { id: 6, name: "Iniciar teleconsultas", module: "Teleconsulta", icon: "Video", enabled: true },
    { id: 7, name: "Configurar sistema", module: "Sistema", icon: "Settings", enabled: false },
    { id: 8, name: "Ver reportes", module: "Reportes", icon: "FileText", enabled: false },
  ];

  selectedRoleId: number | null = null;

  toggleRoleConfig(roleId: number): void {
    if (this.selectedRoleId === roleId) {
      this.selectedRoleId = null;
    } else {
      this.selectedRoleId = roleId;
      this.loadPermissionsForRole(roleId);
    }
  }

  loadPermissionsForRole(roleId: number): void {
    if (roleId === 2) { // Médico
      this.permissions = this.permissions.map(p => ({
        ...p,
        enabled: p.id <= 6
      }));
    } else if (roleId === 3) { // Paciente
      this.permissions = this.permissions.map(p => ({
        ...p,
        enabled: p.id === 6
      }));
    }
  }

  togglePermission(permissionId: number): void {
    const permission = this.permissions.find(p => p.id === permissionId);
    if (permission) {
      permission.enabled = !permission.enabled;
    }
  }

  getSelectedRoleName(): string {
    const role = this.roles.find(r => r.id === this.selectedRoleId);
    return role ? role.name : '';
  }

  saveChanges(): void {
  // Aquí puedes agregar lógica para guardar en el backend
  console.log('Guardando cambios...', this.permissions);
  this.selectedRoleId = null; // Oculta la matriz
}

cancelChanges(): void {
  this.selectedRoleId = null; // Oculta la matriz sin guardar
}
}
