// ================================
// CONFIGURACIÓN
// ================================
const FLOW_URL = "https://default9cfb9ab8c5ae49a2ab6e7df445081004.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/c6d8357a2ad047a792bf75dea76d7263/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=u4UYD3Dn29Afv19GAjpexKOTxK9DTEBtmYa0gOz-aDI";

// ===============================
// FUNCIÓN PRINCIPAL
// ===============================
async function enviarDatos() {
    const proveedor_id = document.getElementById("proveedor").value.trim();
    const resultadoDiv = document.getElementById("resultado");
    const tbody = document.querySelector("#tablaSolpeds tbody");

    // Limpiar tabla y mensaje
    tbody.innerHTML = "";
    resultadoDiv.innerText = "Consultando datos...";

    // Payload para Power Automate
    const payload = { proveedor_id };

    try {
        // DEBUG: ver qué se envía al flujo
        console.log("Payload que se envía:", JSON.stringify(payload));

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
        console.log("Respuesta del flujo:", data); // DEBUG

        // -----------------------------
        // Manejo de solpeds (string -> array)
        // -----------------------------
        let solpedsArray = [];

        if (data.solpeds) {
            try {
                solpedsArray = typeof data.solpeds === "string" ? JSON.parse(data.solpeds) : data.solpeds;
            } catch (e) {
                console.error("Error parseando solpeds:", e);
                resultadoDiv.innerText = "❌ Error al procesar los SOLPEDs";
                return;
            }
        }

        if (!Array.isArray(solpedsArray) || solpedsArray.length === 0) {
            resultadoDiv.innerText = "No se encontraron SOLPEDs para este proveedor.";
            return;
        }

        resultadoDiv.innerText = `✅ ${solpedsArray.length} SOLPED(s) encontradas`;

        // -----------------------------
        // Llenar tabla
        // -----------------------------
        solpedsArray.forEach(s => {
            tbody.innerHTML += `
                <tr>
                    <td>${s.numero || ""}</td>
                    <td>${s.material || ""}</td>
                    <td>${s.cantidad || ""}</td>
                    <td>${s.estado || ""}</td>
                </tr>`;
        });

    } catch (error) {
        console.error(error);
        resultadoDiv.innerText = "❌ Error al consultar información";
    }
}
