// ===============================
// CONFIGURACIÓN
// ===============================
const FLOW_URL = "https://default9cfb9ab8c5ae49a2ab6e7df4450810.04.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/9cd7b812c9bd451fa5bd034d1a66ac42/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=b8Ekw__2omVqmwWeLRaV36JXcXjnbt4t_xraOkDq5-A";

// ===============================
// FUNCIÓN PRINCIPAL
// ===============================
async function enviarDatos() {

    const usuario = document.getElementById("usuario").value;
    const accion = document.getElementById("accion").value;
    const comentario = document.getElementById("comentario").value;

    const payload = {
        usuario: usuario,
        accion: accion,
        comentario: comentario
    };

    document.getElementById("resultado").innerText = "Enviando datos...";

    try {
        const response = await fetch(FLOW_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error("Error HTTP: " + response.status);
        }

        const data = await response.json();

        document.getElementById("resultado").innerText =
            "✅ " + data.mensaje;

    } catch (error) {
        console.error(error);
        document.getElementById("resultado").innerText =
            "❌ Error al enviar información";
    }
}
