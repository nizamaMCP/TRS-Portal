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

    const payload = { proveedor_id };

    try {
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
        console.log("Respuesta del flujo:", data);

        // -----------------------------
        // Manejo de solpeds
        // -----------------------------
        let solpedsArray = [];

        if (data.solpeds) {
            // Forzar parseo si viene como string
            if (typeof data.solpeds === "string") {
                try {
                    solpedsArray = JSON.parse(data.solpeds);
                } catch (parseError) {
                    console.error("Error parseando solpeds:", parseError);
                    resultadoDiv.innerText = "❌ Error al procesar los SOLPEDs (JSON inválido)";
                    return;
                }
            } else if (Array.isArray(data.solpeds)) {
                solpedsArray = data.solpeds;
            } else {
                console.warn("solpeds no es un array ni string:", data.solpeds);
                resultadoDiv.innerText = "❌ Formato de datos inesperado";
                return;
            }
        }

        if (!Array.isArray(solpedsArray) || solpedsArray.length === 0) {
            resultadoDiv.innerText = "No se encontraron SOLPEDs para este proveedor.";
            return;
        }

        resultadoDiv.innerText = `✅ ${solpedsArray.length} SOLPED(s) encontradas`;

        // Llenar tabla
        tbody.innerHTML = ""; // Asegurarse de limpiar
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
