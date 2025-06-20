import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { AgendaService } from '../../../services/agenda.service';
import { MedicoService } from '../../../services/medico.service';
import { Agenda } from '../../../models/agenda.model';
import { Medico } from '../../../models/medico.model';
import { AgendaFormComponent } from './agenda-form.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-agenda-list',
  imports: [CommonModule, FormsModule, AgendaFormComponent],
  templateUrl: './agenda-list.component.html',
  styleUrls: ['./agenda-list.component.css']
})
export class AgendaListComponent implements OnInit {
  agendas$!: Observable<Agenda[]>;
  medicos: Medico[] = [];
  selectedAgenda?: Agenda;
  errorPadre: string = '';
  filtroMedico: string = '';
  medicoFiltradoId: string = '';
  menuOpcion: 'unitaria' | 'completa' | 'actualizacion' = 'unitaria';


  constructor(
    private agendaService: AgendaService,
    private medicoService: MedicoService
  ) {}

  ngOnInit(): void {
    this.loadMedicos();
    this.loadAgendas();
  }

  loadMedicos() {
    this.medicoService.getMedicos().subscribe(meds => {
      this.medicos = meds;
    });
  }

  loadAgendas() {
    this.agendas$ = this.agendaService.getAgendas();
  }

  editAgenda(agenda: Agenda) {
    this.selectedAgenda = { ...agenda };
  }

  deleteAgenda(uid: string) {
    if (confirm('¿Seguro que quieres eliminar esta agenda?')) {
      this.agendaService.deleteAgenda(uid).then(() => {
        this.loadAgendas();
      });
    }
  }

  onSaveAgenda(agenda: Agenda) {
    this.errorPadre = '';
    if (agenda.id) {
      // Edición
      this.agendaService.updateAgenda(agenda.id, agenda).then(() => {
        this.selectedAgenda = undefined;
        this.loadAgendas();
      });
    } else {
      // Nuevo registro: validación de solapamiento y fecha
      this.agendaService.getAgendasByMedico(agenda.uidMedico).subscribe(agendasExistentes => {
        const mismaFecha = (agendasExistentes || []).find(a => a.fecha === agenda.fecha);
        if (mismaFecha) {
          this.errorPadre = 'Ya existe una agenda para este médico en la fecha seleccionada.';
          return;
        }
        const existeSolapamiento = (agendasExistentes || []).some(a =>
          a.fecha === agenda.fecha &&
          (
            (agenda.horaInicio >= a.horaInicio && agenda.horaInicio < a.horaFin) ||
            (agenda.horaFin > a.horaInicio && agenda.horaFin <= a.horaFin) ||
            (agenda.horaInicio <= a.horaInicio && agenda.horaFin >= a.horaFin)
          )
        );
        if (existeSolapamiento) {
          this.errorPadre = 'El médico ya tiene una agenda en ese horario.';
          return;
        }
        this.agendaService.addAgenda(agenda).then(() => {
          this.selectedAgenda = undefined;
          this.loadAgendas();
        });
      });
    }
  }

  cancelarEdicion() {
    this.selectedAgenda =undefined;
  }

  getNombreMedico(medicoId?: string): string {
  if (!medicoId) return 'Sin asignar';
  const medico = this.medicos.find(m => m.id === medicoId);
  return medico ? medico.nombre : 'Sin asignar';
}

get medicosFiltrados(): Medico[] {
    if (!this.filtroMedico.trim()) return this.medicos;
    return this.medicos.filter(m => m.nombre.toLowerCase().includes(this.filtroMedico.toLowerCase()));
  }

  filtrarAgendasPorMedico() {
    if (this.medicoFiltradoId) {
      this.agendas$ = this.agendaService.getAgendasByMedico(this.medicoFiltradoId);
    } else {
      this.loadAgendas();
    }
    this.selectedAgenda = undefined;
  }

  setMenuOpcion(opcion: 'unitaria' | 'completa' | 'actualizacion') {
    this.menuOpcion = opcion;
    this.selectedAgenda = undefined;
    this.errorPadre = '';
  }

}
