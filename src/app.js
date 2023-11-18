// Función para obtener el hash de los nodos activos
let miContrato;
let web3MetaMask;
let accounts;

function actualizaReloj() {
    const currentTime = new Date();
    const hours = currentTime.getHours().toString().padStart(2, '0'); // Agrega cero a la izquierda si es necesario
    const minutes = currentTime.getMinutes().toString().padStart(2, '0'); // Agrega cero a la izquierda si es necesario
    const formattedTime = `${hours}:${minutes}`;
    document.getElementById('clock-time').textContent = formattedTime; // Actualiza la hora en el contenedor
    // Actualiza el reloj cada segundo
    setInterval(actualizaReloj, 1000);
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
        default:
            break;
    }
}

async function connectMetamask() {
    try {
        if (typeof window.ethereum !== 'undefined') {
            // Conecta la aplicación a MetaMask
            await window.ethereum.enable();
            web3MetaMask = new Web3(window.ethereum);
            accounts = await window.ethereum.request({ method: 'eth_accounts' });
            const contractAddress = '0xDFCA09868a46C440148544958E1De1FC96A56409';
            const response = await fetch('../build/contracts/HistoriaClinica.json');
            const Codabi = await response.json();
            // Crea una instancia del contrato
            miContrato = new web3MetaMask.eth.Contract(Codabi.abi, contractAddress);
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
        const dniPaciente = document.getElementById('dniPaciente').value;
        const centroSanitarioPaciente = document.getElementById('centroSanitarioPaciente').value;
        const datosPaciente = document.getElementById('datosPaciente').value;

        // Llama a la función del contrato para registrar pacientes
        let paciente = await miContrato.methods.registrarPaciente(dniPaciente, centroSanitarioPaciente, datosPaciente).send({ from: accounts[0] });
        // Actualiza la interfaz o muestra un mensaje de éxito
        console.log(paciente);
        alert('Paciente con DNI ' + dniPaciente + ' registrado exitosamente.');
    }
    catch (error) {
        document.getElementById('transactionResult').textContent = 'Error en la transacción: ' + error.message;
    }
}