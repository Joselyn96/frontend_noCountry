import { CommonModule } from '@angular/common';
import { Component, computed, HostListener, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

type RoleKey = 'admin' | 'doctor' | 'patient';
type StatusKey = 'active' | 'inactive';

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: RoleKey;
  specialty: string | null;
  status: StatusKey;
  joinDate: string;
}

@Component({
  selector: 'app-patients-management',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './patients-management.component.html',
  styleUrl: './patients-management.component.css'
})
export class PatientsManagementComponent {

  ngOnInit() {
    
  }

 users = signal<User[]>([
    { id: 1, name: 'Dra. María González', email: 'maria.gonzalez@mediconnect.com', phone: '+34 600 111 222', role: 'doctor', specialty: 'Cardiología', status: 'active', joinDate: '2024-01-15' },
    { id: 2, name: 'Juan Pérez', email: 'juan.perez@email.com', phone: '+34 600 333 444', role: 'patient', specialty: null, status: 'active', joinDate: '2024-02-20' },
    { id: 3, name: 'Dr. Carlos Ruiz', email: 'carlos.ruiz@mediconnect.com', phone: '+34 600 555 666', role: 'doctor', specialty: 'Medicina General', status: 'active', joinDate: '2024-01-10' },
    { id: 4, name: 'Ana Martínez', email: 'ana.martinez@email.com', phone: '+34 600 777 888', role: 'patient', specialty: null, status: 'inactive', joinDate: '2024-03-05' },
    { id: 5, name: 'Admin Sistema', email: 'admin@mediconnect.com', phone: '+34 600 999 000', role: 'admin', specialty: null, status: 'active', joinDate: '2024-01-01' },
  ]);

  roleConfig: Record<RoleKey, { label: string; color: string }> = {
    admin: { label: 'Administrador', color: 'bg-[#f44336]' },
    doctor: { label: 'Médico', color: 'bg-[#1877f2]' },
    patient: { label: 'Paciente', color: 'bg-[#2ead4e]' },
  };

  // Forms
  doctorForm!: FormGroup;
  patientForm!: FormGroup;

  // Estado UI
  searchTerm = signal<string>('');
  roleFilter = signal<'all' | RoleKey>('all');
  showMenu = false;

  isDoctorDialogOpen = signal<boolean>(false);
  isPatientDialogOpen = signal<boolean>(false);

  isCreating = signal<boolean>(false);
  errorMsg = signal<string>('');
  successMsg = signal<string>('');

  constructor(private fb: FormBuilder) {
    this.doctorForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      specialty: ['null', Validators.required],
      licenseNumber: [''],
    });

    this.patientForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      dni: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
    });
  }

  filteredUsers = computed(() => {
    const q = this.searchTerm().toLowerCase().trim();
    const rf = this.roleFilter();

    return this.users().filter(u => {
      const matchesSearch = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
      const matchesRole = rf === 'all' || u.role === rf;
      return matchesSearch && matchesRole;
    });
  });

  openDoctorDialog() {
    this.showMenu = false;
    this.errorMsg.set('');
    this.successMsg.set('');
    this.doctorForm.reset();
    this.isDoctorDialogOpen.set(true);
  }

  openPatientDialog() {
    this.showMenu = false;
    this.errorMsg.set('');
    this.successMsg.set('');
    this.patientForm.reset();
    this.isPatientDialogOpen.set(true);
  }

  closeAllDialogs() {
    this.isDoctorDialogOpen.set(false);
    this.isPatientDialogOpen.set(false);
  }

  async createDoctor() {
    if (this.doctorForm.invalid) {
      this.errorMsg.set('Por favor completa todos los campos obligatorios');
      this.doctorForm.markAllAsTouched();
      return;
    }

    this.isCreating.set(true);
    await new Promise(res => setTimeout(res, 1500));

    const v = this.doctorForm.value;
    const nextId = Math.max(...this.users().map(u => u.id)) + 1;

    this.users.update(list => [
      ...list,
      {
        id: nextId,
        name: v.name!,
        email: v.email!,
        phone: v.phone || '',
        role: 'doctor',
        specialty: v.specialty || null,
        status: 'active',
        joinDate: new Date().toISOString().slice(0, 10),
      }
    ]);

    this.successMsg.set('Cuenta de médico creada exitosamente.');
    this.doctorForm.reset();

    setTimeout(() => {
      this.isCreating.set(false);
      this.isDoctorDialogOpen.set(false);
      this.successMsg.set('');
    }, 1200);
  }

  async createPatient() {
    if (this.patientForm.invalid) {
      this.errorMsg.set('Por favor completa todos los campos obligatorios');
      this.patientForm.markAllAsTouched();
      return;
    }

    this.isCreating.set(true);
    await new Promise(res => setTimeout(res, 1500));

    const v = this.patientForm.value;
    const nextId = Math.max(...this.users().map(u => u.id)) + 1;

    this.users.update(list => [
      ...list,
      {
        id: nextId,
        name: v.name!,
        email: v.email!,
        phone: v.phone || '',
        role: 'patient',
        specialty: null,
        status: 'active',
        joinDate: new Date().toISOString().slice(0, 10),
      }
    ]);

    this.successMsg.set('Cuenta de paciente creada exitosamente.');
    this.patientForm.reset();

    setTimeout(() => {
      this.isCreating.set(false);
      this.isPatientDialogOpen.set(false);
      this.successMsg.set('');
    }, 1200);
  }
  showRoleDropdown = false;

roleOptions = [
  { value: 'all', label: 'Todos los roles' },
  { value: 'admin', label: 'Administradores' },
  { value: 'doctor', label: 'Médicos' },
  { value: 'patient', label: 'Pacientes' }
];

selectRole(value: string): void {
  this.roleFilter.set(value as RoleKey | 'all');
  this.showRoleDropdown = false;
}

getSelectedRoleLabel(): string {
  const selected = this.roleOptions.find(opt => opt.value === this.roleFilter());
  return selected ? selected.label : 'Todos los roles';
}

// Si ya tienes un @HostListener, agrégale esto:
@HostListener('document:click', ['$event'])
clickOutside(event: Event): void {
  const target = event.target as HTMLElement;
  if (!target.closest('.relative')) {
    this.showRoleDropdown = false;
    this.showMenu = false; // Para el menú de crear usuario
  }
}
}
