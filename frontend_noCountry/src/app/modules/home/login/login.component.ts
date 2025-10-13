import { Component } from '@angular/core';
import { FormLoginComponent } from './form-login/form-login.component';

@Component({
  selector: 'app-login',
  imports: [FormLoginComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  constructor() {
    console.log('login');
  }
}
