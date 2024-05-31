import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideToastr } from 'ngx-toastr';
import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { provideDaterangepickerLocale } from "ngx-daterangepicker-bootstrap";


export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    provideAnimations(),
    provideToastr({
      closeButton: true,
      positionClass: 'toast-top-right',
      progressBar: true,
      progressAnimation: 'decreasing',
      preventDuplicates: false,
      timeOut: 10000,
    }), 
    provideDaterangepickerLocale({
      separator: ' - ',
      applyLabel: 'Okay',
    })
  ],
};
