// src/app/pages/admin/pacientes/paciente-form.component.ts
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators,ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PacienteService } from '../../../services/paciente.service';
import { Paciente } from '../../../models/paciente.model';


@Component({
  selector: 'app-paciente-form',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule],
  styleUrls: ['./paciente-form.component.css'],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()" class="paciente-form">
      <h3>{{ paciente?.uid ? 'Editar' : 'Registrar' }} Paciente</h3>

      <label>Nombre:
        <input formControlName="nombre" type="text">
      </label>

      <label>Dirección:
        <input formControlName="direccion" type="text">
      </label>

      <label>Fecha de Nacimiento:
        <input formControlName="fechaNacimiento" type="date">
      </label>

      <label>Email:
        <input formControlName="email" type="email">
      </label>

      <label>Contraseña:
        <input formControlName="password" type="password" [required]="!paciente?.uid">
      </label>

      <div class="buttons">
        <button type="submit" [disabled]="form.invalid">
          {{ paciente?.uid ? 'Actualizar' : 'Registrar' }}
        </button>
        <button type="button" (click)="cancelEdit.emit()">Cancelar</button>
      </div>
    </form>
  `,
  styles: [`
    .paciente-form {
      display: flex;
      flex-direction: column;
      gap: 10px;
      max-width: 400px;
      margin-bottom: 20px;
    }

    label {
      display: flex;
      flex-direction: column;
    }

    .buttons {
      display: flex;
      justify-content: space-between;
    }
  `]
})
export class PacienteFormComponent implements OnChanges {
  @Input() paciente: Paciente | null = null;
  @Output() formSubmit = new EventEmitter<void>();
  @Output() cancelEdit = new EventEmitter<void>();

  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private pacienteService: PacienteService
  ) {
    this.form = this.fb.group({
      nombre: ['', Validators.required],
      direccion: ['', Validators.required],
      fechaNacimiento: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['']
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['paciente'] && this.paciente) {
      this.form.patchValue({
        nombre: this.paciente.nombre,
        direccion: this.paciente.direccion,
        fechaNacimiento: this.paciente.fechaNacimiento,
        email: this.paciente.email,
        password: ''
      });
    } else {
      this.form.reset();
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    const formData = this.form.value;

    if (this.paciente?.uid) {
      // Actualizar paciente existente
      this.pacienteService.updatePaciente(this.paciente.uid, {
        nombre: formData.nombre,
        direccion: formData.direccion,
        fechaNacimiento: formData.fechaNacimiento,
        email: formData.email,
        rol: 'paciente'
      }).then(() => this.formSubmit.emit());
    } else {
      // Registrar nuevo paciente (con creación en Firebase Auth)
      this.pacienteService.createPacienteWithAuth({
        email: formData.email,
        password: formData.password,
        nombre: formData.nombre,
        direccion: formData.direccion,
        fechaNacimiento: formData.fechaNacimiento,
        rol: 'paciente'
      }).then(() => this.formSubmit.emit());
    }

    this.form.reset();
  }
}
