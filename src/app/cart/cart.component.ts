import { Component, OnInit } from '@angular/core';
import { Router, RouterLink} from '@angular/router';
import { CommonModule } from '@angular/common';

// Angular Material
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

import { CartService } from '../../services/cart.service';
import { CartItemModel } from '../../models/cart.model';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatCardModule,
    RouterLink
  ],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
  cartItems: CartItemModel[] = [];
  totalPrice: number = 0;
  displayedColumns: string[] = ['title', 'duration', 'projection', 'price', 'actions'];

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Proveravamo da li je korisnik ulogovan
    if (!UserService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    this.loadCartItems();
  }

  // Ucitavanje stavki iz korpe
  loadCartItems(): void {
    this.cartItems = CartService.getCartItems()
      .filter(item => item.status === 'rezervisano'); // Prikazujemo samo rezervisane
    this.calculateTotalPrice();
  }

  // Racunanje ukupne cene
  calculateTotalPrice(): void {
    this.totalPrice = CartService.getTotalPrice();
  }

  // Formatiranje datuma i vremena projekcije
  formatProjectionDateTime(date: string, time: string): string {
    // Pretvaramo datum iz YYYY-MM-DD formata u DD.MM.YYYY
    const dateObj = new Date(date);
    const formattedDate = dateObj.toLocaleDateString('sr-RS', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    
    return `${formattedDate} ${time}`;
  }

  // Metoda za dugme "Plati" - 
  payForReservation(item: CartItemModel): void {
  CartService.updateStatus(
    item.movieId,
    item.projectionDate, 
    item.projectionTime, 
    'gledano'                 
  );
  this.loadCartItems();
}

  // Metoda za dugme "Otkazi" 
  cancelReservation(item: CartItemModel): void {
  CartService.updateStatus(
    item.movieId,
    item.projectionDate,  
    item.projectionTime, 
    'otkazano'
  );
  this.loadCartItems();
}
}