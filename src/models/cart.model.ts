export interface CartItemModel {
  movieId: number;
  movieTitle: string;
  movieDuration: number;
  projectionDate: string;
  projectionTime: string;
  price: number;
  status: 'rezervisano' | 'gledano' | 'otkazano';
}