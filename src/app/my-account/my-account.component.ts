import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { LoginAndRegistrationService } from '../login-and-registration/login-and-registration.service';
import { Auth } from '@angular/fire/auth';
import { MyAccountService } from './my-account.service';
import { Database, ref, update, get, onValue } from '@angular/fire/database';
import { HotToastService } from '@ngneat/hot-toast';
import { User } from './my-account-request-response';
import { reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";

@Component({
  selector: 'app-my-account',
  templateUrl: './my-account.component.html',
  styleUrls: ['./my-account.component.css']
})
export class MyAccountComponent implements OnInit {

  sendMoneyForm = new FormGroup({
    sendToEmail: new FormControl('', [Validators.required, Validators.email]),
    sendToAmount: new FormControl(null, [Validators.required, Validators.min(50)]),
    password: new FormControl('', [Validators.required])
  });

  depositMoneyForm = new FormGroup({
    phoneNumber: new FormControl(null, [Validators.required]),
    depositAmount: new FormControl(null, [Validators.required, Validators.min(50)]),
  });

  user$ = this.loginAndRegistrationService.currentUser$;
  balance = 0;
  hide = true;
  currentUser = this.auth.currentUser;
  currentUserUid = this.currentUser?.uid === undefined ? '' : this.currentUser.uid;
  currentUserEmail = this.currentUser?.email === undefined ? '' : this.currentUser.email;
  currentAmount = 0;
  user: User | undefined;

  constructor(private loginAndRegistrationService: LoginAndRegistrationService,
    private auth: Auth,
    private myAccountService: MyAccountService,
    private database: Database,
    private toast: HotToastService
  ) { }

  async ngOnInit(): Promise<void> {
    this.user = await this.getUser(this.currentUserUid);
    this.balance = this.user?.amount === undefined ? 0 : this.user.amount;
    this.updateUserBalance();
  }


  updateUserBalance() {
    const amountRef = ref(this.database, 'users/' + this.currentUserUid + '/amount');
    onValue(amountRef, (snapshot) => {
      const data = snapshot.val();
      this.balance = data;
    });
  }

  get phoneNumber() {
    return this.depositMoneyForm.get('phoneNumber');
  }

  get depositAmount() {
    return this.depositMoneyForm.get('depositAmount');
  }

  get sendToEmail() {
    return this.sendMoneyForm.get('sendToEmail');
  }

  get sendToAmount() {
    return this.sendMoneyForm.get('sendToAmount');
  }

  get password() {
    return this.sendMoneyForm.get('password');
  }

  submitSendMoneyForm() {
    const { sendToEmail, sendToAmount, password } = this.sendMoneyForm.value;

    if (!this.sendMoneyForm.valid || !sendToEmail || !sendToAmount || !password) {
      this.toast.show('invalid input', { duration: 5000 })
      return;
    }

    if (!confirm("send Ksh " + sendToAmount + " to " + sendToEmail)) {
      this.resetForm(this.sendMoneyForm);
      this.toast.show('transaction cancelled', { duration: 5000 })
      return;
    }

    let initialDAta: {};
    let userId: string;

    this.myAccountService.searchForEmail(sendToEmail).subscribe(
      (data) => {
        initialDAta = data;
        userId = Object.keys(initialDAta)[0];
      },
      (error) => { this.toast.show(error, { duration: 5000 }) },
      async () => {
        if (Object.keys(initialDAta).length > 0 && parseInt(sendToAmount) < this.balance && sendToEmail !== this.currentUserEmail) {
          if (await this.reauthenticateUser(password)) {
            this.sendMoney(userId, sendToAmount);
          } else {
            this.toast.show('incorrect password', { duration: 5000 })
          }
        }
      }
    );

    this.resetForm(this.sendMoneyForm);
  }

  resetForm(form: FormGroup) {
    form.reset();
    Object.keys(form.controls).forEach(key => {
      form.get(key)?.setErrors(null)
    });
  }

  submitDepositMoneyForm() {
    const { phoneNumber, depositAmount } = this.depositMoneyForm.value;

    if (!this.depositMoneyForm.valid || !phoneNumber || !depositAmount) {
      return;
    }

    if (!confirm("deosit Ksh " + depositAmount)) {
      this.resetForm(this.depositMoneyForm);
      this.toast.show('transaction cancelled', { duration: 5000 })
      return;
    }

    this.balance = (this.balance + parseInt(depositAmount));

    this.updateUserAmount(this.currentUserUid, this.balance);

    this.resetForm(this.depositMoneyForm);
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

  async sendMoney(userId: string, sendToAmount: any) {
    this.balance = this.balance - parseInt(sendToAmount);
    this.updateUserAmount(this.currentUserUid, this.balance);

    this.user = await this.getUser(userId);
    let recipientAmount = parseInt(this.user?.amount + sendToAmount);
    this.updateUserAmount(userId, recipientAmount);
  }

  async getUser(id: string) {
    const snapshot = await get(ref(this.database, 'users/' + id));
    this.user = snapshot.val();
    return this.user;
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

}
