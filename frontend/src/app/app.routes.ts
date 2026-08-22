import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { PublicLayoutComponent } from './shared/components/public-layout/public-layout.component';
import { AdminLayoutComponent } from './shared/components/admin-layout/admin-layout.component';

export const routes: Routes = [
  // ── Rutas públicas ──────────────────────────────────────────────
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/cliente/home.component').then((m) => m.HomeComponent),
      },
      {
        path: 'menu',
        loadComponent: () =>
          import('./features/cliente/menu/menu.component').then((m) => m.MenuComponent),
      },
      {
        path: 'carrito',
        loadComponent: () =>
          import('./features/cliente/carrito/carrito.component').then((m) => m.CarritoComponent),
      },
      {
        path: 'pedido/:id',
        loadComponent: () =>
          import('./features/cliente/pedido-estado/pedido-estado.component').then((m) => m.PedidoEstadoComponent),
      },
      {
        path: 'nosotros',
        loadComponent: () =>
          import('./features/cliente/nosotros/nosotros.component').then((m) => m.NosotrosComponent),
      },
      {
        path: 'contacto',
        loadComponent: () =>
          import('./features/cliente/contacto/contacto.component').then((m) => m.ContactoComponent),
      },
    ],
  },

  // ── Auth ─────────────────────────────────────────────────────────
  {
    path: 'login',
    loadComponent: () =>
      import('./auth/login/login.component').then((m) => m.LoginComponent),
  },

  // ── Admin ────────────────────────────────────────────────────────
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN'] },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/admin/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'pedidos',
        loadComponent: () =>
          import('./features/admin/pedidos/pedidos.component').then((m) => m.PedidosComponent),
      },
      {
        path: 'productos',
        loadComponent: () =>
          import('./features/admin/productos/productos.component').then((m) => m.ProductosComponent),
      },
      {
        path: 'clientes',
        loadComponent: () =>
          import('./features/admin/clientes/clientes.component').then((m) => m.ClientesAdminComponent),
      },
      {
        path: 'gastos',
        loadComponent: () =>
          import('./features/admin/gastos/gastos.component').then((m) => m.GastosComponent),
      },
      {
        path: 'caja',
        loadComponent: () =>
          import('./features/admin/caja/caja.component').then((m) => m.CajaComponent),
      },
      {
        path: 'reportes',
        loadComponent: () =>
          import('./features/admin/reportes/reportes.component').then((m) => m.ReportesComponent),
      },
    ],
  },

  // ── Cocina ───────────────────────────────────────────────────────
  {
    path: 'cocina',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['COCINA', 'ADMIN'] },
    loadComponent: () =>
      import('./features/cocina/cocina.component').then((m) => m.CocinaComponent),
  },

  // ── Mozo ─────────────────────────────────────────────────────────
  {
    path: 'mozo',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['MOZO', 'ADMIN'] },
    children: [
      { path: '', redirectTo: 'mesas', pathMatch: 'full' },
      {
        path: 'mesas',
        loadComponent: () =>
          import('./features/mozo/mesas/mesas.component').then((m) => m.MesasComponent),
      },
    ],
  },

  // ── Fallback ─────────────────────────────────────────────────────
  { path: '**', redirectTo: '' },
];
