use serde::{Deserialize, Serialize};

#[derive(Serialize)]
pub struct HealthResponse {
    pub status: &'static str,
    pub service: &'static str,
    pub supabase_configured: bool,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Ubicacion {
    pub lat: f64,
    pub lng: f64,
}

#[derive(Deserialize, Debug)]
pub struct GenerarRutaRequest {
    pub preferencias_comida: Vec<String>,
    pub tipo_acompanante: String,
    pub presupuesto_nivel: String,
    pub tiempo_disponible_horas: u32,
    pub ubicacion_origen: Option<Ubicacion>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Parada {
    pub orden: u32,
    pub nombre: String,
    pub descripcion_actividad: String,
    pub coordenadas: Ubicacion,
    pub tiempo_estadia_minutos: u32,
    pub costo_estimado: f64,
    pub tips_ia: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Tramo {
    pub origen: String,
    pub destino: String,
    pub modo_transporte: String,
    pub duracion_estimada_minutos: u32,
    pub distancia_km: f64,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct RutaGeneradaResponse {
    pub titulo_ruta: String,
    pub descripcion: String,
    pub duracion_total_horas: f64,
    pub presupuesto_total_estimado: f64,
    pub paradas: Vec<Parada>,
    pub tramos: Vec<Tramo>,
}