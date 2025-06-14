import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';

// Angular Material
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';

import { UserService } from '../../services/user.service';
import { CartService } from '../../services/cart.service';
import { UserModel } from '../../models/user.model';
import { CartItemModel } from '../../models/cart.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatTableModule,
    MatIconModule,
    NgIf
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  // Korisnicke informacije
  user: UserModel | null = null;
  editableUser: UserModel = {
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    favoriteGenres: [],
    password: ''
  };

  // Polja za promenu lozinke
  oldPassword: string = '';
  newPassword: string = '';
  confirmPassword: string = '';

  // Poruke za korisnika
  passwordSuccessMessage: string = '';
  passwordErrorMessage: string = '';
  infoSuccessMessage: string = '';
  infoErrorMessage: string = '';

  // Dostupni zanrovi za izbor
  availableGenres: string[] = [
    'Akcija', 'Komedija', 'Drama', 'Horor', 'Naučna fantastika', 
    'Romantična', 'Triler', 'Avantura', 'Animacija', 'Kriminalistički'
  ];

  // Podaci o filmovima
  watchedMovies: CartItemModel[] = [];
  cancelledMovies: CartItemModel[] = [];

  // Kolone za tabele
  watchedMoviesColumns: string[] = ['title', 'duration', 'projection', 'price', 'review'];
  cancelledMoviesColumns: string[] = ['title', 'duration', 'projection', 'price'];

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Proveravamo da li je korisnik ulogovan
    if (!UserService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    this.loadUserData();
    this.loadMovieData();
  }

  /**
   * Ucitava podatke o korisniku iz UserService-a
   * Kreira kopiju za editovanje kako originalni podaci ne bi bili izmenjeni dok se ne sacuvaju
   */
  loadUserData(): void {
    this.user = UserService.getActiveUser();
    if (this.user) {
      // Pravimo kopiju korisncčkih podataka za editovanje
      this.editableUser = {
        email: this.user.email,
        firstName: this.user.firstName,
        lastName: this.user.lastName,
        phone: this.user.phone,
        address: this.user.address,
        favoriteGenres: [...this.user.favoriteGenres], // kopiramo niz
        password: this.user.password
      };
    }
  }

  /**
   * Ucitava filmove iz korpe na osnovu njihovog statusa
   * Pogledani filmovi su oni sa statusom 'gledano'
   * Otkazani filmovi su oni sa statusom 'otkazano'
   */
  loadMovieData(): void {
    const allCartItems = CartService.getCartItems();
    
    this.watchedMovies = allCartItems.filter(item => item.status === 'gledano');
    this.cancelledMovies = allCartItems.filter(item => item.status === 'otkazano');
  }

  /**
   * Formatira datum i vreme projekcije u citljiv format
   * Pretvara YYYY-MM-DD format u DD.MM.YYYY i dodaje vreme
   */
  formatProjectionDateTime(date: string, time: string): string {
    const dateObj = new Date(date);
    const formattedDate = dateObj.toLocaleDateString('sr-RS', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    
    return `${formattedDate} ${time}`;
  }

  /**
   * Menja lozinku korisnika
   * Proverava da li su nova lozinka i potvrda identicne
   * Poziva UserService da izvrsi promenu
   */
  changePassword(): void {
    // Resetujemo poruke
    this.passwordSuccessMessage = '';
    this.passwordErrorMessage = '';

    // Validacija polja
    if (!this.oldPassword || !this.newPassword || !this.confirmPassword) {
      this.passwordErrorMessage = 'Molimo popunite sva polja.';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.passwordErrorMessage = 'Nova lozinka i potvrda se ne poklapaju.';
      return;
    }

    if (this.newPassword.length < 6) {
      this.passwordErrorMessage = 'Nova lozinka mora imati najmanje 6 karaktera.';
      return;
    }

    // Pokusavamo da promenimo lozinku
    const success = UserService.changePassword(this.oldPassword, this.newPassword);
    
    if (success) {
      this.passwordSuccessMessage = 'Lozinka je uspešno promenjena.';
      // cistimo polja nakon uspešne promene
      this.oldPassword = '';
      this.newPassword = '';
      this.confirmPassword = '';
      
      // Uklanjamo poruku posle 3 sekunde
      setTimeout(() => {
        this.passwordSuccessMessage = '';
      }, 3000);
    } else {
      this.passwordErrorMessage = 'Stara lozinka nije tačna.';
    }
  }

  /**
   * Azurira korisnicke informacije
   * Validira podatke i cuva ih putem UserService-a
   */
  updateUserInfo(): void {
    // Resetujemo poruke
    this.infoSuccessMessage = '';
    this.infoErrorMessage = '';

    // Validacija obaveznih polja
    if (!this.editableUser.firstName || !this.editableUser.lastName) {
      this.infoErrorMessage = 'Ime i prezime su obavezni.';
      return;
    }

    if (!this.editableUser.phone) {
      this.infoErrorMessage = 'Telefon je obavezan.';
      return;
    }

    if (!this.editableUser.address) {
      this.infoErrorMessage = 'Adresa je obavezna.';
      return;
    }

    // Validacija telefona (osnovni format)
    const phoneRegex = /^\+?[0-9\s\-()]{9,15}$/;
    if (!phoneRegex.test(this.editableUser.phone)) {
      this.infoErrorMessage = 'Molimo unesite valjan broj telefona.';
      return;
    }

    try {
      // Azuriramo korisničke podatke
      UserService.updateUser(this.editableUser);
      
      // Ponovo ucitavamo podatke da bismo prikazali azurirane informacije
      this.loadUserData();
      
      this.infoSuccessMessage = 'Korisničke informacije su uspešno ažurirane.';
      
      // Uklanjamo poruku posle 3 sekunde
      setTimeout(() => {
        this.infoSuccessMessage = '';
      }, 3000);
      
    } catch (error) {
      this.infoErrorMessage = 'Došlo je do greške pri ažuriranju podataka.';
    }
  }

  /**
   * Dobija trenutnu ocenu za odredjenu projekciju
   * Koristi UserService da pronađe ocenu korisnika za datu projekciju
   */
  getRating(movieId: number, projectionDate: string, projectionTime: string): number {
    return UserService.getUserRating(movieId, projectionDate, projectionTime);
  }

  /**
   * Ocenjuje film zvezdama
   * cuva ocenu u localStorage putem UserService-a
   */
  rateMovie(movieId: number, movieTitle: string, projectionDate: string, 
            projectionTime: string, rating: number): void {
    const success = UserService.rateMovie(movieId, movieTitle, projectionDate, projectionTime, rating);
    
    if (!success) {
      // Ako korisnik nije ulogovan ili je došlo do greske
      console.error('Greška pri ocenjivanju filma');
    }
    
  }
}