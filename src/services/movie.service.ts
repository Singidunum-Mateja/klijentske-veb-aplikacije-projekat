import { Injectable } from '@angular/core';
import axios from 'axios';
import { MovieModel } from '../models/movie.model';

interface RawMovie {
  movieId: number;
  title: string;
  description: string; 
  shortDescription: string; 
  startDate: string;
  runTime: number;
  poster: string;
  movieGenres: { genre: { genreId: number; name: string } }[];
  movieActors: { actor: { actorId: number; name: string } }[];
  director: { directorId: number; name: string };
}

@Injectable({
  providedIn: 'root'
})
export class MovieService {
  private apiUrl = 'https://movie.pequla.com/api/movie';

  async getMovies(): Promise<MovieModel[]> {
    try {
      const response = await axios.get<RawMovie[]>(this.apiUrl);
      // Mapiranje sirovih podataka u nas MovieModel format
      return response.data.map(m => ({
        id: m.movieId,
        title: m.title,
        description: m.description || 'Opis filma trenutno nije dostupan.', // Koristimo pravi opis iz API-ja
        shortDescription: m.shortDescription || 'Kratki opis filma trenutno nije dostupan.',
        releaseDate: m.startDate,
        duration: m.runTime,
        imageUrl: m.poster,
        // Mapiranje zanrova u nas GenreModel format
        genres: m.movieGenres.map(mg => ({
          id: mg.genre.genreId,
          name: mg.genre.name
        })),
        // Mapiranje glumaca u nas ActorModel format
        actors: m.movieActors.map(ma => ({
          id: ma.actor.actorId,
          name: ma.actor.name
        })),
        // API daje samo jednog rezisera, pa ga omatamo u niz
        directors: [{
          id: m.director.directorId,
          name: m.director.name
        }]
      }));
    } catch (error) {
      console.error('Greška pri učitavanju filmova:', error);
      return [];
    }
  }
}