import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { CitasService, Cita } from '../../services/citas.service';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-paciente-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './paciente-dashboard.component.html',
  styleUrls: ['./paciente-dashboard.component.css']
})
export class PacienteDashboardComponent {
  menuOpen = false;
  isDesktop = window.innerWidth > 900;
  citasPendientes: Cita[] = [];
  usuarioId: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private citasService: CitasService
  ) {
    window.addEventListener('resize', () => {
      this.isDesktop = window.innerWidth > 900;
      if (this.isDesktop) {
        this.menuOpen = false;
      }
    });
    // Obtener el usuario actual y sus citas pendientes
    this.authService.getUid().subscribe(uid => {
      this.usuarioId = uid;
      if (uid) {
        this.citasService.getCitas().subscribe(citas => {
          this.citasPendientes = (citas || []).filter((c: any) => c.pacienteId === uid && c.estado === 'pendiente');
        });
      }
    });
  }

  logout(): void {
    this.authService.logout().then(() => {
      this.router.navigate(['/']);
    });
  }
}
