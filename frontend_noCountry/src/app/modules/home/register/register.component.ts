import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { FormRegisterComponent } from './form-register/form-register.component';
import { PatientCreate } from '../../../core/models/patient';

@Component({
  selector: 'app-register',
  imports: [CommonModule, ReactiveFormsModule, FormRegisterComponent, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  constructor(private fb: FormBuilder, private router: Router) {
  }

}
