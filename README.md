# 🩺 MediConnect

Es un portal web de coordinación de citas y teleasistencia diseñado para clínicas y centros de salud.
El proyecto busca mejorar la eficiencia de los servicios de salud mediante una plataforma unificada, moderna y segura

## 🧩 Tecnologías utilizadas

- **Angular** 19.2.17 — Framework principal para la aplicación web  
- **Node.js** 20.18.1 — Entorno de ejecución  
- **Tailwind CSS** — Framework de estilos utilitario para una UI moderna  
- **TypeScript** — Tipado estático y organización modular del código

**Nota:**  
El código fuente activo y en desarrollo se encuentra en la rama **`development`**

## 🧱 Estructura del proyecto

La estructura del proyecto se organizó para mantener claridad, escalabilidad y orden en el desarrollo 
**Core** centraliza la configuración y servicios globales, **Shared** agrupa componentes y utilidades reutilizables, y **Modules** concentra las funcionalidades principales como citas, pacientes y teleasistencia
Además, **Assets** gestiona recursos estáticos y **Environments** las configuraciones por entorno  
Esta estructura facilita el trabajo colaborativo, la integración con servicios externos y un diseño coherente mediante **Tailwind CSS**

```plaintext
src/
├─ app/
│ ├─ core/
│ │ ├─ auth/ # Servicios y guards de autenticación/MFA
│ │ ├─ services/ # Servicios globales (API, storage, notificaciones)
│ │ ├─ models/ # Modelos globales y tipos
│ │ └─ interceptors/ # Interceptores HTTP (JWT, errores, logging)
│ │
│ ├─ shared/
│ │ ├─ components/ # Componentes reutilizables (botones, inputs, modales)
│ │ ├─ directives/ # Directivas reutilizables
│ │ ├─ pipes/ # Pipes globales (formatos, fechas, etc.)
│ │ └─ utils/ # Funciones y helpers compartidos
│ │
│ ├─ modules/
│ │ ├─ appointments/ # Gestión de citas
│ │ ├─ patients/ # Perfiles y datos de pacientes
│ │ ├─ clinicians/ # Agenda del médico
│ │ ├─ telehealth/ # Videollamadas y chat seguro
│ │ ├─ notifications/ # Recordatorios SMS/email
│ │ └─ ehr/ # Integración FHIR/EHR
│ │
│ ├─ app.component.* # Componente raíz
│ ├─ app.routes.ts # Configuración de rutas principales
│ └─ app.config.ts # Configuración inicial y providers globales
│
├─ assets/
│ ├─ images/ # Logos, íconos, ilustraciones
│ ├─ fonts/ # Tipografías personalizadas
│ ├─ i18n/ # Traducciones (es/en)
│ ├─ docs/ # PDFs y manuales
│ └─ mocks/ # Datos de prueba JSON
│
├─ environments/
│ ├─ environment.ts # Variables de entorno producción
│ └─ environment.development.ts # Variables de entorno desarrollo
│
├─ styles.css # Estilos globales (Tailwind importado aquí)
└─ main.ts # Punto de entrada
