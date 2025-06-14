import { Component } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { UserService } from '../../services/user.service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [
    FormsModule, 
    MatFormFieldModule, 
    MatInputModule, 
    MatCardModule, 
    MatButtonModule, 
    RouterLink
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  // Podaci za prijavu korisnika
  public email: string = ''
  public password: string = ''

  constructor(private router: Router) {
    // Proveri da li je korisnik vec ulogovan
    // Ako jeste, preusmeri ga direktno na pocetnu stranicu umesto da ostane na login stranici
    if (UserService.getActiveUser()) {
      this.router.navigate(['/'])
      return
    }
  }

  // Glavna metoda za prijavljivanje korisnika
  public doLogin(): void {
    // Pozovi UserService da pokusa da uloguje korisnika sa unetim podacima
    if (UserService.login(this.email, this.password)) {
      // Uspesna prijava - preusmeri korisnika na pocetnu stranicu
      this.router.navigate(['/'])
      
    } else {
      // Neuspesna prijava - prikazi poruku o gresci
      alert('Neispravno korisničko ime ili lozinka')
    }
  }
}