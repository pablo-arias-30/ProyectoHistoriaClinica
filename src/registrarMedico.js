// Agrega tus funciones JavaScript aquí
async function registrarMedico() {
    try {
        if (typeof window.ethereum !== 'undefined') {
            // Conecta la aplicación a MetaMask
            await window.ethereum.enable();
            const web3MetaMask = new Web3(window.ethereum);
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            const contractAddress = '0x9e8c07fc1D181F53f76BCC1948a066fC1322DC71';
            const response = await fetch('../contracts/HistoriaClinica.json');
            const Codabi = await response.json();
            // Crea una instancia del contrato
            const miContrato = new web3MetaMask.eth.Contract(Codabi.abi, contractAddress);
            // Obtiene los valores del formulario
            const direccionMedico = document.getElementById('direccionMedico').value;
            const dniMedico = document.getElementById('dniMedico').value;
            const especialidadMedico = document.getElementById('especialidadMedico').value;
            const centroSanitarioMedico = document.getElementById('centroSanitarioMedico').value;

            // Llama a la función del contrato para registrar médicos
            await miContrato.methods.registrarMedico(direccionMedico, dniMedico, especialidadMedico, centroSanitarioMedico).send({ from: accounts[0] });

            // Actualiza la interfaz o muestra un mensaje de éxito
            alert('Médico registrado exitosamente.');
        }
    } catch (error) {
        document.getElementById('transactionResult').textContent = 'Error en la transacción: ' + error.message;
    }
}
