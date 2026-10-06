export const generarRutaIA = async (datosUsuario) => {
  const response = await fetch('http://localhost:3000/api/routes/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(datosUsuario),
  });

  if (!response.ok) {
    throw new Error('Error al generar la ruta con la IA');
  }

  return await response.json();
};