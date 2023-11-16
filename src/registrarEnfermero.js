// Agrega tus funciones JavaScript aquí
async function registrarEnfermero() {
    try {
        if (typeof window.ethereum !== 'undefined') {
            // Conecta la aplicación a MetaMask
            await window.ethereum.enable();
            const web3MetaMask = new Web3(window.ethereum);
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            const contractAddress = '0xDFCA09868a46C440148544958E1De1FC96A56409'; // Cambia esto con la dirección de tu contrato
            const response = await fetch('../build/contracts/HistoriaClinica.json');
            const Codabi = await response.json();
            // Crea una instancia del contrato
            const miContrato = new web3MetaMask.eth.Contract(Codabi.abi, contractAddress);
            // Obtiene los valores del formulario
            const direccionEnfermero = document.getElementById('direccionEnfermero').value;
            const dniEnfermero = document.getElementById('dniEnfermero').value;
            const especialidadEnfermero = document.getElementById('especialidadEnfermero').value;
            const centroSanitarioEnfermero = document.getElementById('centroSanitarioEnfermero').value;

            // Llama a la función del contrato para registrar enfermeros
            await miContrato.methods.registrarEnfermero(direccionEnfermero, dniEnfermero, especialidadEnfermero, centroSanitarioEnfermero).send({ from: accounts[0] });

            // Actualiza la interfaz o muestra un mensaje de éxito
            alert('Enfermero registrado exitosamente.');
        }
    } catch (error) {
        document.getElementById('transactionResult').textContent = 'Error en la transacción: ' + error.message;
    }
}
