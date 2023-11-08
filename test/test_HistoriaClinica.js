const HistoriaClinica = artifacts.require('./HistoriaClinica.sol');

contract('HistoriaClinica', (accounts) => {
  let historiaClinica;

  beforeEach(async () => {
    historiaClinica = await HistoriaClinica.new({ from: accounts[0] });
  });

  it('Registrar un nuevo paciente y asignar un médico', async () => {
    const DNI_Paciente = '123456789';
    const centroSanitario = 'Hospital Público';
    const datosPaciente = 'Información del paciente';
  
    // Registrar un médico general en el mismo centro sanitario
    await historiaClinica.registrarMedico(accounts[2], '111111111', 'General', centroSanitario, { from: accounts[0] });
  
    await historiaClinica.registrarPaciente(DNI_Paciente, centroSanitario, datosPaciente, { from: accounts[1] });
  
    const paciente = await historiaClinica.pacientes(DNI_Paciente);
    assert.equal(paciente.datos.direccionPublica, accounts[1], 'La dirección del paciente es incorrecta');
    assert.equal(paciente.centro_sanitario, centroSanitario, 'El centro sanitario del paciente es incorrecto');
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

    await historiaClinica.registrarMedico(accounts[2], '987654321', 'General', 'Hospital Público', { from: accounts[0] });
    await historiaClinica.registrarPaciente(DNI_Paciente, 'Hospital Público', 'Información del paciente', { from: accounts[1] });

    await historiaClinica.solicitarCita(DNI_Paciente, fecha, hora, 'Consulta de rutina', tipoConsulta, { from: accounts[1] });

    const cita = await historiaClinica.citas(0);
    assert.equal(cita.paciente.datos.DNI, DNI_Paciente, 'El DNI del paciente en la cita es incorrecto');
    assert.equal(cita.fecha, fecha, 'La fecha de la cita es incorrecta');
    assert.equal(cita.hora, hora, 'La hora de la cita es incorrecta');
    assert.equal(cita.tipoConsulta, tipoConsulta, 'El tipo de consulta en la cita es incorrecto');
  });

  it('Atender una consulta', async () => {
    const DNI_Paciente = '123456789';
    const fecha = Math.floor(Date.now() / 1000) + 3600; // Obtener el timestamp actual en segundos
    const hora = 10;

    await historiaClinica.registrarMedico(accounts[2], '987654321', 'General', 'Hospital Público', { from: accounts[0] });
    await historiaClinica.registrarPaciente(DNI_Paciente, 'Hospital Público', 'Información del paciente', { from: accounts[1] });

    await historiaClinica.solicitarCita(DNI_Paciente, fecha, hora, 'Consulta de rutina', 0, { from: accounts[1] });

    await historiaClinica.atenderConsulta(DNI_Paciente, fecha, hora, 'Consulta atendida', { from: accounts[2] });

    const consulta = await historiaClinica.consultas(0);
    assert.equal(consulta.estado, 2, 'El estado de la consulta es incorrecto');
    assert.equal(consulta.datos_consulta, 'Consulta atendida', 'Los datos de la consulta son incorrectos');
  });

  it('Modificar una cita', async () => {
    const DNI_Paciente = '123456789';
    const fecha = Math.floor(Date.now() / 1000) + 3600; // Obtener el timestamp actual en segundos
    const hora = 10;
    const nuevaFecha = fecha + 3600;
    const nuevaHora = 14;
    const nuevoTipoConsulta = 1; // Tipo de consulta de especialidad

    await historiaClinica.registrarMedico(accounts[2], '987654321', 'General', 'Hospital Público', { from: accounts[0] });
    await historiaClinica.registrarPaciente(DNI_Paciente, 'Hospital Público', 'Información del paciente', { from: accounts[1] });

    await historiaClinica.solicitarCita(DNI_Paciente, fecha, hora, 'Consulta de rutina', 0, { from: accounts[1] });

    await historiaClinica.modificarCita(0, { datos: { direccionPublica: accounts[2] } }, 'Nueva cita', { datos: { direccionPublica: accounts[1] } }, nuevaFecha, nuevaHora, nuevoTipoConsulta, { from: accounts[1] });

    const citaModificada = await historiaClinica.citas(0);
    assert.equal(citaModificada.fecha, nuevaFecha, 'La nueva fecha de la cita es incorrecta');
    assert.equal(citaModificada.hora, nuevaHora, 'La nueva hora de la cita es incorrecta');
    assert.equal(citaModificada.tipoConsulta, nuevoTipoConsulta, 'El nuevo tipo de consulta es incorrecto');
  });

  it('Crear una nueva consulta', async () => {
    const nuevaConsulta = {
      paciente: { datos: { DNI: '123456789', direccionPublica: accounts[1] } },
      medico: { datos: { direccionPublica: accounts[2] } },
      fecha : Math.floor(Date.now() / 1000) + 3600*2, // Obtener el timestamp actual en segundos
      hora: 16,
      datos_consulta: 'Consulta de seguimiento',
      estado: 0, // Estado de consulta programada
      tipo: 1, // Tipo de consulta de especialidad
    };

    await historiaClinica.crearConsulta(nuevaConsulta, { from: accounts[1] });

    const consulta = await historiaClinica.consultas(0);
    assert.equal(consulta.paciente.datos.DNI, nuevaConsulta.paciente.datos.DNI, 'El DNI del paciente en la consulta es incorrecto');
    assert.equal(consulta.fecha, nuevaConsulta.fecha, 'La fecha de la consulta es incorrecta');
    assert.equal(consulta.hora, nuevaConsulta.hora, 'La hora de la consulta es incorrecta');
    assert.equal(consulta.datos_consulta, nuevaConsulta.datos_consulta, 'Los datos de la consulta son incorrectos');
    assert.equal(consulta.estado, nuevaConsulta.estado, 'El estado de la consulta es incorrecto');
    assert.equal(consulta.tipo, nuevaConsulta.tipo, 'El tipo de consulta es incorrecto');
  });
});
