use axum::{routing::{get, post}, Router};
use std::{env, net::SocketAddr};
use tower_http::cors::CorsLayer;

mod handlers;
mod models;

#[tokio::main]
async fn main() {
    dotenvy::dotenv().ok();

    let port = env::var("PORT")
        .ok()
        .and_then(|value| value.parse::<u16>().ok())
        .unwrap_or(3000);

    let app = Router::new()
        .route("/health", get(handlers::health))
        .route("/api/routes/generate", post(handlers::generar_ruta)) 
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