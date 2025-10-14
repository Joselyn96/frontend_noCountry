// import { bootstrapApplication } from '@angular/platform-browser';
// import { appConfig } from './app/app.config';
// import { AppComponent } from './app/app.component';
// import { provideRouter, withHashLocation } from '@angular/router';
// import { routes } from './app/app.routes';

// bootstrapApplication(AppComponent, appConfig)
//   .catch((err) => console.error(err));
// // bootstrapApplication(AppComponent, {
// //   providers: [
// //     provideRouter(routes, withHashLocation()),
// //   ],
// // })
// // .catch(err => console.error(err));

import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter, withHashLocation } from '@angular/router';
import { routes } from './app/app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { interceptorInterceptor } from './app/core/auth/interceptor/interceptor.interceptor';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([interceptorInterceptor]) // <-- aquí agregamos el interceptor
    )
  ]
})
.catch(err => console.error(err));
