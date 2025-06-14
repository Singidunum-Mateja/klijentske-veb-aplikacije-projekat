import { Component } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { NgIf } from '@angular/common';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet, 
    RouterLink, 
    MatToolbarModule, 
    MatButtonModule, 
    MatIconModule,
    NgIf
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  
  constructor(private router: Router) {}

  // Metoda za proveru da li je korisnik ulogovan
  // Ova metoda se poziva iz template-a da bi se uslovni sadrzaj prikazao
  isUserLoggedIn(): boolean {
    return UserService.isLoggedIn()
  }

  // Metoda za odjavljuavanje korisnika
  // Brise podatke o aktivnom korisniku i preusmerava na pocetnu stranicu
  logout(): void {
    UserService.logout()
    // Nakon odjave, preusmeri korisnika na početnu stranicu
    this.router.navigate(['/'])
    
  }
}