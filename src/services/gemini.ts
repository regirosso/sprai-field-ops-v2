// DEJA AQUÍ LA MISMA URL DE TU APPS SCRIPT
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx-fGM-MgTg1gXgVsYSkqq-bho1cbzeQQnNfN09PoD2vfzBAW8YlVWcXsiTr5PQg40s_A/exec';

export async function validateInstallationPhoto(
  base64Image: string,
  itemLabel: string
): Promise<{ success: boolean; feedback: string }> {
  try {
    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({
        accion: 'validar_foto',
        base64: base64Image,
        itemLabel: itemLabel
      })
    });
    
    const data = await response.json();
    
    // Si Apps Script falló o no devolvió un éxito explícito
    if (data.success === false) {
      return { success: false, feedback: data.error || 'Error interno del servidor IA.' };
    }

    return { 
      success: data.success, 
      feedback: data.feedback || 'Sin feedback del servidor.' 
    };
  } catch (error) {
    console.error('Error al validar con Apps Script:', error);
    return { success: false, feedback: 'Error de conexión con el módulo de IA del servidor.' };
  }
}