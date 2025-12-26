// Pruebas HTML POST
//https://reqbin.com/post-online
// ejemplo: { "proveedor_id": "FERREYROS" }

// ================================
// CONFIGURACIÓN
// ================================
const FLOW_URL = "https://default9cfb9ab8c5ae49a2ab6e7df4450810.04.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/c6d8357a2ad047a792bf75dea76d7263/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=u4UYD3Dn29Afv19GAjpexKOTxK9DTEBtmYa0gOz-aDI";
const FLOW_UPDATE_URL = "https://default9cfb9ab8c5ae49a2ab6e7df4450810.04.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/ea2f00bee9f044a2ba4d48014b3f80e8/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=ZnmmOtuo8KyCPFW8HIzRRXlg2teazYqjSYCHirsBv2s";

// ================================
// VARIABLES GLOBALES
// ================================
let solpedsArray = [];
let solpedsOriginal = [];

// ================================
// FUNCIONES AUXILIARES
// ================================
function excelDateToJSDate(excelSerial) {
    if (!excelSerial) return '';
    const excelEpoch = new Date(1899, 11, 30);
    const jsDate = new Date(excelEpoch.getTime() + excelSerial * 86400000);
    const yyyy = jsDate.getFullYear();
    const mm = String(jsDate.getMonth() + 1).padStart(2, '0');
    const dd = String(jsDate.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}

// ================================
// CONSULTAR SOLPEDS
// ================================
async function enviarDatos() {
    const proveedor_id = document.getElementById("proveedor").value.trim();
    const resultadoDiv = document.getElementById("resultado");
    const tbody = document.querySelector("#tablaSolpeds tbody");

    tbody.innerHTML = "";
    resultadoDiv.innerText = "Consultando datos...";

    try {
        const response = await fetch(FLOW_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ proveedor_id })
        });

        if (!response.ok) throw new Error("Error HTTP");

        const data = await response.json();

        solpedsArray = typeof data.solpeds === "string"
            ? JSON.parse(data.solpeds)
            : data.solpeds;

        solpedsOriginal = JSON.parse(JSON.stringify(solpedsArray));

        if (!solpedsArray.length) {
            resultadoDiv.innerText = "No se encontraron SOLPEDs";
            return;
        }

        resultadoDiv.innerText = `✅ ${solpedsArray.length} SOLPED(s) encontradas`;

        solpedsArray.forEach((s, i) => {
            tbody.innerHTML += `
                <tr>
                    <td>${s.num_solped}</td>
                    <td>${s.orden}</td>
                    <td>${s.estado_orden}</td>
                    <td>${s.material}</td>

                    <td>
                        <input type="date"
                               value="${excelDateToJSDate(s.fecha_recep_comp)}"
                               data-index="${i}"
                               data-field="fecha_recep_comp"
                               class="fecha-input">
                    </td>

                    <td>
                        <input type="date"
                               value="${excelDateToJSDate(s.fecha_termino)}"
                               data-index="${i}"
                               data-field="fecha_termino"
                               class="fecha-input">
                    </td>

                    <td>
                        <input type="date"
                               value="${excelDateToJSDate(s.fecha_despacho_real)}"
                               data-index="${i}"
                               data-field="fecha_despacho_real"
                               class="fecha-input">
                    </td>
                </tr>`;
        });

    } catch (error) {
        console.error(error);
        resultadoDiv.innerText = "❌ Error al consultar información";
    }
}

// ================================
// GUARDAR CAMBIOS
// ================================
async function guardarCambios() {
    const resultadoDiv = document.getElementById("resultado");
    const tbody = document.querySelector("#tablaSolpeds tbody");

    const fechaInputs = tbody.querySelectorAll(".fecha-input");

    fechaInputs.forEach(input => {
        const index = input.dataset.index;
        const field = input.dataset.field;
        solpedsArray[index][field] = input.value;
    });

    const cambios = solpedsArray.filter((fila, i) =>
        fila.fecha_recep_comp !== solpedsOriginal[i].fecha_recep_comp ||
        fila.fecha_termino !== solpedsOriginal[i].fecha_termino ||
        fila.fecha_despacho_real !== solpedsOriginal[i].fecha_despacho_real
    );

    if (!cambios.length) {
        alert("No hay cambios para guardar");
        return;
    }

    resultadoDiv.innerText = "Guardando cambios...";

    try {
        const response = await fetch(FLOW_UPDATE_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cambios })
        });

        if (!response.ok) throw new Error("Error HTTP");

        cambios.forEach(cambio => {
            const index = solpedsArray.findIndex(s => s.num_solped === cambio.num_solped);
            solpedsOriginal[index] = { ...cambio };
            tbody.querySelectorAll("tr")[index].style.backgroundColor = "#d4edda";
        });

        resultadoDiv.innerText = `✅ ${cambios.length} cambio(s) guardados`;

    } catch (error) {
        console.error(error);
        resultadoDiv.innerText = "❌ Error al guardar cambios";
    }
}
