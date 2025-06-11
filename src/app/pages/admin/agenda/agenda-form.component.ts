import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Medico } from '../../../models/medico.model';
import { Agenda } from '../../../models/agenda.model';
import { AgendaService } from '../../../services/agenda.service';

@Component({
  standalone: true,
  selector: 'app-agenda-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './agenda-form.component.html',
  styleUrls: ['./agenda-form.component.css']
})
export class AgendaFormComponent implements OnInit, OnChanges {
  @Input() agenda?: Agenda;
  @Input() medicos: Medico[] = [];
  @Input() errorPadre: string = '';
  @Output() onSave = new EventEmitter<Agenda>();
  @Output() onCancel = new EventEmitter<void>();
  @Output() onError = new EventEmitter<string>();

  formAgenda!: FormGroup;
  mensajeError: string = '';

  constructor(private fb: FormBuilder, private agendaService: AgendaService) {}

  ngOnInit(): void {
    this.formAgenda = this.fb.group({
      uidMedico: ['', Validators.required],
      fecha: ['', Validators.required],
      horaInicio: ['', Validators.required],
      horaFin: ['', Validators.required],
      disponible: [true]
    });
  }

  ngOnChanges(): void {
    if (this.agenda && this.formAgenda) {
      this.formAgenda.patchValue({
        uidMedico: this.agenda.uidMedico,
        fecha: this.agenda.fecha,
        horaInicio: this.agenda.horaInicio,
        horaFin: this.agenda.horaFin,
        disponible: this.agenda.disponible
      });
    }
  }

  async guardar() {
    this.mensajeError = '';
    if (this.formAgenda.valid) {
      const agendaForm = this.formAgenda.value;
      const medico = this.medicos.find(m => m.id === agendaForm.uidMedico);
      const medicoNombre = medico ? medico.nombre : 'Sin asignar';
      const agenda: Agenda = {
        ...agendaForm,
        medicoNombre
      };
      if (this.agenda?.id) {
        agenda.id = this.agenda.id;
      }
      this.onSave.emit(agenda);
    }
  }

  cancelar() {
    window.location.reload();
  }
}
