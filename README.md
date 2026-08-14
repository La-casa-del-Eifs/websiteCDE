# La Casa del Eifs — Sitio web + Catálogo

Sitio web y catálogo de productos EIFS con **login por roles**, **panel de KPIs** y gestión de **clientes** y **usuarios**. Construido con **Next.js 14 + Tailwind CSS + Supabase** y preparado para convertirse en **e-commerce**. Identidad visual basada en el logo oficial (azul marino `#0F2B53` + amarillo `#F7BD1E`).

> **Funciona de inmediato en modo demostración** (con datos de ejemplo). Cuando conectes Supabase, usará tu catálogo, usuarios y KPIs reales.

---

## 🧱 Tecnologías

- **Next.js 14** (App Router) — framework de React con renderizado en servidor.
- **Tailwind CSS** — estilos.
- **Supabase** — base de datos PostgreSQL, autenticación y seguridad por filas (RLS).
- **TypeScript** y **lucide-react** (íconos).

---

## 🚀 Puesta en marcha (rápida)

Necesitas [Node.js 18+](https://nodejs.org).

```bash
# 1. Instalar dependencias
npm install

# 2. Levantar en modo desarrollo
npm run dev
```

Abre **http://localhost:3000**. Verás el sitio con datos de ejemplo (aparece un aviso de "Modo demostración").

---

## 🔌 Conectar Supabase (datos reales)

### 1. Crear el proyecto
1. Entra a [supabase.com](https://supabase.com) y crea un proyecto gratis.
2. Ve a **Project Settings → API** y copia el **Project URL** y la **anon public key**.

### 2. Variables de entorno
```bash
cp .env.local.example .env.local
```
Edita `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://tuproyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 3. Crear las tablas
En Supabase, ve a **SQL Editor → New query**, pega el contenido de `supabase/schema.sql` y ejecútalo. Crea tablas, roles, triggers y políticas de seguridad (RLS).

### 4. (Opcional) Cargar productos de ejemplo
Ejecuta también `supabase/seed.sql` para poblar el catálogo.

### 5. Crear tu usuario administrador
1. Reinicia el servidor y entra a **/registro** para crear tu cuenta.
2. En Supabase ve a **Authentication → Users** y copia tu **UUID**.
3. En **SQL Editor**, ejecuta (reemplaza el UUID):
   ```sql
   update public.profiles set role = 'admin'
   where id = 'TU-UUID-AQUI';
   ```
4. Vuelve a **/login**. Verás el panel completo con KPIs y gestión.

---

## 👥 Roles (5)

| Rol          | Acceso                                                          |
| ------------ | -------------------------------------------------------------- |
| **admin**    | Todo: KPIs, productos, clientes y usuarios.                    |
| **vendedor** | Clientes y productos (sin gestión de usuarios ni config).      |
| **cliente**  | Su cuenta y catálogo. Rol por defecto al registrarse.          |
| **usuario**  | Acceso básico a su cuenta.                                     |
| **empresa**  | Cliente con **descuento preferente** asignable por el admin.   |

El admin edita el rol y el descuento de cada usuario desde **Panel → Usuarios**.
El descuento solo aplica al rol **empresa** (se aplicará en el carrito/checkout).

> **Base de datos ya creada:** si aplicaste `schema.sql` antes de esta versión,
> ejecuta una vez `supabase/migration_002_login_roles.sql` en el SQL Editor para
> añadir los nuevos roles y campos (nombres, apellidos, RUT, descuento).

---

## 🗂️ Estructura

```
src/
├─ app/
│  ├─ page.tsx                 # Inicio
│  ├─ catalogo/                # Catálogo + detalle de producto
│  ├─ nosotros/  contacto/     # Páginas informativas
│  ├─ login/  registro/        # Autenticación
│  ├─ auth/                    # Callback y cierre de sesión
│  └─ dashboard/               # Panel (protegido por rol): KPIs, productos, clientes, usuarios
├─ components/                 # Navbar, Footer, Logo, tarjetas, sidebar, formularios
├─ lib/
│  ├─ config.ts                # Datos de contacto y detección de Supabase
│  ├─ format.ts                # Moneda y fechas (edita CURRENCY/LOCALE)
│  ├─ supabase/                # Clientes de Supabase (browser/server/middleware)
│  └─ data/                    # Acceso a datos (con fallback a datos demo)
└─ types/database.ts

public/logo.png                # Logo oficial
src/app/icon.png               # Favicon (marca del logo)
supabase/schema.sql            # Estructura + RLS
supabase/seed.sql              # Datos de ejemplo
```

---

## 🛠️ Personalización

- **Datos de contacto** (correo, teléfono, WhatsApp, dirección): `src/lib/config.ts`.
- **Moneda e idioma**: `src/lib/format.ts` (por defecto CLP / es-CL).
- **Colores de marca**: `tailwind.config.ts` (paletas `brand` = navy y `gold` = amarillo).
- **Logo**: reemplaza `public/logo.png` (y `src/app/icon.png` para el favicon).
- **Fotos de productos**: súbelas a **Supabase Storage** y guarda la URL en el campo `image_url`. Sin imagen, se muestra un marcador con la marca.

---

## 🛒 Camino hacia el e-commerce

La base ya está lista: tablas `orders` y `order_items` con RLS, y botón "Agregar al carrito" (deshabilitado) en el detalle de producto. Próximos pasos: carrito, checkout y pasarela de pago (Stripe, MercadoPago o Transbank/Webpay).

---

## ☁️ Publicar (deploy)

Lo más simple es [**Vercel**](https://vercel.com): sube el proyecto a GitHub, impórtalo en Vercel, agrega las variables de entorno y haz deploy.

---

## 📜 Comandos

```bash
npm run dev     # desarrollo (http://localhost:3000)
npm run build   # compilar para producción
npm run start   # ejecutar la versión compilada
npm run lint    # revisar el código
```

---

© La Casa del Eifs · casadeleifs@outlook.com
