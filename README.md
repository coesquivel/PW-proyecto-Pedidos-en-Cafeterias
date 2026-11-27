# Plantilla del Curso de Programación Web 

2026-2

---

## Descripción del Proyecto

Esta plantilla implementa una aplicación web full-stack utilizando React.js + Vite para el frontend y Node.js + Express para el backend. El proyecto está organizado para separar la interfaz, lógica de negocio, acceso a datos y configuración, permitiendo desarrollar tanto el sitio web como un panel administrativo.

La aplicación utiliza Supabase como base de datos y dispone de migraciones SQL para gestionar su estructura y datos iniciales. Además, incluye configuración para Vercel, vistas EJS para páginas del servidor y una API organizada mediante controladores, servicios y repositorios.

| Carpeta | Descripción |
|---|---|
| `admin/` | Lógica del panel administrativo: APIs, controladores, modelos, repositorios y servicios. |
| `api/` | Punto de entrada de la API del servidor. |
| `configs/` | Configuración general, base de datos, middlewares y funciones auxiliares. |
| `db/` | Esquema y migraciones SQL de la base de datos Supabase. |
| `docs/` | Documentación técnica, incluyendo el diagrama de la base de datos. |
| `public/` | Archivos públicos y recursos estáticos. |
| `src/` | Aplicación React: páginas, componentes, estilos, helpers y entradas de la aplicación. |
| `views/` | Plantillas EJS para las páginas renderizadas por Express. |
| `website/` | Lógica del sitio web: APIs, controladores, modelos, repositorios, rutas y servicios. |
| `server.js` | Archivo principal para iniciar y configurar el servidor Express. |


## Comandos GIT

Descargar GIT del [enlace](https://git-scm.com/install/windows)

![Sitio web de descarga](./docs/gitwindows.png)

Crear proyecto GIT

    > git init
    
Loguearse

    > git config --global user.name "Tu Nombre"
    > git config --global user.email "tu@email.com"

Crear rama

    > git checkout -b feature/prueba

Ver ramas

    > git branch

Cambiar rama

    > git checkout #nombre_rama

Cambiar a commit

    > git reset --hard #commit

Cambiar remote

    > git remote set-url origin git@github.com:usuario/repositorio.git

    git remote set-url origin git@github.com:jovaldiv-ops/pw-2026-2.git

Instalar dependencias:

    npm install

npm install -g vercel
vercel login
vercel --prod