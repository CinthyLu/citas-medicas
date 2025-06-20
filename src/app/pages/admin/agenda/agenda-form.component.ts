import { Component, ElementRef, EventEmitter, AfterViewInit, Input, OnChanges, OnInit, Output, ViewChild, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { Medico } from '../../../models/medico.model';
import { Agenda } from '../../../models/agenda.model';
import { AgendaService } from '../../../services/agenda.service';

@Component({
  standalone: true,
  selector: 'app-agenda-form',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './agenda-form.component.html',
  styleUrls: ['./agenda-form.component.css']
})
export class AgendaFormComponent implements OnInit, OnChanges, AfterViewInit {
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
  editingAgenda: Agenda | null = null;
  agendasMedico: Agenda[] = [];

  @Input() menuOpcion: 'unitaria' | 'completa' | 'actualizacion' = 'unitaria';

  // Variables para la lógica de agenda completa
  recurrenciaTipo: 'dia' | 'mes' | 'hora' = 'dia';
  fechaInicioMes: string = '';
  fechaFinMes: string = '';
  fechaHora: string = '';
  horaInicioBloque: string = '';
  horaFinBloque: string = '';
  duracionBloque: number = 30;

  diasSemana: string[] = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  diasSeleccionados: boolean[] = [false, false, false, false, false, false, false];

  @ViewChild('calendar', { static: false }) calendarDiv!: ElementRef;
  calendar: any;

  constructor(
    private fb: FormBuilder,
    private agendaService: AgendaService,
    private ngZone: NgZone
  ) {}

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
    this.updateCalendarEvents();
  }

  ngAfterViewInit(): void {
    this.initCalendar();
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
    this.updateCalendarEvents();
  }

  onMedicoChange(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const medicoId = selectElement.value;
    this.selectedMedicoId = medicoId;
    this.cargarAgendasMedico(medicoId);
    setTimeout(() => {
      this.destroyAndReinitCalendar();
    }, 0);
  }

  cargarAgendasMedico(medicoId: string) {
    this.agendaService.getAgendasByMedico(medicoId).subscribe(agendas => {
      this.agendasMedico = agendas;
      this.updateCalendarEvents();
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

  agregarFecha(event: any) {
    const fecha = event.target.value;
    if (fecha && !this.selectedDates.find(d => d.toISOString().split('T')[0] === fecha)) {
      this.selectedDates.push(new Date(fecha));
    }
  }

  async guardar() {
    this.mensajeError = '';
    if (this.menuOpcion === 'actualizacion' && this.editingAgenda) {
      if (this.formAgenda.valid) {
        const agendaForm = this.formAgenda.value;
        const medico = this.medicos.find(m => m.id === agendaForm.uidMedico);
        const medicoNombre = medico ? medico.nombre : 'Sin asignar';
        const agenda: Agenda = {
          ...agendaForm,
          id: this.editingAgenda.id,
          medicoNombre
        };
        if (agenda.id) {
          await this.agendaService.updateAgenda(agenda.id, agenda);
        } else {
          this.mensajeError = 'No se puede actualizar: ID de agenda no válido.';
          return;
        }
        this.onSave.emit(agenda);
        this.cargarAgendasMedico(agendaForm.uidMedico);
        this.editingAgenda = null;
        setTimeout(() => {
          this.destroyAndReinitCalendar();
        }, 0);
      }
      return;
    }
    if (this.menuOpcion === 'completa') {
      const agendaForm = this.formAgenda.value;
      const medico = this.medicos.find(m => m.id === agendaForm.uidMedico);
      const medicoNombre = medico ? medico.nombre : 'Sin asignar';
      if (this.fechaInicioMes && this.fechaFinMes && this.horaInicioBloque && this.horaFinBloque) {
        const diasIndices = this.diasSeleccionados
          .map((sel, idx) => sel ? idx : -1)
          .filter(idx => idx !== -1); // 0=Lunes, 6=Domingo
        if (diasIndices.length === 0) {
          this.mensajeError = 'Selecciona al menos un día de la semana.';
          return;
        }
        let current = new Date(this.fechaInicioMes);
        const end = new Date(this.fechaFinMes);
        let agendasCreadas = 0;
        while (current <= end) {
          let diaSemana = current.getDay();
          diaSemana = diaSemana === 0 ? 6 : diaSemana - 1; // Ajustar a 0=Lunes, 6=Domingo
          if (diasIndices.includes(diaSemana)) {
            // Crear bloques horarios para este día
            let [h, m] = this.horaInicioBloque.split(':').map(Number);
            let [hEnd, mEnd] = this.horaFinBloque.split(':').map(Number);
            let startMinutes = h * 60 + m;
            const endMinutes = hEnd * 60 + mEnd;
            if (startMinutes >= endMinutes) {
              this.mensajeError = 'La hora de inicio debe ser menor que la hora de fin.';
              return;
            }
            const horaInicio = this.padTime(Math.floor(startMinutes / 60)) + ':' + this.padTime(startMinutes % 60);
            const horaFin = this.padTime(Math.floor(endMinutes / 60)) + ':' + this.padTime(endMinutes % 60);
            const agenda: Agenda = {
              uidMedico: agendaForm.uidMedico,
              fecha: current.toISOString().split('T')[0],
              horaInicio,
              horaFin,
              disponible: agendaForm.disponible,
              medicoNombre
            };
            await this.agendaService.addAgenda(agenda);
            agendasCreadas++;
          }
          current.setDate(current.getDate() + 1);
        }
        if (agendasCreadas === 0) {
          this.mensajeError = 'No hay días válidos en el rango seleccionado según los días de la semana marcados.';
          return;
        }
      }
      this.cargarAgendasMedico(agendaForm.uidMedico);
      setTimeout(() => {
        this.destroyAndReinitCalendar();
      }, 0);
      this.selectedDates = [];
      this.fechaInicioMes = '';
      this.fechaFinMes = '';
      this.horaInicioBloque = '';
      this.horaFinBloque = '';
      this.diasSeleccionados = [false, false, false, false, false, false, false];
    } else {
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
        setTimeout(() => {
          this.destroyAndReinitCalendar();
        }, 0);
        this.selectedDates = [];
        this.formAgenda.reset();
      }
    }
  }

  editarAgenda(agenda: Agenda) {
    this.editingAgenda = agenda;
    this.formAgenda.patchValue(agenda);
    // Si quieres, puedes hacer scroll al formulario aquí
  }

  eliminarAgenda(agenda: Agenda) {
    if (agenda.id) {
      this.agendaService.deleteAgenda(agenda.id).then(() => {
        this.cargarAgendasMedico(agenda.uidMedico);
        setTimeout(() => {
          this.destroyAndReinitCalendar();
        }, 0);
      });
    }
  }

  cancelar() {
    this.editingAgenda = null;
    this.selectedDates = [];
    window.location.reload();
  }

  destroyAndReinitCalendar() {
    if (this.calendar) {
      this.calendar.destroy();
    }
    this.initCalendar();
  }

  updateCalendarEvents() {
    if (this.calendar) {
      this.calendar.removeAllEvents();
      this.agendasMedico.forEach(a => {
        this.calendar.addEvent({
          id: a.id,
          title: `${a.medicoNombre || ''} (${a.horaInicio} - ${a.horaFin})`,
          start: a.fecha + 'T' + a.horaInicio,
          end: a.fecha + 'T' + a.horaFin
        });
      });
    }
  }

  initCalendar() {
    // @ts-ignore
    this.calendar = new window.FullCalendar.Calendar(document.getElementById('calendar'), {
      initialView: 'dayGridMonth',
      selectable: true,
      editable: false,
      events: [],
      dateClick: (info: any) => {
        this.formAgenda.patchValue({ fecha: info.dateStr });
      },
      eventClick: (info: any) => {
        // Puedes implementar edición aquí
      }
    });
    this.calendar.render();
    this.updateCalendarEvents();
  }

  handleDateSelect(selectInfo: any) {
    // Selección de fecha en el calendario
    const dateStr = selectInfo.startStr.split('T')[0];
    this.formAgenda.patchValue({ fecha: dateStr });
  }

  handleEventClick(clickInfo: any) {
    // Editar agenda al hacer click en evento
    const agenda = clickInfo.event.extendedProps as Agenda;
    this.editarAgenda(agenda);
  }

  handleEventDrop(dropInfo: any) {
    // Permitir mover eventos en el calendario (opcional)
    // ...puedes implementar lógica para actualizar la agenda...
  }

  handleEventResize(resizeInfo: any) {
    // Permitir redimensionar eventos en el calendario (opcional)
    // ...puedes implementar lógica para actualizar la agenda...
  }

  setMenuOpcion(opcion: 'unitaria' | 'completa' | 'actualizacion') {
    this.menuOpcion = opcion;
  }

  padTime(n: number): string {
    return n < 10 ? '0' + n : n.toString();
  }
}
