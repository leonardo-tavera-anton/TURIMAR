# TuriMar API

Backend Rust para TuriMar usando Axum.

## Requisitos

Instala Rust con `rustup`: https://rustup.rs/

## Ejecutar

```powershell
Copy-Item .env.example .env
cargo run
```

La API queda disponible en `http://127.0.0.1:3000`.

- `GET /health`: comprueba que el servicio está activo y que las variables de Supabase existen.

La integración con tablas de Supabase se añadirá cuando se defina el esquema de datos. No se incluye ninguna clave `service_role` en este proyecto.
