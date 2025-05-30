import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PacienteService } from '../../services/paciente.service';
import { Paciente } from '../../models/paciente.model';
import { Auth } from '@angular/fire/auth';

@Component({
  selector: 'app-paciente-perfil',
  standalone: true,  // << agrega esto
  imports: [CommonModule, ReactiveFormsModule],  // << importa aquí
  templateUrl: './paciente-perfil.component.html',
  styleUrls: ['./paciente-perfil.component.css']
})
export class PacientePerfilComponent implements OnInit {
  form!: FormGroup;
  pacienteActual?: Paciente;

  constructor(
    private fb: FormBuilder,
    private pacienteService: PacienteService,
    private auth: Auth
  ) {}

  ngOnInit(): void {
    const usuario = this.auth.currentUser;
    if (usuario?.uid) {
      this.pacienteService.getPaciente(usuario.uid).then(paciente => {
        if (paciente) {
          this.pacienteActual = paciente;
          this.form = this.fb.group({
            nombre: [paciente.nombre, Validators.required],
            direccion: [paciente.direccion, Validators.required],
            fechaNacimiento: [paciente.fechaNacimiento, Validators.required],
            email: [{ value: paciente.email, disabled: true }]
          });
        }
      });
    }
  }

  guardar(): void {
    if (this.form.valid && this.pacienteActual?.uid) {
      const datosActualizados: Partial<Paciente> = this.form.getRawValue();
      this.pacienteService.updatePaciente(this.pacienteActual.uid, datosActualizados)
        .then(() => alert('Datos actualizados correctamente'))
        .catch(err => alert('Error al actualizar: ' + err.message));
    }
  }
}
