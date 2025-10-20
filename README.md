# 📚 CMPC-Libros Frontend

Sistema de gestión de inventario de libros con interfaz moderna y responsiva construida con React,
TypeScript, Ant Design y Tailwind CSS.

## 🎯 Descripción General

CMPC-Libros Frontend es una aplicación web moderna que proporciona una interfaz intuitiva para la
gestión completa de inventario de libros. La aplicación incluye funcionalidades avanzadas como
búsqueda, filtrado, exportación de datos, sistema de auditoría y gestión de usuarios.

## ✨ Características Principales

- 🎨 **Interfaz Moderna**: Diseño responsivo con Ant Design y Tailwind CSS
- 🔐 **Autenticación JWT**: Sistema de login/registro seguro
- 📚 **Gestión de Libros**: CRUD completo con validaciones
- 🔍 **Búsqueda Avanzada**: Filtros múltiples y búsqueda en tiempo real
- 📊 **Dashboard de Auditoría**: Monitoreo completo de operaciones
- 📥 **Exportación de Datos**: Exportación CSV con filtros personalizables
- 🌙 **Modo Oscuro**: Soporte completo para tema claro y oscuro
- 📱 **Responsive**: Optimizado para dispositivos móviles y desktop
- ⚡ **Performance**: Optimizado con React 18 y Vite

## 🛠️ Tecnologías Utilizadas

### Core

- **React 18.3.1** - Biblioteca de UI
- **TypeScript 5.3.3** - Tipado estático
- **Vite 5.1.0** - Build tool y dev server

### UI/UX

- **Ant Design 5.27.2** - Componentes de UI
- **Tailwind CSS 4.1.10** - Framework de estilos
- **Framer Motion 11.0.3** - Animaciones
- **React Icons 5.0.1** - Iconografía

### Estado y Routing

- **Zustand 5.0.8** - Gestión de estado
- **React Router DOM 6.22.0** - Enrutamiento

### Utilidades

- **date-fns 4.1.0** - Manipulación de fechas
- **jwt-decode 4.0.0** - Decodificación de JWT
- **zod 3.22.4** - Validación de esquemas

## 🚀 Instalación y Configuración

### Prerrequisitos

- **Node.js** >= 18.0.0
- **npm** >= 8.0.0 o **pnpm** >= 7.0.0
- **Backend API** ejecutándose en puerto 3001

### 1. Clonar el Repositorio

```bash
git clone <repository-url>
cd cmcp-front
```

### 2. Instalar Dependencias

```bash
# Con npm
npm install

# Con pnpm (recomendado)
pnpm install

# Con yarn
yarn install
```

### 3. Configuración de Variables de Entorno

Crear archivo `.env.local` en la raíz del proyecto:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:3001/api/v1

# App Configuration
VITE_APP_NAME=CMPC-Libros
VITE_APP_VERSION=1.0.0

# Feature Flags
VITE_ENABLE_AUDIT_LOGS=true
VITE_ENABLE_EXPORT=true
VITE_ENABLE_DARK_MODE=true
```

### 4. Ejecutar en Desarrollo

```bash
# Con npm
npm run dev

# Con pnpm
pnpm dev

# Con yarn
yarn dev
```

La aplicación estará disponible en `http://localhost:5173`

### 5. Build para Producción

```bash
# Con npm
npm run build

# Con pnpm
pnpm build

# Con yarn
yarn build
```

Los archivos de producción se generarán en la carpeta `dist/`

## 📁 Estructura del Proyecto

```
src/
├── components/           # Componentes reutilizables
│   ├── ActionButton.tsx
│   ├── BookCard.tsx
│   ├── BookFilters.tsx
│   ├── BookForm.tsx
│   ├── BookPagination.tsx
│   ├── BookSorting.tsx
│   ├── FeatureCard.tsx
│   ├── Navbar.tsx
│   └── UserProfile.tsx
├── config/              # Configuraciones
│   └── api.ts
├── contexts/            # Contextos de React
│   └── ThemeContext.tsx
├── data/                # Datos estáticos
│   └── landingData.tsx
├── hooks/               # Custom hooks
│   └── useScrollToSection.ts
├── pages/               # Páginas principales
│   ├── BookList.tsx
│   ├── Dashboard.tsx
│   └── LandingPage.tsx
├── providers/           # Providers de la app
│   └── AntdConfigProvider.tsx
├── routes/              # Configuración de rutas
│   ├── GuestRoutes.tsx
│   └── ProtectedAuthRoute.tsx
├── services/            # Servicios de API
│   ├── auditLogService.ts
│   └── bookService.ts
├── store/               # Estado global
│   └── index.ts
├── types/               # Definiciones de tipos
│   ├── book.ts
│   ├── landing.ts
│   └── session.ts
├── views/               # Vistas comunes
│   └── common/
├── App.tsx              # Componente principal
├── main.tsx             # Punto de entrada
└── index.css            # Estilos globales
```

## 🎨 Guía de Uso

### 1. Autenticación

#### Registro de Usuario

1. Navegar a la página de registro
2. Completar formulario con datos requeridos
3. El sistema validará los datos y creará la cuenta

#### Inicio de Sesión

1. Ingresar email y contraseña
2. El sistema generará tokens JWT
3. Redirección automática al dashboard

### 2. Gestión de Libros

#### Agregar Libro

1. Ir a "Gestión de Libros"
2. Hacer clic en "Agregar Libro"
3. Completar formulario con datos del libro
4. Subir imagen (opcional)
5. Guardar cambios

