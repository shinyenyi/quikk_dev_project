import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { LoginAndRegistrationService } from '../login-and-registration/login-and-registration.service';
import { Auth } from '@angular/fire/auth';
import { MyAccountService } from './my-account.service';
import { HotToastService } from '@ngneat/hot-toast';
import { User } from './my-account-request-response';
import { formatDate } from '@angular/common';
import { Transaction } from './my-account-request-response';

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
  sentTransactionsArray: Transaction[] = [];
  sentTransactions: any = {};
  recievedTransactionsArray: Transaction[] = [];
  recievedTransactions: any = {};

  constructor(private loginAndRegistrationService: LoginAndRegistrationService,
    private auth: Auth,
    private myAccountService: MyAccountService,
    private toast: HotToastService
  ) { }

  async ngOnInit(): Promise<void> {
    this.user = await this.myAccountService.getUser(this.currentUserUid);
    this.balance = this.user?.amount === undefined ? 0 : this.user.amount;
    this.getTransactions();
  }

  async getTransactions() {
    this.sentTransactionsArray = [];
    this.recievedTransactions = {};
    this.sentTransactions = {}
    this.recievedTransactionsArray = [];
    this.sentTransactions = await this.myAccountService.getUserTransactions(this.currentUserEmail === null ? '' : this.currentUserEmail, 'recievedFrom');
    this.recievedTransactions = await this.myAccountService.getUserTransactions(this.currentUserEmail === null ? '' : this.currentUserEmail, 'sendTo');
    this.createTransactionsArray(this.sentTransactions, this.sentTransactionsArray);
    this.createTransactionsArray(this.recievedTransactions, this.recievedTransactionsArray)
  }

  createTransactionsArray(obj: any, arr: Transaction[]) {
    Object.keys(obj).forEach((key) => {
      return arr.push(obj[key]);
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
          if (await this.myAccountService.reauthenticateUser(password)) {
            this.sendMoney(userId, sendToAmount);
          } else {
            this.toast.show('incorrect password', { duration: 5000 })
          }
        }
      }
    );
    this.getTransactions();
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
      this.toast.show('transaction cancelled', { duration: 5000 });
      return;
    }

    this.balance = (this.balance + parseInt(depositAmount));

    this.myAccountService.updateUserAmount(this.currentUserUid, this.balance);

    let time = this.getCurrentTime();
    this.myAccountService.saveUserTransaction(
      this.currentUserEmail === null ? '' : this.currentUserEmail,
      'MPESA',
      depositAmount,
      time
    );
    this.getTransactions();
    this.resetForm(this.depositMoneyForm);
  }

  async sendMoney(userId: string, sendToAmount: any) {
    this.balance = this.balance - parseInt(sendToAmount);
    this.myAccountService.updateUserAmount(this.currentUserUid, this.balance);

    this.user = await this.myAccountService.getUser(userId);
    let recipientAmount = parseInt(this.user?.amount + sendToAmount);
    this.myAccountService.updateUserAmount(userId, recipientAmount);

    let time = this.getCurrentTime();
    this.myAccountService.saveUserTransaction(
      this.user?.userEmail === undefined ? '' : this.user.userEmail,
      this.currentUserEmail === null ? '' : this.currentUserEmail,
      sendToAmount,
      time
    );
  }

  getCurrentTime() {
    let date = new Date();
    let time = formatDate(date, 'dd-MM-yyyy, hh:mm:ss a', 'en-US', '+0300');
    return time;
  }

}
