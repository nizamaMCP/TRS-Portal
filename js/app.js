// ================================
// CONFIGURACIÓN
// ================================
const FLOW_URL = "https://default9cfb9ab8c5ae49a2ab6e7df4450810.04.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/c6d8357a2ad047a792bf75dea76d7263/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=u4UYD3Dn29Afv19GAjpexKOTxK9DTEBtmYa0gOz-aDI";
const FLOW_UPDATE_URL = "https://default9cfb9ab8c5ae49a2ab6e7df4450810.04.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/ea2f00bee9f044a2ba4d48014b3f80e8/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=ZnmmOtuo8KyCPFW8HIzRRXlg2teazYqjSYCHirsBv2s"; // URL del flujo de actualización

// ===============================
// VARIABLES GLOBALES
// ===============================
let solpedsArray = [];      // Datos que se muestran en la tabla
let solpedsOriginal = [];   // Copia para comparar cambios

// ===============================
// FUNCIÓN PRINCIPAL: CONSULTAR
// ===============================
async function enviarDatos() {
    const proveedor_id = document.getElementById("proveedor").value.trim();
    const resultadoDiv = document.getElementById("resultado");
    const tbody = document.querySelector("#tablaSolpeds tbody");

    tbody.innerHTML = "";
    resultadoDiv.innerText = "Consultando datos...";

    try {
        const payload = { proveedor_id };
        console.log("Payload que se envía:", JSON.stringify(payload));

        const response = await fetch(FLOW_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error("Error HTTP: " + response.status);

        const data = await response.json();
        console.log("Respuesta del flujo:", data);

        // Parsear solpeds si vienen como string
        solpedsArray = typeof data.solpeds === "string" ? JSON.parse(data.solpeds) : data.solpeds;
        solpedsOriginal = JSON.parse(JSON.stringify(solpedsArray)); // copia profunda

        if (!Array.isArray(solpedsArray) || solpedsArray.length === 0) {
            resultadoDiv.innerText = "No se encontraron SOLPEDs para este proveedor.";
            return;
        }

        resultadoDiv.innerText = `✅ ${solpedsArray.length} SOLPED(s) encontradas`;

        // Llenar tabla con input para cantidad editable
        tbody.innerHTML = "";
        solpedsArray.forEach((s, i) => {
            tbody.innerHTML += `
                <tr>
                    <td>${s.numero}</td>
                    <td>${s.material}</td>
                    <td><input type="number" min="0" value="${s.cantidad}" data-index="${i}" class="cantidad-input"></td>
                    <td>${s.estado}</td>
                </tr>`;
        });

    } catch (error) {
        console.error(error);
        resultadoDiv.innerText = "❌ Error al consultar información";
    }
}

// ===============================
// FUNCIÓN: GUARDAR CAMBIOS
// ===============================
async function guardarCambios() {
    const resultadoDiv = document.getElementById("resultado");
    const tbody = document.querySelector("#tablaSolpeds tbody");

    // Leer los valores editados
    const inputs = tbody.querySelectorAll(".cantidad-input");
    inputs.forEach(input => {
        const index = parseInt(input.dataset.index);
        solpedsArray[index].cantidad = input.value.trim();
    });

    // Filtrar solo los cambios
    const cambios = solpedsArray.filter((fila, i) => fila.cantidad !== solpedsOriginal[i].cantidad);

    if (cambios.length === 0) {
        alert("No hay cambios para guardar");
        return;
    }

    // Validaciones
    for (let c of cambios) {
        if (isNaN(c.cantidad) || Number(c.cantidad) <= 0) {
            alert(`Cantidad inválida para Solped ${c.numero}`);
            return;
        }
    }

    resultadoDiv.innerText = "Guardando cambios...";

    try {
        const response = await fetch(FLOW_UPDATE_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cambios })
        });

        if (!response.ok) throw new Error("Error HTTP: " + response.status);

        const data = await response.json();
        console.log("Respuesta actualización:", data);

        // Actualizar copia original y resaltar filas modificadas
        cambios.forEach(cambio => {
            const index = solpedsArray.findIndex(s => s.numero === cambio.numero);
            solpedsOriginal[index].cantidad = cambio.cantidad;
            const tr = tbody.querySelectorAll("tr")[index];
            tr.style.backgroundColor = "#d4edda"; // verde suave
        });

        resultadoDiv.innerText = `✅ ${cambios.length} cambio(s) guardado(s) correctamente`;

    } catch (error) {
        console.error(error);
        resultadoDiv.innerText = "❌ Error al guardar los cambios";
    }
}
