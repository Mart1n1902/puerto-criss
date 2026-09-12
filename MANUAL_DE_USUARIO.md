# 📖 MANUAL DE USUARIO — PUERTO CRISS
### Sistema Integral de Gestión para Restaurante Marino y Cevichería

---

## 📑 Tabla de Contenidos

1. [Introducción y Visión General](#1-introducción-y-visión-general)
2. [Acceso al Sistema y Roles de Usuario](#2-acceso-al-sistema-y-roles-de-usuario)
3. [Módulo Público (Clientes y Pedidos Online)](#3-módulo-público-clientes-y-pedidos-online)
   - 3.1. [Página de Inicio y Navegación](#31-página-de-inicio-y-navegación)
   - 3.2. [Carta y Menú Digital](#32-carta-y-menú-digital)
   - 3.3. [Carrito de Compras y Realización de Pedidos](#33-carrito-de-compras-y-realización-de-pedidos)
   - 3.4. [Seguimiento de Pedido en Tiempo Real](#34-seguimiento-de-pedido-en-tiempo-real)
4. [Módulo de Mozos (Salón y Atención en Mesas)](#4-módulo-de-mozos-salón-y-atención-en-mesas)
   - 4.1. [Mapa y Estado de Mesas](#41-mapa-y-estado-de-mesas)
   - 4.2. [Toma de Comandas y Envío a Cocina](#42-toma-de-comandas-y-envío-a-cocina)
   - 4.3. [Liberación y Cierre de Mesas](#43-liberación-y-cierre-de-mesas)
5. [Módulo de Cocina (Pantalla de Comandas KDS)](#5-módulo-de-cocina-pantalla-de-comandas-kds)
   - 5.1. [Recepción de Comandas en Vivo y Timbre Sonoro](#51-recepción-de-comandas-en-vivo-y-timbre-sonoro)
   - 5.2. [Flujo de Estados de Preparación](#52-flujo-de-estados-de-preparación)
   - 5.3. [Control de Stock y Disponibilidad de Platos](#53-control-de-stock-y-disponibilidad-de-platos)
6. [Módulo de Administración y Caja](#6-módulo-de-administración-y-caja)
   - 6.1. [Dashboard Gerencial](#61-dashboard-gerencial)
   - 6.2. [Control de Pedidos y Cobros](#62-control-de-pedidos-y-cobros)
   - 6.3. [Gestión de Caja Diaria y Arqueo](#63-gestión-de-caja-diaria-y-arqueo)
   - 6.4. [Control de Gastos y Movimientos](#64-control-de-gastos-y-movimientos)
   - 6.5. [Catálogo de Productos y Categorías](#65-catálogo-de-productos-y-categorías)
   - 6.6. [Directorio de Clientes](#66-directorio-de-clientes)
   - 6.7. [Reportes y Estadísticas Financieras](#67-reportes-y-estadísticas-financieras)
7. [Preguntas Frecuentes y Solución de Problemas](#7-preguntas-frecuentes-y-solución-de-problemas)

---

## 1. Introducción y Visión General

**Puerto Criss** es una solución integral diseñada para optimizar los procesos operativos, de cocina, atención al salón y administración de un restaurante marino o cevichería.

### ✨ Características Principales:
* **Sincronización en Tiempo Real (WebSockets):** Los pedidos tomados por clientes o mozos llegan instantáneamente a la pantalla de cocina y al panel de administración sin necesidad de recargar la página.
* **Alertas Sonoras y Visuales en Cocina:** Timbre interactivo para notificar al personal cocinero de nuevos pedidos al instante.
* **Control Multirrol con Seguridad:** Interfaces optimizadas según el rol de trabajo (`ADMIN`, `COCINA`, `MOZO` y público general).
* **Gestión de Caja y Flujo de Dinero:** Apertura con sencillo, registro de ingresos/egresos, arqueo de turno y emisión de tickets de resumen.
* **Multiplataforma:** Compatible con computadoras de escritorio, tablets y teléfonos móviles.

---

## 2. Acceso al Sistema y Roles de Usuario

El sistema cuenta con un control de acceso protegido mediante contraseñas seguras y token de autenticación.

### 🔑 Iniciar Sesión (`/login`)
1. Ingrese a la dirección web del sistema y pulse sobre el botón **"Acceso Personal"** o diríjase a `/login`.
2. Ingrese su correo electrónico y contraseña.
3. El sistema redirigirá automáticamente a la pantalla correspondiente según su rol asignado.

```
┌──────────────┬────────────────────────┬─────────────┬────────────────────────────────┐
│ Rol          │ Correo por Defecto     │ Clave Inicial│ Pantalla Principal             │
├──────────────┼────────────────────────┼─────────────┼────────────────────────────────┤
│ Administrador│ admin@puertocris.com   │ 123456      │ Panel de Administración /admin │
│ Cocina       │ cocina@puertocris.com  │ 123456      │ Pantalla KDS /cocina           │
│ Mozo         │ mozo@puertocris.com    │ 123456      │ Mapa de Mesas /mozo/mesas      │
└──────────────┴────────────────────────┴─────────────┴────────────────────────────────┘
```

> ⚠️ **Recomendación de Seguridad:** Modifique las contraseñas predeterminadas desde el panel administrativo para evitar accesos no autorizados.

---

## 3. Módulo Público (Clientes y Pedidos Online)

Permite a los clientes interactuar con la marca, consultar la carta en línea y realizar pedidos desde la comodidad de su hogar o dispositivo móvil.

### 3.1. Página de Inicio y Navegación (`/`)
* **Hero Banner:** Bienvenida a la cevichería con llamados a la acción rápidos ("Ver Carta", "Pedir Online").
* **Platos Destacados:** Muestra los platos marinos más populares y recomendados del día.
* **Información de Horarios y Ubicación:** Datos de contacto accesibles de inmediato.

### 3.2. Carta y Menú Digital (`/menu`)
* **Filtro por Categorías:** Pestañas interactivas para navegar entre *Ceviches, Chicharrones, Chaufas, Causas, Bebidas*, etc.
* **Personalizador de Platos:** Al presionar `+`, se abre una ventana para personalizar:
  * 🌶️ **Nivel de Picante:** *Sin ají*, *Poco picante*, *Punto medio (Recomendado)*, *Bien picante / Fuego*.
  * 🍠 **Guarnición / Preferencias:** *Clásico (Camote y choclo)*, *Doble canchita*, *Con yuca frita*, *Sin cebolla*.
  * 📝 **Nota para Cocina:** Peticiones especiales por plato.
* **Autopedido por Código QR de Mesa:** Si el cliente ingresa escaneando el código QR de su mesa (ej. `?mesa=4`), el sistema detecta su ubicación y fija su mesa de forma automática.
* **Estado de Disponibilidad en Vivo:** Si un plato se agota en cocina, se muestra como "Agotado" en tiempo real para evitar que se pida.

### 3.3. Carrito de Compras y Realización de Pedidos (`/carrito`)
1. **Revisión del Pedido:** Modifique cantidades o elimine platos con sus modificadores detallados.
2. **Autocompletado de Cliente Frecuente:** Al ingresar el número de celular, el sistema reconoce al cliente y rellena automáticamente su nombre y dirección guardada.
3. **Tipo de Entrega:**
   * 🛵 **Delivery:** Solicita la dirección exacta de entrega y una referencia (ej. "Frente al parque").
   * 🛍️ **Recojo en Local:** Para retirar directamente en el restaurante.
   * 🪑 **Mesa:** Para comer en salón (se autocompleta con QR o se selecciona manualmente).
4. **Método de Pago Preferido:** Efectivo o Yape / Plin.
5. **Confirmación:** Al pulsar **"Confirmar y Enviar Pedido"**, se genera un **Código Único de Seguimiento** (ej. `PC-7K4M`) y la orden se envía instantáneamente a cocina.

### 3.4. Seguimiento de Pedido en Tiempo Real (`/pedido/:codigo`)
* **Línea de Tiempo Dinámica Segura:**
  * 🟡 **Pendiente:** Pedido recibido por el sistema.
  * 🔵 **Preparando:** Los cocineros están elaborando los platos.
  * 🟢 **Listo:** El pedido está empaquetado para recojo o servido en mesa.
  * ✅ **Entregado:** Orden completada exitosamente.

---

## 4. Módulo de Mozos (Salón y Atención en Mesas)

Diseñado especialmente para tablets y celulares de los saloneros/mozos para agilizar la atención en el comedor.

### 4.1. Mapa y Estado de Mesas (`/mozo/mesas`)
* Visualización en cuadrícula de todas las mesas del restaurante con código de colores:
  * 🟢 **Libre:** Mesa disponible para sentar comensales.
  * 🔴 **Ocupada:** Mesa con comanda activa o comensales consumiendo.
  * 🟡 **Reservada:** Mesa apartada para clientes.
* **📲 Generador de Enlace / QR de Mesa:** Botón en cada mesa para ver o copiar el enlace directo `puertocriss.com/menu?mesa=N` para colocar en el acrílico o servilletero de cada mesa.

---

## 5. Módulo de Cocina (Pantalla de Comandas KDS)

Pantalla táctil o monitor para los chefs y ayudantes de cocina (`/cocina`). Diseñada en modo oscuro de alto contraste para máxima visibilidad.

### 5.1. Recepción de Comandas en Vivo y Timbre Sonoro
* **Alerta Sonora (Timbre):** Al recibir una nueva orden suena una campana sintetizada (Web Audio API) audible para avisar al personal.
* **Semáforo Inteligente de Tiempos de Espera:**
  * 🟢 **Verde (< 10 min):** Preparación a buen ritmo.
  * 🟡 **Amarillo (10 - 20 min):** Tiempo prudente, requiere atención.
  * 🔴 **Rojo Parpadeante (> 20 min):** ¡Alerta de demora! Comanda prioritaria.
* **Especificaciones y Modificadores Claros:** Las peticiones de picor y notas especiales se muestran destacadas en recuadros amarillos para no cometer errores.

   * Botón **"Empezar a Preparar" ➔** Mueve el pedido a estado *Preparando*.
2. **Columna "En Preparación" (Azul):**
   * Platos actualmente en las hornillas o barra de ceviches.
   * Botón **"¡Plato Listo!" ➔** Cambia el estado a *Listo*, alertando a los mozos o repartidores.

### 5.3. Control de Stock y Disponibilidad de Platos
* Botón **"🍽️ Stock / Platos del Día"**: Permite a cocina apagar un plato al instante (ej. si se agotaron las conchas negras o langostinos) con un switch interactivo.
* Se sincroniza inmediatamente en la carta web de los clientes y el panel de mozos.

---

## 6. Módulo de Administración y Caja

Panel central de control gerencial (`/admin`) para administradores, cajeros y dueños de negocio.

### 6.1. Dashboard Gerencial (`/admin/dashboard`)
* **Tarjetas de KPIs:**
  * 💵 Total de ventas del día.
  * 🧾 Cantidad de pedidos atendidos y ticket promedio.
  * ⏳ Pedidos actualmente en curso.
* **Gráficos Estadísticos:** Tendencia de ingresos por hora y días de la semana.

### 6.2. Control de Pedidos y Cobros (`/admin/pedidos`)
* **Listado General:** Filtros rápidos por estado (*Todos, Pendientes, En Cocina, Listos, Entregados, Cancelados*).
* **Detalle del Pedido:** Visualice cliente, mesa, dirección, platos y precio unitario.
* **Cobro de Pedido:**
  * Seleccione el método de pago recibido: **Efectivo**, **Yape / Plin** o **Tarjeta**.
  * Al liquidar el cobro en efectivo, el monto ingresa automáticamente a la sesión de caja abierta.
* **Cancelación de Pedidos:** En caso de errores o anulación por parte del cliente.

### 6.3. Gestión de Caja Diaria y Arqueo (`/admin/caja`)
* **Apertura de Caja:**
  * Al iniciar el turno o jornada, ingrese el **Sencillo Inicial** (monto en monedas y billetes para dar vuelto, ej. S/ 50.00).
* **Métricas en Tiempo Real de la Sesión:**
  * 🟢 **Monto Inicial:** Sencillo de partida.
  * 🔵 **Ventas en Efectivo:** Ingresos recaudados por órdenes pagadas en efectivo.
  * 🟡 **Ingresos Extra:** Dinero adicional ingresado a caja.
  * 🔴 **Egresos / Gastos:** Compras menores o pagos a proveedores pagados desde la gaveta.
  * 💰 **Efectivo Esperado en Cajón:** Total exacto que debe haber físicamente en gaveta.
* **Cierre de Caja:**
  * Ingrese el monto físico contado. El sistema calcula sobrantes o faltantes.
  * Genera el **Comprobante / Ticket de Cierre** listo para imprimir o archivar.

### 6.4. Control de Gastos y Movimientos (`/admin/gastos`)
* **Registro de Gastos:**
  * Registro clasificado de salidas de dinero: *Insumos (pescado, mariscos, limones), Servicios (luz, gas), Personal o Gastos Imprevistos*.
* **Categorías Personalizables:** Posibilidad de crear nuevas categorías de ingresos y egresos para mantener un orden contable estricto.

### 6.5. Catálogo de Productos y Categorías (`/admin/productos`)
* **Crear / Editar Platos:** Nombre, categoría asociada, descripción apetitosa, precio actual y enlace de fotografía.
* **Switch de Disponibilidad:** Activar o pausar productos del menú.
* **Gestión de Categorías:** Crear, renombrar o deshabilitar secciones del menú (*Ceviches, Tríos Marinos, Bebidas, etc.*).

### 6.6. Directorio de Clientes (`/admin/clientes`)
* Lista de clientes registrados a través de compras web o atención en salón.
* Historial de pedidos anteriores por cliente, números de contacto y direcciones frecuentes para fidelización.

### 6.7. Reportes y Estadísticas Financieras (`/admin/reportes`)
* **Filtros por Fecha:** Análisis del día, semana, mes o rango personalizado.
* **Métricas Financieras:**
  * Ingresos Totales vs Egresos Totales.
  * Ganancia Neta estimada.
* **Desglose de Métodos de Pago:** Porcentaje recaudado en Efectivo, Yape y Tarjetas.
* **Ranking de Platos:** Los 5 platos más vendidos del restaurante para proyectar compras de insumos.

---

## 7. Preguntas Frecuentes y Solución de Problemas

### ❓ ¿Qué hacer si en cocina no suena el timbre al entrar un pedido?
> **Solución:** Los navegadores modernos bloquean el sonido automático si el usuario no ha interactuado previamente con la página. Al abrir la pantalla de cocina, haga un click en cualquier parte de la pantalla o presione el botón amarillo **"Activar Timbre"**.

### ❓ ¿Qué ocurre si un comensal cambia de opinión y desea agregar más platos a su mesa?
> **Solución:** El mozo puede volver a seleccionar la mesa ocupada, agregar los nuevos platos adicionales y enviarlos a cocina; el total de la cuenta se actualizará automáticamente.

### ❓ ¿Cómo se registra un pago mixto (ejemplo: mitad Yape y mitad Efectivo)?
> **Solución:** En el módulo de cobro o en el registro de caja puede asentar el desglose correspondiente por método de pago para que el arqueo de efectivo mantenga precisión exacta.

### ❓ ¿Cómo reiniciar o sembrar datos de prueba?
> **Solución:** Desde la terminal del servidor ejecute `npm run seed` para restablecer las categorías, mesas, platos iniciales y usuarios de prueba.

---

*Manual elaborado para el sistema **Puerto Criss — Restaurante Marino & Cevichería**.*
