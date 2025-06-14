import { UserModel } from "../models/user.model"

// Interface za ocene filmova
export interface MovieRating {
    movieId: number;
    movieTitle: string;
    projectionDate: string;
    projectionTime: string;
    rating: number; // 1-5 zvezdica
    userEmail: string;
}

export class UserService {

    // Dobijanje svih korisnika iz localStorage-a
    static retrieveUsers(): UserModel[] {
        if (!localStorage.getItem('users')) {
            // Kreiranje default korisnika za testiranje
            const arr: UserModel[] = [
                {
                    email: 'user@example.com',
                    firstName: 'Marko',
                    lastName: 'Petrović',
                    phone: '+381641234567',
                    address: 'Knez Mihailova 15, Beograd',
                    favoriteGenres: ['Action', 'Drama'],
                    password: 'user123'
                }
            ]

            localStorage.setItem('users', JSON.stringify(arr))
        }

        return JSON.parse(localStorage.getItem('users')!)
    }

    // Kreiranje novog korisnika
    static createUser(model: UserModel): boolean {
        const users = this.retrieveUsers()

        // Provera da li vec postoji korisnik sa istim email-om
        for (let u of users) {
            if (u.email === model.email)
                return false
        }

        users.push(model)
        localStorage.setItem('users', JSON.stringify(users))
        return true
    }

    // Azuriranje podataka korisnika
    static updateUser(model: UserModel): void {
        const users = this.retrieveUsers()
        for (let u of users) {
            if (u.email === model.email) {
                u.firstName = model.firstName
                u.lastName = model.lastName
                u.address = model.address
                u.phone = model.phone
                u.favoriteGenres = model.favoriteGenres
            }
        }

        localStorage.setItem('users', JSON.stringify(users))
    }

    // Prijavljivanje korisnika
    static login(email: string, password: string): boolean {
        for (let user of this.retrieveUsers()) {
            if (user.email === email && user.password === password) {
                localStorage.setItem('active', user.email)
                return true
            }
        }

        return false
    }

    // Dobijanje trenutno ulogovanog korisnika
    static getActiveUser(): UserModel | null {
        if (!localStorage.getItem('active'))
            return null

        for (let user of this.retrieveUsers()) {
            if (user.email == localStorage.getItem('active')) {
                return user
            }
        }

        return null
    }

    // Odjavljuivanje korisnika
    static logout(): void {
        localStorage.removeItem('active')
    }

    // Promena lozinke
    static changePassword(oldPassword: string, newPassword: string): boolean {
        const activeUser = this.getActiveUser()
        if (!activeUser) return false

        // Proveravamo da li je stara lozinka tacna
        if (activeUser.password !== oldPassword) return false

        const arr = this.retrieveUsers()
        for (let user of arr) {
            if (user.email == activeUser.email) {
                user.password = newPassword
                localStorage.setItem('users', JSON.stringify(arr))
                return true
            }
        }

        return false
    }

    // Provera da li je korisnik ulogovan
    static isLoggedIn(): boolean {
        return this.getActiveUser() !== null
    }

    // Dobijanje svih ocena iz localStorage
    static getAllRatings(): MovieRating[] {
        const ratings = localStorage.getItem('movie_ratings')
        return ratings ? JSON.parse(ratings) : []
    }

    // cuvanje ocene filma
    static rateMovie(movieId: number, movieTitle: string, projectionDate: string, 
                    projectionTime: string, rating: number): boolean {
        const activeUser = this.getActiveUser()
        if (!activeUser) return false

        const allRatings = this.getAllRatings()
        
        // Proveravamo da li vec postoji ocena za ovu projekciju od ovog korisnika
        const existingIndex = allRatings.findIndex(r => 
            r.movieId === movieId && 
            r.projectionDate === projectionDate && 
            r.projectionTime === projectionTime && 
            r.userEmail === activeUser.email
        )

        const newRating: MovieRating = {
            movieId,
            movieTitle,
            projectionDate,
            projectionTime,
            rating,
            userEmail: activeUser.email
        }

        if (existingIndex >= 0) {
            // Azuriramo postojecu ocenu
            allRatings[existingIndex] = newRating
        } else {
            // Dodajemo novu ocenu
            allRatings.push(newRating)
        }

        localStorage.setItem('movie_ratings', JSON.stringify(allRatings))
        return true
    }

    // Dobijanje ocene za određenu projekciju od trenutnog korisnika
    static getUserRating(movieId: number, projectionDate: string, projectionTime: string): number {
        const activeUser = this.getActiveUser()
        if (!activeUser) return 0

        const allRatings = this.getAllRatings()
        const rating = allRatings.find(r => 
            r.movieId === movieId && 
            r.projectionDate === projectionDate && 
            r.projectionTime === projectionTime && 
            r.userEmail === activeUser.email
        )

        return rating ? rating.rating : 0
    }
}