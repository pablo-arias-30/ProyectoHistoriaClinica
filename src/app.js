// Función para obtener el hash de los nodos activos
async function obtenerHashNodosActivos() {
  try {
      if (typeof window.ethereum !== 'undefined') {
          // Conecta la aplicación a MetaMask
          await window.ethereum.enable();
          const web3MetaMask = new Web3(window.ethereum);
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          const nodeId = await web3MetaMask.eth.getNodeInfo();
          const peerCount = await web3MetaMask.eth.net.getPeerCount();
          const contractAddress = '0xDFCA09868a46C440148544958E1De1FC96A56409';
          const response = await fetch('../build/contracts/HistoriaClinica.json');
          const Codabi = await response.json();
          // Crea una instancia del contrato
          const miContrato = new web3MetaMask.eth.Contract(Codabi.abi, contractAddress);
          console.log("Dirección del contrato:", miContrato.options.address);
          console.log("Interfaz del contrato (ABI):", miContrato.options.jsonInterface);
          console.log("Funciones del contrato:", miContrato.methods);
          const senderAddress = web3MetaMask.eth.defaultAccount;
          console.log(senderAddress);         
          // Ejecuta la transacción
          /*const result = await miContrato.methods.registrarMedico('0x742d35Cc6634C0532925a3b844Bc454e4438f44e', '123456789', 'General', 'ramon y cajal').send({from:accounts[0]});
          console.log(result);



          // Actualiza el resultado de la transacción en el HTML
          document.getElementById('transactionResult').textContent = 'Transacción exitosa: ' + result.transactionHash;
*/
          // Cálculo del hash
          const hash = web3MetaMask.utils.soliditySha3({ t: 'string', v: nodeId }, { t: 'uint', v: peerCount });

          // Muestra el resultado
          const outputElement = document.getElementById('output');
          outputElement.innerHTML = `<p>Node ID: ${nodeId}</p>`;
          outputElement.innerHTML += `<p>Peer Count: ${peerCount}</p>`;
          outputElement.innerHTML += `<p>Hash de Nodos Activos: ${hash}</p>`;
      } else {
          console.log("Error con Metamask");
      }
  } catch (error) {
      document.getElementById('transactionResult').textContent = 'Error en la transacción: ' + error.message;
  }
}

//realizarTransaccion();

