import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MedicoService } from '../../services/medico.service';
import { CitasService } from '../../services/citas.service';
import { AgendaService } from '../../services/agenda.service';
import { Medico } from '../../models/medico.model';
import { Agenda } from '../../models/agenda.model';
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
  agendasDisponibles: Agenda[] = [];
  mensaje: string = '';
  nombreMedicoSeleccionado: string = '';

  constructor(
    private fb: FormBuilder,
    private medicoService: MedicoService,
    private citasService: CitasService,
    private agendaService: AgendaService,
    private auth: Auth
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      medicoId: ['', Validators.required],
      agendaId: ['', Validators.required],
      motivo: ['', [Validators.required, Validators.minLength(10)]]
    });

    this.loadMedicos();

    this.form.get('medicoId')?.valueChanges.subscribe(medicoId => {
      this.nombreMedicoSeleccionado = this.medicos.find(m => m.id === medicoId)?.nombre || '';
      this.cargarAgendasDisponibles(medicoId);
    });
  }

  loadMedicos() {
    this.medicoService.getMedicos().subscribe((lista: Medico[]) => {
      this.medicos = lista;
    });
  }

  cargarAgendasDisponibles(medicoId: string) {
    this.agendaService.getAgendasByMedico(medicoId).subscribe((agendas: Agenda[]) => {
      this.agendasDisponibles = agendas.filter(a => a.disponible);
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

    const agendaSeleccionada = this.agendasDisponibles.find(a => a.id === this.form.value.agendaId);

    if (!agendaSeleccionada) {
      this.mensaje = 'Agenda seleccionada no válida.';
      return;
    }

    const cita = {
      pacienteId: usuario.uid,
      medicoId: this.form.value.medicoId,
      medicoNombre: this.nombreMedicoSeleccionado,
      fecha: agendaSeleccionada.fecha,
      hora: agendaSeleccionada.horaInicio,
      motivo: this.form.value.motivo,
      estado: 'pendiente',
      creadaEn: new Date()
    };

    try {
      await this.citasService.solicitarCita(cita);
      this.mensaje = 'Cita solicitada correctamente.';
      this.form.reset();
      this.agendasDisponibles = [];
    } catch (error) {
      this.mensaje = 'Error al solicitar cita.';
    }
  }
}
