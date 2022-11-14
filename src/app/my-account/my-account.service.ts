import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Database, ref, update, get, set, query, orderByChild, equalTo } from '@angular/fire/database';
import { Auth } from '@angular/fire/auth';
import { HotToastService } from '@ngneat/hot-toast';
import { User } from './my-account-request-response';
import { reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";

@Injectable({
  providedIn: 'root'
})

export class MyAccountService {
  currentUser = this.auth.currentUser;
  currentUserUid = this.currentUser?.uid === undefined ? '' : this.currentUser.uid;
  user: User | undefined;
  FIREBASE_USERS_TABLE_API_URL = 'https://quikk-f65e1-default-rtdb.europe-west1.firebasedatabase.app/users.json';

  constructor(private http: HttpClient,
    private database: Database,
    private auth: Auth,
    private toast: HotToastService
  ) { }

  searchForEmail(email: string) {
    return this.http.get(this.FIREBASE_USERS_TABLE_API_URL,
      {
        params: new HttpParams()
          .set('orderBy', '"userEmail"')
          .set('equalTo', `"${email}"`)
      });
  }

  updateUserAmount(id: string, amount: number) {
    update(ref(this.database, 'users/' + id), {
      amount: amount,
    }).then(() => {
      if (this.currentUser?.uid === id) {
        this.toast.show('New balance is Ksh ' + amount,
          {
            duration: 3000,
          });
      }
    }).catch((error) => {
      this.toast.show(error, { duration: 5000 })
    });
  }

  async getUser(id: string) {
    const snapshot = await get(ref(this.database, 'users/' + id));
    this.user = snapshot.val();
    return this.user;
  }

  async getUserTransactions(email: string, attribute: string) {
    const transactionsRef = query(ref(this.database, 'transactions'), orderByChild(attribute), equalTo(email))
    const snapshot = await get(transactionsRef);
    let transactions = snapshot.val();
    return transactions;
  }

  async reauthenticateUser(password: string) {
    let authenticated = false;
    if (this.currentUser) {
      const credential = EmailAuthProvider.credential(
        this.currentUser?.email === null ? '' : this.currentUser.email,
        password
      );
      await reauthenticateWithCredential(this.currentUser, credential).then(() => {
        // User re-authenticated.
        authenticated = true;
      }).catch((error) => {
        this.toast.show('incorect password!!' + error, { duration: 5000 })
      });
    }

    return authenticated;
  }

  saveUserTransaction(sendTo: string, recievedFrom: string, amount: number, time: string) {
    let randomId = Math.random().toString(36).substring(7, 13);
    set(ref(this.database, 'transactions/' + time + randomId), {
      recievedFrom: recievedFrom,
      sendTo: sendTo,
      amount: amount,
      time: time
    }).then(() => {
      this.toast.show('Transaction Saved Successfully', { duration: 3000 })
    }).catch((error) => {
      this.toast.show(error, { duration: 5000 })
    });
  }

}
