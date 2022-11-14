
export class User {
  constructor(
    public phoneNumber: number,
    public amount: number,
    public userEmail: string
  ) { }
}

export class Transaction {
  constructor(
    public amount: number,
    public recievedFrom: string,
    public sendTo: string,
    public time: string,
  ) { }
}