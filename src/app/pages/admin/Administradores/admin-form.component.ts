import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Administrador } from '../../../models/admin.model';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-admin-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatSnackBarModule],
 styleUrls: ['./admin-form.component.css'],
  template: `
   <div class="container">
  <h2>{{ isEdit ? 'Editar Administrador' : 'Registrar Administrador' }}</h2>
  <form [formGroup]="adminForm" (ngSubmit)="guardar()">
    <div class="form-group">
      <label>Nombre</label>
      <input type="text" formControlName="nombre" class="form-control" />
    </div>

    <div class="form-group">
      <label>Dirección</label>
      <input type="text" formControlName="direccion" class="form-control" />
    </div>

    <div class="form-group">
      <label>Fecha de Nacimiento</label>
      <input type="date" formControlName="fechaNacimiento" class="form-control" />
    </div>

    <div class="form-group">
      <label>Email</label>
      <input type="email" formControlName="email" class="form-control" />
    </div>

    <div class="form-group" *ngIf="!isEdit">
      <label>Contraseña</label>
      <input type="password" formControlName="password" class="form-control" />
    </div>

    <div class="buttons">
      <button type="submit">{{ isEdit ? 'Actualizar' : 'Registrar' }}</button>
      <button type="button" class="cancel-btn" (click)="router.navigate(['/admin/administradores'])">Cancelar</button>
    </div>
  </form>

  <div class="buttons">
    <button type="button" (click)="crearAdminConGoogle()">Crear con Google</button>
  </div>
</div>

  `,
 
})
export class AdminFormComponent implements OnInit {
  @Input() admin: Administrador | null = null;
  adminForm!: FormGroup;
  isEdit = false;
  uid: string | null = null;

  constructor(
    private fb: FormBuilder,
    private adminService: AdminService,
    public router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.adminForm = this.fb.group({
      nombre: ['', Validators.required],
      direccion: ['', Validators.required],
      fechaNacimiento: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['']
    });

    this.uid = this.route.snapshot.paramMap.get('uid');
    if (this.uid) {
      this.isEdit = true;
      this.adminService.getAdmins().subscribe((admins) => {
        if (admins) {
          this.adminForm.patchValue(admins);
        }
      });

      this.adminForm.get('password')?.clearValidators();
      this.adminForm.get('password')?.updateValueAndValidity();
    }
  }

  async guardar() {
    if (this.adminForm.invalid) return;

    const { password, ...adminData } = this.adminForm.value;

    if (this.isEdit && this.uid) {
      await this.adminService.updateAdmin({ ...adminData, uid: this.uid });
    } else {
      await this.adminService.registerAdmin({ ...adminData, rol: 'administrador' }, password);
    }

    this.router.navigate(['/admin/administradores']);
  }

 async crearAdminConGoogle() {
  const creado = await this.adminService.crearAdminConGoogle();
  if (creado) {
    this.snackBar.open('Administrador creado exitosamente con Google', 'Cerrar', {
      duration: 3000,
      verticalPosition: 'top',
    });
  } else {
    this.snackBar.open('El usuario ya existe', 'Cerrar', {
      duration: 3000,
      verticalPosition: 'top',
    });
  }
}

}
