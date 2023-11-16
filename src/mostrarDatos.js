async function mostrarDatos(){
    try {
        if (typeof window.ethereum !== 'undefined') {
            await window.ethereum.enable();
            const web3MetaMask = new Web3(window.ethereum);
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            const contractAddress = '0xDFCA09868a46C440148544958E1De1FC96A56409'; // Coloca la dirección de tu contrato aquí
            const response = await fetch('../build/contracts/HistoriaClinica.json');
            const Codabi = await response.json();
            const miContrato = new web3MetaMask.eth.Contract(Codabi.abi, contractAddress);

            // Obtener datos de pacientes
            const dniPaciente = document.getElementById('dniPaciente').value;
            const pacientes = await miContrato.methods.obtenerDatosPaciente(dniPaciente).send({ from: accounts[0] });
            const paciente = await miContrato.methods.obtenerDatosPaciente(dniPaciente).call({ from: accounts[0] });

            // Mostrar datos del paciente
            const datosPacienteContainer = document.getElementById('datosPacienteContainer');
            datosPacienteContainer.innerHTML = `
                <p>DNI: ${paciente.DNI}</p>
                <p>Centro Sanitario: ${paciente.centro_sanitario}</p>
                <p>Médico Asignado: ${paciente.medico_asignado}</p>
            `;

            // Obtener datos de médicos
            const medicos = await miContrato.methods.obtenerMedicos().send({ from: accounts[0] });
            const listaMedicos = document.getElementById('listaMedicos');
            medicos.forEach(medico => {
                const li = document.createElement('li');
                li.textContent = `DNI: ${medico.datos.DNI}, Especialidad: ${medico.especialidad}, Centro Sanitario: ${medico.centro_sanitario}`;
                listaMedicos.appendChild(li);
            });

            // Obtener datos de enfermeros
            const enfermeros = await miContrato.methods.obtenerEnfermeros().send({ from: accounts[0] });
            const listaEnfermeros = document.getElementById('listaEnfermeros');
            enfermeros.forEach(enfermero => {
                const li = document.createElement('li');
                li.textContent = `DNI: ${enfermero.datos.DNI}, Especialidad: ${enfermero.especialidad}, Centro Sanitario: ${enfermero.centro_sanitario}`;
                listaEnfermeros.appendChild(li);
            });
        }
    } catch (error) {
        console.error('Error:', error);
    }
};
