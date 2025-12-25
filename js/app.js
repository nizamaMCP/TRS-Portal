// ===============================
// CONFIGURACIÓN
// ===============================
const FLOW_URL = "TU_URL_DEL_FLOJO_AQUI"; // Pega la URL de tu Power Automate

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
    const payload = {
        proveedor_id: proveedor_id
    };

    try {
        const response = await fetch(FLOW_URL, {
            method: "POST",
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error("Error HTTP: " + response.status);
        }

        const data = await response.json();

        console.log("Respuesta del flujo:", data); // DEBUG

        if (!data.solpeds || data.solpeds.length === 0) {
            resultadoDiv.innerText = "No se encontraron SOLPEDs para este proveedor.";
            return;
        }

        resultadoDiv.innerText = `✅ ${data.solpeds.length} SOLPED(s) encontradas`;

        // Llenar tabla
        data.solpeds.forEach(s => {
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
