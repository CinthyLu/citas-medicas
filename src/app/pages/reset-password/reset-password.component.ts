import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true, // ⬅️ IMPORTANTE
  imports: [CommonModule, ReactiveFormsModule], // ⬅️ NECESARIO
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {
  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  sendResetEmail() {
    const email = this.form.get('email')?.value;
    if (email) {
      this.auth.resetPassword(email)
        .then(() => alert('Correo de recuperación enviado'))
        .catch(err => {
          console.error('Error al enviar correo:', err);
          alert('Hubo un error al enviar el correo.');
        });
    }
  }
}
