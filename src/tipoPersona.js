const contract = new web3.eth.Contract("../contracts/HistoriaClinica.json", "0x34CB52ab6934236A8AAa662d1791BecbD2f29CEb");

const direccionesPacientes = await historiaClinica.methods.direccionesPacientes().call();
const direccionesMedicos = await historiaClinica.methods.direccionesMedicos().call();

// Función para determinar el tipo de persona
function getPersonaType(address) {
    if (direccionesPacientes.includes(address)) {
        return 'Paciente';
    } else if (direccionesMedicos.includes(address)) {
        return 'Médico';
    } else if (enfermerosAddresses.includes(address)) {
        return 'Enfermero';
    } else {
        return 'Desconocido';
    }
}

// Función para mostrar la lista de personas en la interfaz
function mostrarListaPersonas() {
    const personList = document.getElementById('personList');
    personList.innerHTML = '';

    direccionesPacientes.forEach((address) => {
        const listItem = document.createElement('li');
        listItem.className = 'list-group-item';
        listItem.textContent = `Dirección: ${address}, Tipo: ${getPersonaType(address)}`;
        personList.appendChild(listItem);
    });

    direccionesMedicos.forEach((address) => {
        const listItem = document.createElement('li');
        listItem.className = 'list-group-item';
        listItem.textContent = `Dirección: ${address}, Tipo: ${getPersonaType(address)}`;
        personList.appendChild(listItem);
    });

    enfermerosAddresses.forEach((address) => {
        const listItem = document.createElement('li');
        listItem.className = 'list-group-item';
        listItem.textContent = `Dirección: ${address}, Tipo: ${getPersonaType(address)}`;
        personList.appendChild(listItem);
    });
}

// Llama a la función para mostrar la lista de personas
mostrarListaPersonas();