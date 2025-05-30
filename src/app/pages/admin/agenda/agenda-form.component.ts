import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Medico } from '../../../models/medico.model';
import { Agenda } from '../../../models/agenda.model';

@Component({
  selector: 'app-agenda-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './agenda-form.component.html',
  styleUrls: ['./agenda-form.component.css']
})
export class AgendaFormComponent implements OnInit {
  @Input() agenda?: Agenda;
  @Input() medicos: Medico[] = [];
  @Output() onSave = new EventEmitter<Agenda>();

  formAgenda!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.formAgenda = this.fb.group({
      medicoId: [this.agenda?.id || '', Validators.required],
      fecha: [this.agenda?.fecha || '', Validators.required],
      horaInicio: [this.agenda?.horaInicio || '', Validators.required],
      horaFin: [this.agenda?.horaFin || '', Validators.required],
      disponible: [this.agenda?.disponible ?? true]
    });
  }

  guardar(): void {
  if (!this.formAgenda.valid) {
    console.warn('Formulario inválido');
    return;
  }

  const isEditing = !!this.agenda?.id;

  const datos: Agenda = {
    ...this.formAgenda.value,
    ...(isEditing ? { uid: this.agenda!.id } : {})
  };

  this.onSave.emit(datos);
  this.formAgenda.reset();
}


  cancelar(): void {
    this.formAgenda.reset();
  }
}
