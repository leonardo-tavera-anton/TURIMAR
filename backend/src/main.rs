use axum::{http::StatusCode, routing::get, Json, Router};
use serde::Serialize;
use std::{env, net::SocketAddr};
use tower_http::cors::CorsLayer;

#[derive(Serialize)]
struct HealthResponse {
    status: &'static str,
    service: &'static str,
    supabase_configured: bool,
}

async fn health() -> (StatusCode, Json<HealthResponse>) {
    let supabase_configured = env::var("SUPABASE_URL").is_ok()
        && env::var("SUPABASE_ANON_KEY").is_ok();

    (
        StatusCode::OK,
        Json(HealthResponse {
            status: "ok",
            service: "turimar-api",
            supabase_configured,
        }),
    )
}

#[tokio::main]
async fn main() {
    dotenvy::dotenv().ok();

    let port = env::var("PORT")
        .ok()
        .and_then(|value| value.parse::<u16>().ok())
        .unwrap_or(3000);

    let app = Router::new()
        .route("/health", get(health))
        .layer(CorsLayer::very_permissive());

    let address = SocketAddr::from(([127, 0, 0, 1], port));
    let listener = tokio::net::TcpListener::bind(address)
        .await
        .expect("no se pudo abrir el puerto del backend");

    println!("TuriMar API escuchando en http://{address}");
    axum::serve(listener, app)
        .await
        .expect("el servidor terminó inesperadamente");
}
