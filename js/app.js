// ===============================
// CONFIGURACIÓN
// ===============================
const FLOW_URL = "https://default9cfb9ab8c5ae49a2ab6e7df4450810.04.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/c6d8357a2ad047a792bf75dea76d7263/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=u4UYD3Dn29Afv19GAjpexKOTxK9DTEBtmYa0gOz-aDI";

// ===============================
// FUNCIÓN PRINCIPAL
// ===============================
async function enviarDatos() {
    const proveedor_id = document.getElementById("proveedor").value;
    const resultadoDiv = document.getElementById("resultado");
    const tbody = document.querySelector("#tablaSolpeds tbody");
    tbody.innerHTML = "";
    resultadoDiv.innerText = "Consultando datos...";

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

        if (!data.solpeds || data.solpeds.length === 0) {
            resultadoDiv.innerText = "No se encontraron SOLPEDs para este proveedor.";
            return;
        }

        resultadoDiv.innerText = `✅ ${data.solpeds.length} SOLPED(s) encontradas`;

        // Llenar tabla
        data.solpeds.forEach(s => {
            tbody.innerHTML += `
                <tr>
                    <td>${s.Numero || ""}</td>
                    <td>${s.Material || ""}</td>
                    <td>${s.Cantidad || ""}</td>
                    <td>${s.Estado || ""}</td>
                </tr>`;
        });

    } catch (error) {
        console.error(error);
        resultadoDiv.innerText = "❌ Error al consultar información";
    }
}