#### Buscar y Filtrar

1. Usar barra de búsqueda para texto libre
2. Aplicar filtros por género, editorial, autor
3. Ordenar por diferentes criterios
4. Navegar con paginación

#### Editar/Eliminar

1. Hacer clic en "Editar" en la tarjeta del libro
2. Modificar datos necesarios
3. Para eliminar, usar botón "Eliminar" con confirmación

### 3. Dashboard de Auditoría

#### Visualizar Logs

1. Acceder al Dashboard desde el menú
2. Ver logs de todas las operaciones
3. Filtrar por acción, usuario, fecha
4. Exportar datos en CSV

#### Exportar Datos

1. Aplicar filtros deseados
2. Hacer clic en "Exportar Datos"
3. Descargar archivo CSV generado

## 🔧 Configuración Avanzada

### Personalización de Temas

El sistema soporta temas personalizados a través de Tailwind CSS:

```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        'fountain-blue': {
          50: '#f0f9ff',
          100: '#e0f2fe',
          // ... más colores
        },
      },
    },
  },
};
```

### Configuración de API

```typescript
// src/config/api.ts
export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
};
```

### Gestión de Estado

```typescript
// src/store/index.ts
import { create } from 'zustand';

interface AppState {
  user: User | null;
  theme: 'light' | 'dark';
  setUser: (user: User | null) => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  theme: 'light',
  setUser: (user) => set({ user }),
  setTheme: (theme) => set({ theme }),
}));
```

## 🧪 Testing

### Ejecutar Tests

```bash
# Tests unitarios
npm run test

# Tests con coverage
npm run test:coverage

# Tests en modo watch
npm run test:watch
```

### Estructura de Tests

```
src/
├── __tests__/
│   ├── components/
│   ├── pages/
│   └── services/
└── test-utils/
    └── test-utils.tsx
```

## 🚀 Deployment

### Netlify (Recomendado)

1. Conectar repositorio a Netlify
2. Configurar build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
3. Configurar variables de entorno en Netlify
4. Deploy automático en cada push

### Vercel

1. Conectar repositorio a Vercel
2. Configurar variables de entorno
3. Deploy automático

### Docker

```dockerfile
# Dockerfile
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 🔒 Seguridad

### Mejores Prácticas Implementadas

- ✅ **Autenticación JWT** con refresh tokens
- ✅ **Validación de entrada** con Zod
- ✅ **Sanitización de datos** en formularios
- ✅ **HTTPS** en producción
- ✅ **Headers de seguridad** configurados
- ✅ **Validación de tokens** en cada request

### Configuración de Seguridad

```typescript
// Headers de seguridad recomendados
const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
};
```

## 📊 Performance

### Optimizaciones Implementadas

- ⚡ **Code Splitting** con React.lazy
- ⚡ **Tree Shaking** automático con Vite
- ⚡ **Image Optimization** con lazy loading
- ⚡ **Bundle Analysis** con rollup-plugin-visualizer
- ⚡ **Caching** de assets estáticos

### Métricas de Performance

```bash
# Analizar bundle
npm run build -- --analyze

# Lighthouse audit
npm run lighthouse
```

## 🐛 Troubleshooting

### Problemas Comunes

#### Error de CORS

```bash
# Verificar configuración del backend
# Asegurar que CORS esté habilitado para el dominio del frontend
```

#### Error de Autenticación

```bash
# Verificar que el token JWT sea válido
# Comprobar expiración del token
# Verificar configuración de refresh token
```

#### Error de Build

```bash
# Limpiar cache
rm -rf node_modules package-lock.json
npm install

# Verificar versiones de Node.js
node --version  # Debe ser >= 18.0.0
```

## 🤝 Contribución

### Proceso de Contribución

1. Fork del repositorio
2. Crear rama feature: `git checkout -b feature/nueva-funcionalidad`
3. Commit cambios: `git commit -m 'Agregar nueva funcionalidad'`
4. Push a la rama: `git push origin feature/nueva-funcionalidad`
5. Crear Pull Request

### Estándares de Código

- **ESLint** para linting
- **Prettier** para formateo
- **TypeScript** estricto
- **Conventional Commits** para mensajes

```bash
# Linting
npm run lint

# Formateo
npm run format

# Type checking
npm run type-check
```

## 📝 Changelog

### v1.0.0 (2024-01-XX)

- ✨ Lanzamiento inicial
- 🎨 Interfaz moderna con Ant Design
- 🔐 Sistema de autenticación JWT
- 📚 Gestión completa de libros
- 📊 Dashboard de auditoría
- 📥 Exportación de datos
- 🌙 Modo oscuro

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

## 🆘 Soporte

Para soporte técnico o reportar problemas:

- 📧 Email: dev@cmpc-books.com
- 🐛 Issues: [GitHub Issues](https://github.com/cmpc-books/frontend/issues)
- 📖 Documentación: [Wiki del Proyecto](https://github.com/cmpc-books/frontend/wiki)

## 🙏 Agradecimientos

- [Ant Design](https://ant.design/) por los componentes de UI
- [Tailwind CSS](https://tailwindcss.com/) por el framework de estilos
- [Framer Motion](https://www.framer.com/motion/) por las animaciones
- [React](https://reactjs.org/) por la biblioteca de UI
- [Vite](https://vitejs.dev/) por el build tool

---

**Desarrollado con ❤️ por el equipo CMPC**
