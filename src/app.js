let miContrato;
let web3MetaMask;
let accounts;
const contractAddress = '0x0Ef5Da3590c64aC552C35Fa565F3f750Ad87D6dD';

function actualizaReloj() {
    const currentTime = new Date();
    const hours = currentTime.getHours().toString().padStart(2, '0'); // Agrega cero a la izquierda si es necesario
    const minutes = currentTime.getMinutes().toString().padStart(2, '0'); // Agrega cero a la izquierda si es necesario
    const formattedTime = `${hours}:${minutes}`;
    document.getElementById('clock-time').textContent = formattedTime; // Actualiza la hora en el contenedor
    // Actualiza el reloj cada segundo
    setInterval(actualizaReloj, 10000);
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

async function mostrarDatosPacienteAdmin() {
    try {
        const dniPaciente = document.getElementById('dniPaciente').value;
        
        // Obtener datos del paciente
        const paciente = await miContrato.methods.obtenerDatosPaciente(dniPaciente).call({ from: accounts[0] });
        const datosPacienteContainer = document.getElementById('datosPacienteContainer');
        datosPacienteContainer.innerHTML = '';
        if (!paciente.datos.DNI) {
            datosPacienteContainer.innerHTML = '';
        } else {
            datosPacienteContainer.innerHTML +=`<p class="text-left"><strong>DNI:</strong> ${dniPaciente}</p>`;
            datosPacienteContainer.innerHTML += `<p class="text-left"><strong>Centro Sanitario:</strong> ${paciente.centro_sanitario}</p>`;
            datosPacienteContainer.innerHTML += `<p class="text-left"><strong>Indice Médico Asignado:</strong> ${paciente.medico_asignado}</p>`;
            // Separar los datos del paciente utilizando el separador ':'
            const datosSeparados = paciente.datos_paciente.split(':');
            // Crear un array con los nombres de los campos
            const campos = ['Nombre Completo', 'Dirección', 'Nacionalidad', 'Fecha de Nacimiento', 'Alergias', 'Grupo Sanguíneo', 'Peso (kg)', 'Altura (cm)', 'Vacunas'];
            // Mostrar los datos en el contenedor
            for (let i = 0; i < campos.length; i++) {
                datosPacienteContainer.innerHTML += `<p class="text-left"><strong>${campos[i]}:</strong> ${datosSeparados[i]}</p>`;
            }
        }
    } catch (error) {
        if (error.message.includes("Transaction has been reverted by the EVM")) {
            window.location.href = 'noAutorizado.html';
        } else {
            document.getElementById('transactionResult').textContent = 'Error en la transacción: ' + error.message;
        }
    }
}

async function mostrarDatosPaciente() {
    try {
        const dniPaciente = document.getElementById('dniPaciente').value;
        
        // Obtener datos del paciente
        const paciente = await miContrato.methods.obtenerDatosPaciente(dniPaciente).call({ from: accounts[0] });
        const datosPacienteContainer = document.getElementById('datosPacienteContainer');
        datosPacienteContainer.innerHTML = '';
        if (!paciente.datos.DNI) {
            datosPacienteContainer.innerHTML = 'Debes introducir un DNI válido';
        } else {
            datosPacienteContainer.innerHTML += `<p class="text-left"><strong>DNI:</strong> ${dniPaciente}</p>`;
            datosPacienteContainer.innerHTML += `<p class="text-left"><strong>Centro Sanitario:</strong> ${paciente.centro_sanitario}</p>`;
            // Separar los datos del paciente utilizando el separador ':'
            const datosSeparados = paciente.datos_paciente.split(':');
            // Crear un array con los nombres de los campos
            const campos = ['Nombre Completo', 'Dirección', 'Nacionalidad', 'Fecha de Nacimiento', 'Alergias', 'Grupo Sanguíneo',  'Peso (kg)', 'Altura (cm)', 'Vacunas'];
            // Mostrar los datos en el contenedor
            for (let i = 0; i < campos.length; i++) {
                datosPacienteContainer.innerHTML += `<p class="text-left"><strong>${campos[i]}:</strong> ${datosSeparados[i]}</p>`;
            }
        }
    } catch (error) {
        if (error.message.includes("Transaction has been reverted by the EVM")) {
            window.location.href = 'noAutorizado.html';
        } else {
            document.getElementById('transactionResult').textContent = 'Error en la transacción: ' + error.message;
        }
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
        window.location.href = 'index.html';

    } catch (error) {
        if (error.message.includes("Transaction has been reverted by the EVM")) {
            window.location.href = 'noAutorizado.html';
        } else {
            document.getElementById('transactionResult').textContent = 'Error en la transacción: ' + error.message;
        }
    }
}


async function registrarMedico() {
    try {
        const direccionMedico = document.getElementById('direccionMedico').value;
        const dniMedico = document.getElementById('dniMedico').value;
        const especialidadMedico = document.getElementById('especialidadMedico').value;
        const centroSanitarioMedico = document.getElementById('centroSanitarioMedico').value;

        await miContrato.methods.registrarMedico(direccionMedico, dniMedico, especialidadMedico, centroSanitarioMedico).send({ from: accounts[0] });

        alert('Médico con DNI ' + dniMedico + ' registrado exitosamente.');
        window.location.href = 'index.html';

    } catch (error) {
        if (error.message.includes("Transaction has been reverted by the EVM")) {
            window.location.href = 'noAutorizado.html';
        } else {
            document.getElementById('transactionResult').textContent = 'Error en la transacción: ' + error.message;
        }
    }
}
async function registrarPaciente() {
    try {
        const dniPaciente = document.getElementById('dniPaciente').value;
        const centroSanitarioPaciente = document.getElementById('centroSanitarioPaciente').value;

        // Agrupa los datos del paciente con el separador ":"
        const datosPaciente = [
            document.getElementById('nombreCompleto').value,
            document.getElementById('direccion').value,
            document.getElementById('nacionalidad').value,
            document.getElementById('fechaNacimiento').value,
            document.getElementById('alergias').value,
            document.getElementById('grupoSanguineo').value,
            document.getElementById('peso').value,
            document.getElementById('altura').value,
            document.getElementById('vacunas').value
        ].join(':');
        await miContrato.methods.registrarPaciente(dniPaciente, centroSanitarioPaciente, datosPaciente).send({ from: accounts[0] });
        alert('Paciente con DNI ' + dniPaciente + ' registrado exitosamente.');
        window.location.href = 'index.html';
    } catch (error) {
        if (error.message.includes("Transaction has been reverted by the EVM")) {
            window.location.href = 'noAutorizado.html';
        } else {
            document.getElementById('transactionResult').textContent = 'Error en la transacción: ' + error.message;
        }
    }
}

async function solicitarCita() {
    try {
        const fechaCita = document.getElementById('fechaCita').value;
        const horaCita = document.getElementById('horaCita').value;
        const datosConsulta = document.getElementById('datosConsulta').value;
        const tipoConsulta = document.getElementById('tipoConsulta').value;
        const dniPaciente = document.getElementById('dniPaciente').value;

        // Validar que la fecha de la cita no sea anterior a hoy
        const today = new Date().toISOString().split('T')[0];
        if (fechaCita < today) {
            alert('La fecha de la cita no puede ser anterior a hoy.');
            return;
        }

        // Continuar con la solicitud de la cita
        let result = await miContrato.methods.solicitarCita(
            dniPaciente,
            Date.parse(fechaCita + ' ' + horaCita) / 1000, // Convierte la fecha y hora a un timestamp Unix
            parseInt(horaCita), // Convierte la hora a un entero
            datosConsulta,
            tipoConsulta
        ).send({ from: accounts[0] });
        console.log(result);
        alert('Cita solicitada exitosamente.');
        window.location.href = 'index.html';
    } catch (error) {
        if (error.message.includes("Transaction has been reverted by the EVM")) {
            window.location.href = 'noAutorizado.html';
        } else {
            document.getElementById('transactionResult').textContent = 'Error en la transacción: ' + error.message;
        }
    }
}

async function atenderConsulta() {
    try {
        const dniPacienteAtender = document.getElementById('dniPacienteAtender').value;
        const fechaConsulta = document.getElementById('fechaConsulta').value;
        const horaConsulta = document.getElementById('horaConsulta').value;
        const motivoConsulta = document.getElementById('motivoConsulta').value;
        const problemaSalud = document.getElementById('problemaSalud').value;
        const examenesRealizados = document.getElementById('examenesRealizados').value;
        const medicacionPropuesta = document.getElementById('medicacionPropuesta').value;
        const tiempoEntreTomas = document.getElementById('tiempoEntreTomas').value;
        const dosis = document.getElementById('dosis').value;
        const datosConsultaAtender = `${motivoConsulta}:${examenesRealizados}:${problemaSalud}:${medicacionPropuesta}:${tiempoEntreTomas}:${dosis}`;
        const result = await miContrato.methods.atenderConsulta(
            dniPacienteAtender,
            Date.parse(fechaConsulta + ' ' + horaConsulta) / 1000, // Convierte la fecha y hora a un timestamp Unix
            parseInt(horaConsulta), // Convierte la hora a un entero
            datosConsultaAtender
        ).send({ from: accounts[0] });

        console.log(result);
        alert('Consulta atendida exitosamente.');
        window.location.href = 'index.html';
    } catch (error) {
        if (error.message.includes("Transaction has been reverted by the EVM")) {
            window.location.href = 'noAutorizado.html';
        } else {
            document.getElementById('transactionResult').textContent = 'Error en la transacción: ' + error.message;
        }
    }
}

function timestampAFecha(timestamp) {
    const fecha = new Date(timestamp * 1000); // Multiplicar por 1000 si el timestamp está en segundos
    return fecha.toLocaleDateString() + ' ' + fecha.toLocaleTimeString();
}

async function mostrarCitas() {
    try {
        const dniPaciente = document.getElementById('dniPaciente').value;
        const citas = await miContrato.methods.obtenerCitas().call({ from: accounts[0] });
        console.log(citas);
        const listaCitas = document.getElementById('listaCitasConsultas');
        listaCitas.innerHTML = '';

        // Obtiene la fecha actual
        const fechaActual = new Date().getTime() / 1000; // Convierte a segundos

        citas.forEach(cita => {
            if (cita.paciente.datos.direccionPublica.toLowerCase() == accounts[0] && cita.fecha > fechaActual) {
                const li = document.createElement('li');
                li.classList.add('lista-item');
                const fechaFormateada = timestampAFecha(cita.fecha);
                const tipoTexto = obtenerTextoTipoConsulta(cita.tipoConsulta);
                li.innerHTML = `<strong>Fecha:</strong>${fechaFormateada}<br><strong>Tipo:</strong>${tipoTexto}<br><strong>Motivo:</strong>${cita.datos_cita}`;
                listaCitas.appendChild(li);
            }
        });
    } catch (error) {
        if (error.message.includes("Transaction has been reverted by the EVM")) {
            window.location.href = 'noAutorizado.html';
        } else {
            document.getElementById('transactionResult').textContent = 'Error en la transacción: ' + error.message;
        }
    }
}

async function mostrarConsultas() {
    try {
        const dniPaciente = document.getElementById('dniPaciente').value;
        const consultas = await miContrato.methods.obtenerConsultas().call({ from: accounts[0] });
        const listaConsultas = document.getElementById('listaConsultas');
        listaConsultas.innerHTML = '';
        consultas.forEach(consulta => {
            if (consulta.paciente.datos.direccionPublica.toLowerCase() == accounts[0]) {
                const li = document.createElement('li');
                li.classList.add('lista-item');
                const fechaFormateada = timestampAFecha(consulta.fecha);
                const estadoTexto = obtenerTextoEstadoConsulta(consulta.estado);
                const tipoTexto = obtenerTextoTipoConsulta(consulta.tipo);
                li.innerHTML = ''; 
                li.innerHTML += `<strong>Fecha:</strong> ${fechaFormateada}<br><strong>Estado:</strong>${estadoTexto}<br><strong>Tipo:</strong> ${tipoTexto}`;
                const datosConsultaArray = consulta.datos_consulta.split(':');
                const motivoConsulta = datosConsultaArray[0];
                const examenesRealizados = datosConsultaArray[1];
                const problemaSalud = datosConsultaArray[2];
                const medicacionPropuesta = datosConsultaArray[3];
                const tiempoEntreTomas = datosConsultaArray[4];
                const dosis = datosConsultaArray[5];
                li.innerHTML += `<br><strong>Motivo:</strong> ${motivoConsulta}<br>
                    <strong>Examenes realizados:</strong> ${examenesRealizados}<br>
                    <strong>Problema de salud:</strong> ${problemaSalud}<br>
                    <strong>Medicación propuesta:</strong> ${medicacionPropuesta}<br>
                    <strong>Tiempo entre tomas:</strong> ${tiempoEntreTomas}<br>
                    <strong>Dosis:</strong> ${dosis}
                `;
                listaConsultas.appendChild(li);            
        }});
    } catch (error) {
        if (error.message.includes("Transaction has been reverted by the EVM")) {
            window.location.href = 'noAutorizado.html';
        } else {
            document.getElementById('transactionResult').textContent = 'Error en la transacción: ' + error.message;
        }
    }
}

async function comprobarConsultasProgramadas () {
    try {
        const consultasProgramadas = await miContrato.methods.obtenerConsultas().call({ from: accounts[0] });
        const listaConsultasProgramadas = document.getElementById('listaConsultasProgramadas');
        console.log(consultasProgramadas);
        listaConsultasProgramadas.innerHTML = '';
        consultasProgramadas.forEach(consulta => {
            if (consulta.medico.datos.direccionPublica.toLowerCase() === accounts[0].toLowerCase()) {
                console.log(consulta);
                const li = document.createElement('li');
                li.classList.add('lista-item');
                const fechaFormateada = timestampAFecha(consulta.fecha);
                const tipoTexto = obtenerTextoTipoConsulta(consulta.tipo);
                li.innerHTML = `<strong>Paciente:</strong>${consulta.paciente.datos.DNI}<br><strong>Fecha:</strong>${fechaFormateada}<br><strong>Tipo:</strong>${tipoTexto}<br>`;
                listaConsultasProgramadas.appendChild(li);
            }
        });
    } catch (error) {
        if (error.message.includes("Transaction has been reverted by the EVM")) {
            window.location.href = 'noAutorizado.html';
        } else {
            document.getElementById('transactionResult').textContent = 'Error en la transacción: ' + error.message;
        }
    }
}


function obtenerTextoTipoConsulta(tipo) {
    switch (tipo) {
        case '0':
            return "Consulta general";
        case '1':
            return "Consulta especializada";
    }
}
function obtenerTextoEstadoConsulta(estado) {
    switch (estado) {
        case '0':
            return "Programada";
        case '1':
            return "Cancelada";
        case '2':
            return "Cerrada";
    }
}

function mostrarSubMenu(submenuId) {
    var submenu = document.getElementById(submenuId + '-submenu');
    if (submenu) {
        submenu.style.display = 'block';
    }
}

function ocultarSubMenu(submenuId) {
    var submenu = document.getElementById(submenuId + '-submenu');
    if (submenu) {
        submenu.style.display = 'none';
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
        case 'atenderConsulta':
            window.location.href = 'atenderConsulta.html';
            break;
        case 'datosPaciente':
            window.location.href = 'datosPaciente.html';
            break;
        case 'mostrarDatos':
            window.location.href = 'mostrarDatos.html';
            break;
        default:
            break;
    }
}