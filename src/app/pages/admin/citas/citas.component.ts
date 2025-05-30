import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CitasService, Cita } from '../../../services/citas.service';

@Component({
  selector: 'app-citas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './citas.component.html',
  styleUrls: ['./citas.component.css']
})
export class CitasComponent implements OnInit {
  citasPendientes: Cita[] = [];
  loading = true;

  constructor(private citasService: CitasService) {}

  ngOnInit(): void {
    this.obtenerCitasPendientes();
  }

  obtenerCitasPendientes(): void {
    this.citasService.getCitasConNombres().subscribe(citas => {
      this.citasPendientes = citas.filter(cita => cita.estado === 'pendiente');
      this.loading = false;
    });
  }

  confirmarCita(id: string): void {
    this.citasService.updateEstadoCita(id, 'confirmada')
      .then(() => this.obtenerCitasPendientes());
  }

  rechazarCita(id: string): void {
    this.citasService.updateEstadoCita(id, 'rechazada')
      .then(() => this.obtenerCitasPendientes());
  }

  eliminarCita(id: string): void {
    if (confirm('¿Estás seguro de que deseas eliminar esta cita?')) {
      this.citasService.eliminarCita(id)
        .then(() => this.obtenerCitasPendientes());
    }
  }
}

