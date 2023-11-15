async function cargarInformacion() {
    try {
        if (typeof window.ethereum !== 'undefined') {
            await window.ethereum.enable();
            const web3MetaMask = new Web3(window.ethereum);
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            const contractAddress = '0x9e8c07fc1D181F53f76BCC1948a066fC1322DC71';
            const response = await fetch('../contracts/HistoriaClinica.json');
            const Codabi = await response.json();
            const miContrato = new web3MetaMask.eth.Contract(Codabi.abi, contractAddress);

            const listaPacientes = await miContrato.methods.getPacientes().call({ from: accounts[0] });
            const listaPacientesElement = document.getElementById('listaPacientes');
            listaPacientesElement.innerHTML = '';
            listaPacientes.forEach(paciente => {
                const li = document.createElement('li');
                li.textContent = `DNI: ${paciente.DNI}, Centro Sanitario: ${paciente.centro_sanitario}`;
                listaPacientesElement.appendChild(li);
            });

            const listaEnfermeros = await miContrato.methods.getEnfermeros().call({ from: accounts[0] });
            const listaEnfermerosElement = document.getElementById('listaEnfermeros');
            listaEnfermerosElement.innerHTML = '';
            listaEnfermeros.forEach(enfermero => {
                const li = document.createElement('li');
                li.textContent = `DNI: ${enfermero.DNI}, Especialidad: ${enfermero.especialidad}, Centro Sanitario: ${enfermero.centro_sanitario}`;
                listaEnfermerosElement.appendChild(li);
            });
        }
    } catch (error) {
        console.error('Error al cargar la información:', error.message);
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
        default:
            break;
    }
}
