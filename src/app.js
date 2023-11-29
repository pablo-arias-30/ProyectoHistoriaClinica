let miContrato;
let web3MetaMask;
let accounts;
let contractAddress = '0xf14FC09E131047e499EE6382340a3C8ef35E13F9'; //dirección del contrato

function actualizaReloj() {
    let currentTime = new Date();
    let hours = currentTime.getHours().toString().padStart(2, '0'); // Agrega cero a la izquierda si es necesario
    let minutes = currentTime.getMinutes().toString().padStart(2, '0'); // Agrega cero a la izquierda si es necesario
    let formattedTime = `${hours}:${minutes}`;
    document.getElementById('clock-time').textContent = formattedTime; // Actualiza la hora
    // Actualiza el reloj cada 10 segundos
    setInterval(actualizaReloj, 10000);
}

async function connectMetamask() {
    try {
        if (typeof window.ethereum !== 'undefined') {
            // Conecta la aplicación a MetaMask
            await window.ethereum.enable();
            web3MetaMask = new Web3(window.ethereum);
            accounts = await window.ethereum.request({ method: 'eth_accounts' });
            console.log('Connected to MetaMask. Accounts:', accounts);
            const response = await fetch('../build/contracts/HistoriaClinica.json');
            const Codabi = await response.json();
            // Crea una instancia del contrato
            miContrato = new web3MetaMask.eth.Contract(Codabi.abi, contractAddress);
            console.log('Contract instance created:', miContrato);
            console.log('Contract ABI:', miContrato.options.jsonInterface);
        } else {
            window.location.href = 'errorMetamask.html';
        }
    } catch (error) {
        console.error('Error connecting to MetaMask:', error.message);
        alert('Error connecting to MetaMask: ' + error.message);
    }
}

async function mostrarDatosPacienteAdmin() {
    try {
        let dniPaciente = document.getElementById('dniPaciente').value;
        // Obtener datos del paciente
        let paciente = await miContrato.methods.obtenerDatosPaciente(dniPaciente).call({ from: accounts[0] });
        console.log(paciente);
        let datosPacienteContainer = document.getElementById('datosPacienteContainer');
        datosPacienteContainer.innerHTML = '';
        if (!paciente.datos.DNI) {
            datosPacienteContainer.innerHTML = '';
        } else {
            datosPacienteContainer.innerHTML += `<p class="text-left"><strong>DNI:</strong> ${dniPaciente}</p>`;
            datosPacienteContainer.innerHTML += `<p class="text-left"><strong>Centro Sanitario:</strong> ${paciente.centro_sanitario}</p>`;
            datosPacienteContainer.innerHTML += `<p class="text-left"><strong>Indice Médico Asignado:</strong> ${paciente.medico_asignado}</p>`;
            // Separa los datos del paciente utilizando el separador ':'
            let datosSeparados = paciente.datos_paciente.split(':');
            // Crea un array con los nombres de los campos
            let campos = ['Nombre Completo', 'Dirección', 'Nacionalidad', 'Fecha de Nacimiento', 'Alergias', 'Grupo Sanguíneo', 'Peso (kg)', 'Altura (cm)', 'Vacunas'];
            for (let i = 0; i < campos.length; i++) {
                datosPacienteContainer.innerHTML += `<p class="text-left"><strong>${campos[i]}:</strong> ${datosSeparados[i]}</p>`;
            }
        }
    } catch (error) {
        if (error.message.includes("Transaction has been reverted by the EVM")) {
            window.location.href = 'error.html';
        } else {
            document.getElementById('transactionResult').textContent = 'Error en la transacción: ' + error.message;
        }
    }
}

