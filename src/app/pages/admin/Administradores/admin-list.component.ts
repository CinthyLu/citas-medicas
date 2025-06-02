import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { AdminService } from '../../../services/admin.service';
import { Administrador } from '../../../models/admin.model';
import { AdminFormComponent } from './admin-form.component';

@Component({
  standalone: true,
  selector: 'app-admin-list',
  imports: [CommonModule, AdminFormComponent],
  styleUrls: ['./admin-form.component.css'],
  template: `
    <div class="container">
      <!-- Formulario para crear/editar -->
      <app-admin-form
        [admin]="selectedAdmin"
        (formSubmit)="onFormSubmit()"
        (cancelEdit)="selectedAdmin = null">
      </app-admin-form>

      <!-- Tabla de admins -->
      <table class="admin-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Email</th>
            <th>Dirección</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let admin of admins$ | async">
            <td>{{ admin.nombre }}</td>
            <td>{{ admin.email }}</td>
            <td>{{ admin.direccion }}</td>
            <td>
              <button (click)="editAdmin(admin)">Editar</button>
              <button (click)="deleteAdmin(admin.uid!)">Eliminar</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `
})
export class AdminListComponent implements OnInit {
  admins$!: Observable<Administrador[]>;
  selectedAdmin: Administrador | null = null;

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.admins$ = this.adminService.getAdmins();
  }

  editAdmin(admin: Administrador) {
    this.selectedAdmin = { ...admin }; // clonar admin para edición
  }

  deleteAdmin(uid: string) {
    if (confirm('¿Seguro que quieres eliminar?')) {
      this.adminService.deleteAdmin(uid);
    }
  }

  onFormSubmit() {
    this.selectedAdmin = null;  // limpiar el formulario al terminar edición o creación
  }
}
