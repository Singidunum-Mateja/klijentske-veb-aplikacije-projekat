import { GenreModel } from './genre.model';
import { ActorModel } from './actor.model';
import { DirectorModel } from './director.model';

export interface MovieModel {
  id: number;
  title: string;
  releaseDate: string;
  duration: number;
  imageUrl: string;
  description: string; 
  shortDescription: string; 
  genres: GenreModel[];
  actors: ActorModel[];
  directors: DirectorModel[];
}

