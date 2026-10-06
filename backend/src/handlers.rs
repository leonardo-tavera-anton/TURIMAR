use axum::{http::StatusCode, Json};
use reqwest::Client;
use serde_json::{json, Value};
use std::env;

use crate::models::{
    GenerarRutaRequest, HealthResponse, RutaGeneradaResponse,
};

pub async fn health() -> (StatusCode, Json<HealthResponse>) {
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

pub async fn generar_ruta(
    Json(payload): Json<GenerarRutaRequest>,
) -> Result<(StatusCode, Json<RutaGeneradaResponse>), (StatusCode, String)> {
    
    let api_key = env::var("IA_API_KEY").map_err(|_| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            "Falta la variable de entorno IA_API_KEY".to_string(),
        )
    })?;

    println!("Generando ruta con IA para: {:?}", payload.tipo_acompanante);

    let system_prompt = "Eres un guía turístico experto en Chimbote y Nuevo Chimbote, Perú. \
        Debes generar una ruta turística real y coherente. \
        Obligatorio: Tu respuesta debe ser estrictamente un objeto JSON válido, sin texto adicional, sin formato markdown ni bloques de código. \
        El JSON debe tener exactamente esta estructura: \
        { \
          \"titulo_ruta\": \"String\", \
          \"descripcion\": \"String\", \
          \"duracion_total_horas\": 0.0, \
          \"presupuesto_total_estimado\": 0.0, \
          \"paradas\": [ \
            { \"orden\": 1, \"nombre\": \"String\", \"descripcion_actividad\": \"String\", \"coordenadas\": {\"lat\": -9.0, \"lng\": -78.0}, \"tiempo_estadia_minutos\": 0, \"costo_estimado\": 0.0, \"tips_ia\": \"String\" } \
          ], \
          \"tramos\": [ \
            { \"origen\": \"String\", \"destino\": \"String\", \"modo_transporte\": \"caminando|auto|transporte_publico\", \"duracion_estimada_minutos\": 0, \"distancia_km\": 0.0 } \
          ] \
        }";

    let ubicacion_texto = match payload.ubicacion_origen {
        Some(coords) => format!("Latitud: {}, Longitud: {}", coords.lat, coords.lng),
        None => "No proporcionada (asume inicio en el centro de Nuevo Chimbote)".to_string(),
    };

    let user_prompt = format!(
        "Diseña una ruta óptima considerando estos parámetros:\n\
        - Preferencias de comida: {:?}\n\
        - Acompañantes: {}\n\
        - Nivel de presupuesto: {}\n\
        - Tiempo disponible: {} horas\n\
        - Ubicación de inicio: {}\n\
        Limítate a lugares reales, turísticos o gastronómicos, de Chimbote o Nuevo Chimbote.",
        payload.preferencias_comida,
        payload.tipo_acompanante,
        payload.presupuesto_nivel,
        payload.tiempo_disponible_horas,
        ubicacion_texto
    );

    let client = Client::new();
    let request_body = json!({
        "model": "gpt-4o-mini", 
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        "temperature": 0.7,
        "response_format": { "type": "json_object" } 
    });

    let response = client
        .post("https://api.openai.com/v1/chat/completions")
        .bearer_auth(api_key)
        .json(&request_body)
        .send()
        .await
        .map_err(|e| {
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                format!("Error al conectar con OpenAI: {}", e),
            )
        })?;

    let response_json: Value = response.json().await.map_err(|e| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            format!("Error al leer la respuesta de OpenAI: {}", e),
        )
    })?;

    let ia_content = response_json["choices"][0]["message"]["content"]
        .as_str()
        .ok_or((
            StatusCode::INTERNAL_SERVER_ERROR,
            "La API de OpenAI no devolvió contenido válido".to_string(),
        ))?;

    let ruta_generada: RutaGeneradaResponse = serde_json::from_str(ia_content).map_err(|e| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            format!("Error convirtiendo el texto de la IA a modelo Rust: {}", e),
        )
    })?;

    println!("Ruta generada exitosamente: {:#?}", ruta_generada);

    Ok((StatusCode::OK, Json(ruta_generada)))
}