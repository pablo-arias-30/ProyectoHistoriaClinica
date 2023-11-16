// Agrega tus funciones JavaScript aquí
async function registrarPaciente() {
    try {
        if (typeof window.ethereum !== 'undefined') {
            // Conecta la aplicación a MetaMask
            await window.ethereum.enable();
            const web3MetaMask = new Web3(window.ethereum);
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            const contractAddress = '0xDFCA09868a46C440148544958E1De1FC96A56409';
            const response = await fetch('../build/contracts/HistoriaClinica.json');
            const Codabi = await response.json();
            console.log(Codabi.abi);
            // Crea una instancia del contrato
            const miContrato = new web3MetaMask.eth.Contract(Codabi.abi, contractAddress);
            // Obtiene los valores del formulario
            const dniPaciente = document.getElementById('dniPaciente').value;
            const centroSanitarioPaciente = document.getElementById('centroSanitarioPaciente').value;
            const datosPaciente = document.getElementById('datosPaciente').value;

            // Llama a la función del contrato para registrar pacientes
            await miContrato.methods.registrarPaciente(dniPaciente, centroSanitarioPaciente, datosPaciente).send({ from: accounts[0] });

            // Actualiza la interfaz o muestra un mensaje de éxito
            alert('Paciente registrado exitosamente.');
        }
    } catch (error) {
        document.getElementById('transactionResult').textContent = 'Error en la transacción: ' + error.message;
    }
}
