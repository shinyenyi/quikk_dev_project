import { Injectable } from '@angular/core';
import { Auth, authState, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from '@angular/fire/auth';
import { from } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Database, set, ref } from '@angular/fire/database';
import { HotToastService } from '@ngneat/hot-toast';

@Injectable({
  providedIn: 'root'
})
export class LoginAndRegistrationService {

  currentUser$ = authState(this.auth);

  constructor(private auth: Auth,
    private database: Database,
    private toast: HotToastService,
  ) { }

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

  createUserAccount(username: string, signupEmail: string) {
    let currentUser = this.auth.currentUser;
    set(ref(this.database, 'users/' + currentUser?.uid), {
      userName: username,
      userEmail: signupEmail,
      amount: 0
    }).then(() => {
      this.toast.show('Account Created Successfully', { duration: 3000 })
    }).catch((error) => {
      this.toast.show(error, { duration: 5000 })
    });
  }
}
