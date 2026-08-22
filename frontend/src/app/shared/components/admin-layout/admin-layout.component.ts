import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent],
  template: `
    <div class="flex h-screen overflow-hidden bg-slate-100">
      <app-sidebar />
      <main class="flex-1 p-4 lg:p-6 overflow-y-auto pt-16 lg:pt-6">
        <router-outlet />
      </main>
    </div>
  `,
})
export class AdminLayoutComponent {}
