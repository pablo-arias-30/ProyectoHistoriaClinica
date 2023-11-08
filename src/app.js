async function realizarTransaccion() {
    try {
        const result = await miContrato.methods.await.registrarMedico("0x742d35Cc6634C0532925a3b844Bc454e4438f44e", "123456789", "General", "ramon y cajal").send({ from: web3MetaMask.eth.defaultAccount });
        // Actualiza el resultado de la transacción en el HTML
        document.getElementById('transactionResult').textContent = 'Transacción exitosa: ' + result.transactionHash;
    } catch (error) {
        console.error('Error en la transacción:', error);

        // En caso de error, muestra el mensaje de error
        document.getElementById('transactionResult').textContent = 'Error en la transacción: ' + error.message;
    }
}


// Función para obtener el hash de los nodos activos
async function obtenerHashNodosActivos() {
    try {
        if (typeof window.ethereum !== 'undefined') {
            // Conecta la aplicación a MetaMask
            await window.ethereum.enable();
            const web3MetaMask = new Web3(window.ethereum);

            const nodeId = await web3MetaMask.eth.getNodeInfo();
            const peerCount = await web3MetaMask.eth.net.getPeerCount();

            // Cálculo del hash
            const hash = web3MetaMask.utils.soliditySha3({ t: 'string', v: nodeId }, { t: 'uint', v: peerCount });

            // Muestra el resultado de
            const outputElement = document.getElementById('output');
            outputElement.innerHTML = `<p>Node ID: ${nodeId}</p>`;
            outputElement.innerHTML += `<p>Peer Count: ${peerCount}</p>`;
            outputElement.innerHTML += `<p>Hash de Nodos Activos: ${hash}</p>`;
        } else {
            console.error('MetaMask no está instalado o no está disponible en este navegador.');
        }
    } catch (error) {
        console.error('Error al obtener información de los nodos:', error);
    }
}
//realizarTransaccion();

obtenerHashNodosActivos();
