import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { AgendaService } from '../../../services/agenda.service';
import { MedicoService } from '../../../services/medico.service';
import { Agenda } from '../../../models/agenda.model';
import { Medico } from '../../../models/medico.model';
import { AgendaFormComponent } from './agenda-form.component';

@Component({
  standalone: true,
  selector: 'app-agenda-list',
  imports: [CommonModule, AgendaFormComponent],
  templateUrl: './agenda-list.component.html',
  styleUrls: ['./agenda-list.component.css']
})
export class AgendaListComponent implements OnInit {
  agendas$!: Observable<Agenda[]>;
  medicos: Medico[] = [];
  selectedAgenda?: Agenda;


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
    if (agenda.id) {
      // Edición
      this.agendaService.updateAgenda(agenda.id, agenda).then(() => {
        this.selectedAgenda = undefined;
        this.loadAgendas();
      });
    } else {
      // Nuevo registro
      this.agendaService.addAgenda(agenda).then(() => {
        this.selectedAgenda = undefined;
        this.loadAgendas();
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
}
