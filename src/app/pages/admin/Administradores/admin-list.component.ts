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
  template: `
    <div class="container">
     <app-admin-form
  [admin]="selectedAdmin"
  (formSubmit)="handleFormSubmit()"
  (cancelEdit)="selectedAdmin = null">
</app-admin-form>


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
  `,
  styles: [`
    .container {
      max-width: 900px;
      margin: 2rem auto;
      padding: 1rem;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 1rem;
    }

    th, td {
      padding: 0.75rem;
      border: 1px solid #ccc;
      text-align: left;
    }

    th {
      background-color: #f1f1f1;
    }

    button {
      margin-right: 0.5rem;
    }
  `]
})
export class AdminListComponent implements OnInit {
  admins$!: Observable<Administrador[]>;
  selectedAdmin: Administrador | null = null;

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.admins$ = this.adminService.getAdmins();
  }

  editAdmin(admin: Administrador): void {
    this.selectedAdmin = { ...admin };
  }

  deleteAdmin(uid: string): void {
    if (confirm('¿Estás seguro de eliminar este administrador?')) {
      this.adminService.deleteAdmin(uid);
    }
  }

  handleFormSubmit(_: void) {
    this.selectedAdmin = null;
  }
}
