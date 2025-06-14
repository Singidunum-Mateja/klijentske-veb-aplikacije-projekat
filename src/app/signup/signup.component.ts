import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router, RouterLink } from '@angular/router';
import { MatSelectModule } from '@angular/material/select';
import { NgFor } from '@angular/common';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-signup',
  imports: [
    MatCardModule, 
    NgFor, 
    RouterLink, 
    MatFormFieldModule, 
    MatInputModule, 
    FormsModule, 
    MatButtonModule, 
    MatSelectModule
  ],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css'
})
export class SignupComponent {

  // Lista dostupnih zanrova filmova
  // Ovo su standardni filmski zanrovi koje korisnik može da bira kao omiljene
  public genreList: string[] = [
    'Action',
    'Adventure', 
    'Comedy',
    'Drama',
    'Horror',
    'Romance',
    'Sci-Fi',
    'Thriller',
    'Fantasy',
    'Crime',
    'Documentary',
    'Animation'
  ]

  // Podaci za registraciju korisnika
  // Svako polje odgovara jednom input polju u formi
  public email = ''
  public password = ''
  public repeatPassword = ''
  public firstName = ''
  public lastName = ''
  public phone = ''
  public address = ''
  public selectedGenres: string[] = [] // Lista omiljenih žanrova (može biti više)

  constructor(private router: Router) {
    // Konstruktor se poziva kada se komponenta kreira
    // Router service koristimo za navigaciju između stranica
  }

  // Glavna metoda za registraciju korisnika
  // Poziva se kada korisnik klikne na "Signup now" dugme
  public doSignup(): void {
    // Osnovna validacija - email i password su obavezni
    if (this.email === '' || this.password === '') {
      alert('Email i password su obavezna polja')
      return
    }

    // Provera da li se passwordi poklapaju
    if (this.password !== this.repeatPassword) {
      alert('Passwordi se ne poklapaju')
      return
    }

    // Poziv UserService-a da kreira novog korisnika
    // UserService.createUser() vraca true ako je uspesno, false ako email vec postoji
    const result = UserService.createUser({
      email: this.email,
      password: this.password,
      firstName: this.firstName,
      lastName: this.lastName,
      phone: this.phone,
      address: this.address,
      favoriteGenres: this.selectedGenres
    })

    if (result) {
      // Uspesna registracija - preusmeri na login stranicu
      alert('Uspešno ste se registrovali! Sada se možete prijaviti.')
      this.router.navigate(['/login'])
    } else {
      // Neuspesna registracija - email vec postoji
      alert('Email adresa je već zauzeta')
    }
  }
}