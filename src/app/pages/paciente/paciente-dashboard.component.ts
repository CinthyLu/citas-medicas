import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-paciente-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './paciente-dashboard.component.html',
  styleUrls: ['./paciente-dashboard.component.css']
})
export class PacienteDashboardComponent {
  constructor(private authService: AuthService, private router: Router) {}

  logout(): void {
    this.authService.logout().then(() => {
      this.router.navigate(['/']);
    });
  }
}
