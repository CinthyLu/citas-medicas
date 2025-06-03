import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router'; // ✅ importa Router
import { AuthService } from '../../auth/auth.service'; // ✅ ajusta la ruta según tu estructura
import { FormsModule, NgModel } from '@angular/forms';
import { CitasService } from '../../services/citas.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent {
  isMenuOpen = false;
  isDesktop = window.innerWidth > 900;
  citasPendientesCount: number = 0;

  constructor(
    private authService: AuthService,
    private router: Router,
    private citasService: CitasService
  ) {
    window.addEventListener('resize', () => {
      this.isDesktop = window.innerWidth > 900;
      if (this.isDesktop) {
        this.isMenuOpen = false;
      }
    });
    // Obtener cantidad de citas pendientes
    this.citasService.getCitas().subscribe(citas => {
      this.citasPendientesCount = (citas || []).filter((c: any) => c.estado === 'pendiente').length;
    });
  }

  logout() {
    this.authService.logout().then(() => {
      this.router.navigate(['/']);
    });
  }
}
