// ===============================
// CONFIGURACIÓN
// ===============================
const FLOW_URL = "PEGA_AQUI_TU_URL_DE_POWER_AUTOMATE";

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
