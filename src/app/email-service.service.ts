import { Email } from './email.interface';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class EmailService {
  apiAddress: string = 'https://trunkclub-ui-takehome.now.sh/';
  searchAction: string = 'search';
  submitAction: string = 'submit';
  constructor(private http: HttpClient) { }

  public getEmailSuggestions(searchStr: string){
    return this.http.get(this.apiAddress + this.searchAction + '/' + encodeURIComponent(searchStr))
  }

  public submitEmail(email: Email){
    return this.http.post(this.apiAddress + this.submitAction, email)
  }

}
