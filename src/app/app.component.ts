import { AutoCompleteComponent } from './auto-complete/auto-complete.component';
import { Email } from './email.interface';
import { EmailService } from './email-service.service';
import { Component, ViewChild } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  @ViewChild('to')
  private toAutoComplete: AutoCompleteComponent;

  @ViewChild('cc')
  private ccAutoComplete: AutoCompleteComponent;

  title: string = 'email-autocomplete';
  private subject: string;
  private body: string;
  private showSuccess: boolean;
  private showError: boolean;
  private errorMessages: string[];

  constructor(private emailService: EmailService) {
    this.body = '';
    this.subject = ''; 
    this.showSuccess = this.showError = false;
    this.errorMessages = [];
  }

  validateInputs(){
    let hasError = false;
    let errorMessages = [];
    
    // TO field
    let toEmails = this.toAutoComplete.getEmailsArray();
    if (toEmails.length === 0) {
      hasError = true;
      errorMessages.push('To Email is required.');
    } else if (!this.validateEmail(toEmails[0])){
      hasError = true;
      errorMessages.push('To email is not a valid email.');
    }
    if (toEmails.length > 1) {
      hasError = true;
      errorMessages.push('Can only have 1 To email address, please delete additional addresses.');
    }
    
    // CC Emails
    let ccEmails = this.ccAutoComplete.getEmailsArray();
    ccEmails.forEach((element, i) => {
      if (!this.validateEmail(element)){
        hasError = true;
        errorMessages.push(`CC email #${i + 1} is not a valid email.`);
      }
    });

    if (this.subject.trim() === ''){
      hasError = true;
      errorMessages.push('Subject is required.');
    }

    if (this.body.trim() === ''){
      hasError = true;
      errorMessages.push('Body is required.');
    }

    this.errorMessages = errorMessages;
    this.showError = hasError;

    return !hasError;
  }

  // shamelessly taken from stack overflow
  validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }

  sendEmail() {
    this.showError = false;
    this.showSuccess = false;
    let email: Email = {
      to: this.toAutoComplete.getEmailsArray()[0],
      cc: this.ccAutoComplete.getEmailsArray(),
      body: this.body.trim(),
      subject: this.subject.trim()
    };

    if (!this.validateInputs()){
      return;
    }

    this.emailService.submitEmail(email).subscribe((response) => {
      this.showSuccess = true;
      this.toAutoComplete.emails = this.ccAutoComplete.emails = this.body = this.subject = ''; 

      setTimeout(() => {
        this.showSuccess = false;
      }, 3000)
    }, (error) => {
      this.showError = true;
      let errorMessage = error.error.message; 
      // dig out the actual error message for 400's
      this.errorMessages = error.error.statusCode === 400 ? 
        [errorMessage.substring(errorMessage.indexOf('[') + 1, errorMessage.indexOf(']'))] 
        : [errorMessage];
    });
  }
}