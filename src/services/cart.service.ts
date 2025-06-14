import { Injectable } from '@angular/core';
import { CartItemModel } from '../models/cart.model';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  // Dobijanje svih stavki iz korpe za trenutno ulogovanog korisnika
  static getCartItems(): CartItemModel[] {
    const activeUser = UserService.getActiveUser();
    if (!activeUser) {
      return [];
    }

    // Koristimo email korisnika kao kljuc za korpu
    const cartKey = `cart_${activeUser.email}`;
    const cartData = localStorage.getItem(cartKey);
    return cartData ? JSON.parse(cartData) : [];
  }

  // Dodavanje stavke u korpu
  static addToCart(movieId: number, movieTitle: string, movieDuration: number, 
                   projectionDate: string, projectionTime: string, price: number): boolean {
    const activeUser = UserService.getActiveUser();
    if (!activeUser) {
      return false;
    }

    const cartItems = this.getCartItems();
    
    // Proveravamo da li vec postoji rezervacija za isti film
    const existingReservation = cartItems.find(item => 
      item.movieId === movieId && item.status === 'rezervisano'
    );

    if (existingReservation) {
      // Vec postoji rezervacija za ovaj film
      return false;
    }

    // Dodajemo novu stavku u korpu
    const newItem: CartItemModel = {
      movieId,
      movieTitle,
      movieDuration,
      projectionDate,
      projectionTime,
      price,
      status: 'rezervisano'
    };

    cartItems.push(newItem);
    
    // Čuvamo azuriranu korpu u localStorage
    const cartKey = `cart_${activeUser.email}`;
    localStorage.setItem(cartKey, JSON.stringify(cartItems));
    
    return true;
  }

  // Brisanje stavke iz korpe
  static removeFromCart(movieId: number): void {
    const activeUser = UserService.getActiveUser();
    if (!activeUser) {
      return;
    }

    let cartItems = this.getCartItems();
    
    // Filtriramo stavke - uklanjamo onu sa odredjenim movieId
    cartItems = cartItems.filter(item => item.movieId !== movieId);
    
    // cuvamo azuriranu korpu
    const cartKey = `cart_${activeUser.email}`;
    localStorage.setItem(cartKey, JSON.stringify(cartItems));
  }

  // Racunanje ukupne cene
  static getTotalPrice(): number {
    const cartItems = this.getCartItems();
    return cartItems
      .filter(item => item.status === 'rezervisano')
      .reduce((total, item) => total + item.price, 0);
  }

  // Proverava da li film vec ima rezervaciju
  static hasReservation(movieId: number): boolean {
    const cartItems = this.getCartItems();
    return cartItems.some(item => 
      item.movieId === movieId && item.status === 'rezervisano'
    );
  }

  // Azuriranje statusa projekcije
static updateStatus(
  movieId: number,
  projectionDate: string,
  projectionTime: string,
  newStatus: 'rezervisano' | 'gledano' | 'otkazano'
): void {
  const activeUser = UserService.getActiveUser();
  if (!activeUser) return;

  const cartKey = `cart_${activeUser.email}`;
  const cartItems = this.getCartItems();

  // Nađemo tacnu stavku po tri polja
  const item = cartItems.find(ci =>
    ci.movieId === movieId &&
    ci.projectionDate === projectionDate &&
    ci.projectionTime === projectionTime
  );

  if (item) {
    item.status = newStatus;
    localStorage.setItem(cartKey, JSON.stringify(cartItems));
  }
}

}