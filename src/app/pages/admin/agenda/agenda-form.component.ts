import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Medico } from '../../../models/medico.model';
import { Agenda } from '../../../models/agenda.model';
import { AgendaService } from '../../../services/agenda.service';
import { CalendarEvent } from 'angular-calendar';
import { CalendarModule } from 'angular-calendar';

@Component({
  standalone: true,
  selector: 'app-agenda-form',
  imports: [CommonModule, ReactiveFormsModule, CalendarModule],
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

  // Nuevos estados para el calendario y creación múltiple
  selectedMedicoId: string = '';
  selectedDates: Date[] = [];
  isRecurring: boolean = false;
  recurringDays: string[] = [];
  calendarEvents: CalendarEvent[] = [];
  editingAgenda: Agenda | null = null;
  agendasMedico: Agenda[] = [];

  constructor(private fb: FormBuilder, private agendaService: AgendaService) {}

  ngOnInit(): void {
    this.formAgenda = this.fb.group({
      uidMedico: ['', Validators.required],
      fecha: ['', Validators.required],
      horaInicio: ['', Validators.required],
      horaFin: ['', Validators.required],
      disponible: [true],
      isRecurring: [false],
      recurringDays: [[]],
      fechasMultiples: [[]]
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
    if (this.selectedMedicoId) {
      this.cargarAgendasMedico(this.selectedMedicoId);
    }
  }

  onMedicoChange(medicoId: string) {
    this.selectedMedicoId = medicoId;
    this.cargarAgendasMedico(medicoId);
  }

  cargarAgendasMedico(medicoId: string) {
    this.agendaService.getAgendasByMedico(medicoId).subscribe(agendas => {
      this.agendasMedico = agendas;
      this.calendarEvents = agendas.map(a => ({
        start: new Date(a.fecha + 'T' + a.horaInicio),
        end: new Date(a.fecha + 'T' + a.horaFin),
        title: `${a.medicoNombre || ''} (${a.horaInicio} - ${a.horaFin})`,
        meta: a
      }));
    });
  }

  seleccionarFecha(date: Date) {
    if (!this.selectedDates.find(d => d.getTime() === date.getTime())) {
      this.selectedDates.push(date);
    }
  }

  quitarFecha(date: Date) {
    this.selectedDates = this.selectedDates.filter(d => d.getTime() !== date.getTime());
  }

  async guardar() {
    this.mensajeError = '';
    if (this.formAgenda.valid) {
      const agendaForm = this.formAgenda.value;
      const medico = this.medicos.find(m => m.id === agendaForm.uidMedico);
      const medicoNombre = medico ? medico.nombre : 'Sin asignar';
      // Si es recurrente, crear agendas para los días seleccionados
      if (agendaForm.isRecurring && agendaForm.recurringDays.length > 0) {
        // Lógica para crear agendas recurrentes (por ejemplo, todos los lunes)
        // ...
      } else if (this.selectedDates.length > 0) {
        // Crear agendas para cada fecha seleccionada
        for (const fecha of this.selectedDates) {
          const agenda: Agenda = {
            uidMedico: agendaForm.uidMedico,
            fecha: fecha.toISOString().split('T')[0],
            horaInicio: agendaForm.horaInicio,
            horaFin: agendaForm.horaFin,
            disponible: agendaForm.disponible,
            medicoNombre
          };
          await this.agendaService.addAgenda(agenda);
        }
      } else {
        // Crear agenda única
        const agenda: Agenda = {
          ...agendaForm,
          medicoNombre
        };
        if (this.agenda?.id) {
          agenda.id = this.agenda.id;
        }
        this.onSave.emit(agenda);
      }
      this.cargarAgendasMedico(agendaForm.uidMedico);
      this.selectedDates = [];
    }
  }

  editarAgenda(agenda: Agenda) {
    this.editingAgenda = agenda;
    this.formAgenda.patchValue(agenda);
  }

  eliminarAgenda(agenda: Agenda) {
    if (agenda.id) {
      this.agendaService.deleteAgenda(agenda.id).then(() => {
        this.cargarAgendasMedico(agenda.uidMedico);
      });
    }
  }

  cancelar() {
    this.editingAgenda = null;
    this.selectedDates = [];
    window.location.reload();
  }
}
