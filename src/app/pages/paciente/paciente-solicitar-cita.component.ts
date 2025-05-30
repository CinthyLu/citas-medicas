import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MedicoService } from '../../services/medico.service';
import { CitasService } from '../../services/citas.service';
import { Medico } from '../../models/medico.model';
import { Auth } from '@angular/fire/auth';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-paciente-solicitar-cita',
  imports: [CommonModule, ReactiveFormsModule],

  templateUrl: './paciente-solicitar-cita.component.html',
  styleUrls: ['./paciente-solicitar-cita.component.css']
})
export class PacienteSolicitarCitaComponent implements OnInit {
  form!: FormGroup;
  medicos: Medico[] = [];
  mensaje: string = '';

  constructor(
    private fb: FormBuilder,
    private medicoService: MedicoService,
    private citasService: CitasService,
    private auth: Auth
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      medicoId: ['', Validators.required],
      fecha: ['', Validators.required],
      hora: ['', Validators.required],
      motivo: ['', [Validators.required, Validators.minLength(10)]]
    });

    this.loadMedicos();
  }

  loadMedicos() {
    this.medicoService.getMedicos().subscribe((lista: Medico[]) => {
     this.medicos = lista;
});

  }

  async solicitarCita() {
    if (this.form.invalid) {
      this.mensaje = 'Por favor, complete todos los campos correctamente.';
      return;
    }

    const usuario = this.auth.currentUser;
    if (!usuario) {
      this.mensaje = 'Debe estar autenticado para solicitar una cita.';
      return;
    }

    const cita = {
      pacienteId: usuario.uid,
      medicoId: this.form.value.medicoId,
      fecha: this.form.value.fecha,
      hora: this.form.value.hora,
      motivo: this.form.value.motivo,
      estado: 'pendiente',
      creadaEn: new Date()
    };

    try {
      await this.citasService.solicitarCita(cita);
      this.mensaje = 'Cita solicitada correctamente.';
      this.form.reset();
    } catch (error) {
      this.mensaje = 'Error al solicitar cita: ';
    }
  }
}
