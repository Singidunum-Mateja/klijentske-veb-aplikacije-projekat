import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';

import { MovieService } from '../../services/movie.service';
import { CartService } from '../../services/cart.service';
import { MovieModel } from '../../models/movie.model';
import { ProjectionModel } from '../../models/projection.model';
import { LoadingComponent } from '../loading/loading.component';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    LoadingComponent
  ],
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.css']
})
export class DetailsComponent implements OnInit {
  movie: MovieModel | null = null;
  projections: ProjectionModel[] = [];
  isLoading: boolean = false;
  movieId: number = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private movieService: MovieService
  ) {}

  ngOnInit(): void {
    // Proveravamo da li je korisnik ulogovan pre nego sto ucitamo podatke
    if (!UserService.isLoggedIn()) {
      // Ako nije ulogovan, preusmeravamo ga na login stranicu
      this.router.navigate(['/login']);
      return;
    }

    // Dobijamo ID filma iz URL parametra
    this.route.params.subscribe(params => {
      this.movieId = +params['id']; // Konvertujemo string u broj
      this.loadMovieDetails();
      this.generateProjections();
    });
  }

  async loadMovieDetails(): Promise<void> {
    this.isLoading = true;
    try {
      const movies = await this.movieService.getMovies();
      // Pronalazimo film sa odgovarajucim ID-jem
      this.movie = movies.find(m => m.id === this.movieId) || null;
      
      if (!this.movie) {
        console.error('Film nije pronađen');
      }
    } catch (error) {
      console.error('Greška pri učitavanju detalja filma:', error);
    } finally {
      this.isLoading = false;
    }
  }

  // Generisemo test projekcije za svaki film
  generateProjections(): void {
    const times = ['18:00', '20:30', '22:45'];
    const halls = ['Sala 1', 'Sala 2', 'Sala 3'];
    const prices = [450, 500, 550]; // Cene u RSD
    
    this.projections = times.map((time, index) => ({
      date: this.getTomorrowDate(), // Projekcije su sutra
      time: time,
      hall: halls[index],
      price: prices[index]
    }));
  }

  // Pomocna metoda za dobijanje sutrasnjeg datuma
  private getTomorrowDate(): string {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0]; // Format: YYYY-MM-DD
  }

  // Azurirana metoda za rezervaciju projekcije koja koristi CartService
  reserveProjection(projection: ProjectionModel): void {
    if (!UserService.isLoggedIn()) {
      alert('Morate biti ulogovani da biste rezervisali projekciju!');
      this.router.navigate(['/login']);
      return;
    }

    if (!this.movie) {
      alert('Greška pri učitavanju filma!');
      return;
    }

    // Proveravamo da li vec postoji rezervacija za ovaj film
    if (CartService.hasReservation(this.movieId)) {
      alert('Već imate rezervisanu projekciju za ovaj film!');
      return;
    }

    // Dodajemo rezervaciju u korpu
    const success = CartService.addToCart(
      this.movieId,
      this.movie.title,
      this.movie.duration,
      projection.date,
      projection.time,
      projection.price
    );

    if (success) {
      alert(`Uspešno rezervisana projekcija filma "${this.movie.title}" za ${projection.time} u ${projection.hall}!`);
      console.log('Rezervisana projekcija:', projection);
    } else {
      alert('Greška pri rezervaciji projekcije!');
    }
  }

  // Proverava da li je projekcija vec rezervisana
  isProjectionReserved(): boolean {
    return CartService.hasReservation(this.movieId);
  }

  // Pomocna metoda za formatiranje liste glumaca
  getActorsString(): string {
    if (!this.movie?.actors) return '';
    return this.movie.actors.map(actor => actor.name).join(', ');
  }

  // Pomocna metoda za formatiranje liste rezisera
  getDirectorsString(): string {
    if (!this.movie?.directors) return '';
    return this.movie.directors.map(director => director.name).join(', ');
  }
}