async function mostrarDatosPaciente() {
    try {
        let dniPaciente = document.getElementById('dniPaciente').value;

        // Obtener datos del paciente
        let paciente = await miContrato.methods.obtenerDatosPaciente(dniPaciente).call({ from: accounts[0]});
        let datosPacienteContainer = document.getElementById('datosPacienteContainer');
        datosPacienteContainer.innerHTML = '';
        if (!paciente.datos.DNI) {
            datosPacienteContainer.innerHTML = 'Debes introducir un DNI válido';
        } else {
            if (paciente.datos.direccionPublica.toLowerCase() == accounts[0]) {
                datosPacienteContainer.innerHTML += `<p class="text-left"><strong>DNI:</strong> ${dniPaciente}</p>`;
                datosPacienteContainer.innerHTML += `<p class="text-left"><strong>Centro Sanitario:</strong> ${paciente.centro_sanitario}</p>`;
                // Separa los datos del paciente utilizando el separador ':'
                let datosSeparados = paciente.datos_paciente.split(':');
                // Crea un array con los nombres de los campos
                let campos = ['Nombre Completo', 'Dirección', 'Nacionalidad', 'Fecha de Nacimiento', 'Alergias', 'Grupo Sanguíneo', 'Peso (kg)', 'Altura (cm)', 'Vacunas'];
                for (let i = 0; i < campos.length; i++) {
                    datosPacienteContainer.innerHTML += `<p class="text-left"><strong>${campos[i]}:</strong> ${datosSeparados[i]}</p>`;
                }
            } else {
                datosPacienteContainer.innerHTML = 'No tienes permisos para ver información de este paciente';
            }
        }
    } catch (error) {
        if (error.message.includes("Transaction has been reverted by the EVM")) {
            window.location.href = 'error.html';
        } else {
            document.getElementById('transactionResult').textContent = 'Error en la transacción: ' + error.message;
        }
    }
}


async function registrarEnfermero() {
    try {
        let direccionEnfermero = document.getElementById('direccionEnfermero').value;
        let dniEnfermero = document.getElementById('dniEnfermero').value;
        let especialidadEnfermero = document.getElementById('especialidadEnfermero').value;
        let centroSanitarioEnfermero = document.getElementById('centroSanitarioEnfermero').value;

        await miContrato.methods.registrarEnfermero(direccionEnfermero, dniEnfermero, especialidadEnfermero, centroSanitarioEnfermero).send({ from: accounts[0] });
        alert('Enfermero con DNI ' + dniEnfermero + ' registrado exitosamente.');
        window.location.href = 'index.html';

    } catch (error) {
        if (error.message.includes("Transaction has been reverted by the EVM")) {
            window.location.href = 'error.html';
        } else {
            document.getElementById('transactionResult').textContent = 'Error en la transacción: ' + error.message;
        }
    }
}


async function registrarMedico() {
    try {
        let direccionMedico = document.getElementById('direccionMedico').value;
        let dniMedico = document.getElementById('dniMedico').value;
        let especialidadMedico = document.getElementById('especialidadMedico').value;
        let centroSanitarioMedico = document.getElementById('centroSanitarioMedico').value;

        await miContrato.methods.registrarMedico(direccionMedico, dniMedico, especialidadMedico, centroSanitarioMedico).send({ from: accounts[0] });

        alert('Médico con DNI ' + dniMedico + ' registrado exitosamente.');
        window.location.href = 'index.html';

    } catch (error) {
        if (error.message.includes("Transaction has been reverted by the EVM")) {
            window.location.href = 'error.html';
        } else {
            document.getElementById('transactionResult').textContent = 'Error en la transacción: ' + error.message;
        }
    }
}
async function registrarPaciente() {
    try {
        let dniPaciente = document.getElementById('dniPaciente').value;
        let direccionPublicaPaciente = document.getElementById('direccionPublicaPaciente').value;
        let centroSanitarioPaciente = document.getElementById('centroSanitarioPaciente').value;

        // Agrupa los datos del paciente con el separador ":"
        let datosPaciente = [
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
        await miContrato.methods.registrarPaciente(dniPaciente, centroSanitarioPaciente, datosPaciente, direccionPublicaPaciente).send({ from: accounts[0] });
        alert('Paciente con DNI ' + dniPaciente + ' registrado exitosamente.');
        window.location.href = 'index.html';
    } catch (error) {
        if (error.message.includes("Transaction has been reverted by the EVM")) {
            window.location.href = 'error.html';
        } else {
            document.getElementById('transactionResult').textContent = 'Error en la transacción: ' + error.message;
        }
    }
}

async function solicitarCita() {
    try {
        let fechaCita = document.getElementById('fechaCita').value;
        let horaCita = document.getElementById('horaCita').value;
        let datosConsulta = document.getElementById('datosConsulta').value;
        let tipoConsulta = document.getElementById('tipoConsulta').value;
        let dniPaciente = document.getElementById('dniPaciente').value;

        // Validar que la fecha de la cita no sea anterior a hoy
        let today = new Date().toISOString().split('T')[0];
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
            window.location.href = 'error.html';
        } else {
            document.getElementById('transactionResult').textContent = 'Error en la transacción: ' + error.message;
        }
    }
}

