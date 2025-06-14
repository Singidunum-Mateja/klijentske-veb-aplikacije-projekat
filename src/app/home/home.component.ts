import {
  Component,
  OnInit
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

// Angular Material
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule }     from '@angular/material/input';
import { MatSelectModule }    from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { MatCardModule }      from '@angular/material/card';
import { MatButtonModule }    from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

import { RouterLink } from '@angular/router';

import { MovieService } from '../../services/movie.service';
import { MovieModel }   from '../../models/movie.model';
import { GenreModel }   from '../../models/genre.model';
import { ActorModel }   from '../../models/actor.model';
import { DirectorModel } from '../../models/director.model';
import { LoadingComponent } from '../loading/loading.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSliderModule,
    MatCardModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatDatepickerModule,
    MatNativeDateModule,

    LoadingComponent
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})

export class HomeComponent implements OnInit {
  movies: MovieModel[] = [];
  filteredMovies: MovieModel[] = [];
  genres: GenreModel[] = [];
  actors: ActorModel[] = [];
  directors: DirectorModel[] = [];

  searchTerm: string = '';
  selectedGenres: number[] = [];
  selectedActors: number[] = [];
  selectedDirectors: number[] = [];
  maxDuration: number = 300;
  
  // Varijable za datum filtere
  startDate: Date | null = null;  // Pocetni datum filtera
  endDate: Date | null = null;    // Krajnji datum filtera

  isLoading: boolean = false;

  constructor(private movieService: MovieService) {}

  ngOnInit(): void {
    this.loadMovies();
  }

  async loadMovies(): Promise<void> {
    this.isLoading = true;
    try {
      const all = await this.movieService.getMovies();
      this.movies = all.slice(0, 20);        // Uzmi prvih 20 filmova
      this.filteredMovies = [...this.movies];
      
      // Kreiranje jedinstvenih lista za filtere
      this.extractFiltersFromMovies();
    } catch (error) {
      console.error('Greška pri učitavanju filmova:', error);
    } finally {
      this.isLoading = false;
    }
  }

  // logika kreiranja filtera
  private extractFiltersFromMovies(): void {
    // Kreiranje mapa za jedinstvene vrednosti
    const genreMap = new Map<number, string>();
    const actorMap = new Map<number, string>();
    const directorMap = new Map<number, string>();

    // Prolazak kroz sve filmove i dodavanje jedinstvenih vrednosti
    this.movies.forEach(movie => {
      // Dodavanje svih zanrova
      movie.genres.forEach(genre => {
        genreMap.set(genre.id, genre.name);
      });
      
      // Dodavanje svih glumaca
      movie.actors.forEach(actor => {
        actorMap.set(actor.id, actor.name);
      });
      
      // Dodavanje svih rezisera
      movie.directors.forEach(director => {
        directorMap.set(director.id, director.name);
      });
    });

    // Kreiranje finalnih lista
    this.genres = Array.from(genreMap.entries()).map(([id, name]) => ({ id, name }));
    this.actors = Array.from(actorMap.entries()).map(([id, name]) => ({ id, name }));
    this.directors = Array.from(directorMap.entries()).map(([id, name]) => ({ id, name }));
  }

  applyFilters(): void {
    this.filteredMovies = this.movies.filter(movie => {
      // Filter po nazivu filma
      const matchesTitle = this.searchTerm.length === 0 || 
        movie.title.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      // Filter po zanrovima - film mora imati bar jedan od izabranih zanrova
      const matchesGenre = this.selectedGenres.length === 0 ||
        movie.genres.some(genre => this.selectedGenres.includes(genre.id));
      
      // Filter po glumcima - film mora imati bar jednog od izabranih glumaca
      const matchesActor = this.selectedActors.length === 0 ||
        movie.actors.some(actor => this.selectedActors.includes(actor.id));
      
      // Filter po reziserima - film mora imati bar jednog od izabranih rezisera
      const matchesDirector = this.selectedDirectors.length === 0 ||
        movie.directors.some(director => this.selectedDirectors.includes(director.id));
      
      // Filter po trajanju - film ne sme biti duzi od maksimalne vrednosti
      const matchesDuration = movie.duration <= this.maxDuration;

      // Filter po datumu izdavanja filma
      // Konvertujemo releaseDate string u Date objekat za poredjenje
      const movieDate = new Date(movie.releaseDate);
      
      // Provera da li je datum filma u opsegu izmedju startDate i endDate
      const matchesDateRange = this.checkDateRange(movieDate);

      // Film mora zadovoljiti uslove
      return matchesTitle && matchesGenre && matchesActor && matchesDirector && matchesDuration && matchesDateRange;
    });
  }

  // Privatna metoda za proveru da li datum filma odgovara filterima
  private checkDateRange(movieDate: Date): boolean {
    // Ako nijedan datum nije postavljen, prihvati sve filmove
    if (!this.startDate && !this.endDate) {
      return true;
    }
    
    // Ako je postavljen samo pocetni datum, prihvati filmove od tog datuma nadalje
    if (this.startDate && !this.endDate) {
      return movieDate >= this.startDate;
    }
    
    // Ako je postavljen samo krajnji datum, prihvati filmove do tog datuma
    if (!this.startDate && this.endDate) {
      return movieDate <= this.endDate;
    }
    
    // Ako su oba datuma postavljena, prihvati filmove u tom opsegu
    if (this.startDate && this.endDate) {
      return movieDate >= this.startDate && movieDate <= this.endDate;
    }
    
    return true;
  }

  // Metoda za handleovanje slider promene
  onSliderChange(event: any): void {
    this.maxDuration = event.target.value;
    this.applyFilters();
  }

  // resetovanje svih filtera na pocetne vrednosti
  resetFilters(): void {
    // Resetujemo sve filter varijable na pocetne vrednosti
    this.searchTerm = '';
    this.selectedGenres = [];
    this.selectedActors = [];
    this.selectedDirectors = [];
    this.maxDuration = 300;
    this.startDate = null;
    this.endDate = null;
    
    // Ponovno primenjujemo filtere
    this.applyFilters();
  }
}