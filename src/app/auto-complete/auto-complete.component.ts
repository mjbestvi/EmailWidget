import { Component, OnInit, Input, ViewChild, ElementRef, ViewChildren, QueryList } from '@angular/core';
import { $ } from 'protractor';
import { EmailService } from '../email-service.service';
import { Suggestion } from '../suggestion.interface'
import { SearchResponse } from '../search-response.interface';
import { Observable, Subject } from 'rxjs';

@Component({
  selector: 'auto-complete',
  templateUrl: './auto-complete.component.html',
  styleUrls: ['./auto-complete.component.css'],
})
export class AutoCompleteComponent implements OnInit {
  @Input() name: string;
  @Input() displayName: string;
  @Input() multiSelect: boolean;
  
  // UI Elements for the search input box and the list of links
  @ViewChild('searchField')
  searchField: ElementRef;
  @ViewChildren('suggestionLink')
  suggestionLinks: QueryList<ElementRef>;

  // the string in the input box
  emails: string;
  // array of suggestions retrieved from the server
  suggestions: Suggestion[];
  
  // Aborted RXJS adoption
  // suggestions$: Observable<Suggestion[]>;
  // private emailText$ = new Subject<string>();

  constructor(private emailService: EmailService) { 
    this.emails = '';
    this.suggestions = [];
  }

  ngOnInit() { 
    // Aborted RXJS adoption
    // this.suggestions$ = this.emailText$.pipe(
    //   debounceTime(500),
    //   distinctUntilChanged(),
    //   switchMap(packageName =>
    //     this.searchService.search(packageName, this.withRefresh))
    // );
  }

  getEmailsArray(){
    return this.emails.split(',').map(email => { return email.trim() }).filter(email => { return email !== '' });
  }

  handleKeyInput(keyCode){
    if ((keyCode === 40) && this.suggestionLinks.length){
      this.suggestionLinks.first.nativeElement.focus();
    }
  }

  searchEmails(emails){
    // Aborted RXJS adoption
    //this.emailText$.next(emails);

    this.emails = emails;
    let emailArray: string[] = this.getEmailsArray();
    if (emailArray.length > 1 && !this.multiSelect){
      // don't allow further searching if it's single-select
      return;
    }

    if (emailArray[emailArray.length - 1] === ''){
      // don't search as they're starting a new search
      return;
    }

    this.emailService.getEmailSuggestions(emailArray[emailArray.length - 1])
      .subscribe((data: SearchResponse) => {
        // Just keep the first ten
        this.suggestions = data.users.slice(0, 10);
      });
  }

  suggestionKeyUp($event, suggestion: Suggestion, i: number) {
    $event.preventDefault();
    switch ($event.keyCode) {
      // enter
      case 13:
        this.addSuggestion(suggestion);
        break;
      // left and up
      case 37:
      case 38:
        if (i === 0){
          // jump focus to input
          this.searchField.nativeElement.focus();
        } else  {
          this.suggestionLinks.toArray()[i - 1].nativeElement.focus();
        }
        break;
      // down
      case 39:
      case 40: 
        if (i < this.suggestionLinks.toArray().length - 1){
          this.suggestionLinks.toArray()[i + 1].nativeElement.focus();
        }
        break;
    }


    
  }

  addSuggestion(suggestion: Suggestion) {
    let emailArray: string[] =  this.getEmailsArray();
    emailArray[emailArray.length - 1] = suggestion.email;
    this.emails = emailArray.join(', ') + (this.multiSelect ? ', ': '');
    this.suggestions = [];
    this.searchField.nativeElement.focus();
  }


}