async function modificarCita() {
    try {
        let urlParams = new URLSearchParams(window.location.search);
        let indiceCita = parseInt(urlParams.get('indice'));
        let citas = await miContrato.methods.obtenerCitas().call({ from: accounts[0] });
        let nuevaFecha = document.getElementById('nuevaFecha').value;
        let nuevaHora = document.getElementById('nuevaHora').value;
        let datosCita = document.getElementById('motivoCita').value;
        let nuevoTipoConsulta = document.getElementById('nuevoTipoConsulta').value;

        // Validaciones y permisos
        if (indiceCita < 0 || indiceCita >= citas.length) {
            alert('Índice de cita no válido.');
            return;
        }
        let cita = citas[indiceCita];

        if (cita.medico.datos.direccionPublica.toLowerCase() !== accounts[0].toLowerCase() &&
            cita.paciente.datos.direccionPublica.toLowerCase() !== accounts[0].toLowerCase()) {
            alert('No tienes permisos suficientes para modificar esta cita.');
            return;
        }
        nuevaFecha = Date.parse(nuevaFecha + ' ' + nuevaHora) / 1000; // Convierte la fecha y hora a un timestamp Unix
        nuevaHora= parseInt(nuevaHora); // Convierte la hora a un entero
        let today = new Date().toISOString().split('T')[0];
        if (nuevaFecha < today) {
            alert('No se pueden programar citas anteriores a este momento.');
            return;
        }
        await miContrato.methods.modificarCita(indiceCita, datosCita, cita.paciente, nuevaFecha, nuevaHora, nuevoTipoConsulta)
        .send({ from: accounts[0] });
        alert('Cita modificada exitosamente.');
        window.location.href = 'index.html';
    } catch (error) {
        if (error.message.includes("Transaction has been reverted by the EVM")) {
            alert('No se puede establecer la cita.');
        } else {
            document.getElementById('transactionResult').textContent = 'Error en la transacción: ' + error.message;
        }
    }
}


async function atenderConsulta() {
    try {
        let urlParams = new URLSearchParams(window.location.search);
        let indiceConsulta = parseInt(urlParams.get('indice'));
        let consultas = await miContrato.methods.obtenerConsultas().call({ from: accounts[0] });
        if (indiceConsulta < 0 || indiceConsulta >= consultas.length) {
            return;
        }
        let consulta = consultas[indiceConsulta];
        let motivoConsulta = document.getElementById('motivoConsulta').value;
        let problemaSalud = document.getElementById('problemaSalud').value;
        let examenesRealizados = document.getElementById('examenesRealizados').value;
        let medicacionPropuesta = document.getElementById('medicacionPropuesta').value;
        let tiempoEntreTomas = document.getElementById('tiempoEntreTomas').value;
        let dosis = document.getElementById('dosis').value;
        let datosConsultaAtender = `${motivoConsulta}:${examenesRealizados}:${problemaSalud}:${medicacionPropuesta}:${tiempoEntreTomas}:${dosis}`;
        let result = await miContrato.methods.atenderConsulta(
            consulta.paciente.datos.DNI,
            consulta.fecha,
            consulta.hora,
            datosConsultaAtender
        ).send({ from: accounts[0] });
        alert('Consulta atendida exitosamente.');
        window.location.href = 'index.html';
    } catch (error) {
        if (error.message.includes("Transaction has been reverted by the EVM")) {
            window.location.href = 'error.html';
        } else {
            document.getElementById('transactionResult').textContent = 'Error en la transacción: ' + error.message;
        }
    }
}

function timestampAFecha(timestamp) {
    let fecha = new Date(timestamp * 1000); // Multiplicar por 1000 si el timestamp está en segundos
    return fecha.toLocaleDateString() + ' ' + fecha.toLocaleTimeString();
}

async function mostrarCitas() {
    try {
        let listaCitas = document.getElementById('listaCitasConsultas');
        listaCitas.innerHTML = '';
        let citas = await miContrato.methods.obtenerCitas().call({ from: accounts[0] });
        console.log(citas);
        // Obtiene la fecha actual
        let fechaActual = new Date().getTime() / 1000; // Convierte a segundos
        citas.forEach((cita, index) => {
            if (cita.paciente.datos.direccionPublica.toLowerCase() == accounts[0] && cita.fecha > fechaActual) {
                let li = document.createElement('li');
                li.classList.add('lista-item');
                let fechaFormateada = timestampAFecha(cita.fecha);
                let tipoTexto = obtenerTextoTipoConsulta(cita.tipoConsulta);
                li.innerHTML = `<strong>Fecha:</strong>${fechaFormateada}<br><strong>Tipo:</strong>${tipoTexto}<br><strong>Motivo:</strong>${cita.datos_cita}<br>`;

                let botonModificar = document.createElement('button');
                botonModificar.textContent = 'Modificar Cita';
                botonModificar.classList.add('boton-modificar-cita');
                botonModificar.addEventListener('click', function () {
                    // Redirige a modificarCita.html con el índice de la cita
                    window.location.href = `modificarCita.html?indice=${index}`;
                });

                li.appendChild(botonModificar);
                listaCitas.appendChild(li);
            }
        });
    } catch (error) {
        if (error.message.includes("Transaction has been reverted by the EVM")) {
            window.location.href = 'error.html';
        } else {
            document.getElementById('transactionResult').textContent = 'Error en la transacción: ' + error.message;
        }
    }
}



