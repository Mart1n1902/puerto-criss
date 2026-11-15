import { ApplicationConfig } from '@angular/core';
import { provideRouter, withNavigationErrorHandler } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      routes,
      withNavigationErrorHandler((error) => {
        const msg = String((error as any)?.error?.message || (error as any)?.message || '');
        if (
          msg.includes('Failed to fetch dynamically imported module') ||
          msg.includes('Importing a module script failed') ||
          msg.includes('Loading chunk')
        ) {
          const reloadKey = 'puerto_criss_chunk_reload';
          if (!sessionStorage.getItem(reloadKey)) {
            sessionStorage.setItem(reloadKey, '1');
            window.location.reload();
          }
        }
      })
    ),
    provideHttpClient(withInterceptors([authInterceptor])),
  ],
};
