// Función para obtener el hash de los nodos activos
let miContrato;
let web3MetaMask;
let accounts;
const contractAddress = '0x20790dAda36815a6a48Ad1B03608f4F9267fdBd7';


function actualizaReloj() {
    const currentTime = new Date();
    const hours = currentTime.getHours().toString().padStart(2, '0'); // Agrega cero a la izquierda si es necesario
    const minutes = currentTime.getMinutes().toString().padStart(2, '0'); // Agrega cero a la izquierda si es necesario
    const formattedTime = `${hours}:${minutes}`;
    document.getElementById('clock-time').textContent = formattedTime; // Actualiza la hora en el contenedor
    // Actualiza el reloj cada segundo
    setInterval(actualizaReloj, 1000);
}

async function connectMetamask() {
    try {
        if (typeof window.ethereum !== 'undefined') {
            // Conecta la aplicación a MetaMask
            await window.ethereum.enable();
            web3MetaMask = new Web3(window.ethereum);
            accounts = await window.ethereum.request({ method: 'eth_accounts' });
            const response = await fetch('../build/contracts/HistoriaClinica.json');
            const Codabi = await response.json();
            // Crea una instancia del contrato
            miContrato = new web3MetaMask.eth.Contract(Codabi.abi, contractAddress);
            console.log(Codabi.abi);
        } else {
            window.location.href = 'errorMetamask.html';
        }
    } catch (error) {
        alert('Error : ' + error.message);
    }
}

async function mostrarDatos() {
    try {
        const dniPaciente = document.getElementById('dniPaciente').value;
        // Obtener datos del paciente
        const paciente = await miContrato.methods.obtenerDatosPaciente(dniPaciente).call({ from: accounts[0] });
        const datosPacienteContainer = document.getElementById('datosPacienteContainer');
        datosPacienteContainer.innerHTML = '';
        if (!paciente.datos.DNI) {
            datosPacienteContainer.innerHTML = '';
        } else {
            datosPacienteContainer.innerHTML = `<p><strong>DNI:</strong> ${paciente.datos.DNI}</p>
                <p><strong>Centro Sanitario:</strong> ${paciente.centro_sanitario}</p>
                <p><strong>Médico Asignado:</strong> ${paciente.medico_asignado}</p>`;
        }

        // Obtener datos de médicos
        const medicos = await miContrato.methods.obtenerMedicos().call({ from: accounts[0] });
        const listaMedicos = document.getElementById('listaMedicos');
        listaMedicos.innerHTML = '';
        medicos.forEach(medico => {
            const li = document.createElement('li');
            li.innerHTML = `<strong>DNI:</strong> ${medico.datos.DNI}, <strong>Especialidad:</strong> ${medico.especialidad}, <strong>Centro Sanitario:</strong> ${medico.centro_sanitario}`;
            listaMedicos.appendChild(li);
        });

        // Obtener datos de enfermeros
        const enfermeros = await miContrato.methods.obtenerEnfermeros().call({ from: accounts[0] });
        const listaEnfermeros = document.getElementById('listaEnfermeros');
        listaEnfermeros.innerHTML = '';
        enfermeros.forEach(enfermero => {
            const li = document.createElement('li');
            li.innerHTML = `<strong>DNI:</strong> ${enfermero.datos.DNI}, <strong>Especialidad:</strong> ${enfermero.especialidad}, <strong>Centro Sanitario:</strong> ${enfermero.centro_sanitario}`;
            listaEnfermeros.appendChild(li);
        });
    } catch (error) {
        document.getElementById('transactionResult').textContent = 'Error en la transacción: ' + error.message;
    }
}

async function registrarEnfermero() {
    try {
        const direccionEnfermero = document.getElementById('direccionEnfermero').value;
        const dniEnfermero = document.getElementById('dniEnfermero').value;
        const especialidadEnfermero = document.getElementById('especialidadEnfermero').value;
        const centroSanitarioEnfermero = document.getElementById('centroSanitarioEnfermero').value;

        await miContrato.methods.registrarEnfermero(direccionEnfermero, dniEnfermero, especialidadEnfermero, centroSanitarioEnfermero).send({ from: accounts[0] });
        alert('Enfermero con DNI ' + dniEnfermero + ' registrado exitosamente.');

    } catch (error) {
        document.getElementById('transactionResult').textContent = 'Error en la transacción: ' + error.message;
    }
}

