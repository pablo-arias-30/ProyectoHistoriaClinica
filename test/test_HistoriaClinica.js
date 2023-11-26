const HistoriaClinica = artifacts.require('./HistoriaClinica.sol');

contract('HistoriaClinica', (accounts) => {
  let historiaClinica;
  const medicoAddress = '0x571377f2e4D2B1b81d80538466C3c5741d8fFc30';
  const pacienteAddress = '0x44de9f9e79aAdfB395A3Ae13F619a99Da34eC308';

  beforeEach(async () => {
    historiaClinica = await HistoriaClinica.new({ from: accounts[0] });
  });


  it('Registrar un nuevo médico', async () => {
    const DNI_Medico = '987654321';
    const especialidad = 'Pediatría';
    const centroSanitario = 'Hospital Infantil';

    await historiaClinica.registrarMedico(accounts[2], DNI_Medico, especialidad, centroSanitario, { from: accounts[0] });

    const medico = await historiaClinica.medicos(0);
    assert.equal(medico.datos.direccionPublica, accounts[2], 'La dirección del médico es incorrecta');
    assert.equal(medico.especialidad, especialidad, 'La especialidad del médico es incorrecta');
    assert.equal(medico.centro_sanitario, centroSanitario, 'El centro sanitario del médico es incorrecto');
  });

  it('Registrar un nuevo paciente y asignar un médico', async () => {
    const DNI_Paciente = '123456789';
    const centroSanitario = 'Hospital Público';
    const datosPaciente = 'Información del paciente';

    await historiaClinica.registrarMedico(medicoAddress, '111111111', 'General', centroSanitario, { from: accounts[0] });

    await historiaClinica.registrarPaciente(DNI_Paciente, centroSanitario, datosPaciente, pacienteAddress, { from: accounts[0] });

    const paciente = await historiaClinica.pacientes(DNI_Paciente);
    assert.equal(paciente.datos.direccionPublica, pacienteAddress, 'La dirección del paciente es incorrecta');
    assert.equal(paciente.centro_sanitario, centroSanitario, 'El centro sanitario del paciente es incorrecto');
  });

  it('Registrar un nuevo enfermero', async () => {
    const DNI_Enfermero = '456789123';
    const especialidad = 'Cuidados Intensivos';
    const centroSanitario = 'Clínica Privada';

    await historiaClinica.registrarEnfermero(accounts[3], DNI_Enfermero, especialidad, centroSanitario, { from: accounts[0] });

    const enfermero = await historiaClinica.enfermeros(0);
    assert.equal(enfermero.datos.direccionPublica, accounts[3], 'La dirección del enfermero es incorrecta');
    assert.equal(enfermero.especialidad, especialidad, 'La especialidad del enfermero es incorrecta');
    assert.equal(enfermero.centro_sanitario, centroSanitario, 'El centro sanitario del enfermero es incorrecto');
  });

  it('Solicitar una cita', async () => {
    const DNI_Paciente = '123456789';
    const fecha = Math.floor(Date.now() / 1000) + 3600; // Obtener el timestamp actual en segundos
    const hora = 10;
    const tipoConsulta = 0; // Tipo de consulta de urgencia
    const centroSanitario = 'Clínica Privada';
    const datosPaciente = 'Información del paciente';

    await historiaClinica.registrarMedico(medicoAddress, '111111111', 'General', centroSanitario, { from: accounts[0] });
    await historiaClinica.registrarPaciente(DNI_Paciente, centroSanitario, datosPaciente, pacienteAddress, { from: accounts[0] });

    await historiaClinica.solicitarCita(DNI_Paciente, fecha, hora, 'Consulta de rutina', tipoConsulta, { from: pacienteAddress });

    const cita = await historiaClinica.citas(0);
    assert.equal(cita.paciente.datos.DNI, DNI_Paciente, 'El DNI del paciente en la cita es incorrecto');
    assert.equal(cita.fecha, fecha, 'La fecha de la cita es incorrecta');
    assert.equal(cita.hora, hora, 'La hora de la cita es incorrecta');
    assert.equal(cita.tipoConsulta, tipoConsulta, 'El tipo de consulta en la cita es incorrecto');
  });

  it('Atender una consulta', async () => {
    const DNI_Paciente = '123456789';
    const fecha = Math.floor(Date.now() / 1000) + 3600;
    const hora = 10;
    const centroSanitario = 'Clínica Privada';
    const datosPaciente = 'Información del paciente';

    await historiaClinica.registrarMedico(medicoAddress, '111111111', 'General', centroSanitario, { from: accounts[0] });
    await historiaClinica.registrarPaciente(DNI_Paciente, centroSanitario, datosPaciente, pacienteAddress, { from: accounts[0] });

    await historiaClinica.solicitarCita(DNI_Paciente, fecha, hora, 'Consulta de rutina', 0, { from: pacienteAddress });

    await historiaClinica.atenderConsulta(DNI_Paciente, fecha, hora, 'Consulta atendida', { from: medicoAddress });

    const consulta = await historiaClinica.consultas(0);
    assert.equal(consulta.estado, 2, 'El estado de la consulta es incorrecto'); //Consulta cerrada
    assert.equal(consulta.datos_consulta, 'Consulta atendida', 'Los datos de la consulta son incorrectos');
  });

  it('Modificar una cita', async () => {
    const DNI_Paciente = '123456789';
    const fecha = Math.floor(Date.now() / 1000) + 3600; 
    const hora = 10;
    const nuevaFecha = fecha + 3600;
    const nuevaHora = 14;
    const nuevoTipoConsulta = 1; // Tipo de consulta de especialidad
    const centroSanitario = 'Clínica Privada';
    const datosPaciente = 'Información del paciente';

    await historiaClinica.registrarMedico(accounts[2], '111111111', 'General', centroSanitario, { from: accounts[0] });
    await historiaClinica.registrarPaciente(DNI_Paciente, centroSanitario, datosPaciente, accounts[1], { from: accounts[0] });

    await historiaClinica.solicitarCita(DNI_Paciente, fecha, hora, 'Consulta de rutina', 0, { from: accounts[1] });

    const citaAntes = await historiaClinica.citas(0);

    // Modificar la cita
    await historiaClinica.modificarCita(0, 'Nuevo motivo de consulta', citaAntes.paciente, nuevaFecha, nuevaHora, nuevoTipoConsulta, { from: pacienteAddress });

    // Obtener la cita modificada
    const citaDespues = await historiaClinica.citas(0);
    assert.equal(citaDespues.fecha, nuevaFecha, 'La nueva fecha de la cita es incorrecta');
    assert.equal(citaDespues.hora, nuevaHora, 'La nueva hora de la cita es incorrecta');
    assert.equal(citaDespues.datos_cita, 'Nuevo motivo de consulta', 'El nuevo motivo de consulta es incorrecto');
    assert.equal(citaDespues.tipoConsulta, nuevoTipoConsulta, 'El nuevo tipo de consulta es incorrecto');
  });

});