async function mostrarConsultas() {
    try {
        let listaConsultas = document.getElementById('listaConsultas');
        listaConsultas.innerHTML = '';
        let consultas = await miContrato.methods.obtenerConsultas().call({ from: accounts[0] });
        consultas.forEach(consulta => {
            if (consulta.paciente.datos.direccionPublica.toLowerCase() == accounts[0]) {
                let li = document.createElement('li');
                li.classList.add('lista-item');
                let fechaFormateada = timestampAFecha(consulta.fecha);
                let estadoTexto = obtenerTextoEstadoConsulta(consulta.estado);
                let tipoTexto = obtenerTextoTipoConsulta(consulta.tipo);
                li.innerHTML = '';
                if (estadoTexto != 'Programada') { //Solo muestra consultas atendidas
                    li.innerHTML += `<strong>Fecha:</strong> ${fechaFormateada}<br><strong>Estado:</strong>${estadoTexto}<br><strong>Tipo:</strong> ${tipoTexto}`;
                    let datosConsultaArray = consulta.datos_consulta.split(':');
                    let motivoConsulta = datosConsultaArray[0];
                    let examenesRealizados = datosConsultaArray[1];
                    let problemaSalud = datosConsultaArray[2];
                    let medicacionPropuesta = datosConsultaArray[3];
                    let tiempoEntreTomas = datosConsultaArray[4];
                    let dosis = datosConsultaArray[5];
                    li.innerHTML += `<br><strong>Motivo:</strong> ${motivoConsulta}<br>
                    <strong>Examenes realizados:</strong> ${examenesRealizados}<br>
                    <strong>Problema de salud:</strong> ${problemaSalud}<br>
                    <strong>Medicación propuesta:</strong> ${medicacionPropuesta}<br>
                    <strong>Tiempo entre tomas:</strong> ${tiempoEntreTomas}<br>
                    <strong>Dosis:</strong> ${dosis}
                `;
                    listaConsultas.appendChild(li);
                }
            }
        });
    } catch (error) {
        if (error.message.includes("Transaction has been reverted by the EVM")) {
            window.location.href = 'error.html';
        } else {
            document.getElementById('transactionResult').textContent = 'Error en la transacción: ' + error.message;
        }
    }
}

async function comprobarConsultasProgramadas() {
    try {
        let consultasProgramadas = await miContrato.methods.obtenerConsultas().call({ from: accounts[0] });
        let listaConsultasProgramadas = document.getElementById('listaConsultasProgramadas');
        listaConsultasProgramadas.innerHTML = '';
        let num_consultas = 0;
        consultasProgramadas.forEach((consulta, index) => {
            if (consulta.medico.datos.direccionPublica.toLowerCase() === accounts[0].toLowerCase() && consulta.estado == 0) {
                num_consultas++;
                let li = document.createElement('li');
                li.classList.add('lista-item');
                let fechaFormateada = timestampAFecha(consulta.fecha);
                let tipoTexto = obtenerTextoTipoConsulta(consulta.tipo);
                li.innerHTML = `<strong>Paciente:</strong>${consulta.paciente.datos.DNI}<br><strong>Fecha:</strong>${fechaFormateada}<br><strong>Tipo:</strong>${tipoTexto}<br>`;
                let enlace = document.createElement('a');
                enlace.setAttribute('href', `atenderConsulta.html?indice=${index}`);
                enlace.appendChild(li);
                listaConsultasProgramadas.appendChild(enlace);
            }
        });
        if (num_consultas == 0) {
            let li = document.createElement('li');
            li.classList.add('lista-item');
            li.innerHTML = 'No hay consultas programadas';
            listaConsultasProgramadas.appendChild(li);
        }
    } catch (error) {
        if (error.message.includes("Transaction has been reverted by the EVM")) {
            window.location.href = 'error.html';
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
            window.location.href = 'preatenderConsulta.html';
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