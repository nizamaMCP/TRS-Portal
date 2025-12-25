// ================================
// CONFIGURACIÓN
// ================================
const FLOW_URL = "https://default9cfb9ab8c5ae49a2ab6e7df4450810.04.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/c6d8357a2ad047a792bf75dea76d7263/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=u4UYD3Dn29Afv19GAjpexKOTxK9DTEBtmYa0gOz-aDI";

// URL de tu flujo para actualizar datos (debes crear un flujo aparte)
const FLOW_UPDATE_URL = "https://default9cfb9ab8c5ae49a2ab6e7df4450810.04.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/ea2f00bee9f044a2ba4d48014b3f80e8/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=ZnmmOtuo8KyCPFW8HIzRRXlg2teazYqjSYCHirsBv2s";

// ===============================
// FUNCION PRINCIPAL: CONSULTAR SOLPEDs
// ===============================
async function enviarDatos() {
    const proveedor_id = document.getElementById("proveedor").value.trim();
    const resultadoDiv = document.getElementById("resultado");
    const tbody = document.querySelector("#tablaSolpeds tbody");

    tbody.innerHTML = "";
    resultadoDiv.innerText = "Consultando datos...";

    const payload = { proveedor_id };

    try {
        console.log("Payload que se envía:", JSON.stringify(payload));

        const response = await fetch(FLOW_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error("Error HTTP: " + response.status);

        const data = await response.json();
        console.log("Respuesta del flujo:", data);

        let solpedsArray = [];
        if (data.solpeds) {
            solpedsArray = typeof data.solpeds === "string" ? JSON.parse(data.solpeds) : data.solpeds;
        }

        if (!Array.isArray(solpedsArray) || solpedsArray.length === 0) {
            resultadoDiv.innerText = "No se encontraron SOLPEDs para este proveedor.";
            return;
        }

        resultadoDiv.innerText = `✅ ${solpedsArray.length} SOLPED(s) encontradas`;

        // Llenar tabla y hacer columnas editables
        solpedsArray.forEach(s => {
            tbody.innerHTML += `
                <tr>
                    <td>${s.numero || ""}</td>
                    <td>${s.material || ""}</td>
                    <td contenteditable="true">${s.cantidad || ""}</td>
                    <td contenteditable="true">${s.estado || ""}</td>
                </tr>`;
        });

    } catch (error) {
        console.error(error);
        resultadoDiv.innerText = "❌ Error al consultar información";
    }
}

// ===============================
// FUNCION: GUARDAR CAMBIOS
// ===============================
async function guardarCambios() {
    const tbody = document.querySelector("#tablaSolpeds tbody");
    const resultadoDiv = document.getElementById("resultado");

    // Recopilar cambios de la tabla
    const cambios = Array.from(tbody.querySelectorAll("tr")).map(tr => ({
        numero: tr.children[0].innerText.trim(),
        material: tr.children[1].innerText.trim(),
        cantidad: tr.children[2].innerText.trim(),
        estado: tr.children[3].innerText.trim()
    }));

    if (cambios.length === 0) {
        resultadoDiv.innerText = "No hay cambios para guardar.";
        return;
    }

    try {
        const response = await fetch(FLOW_UPDATE_URL, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({solpeds: cambios})
        });

        if (!response.ok) throw new Error("Error HTTP: " + response.status);

        const data = await response.json();
        resultadoDiv.innerText = `✅ ${data.message} (Registros: ${data.updatedCount})`;

    } catch (error) {
        console.error(error);
        resultadoDiv.innerText = "❌ Error al guardar los cambios";
    }
}
