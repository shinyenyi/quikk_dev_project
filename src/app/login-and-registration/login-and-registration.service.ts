import { Injectable } from '@angular/core';
import { Auth, authState, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from '@angular/fire/auth';
import { from } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class LoginAndRegistrationService {

  currentUser$ = authState(this.auth);

  constructor(private auth: Auth) { }

  login(email: string, password: string) {
    return from(signInWithEmailAndPassword(this.auth, email, password));
  }

  signup(username: string, email: string, password: string) {
    return from(createUserWithEmailAndPassword(this.auth, email, password)).pipe(
      switchMap(({ user }) => updateProfile(user, { displayName: username }))
    );
  }

  logout() {
    return from(this.auth.signOut());
  }
}
