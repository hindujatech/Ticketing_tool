import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ServerErrorService } from '../services/server_error.service';

@Component({
    selector: 'error-page',
    templateUrl: 'error_page.component.html',
    styles: ['.page-error-wrapper{min-height:84.8vh}']
})

export class ErrorPageComponent implements OnInit, OnDestroy {
    private subscription: Subscription;
    error_code: any = 500;
    erroe_message: any = {
        404: { message1: 'You may have mistyped the address or the page may have moved.', message2: "Oops. The page you were looking for doesn't exist." },
        400: { message1: 'The server encountered an internal server error and was unable to complete your request.', message2: "Oops. Bad Request error." },
        505: { message1: 'We have been automatically alerted of the issue and will work to fix it asap.', message2: 'Oops. Something is broken.' },
        500: { message1: 'The server encountered an internal server error and was unable to complete your request.', message2: 'Oops. Internal server error.' },
        503: { message1: 'The server is unable to service your request due to maintenance downtime or capacity problems.', message2: 'Service Temporarily Unavailable.' }
    }

    constructor(private server_error_service: ServerErrorService) { }

    ngOnInit() {
        this.subscription = this.server_error_service.getMessage().subscribe(message => {
            this.error_code = message;
        });
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}