async function registrarMedico() {
    try {
        const direccionMedico = document.getElementById('direccionMedico').value;
        const dniMedico = document.getElementById('dniMedico').value;
        const especialidadMedico = document.getElementById('especialidadMedico').value;
        const centroSanitarioMedico = document.getElementById('centroSanitarioMedico').value;

        await miContrato.methods.registrarMedico(direccionMedico, dniMedico, especialidadMedico, centroSanitarioMedico).send({ from: accounts[0] });

        alert('Médico con DNI' + dniMedico+ + ' registrado exitosamente.');
    }
    catch (error) {
        document.getElementById('transactionResult').textContent = 'Error en la transacción: ' + error.message;
    }
}

async function registrarPaciente() {
    try {
        console.log(miContrato.abi);
        const dniPaciente = document.getElementById('dniPaciente').value;
        const centroSanitarioPaciente = document.getElementById('centroSanitarioPaciente').value;
        const datosPaciente = document.getElementById('datosPaciente').value;

        let paciente = await miContrato.methods.registrarPaciente(dniPaciente, centroSanitarioPaciente, datosPaciente).send({ from: accounts[0] });
        alert('Paciente con DNI ' + dniPaciente + ' registrado exitosamente.');
    }
    catch (error) {
        document.getElementById('transactionResult').textContent = 'Error en la transacción: ' + error.message;
    }
}
async function solicitarCita() {
    try {
        // Obtén los valores del formulario
        const fechaCita = document.getElementById('fechaCita').value;
        const horaCita = document.getElementById('horaCita').value;
        const datosConsulta = document.getElementById('datosConsulta').value;
        const tipoConsulta = document.getElementById('tipoConsulta').value;
        const dniPaciente = document.getElementById('dniPaciente').value;
        let result = await miContrato.methods.solicitarCita(
            dniPaciente, 
            Date.parse(fechaCita + ' ' + horaCita) / 1000, // Convierte la fecha y hora a un timestamp Unix
            parseInt(horaCita), // Convierte la hora a un entero
            datosConsulta,
            tipoConsulta
        ).send({ from: accounts[0] });

        console.log(result);
        alert('Cita solicitada exitosamente.');
    } catch (error) {
        document.getElementById('transactionResult').textContent = 'Error en la transacción: ' + error.message;
    }
}
async function obtenerCitasPorPaciente() {
    try {
        const dniPaciente = document.getElementById('dniPaciente').value;
        let citas = await miContrato.citas[0];
        var listaCitas = document.getElementById("listaCitas");
        listaCitas.innerHTML = ""; // Limpiamos la lista
    
        citas.forEach(function (cita) {
            var listItem = document.createElement("li");
            listItem.className = "list-group-item";
            listItem.innerHTML = `<strong>Fecha:</strong> ${cita.fecha}, <strong>Hora:</strong> ${cita.hora}, <strong>Motivo:</strong> ${cita.motivo}`;
            listaCitas.appendChild(listItem);
        });
    } catch (error) {
        document.getElementById('transactionResult').textContent = 'Error en la transacción: ' + error.message;
    }
}



function redirigirPagina(pagina) {
    switch (pagina) {
        case 'registrarMedico':
            window.location.href = 'registroMedico.html';
            break;
        case 'registrarEnfermero':
            window.location.href = 'registroEnfermero.html';
            break;
        case 'registrarPaciente':
            window.location.href = 'registroPaciente.html';
            break;
        case 'panelAdministrador':
            window.location.href = 'mostrarDatos.html';
            break;
            case 'pedirCita':
            window.location.href = 'pedirCita.html';
            break;
            case 'datosPaciente':
            window.location.href = 'datosPaciente.html';
            break;
        default:
            break;
    }
}