import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {
  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('sr-RS');
  }

}
