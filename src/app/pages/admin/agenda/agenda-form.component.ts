import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Medico } from '../../../models/medico.model';
import { Agenda } from '../../../models/agenda.model';

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
  @Output() onSave = new EventEmitter<Agenda>();
  @Output() onCancel = new EventEmitter<void>();

  formAgenda!: FormGroup;

  constructor(private fb: FormBuilder) {}

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

  guardar() {
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

    this.formAgenda.reset();           // Limpia los campos
    this.onCancel.emit();              // Le dice al padre que termine la edición

  }

  cancelar() {
    window.location.reload();
  }
}
