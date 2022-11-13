import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class MyAccountService {

  FIREBASE_USERS_TABLE_API_URL = 'https://quikk-f65e1-default-rtdb.europe-west1.firebasedatabase.app/users.json';

  constructor(private http: HttpClient) { }

  searchForEmail(email: string) {
    return this.http.get(this.FIREBASE_USERS_TABLE_API_URL,
      {
        params: new HttpParams()
          .set('orderBy', '"userEmail"')
          .set('equalTo', `"${email}"`)
      });
  }

}
