const HistoriaClinica = artifacts.require('./contracts/HistoriaClinica.sol');

contract('HistoriaClinica', (cuentas) => {
  let historiaClinica;

  // Desplegar el contrato antes de cada prueba
  beforeEach(async () => {
    historiaClinica = await HistoriaClinica.new({ from: cuentas[0] });
  });

  it('Registrar un nuevo paciente y asignar un médico', async () => {
    const DNI_Paciente = '123456789';
    const datosPaciente = ['123456789', 'Hospital Público'];

    // Registrar un nuevo paciente
    await historiaClinica.registrarPaciente(datosPaciente, { from: cuentas[1] });

    // Verificar si el paciente está registrado
    const paciente = await historiaClinica.pacientes(DNI_Paciente);
    assert.equal(paciente.datos.direccionPublica, cuentas[1], 'La dirección del paciente es incorrecta');
    assert.equal(paciente.centro_sanitario, 'Hospital Público', 'El centro sanitario del paciente es incorrecto');

    // Verificar si se asignó un médico al paciente
    const medicoAsignado = await historiaClinica.medicos(paciente.medico_asignado);
    assert.equal(medicoAsignado.datos.direccionPublica, cuentas[0], 'La dirección del médico es incorrecta');
  });

  it('Registrar un nuevo médico', async () => {
    const DNI_Medico = '987654321';
    const especialidad = 'Pediatría';
    const centroSanitario = 'Hospital Infantil';

    // Registrar un nuevo médico
    await historiaClinica.registrarMedico(cuentas[2], DNI_Medico, especialidad, centroSanitario, { from: cuentas[0] });

    // Verificar si el médico está registrado
    const medico = await historiaClinica.medicos(0);
    assert.equal(medico.datos.direccionPublica, cuentas[2], 'La dirección del médico es incorrecta');
    assert.equal(medico.especialidad, especialidad, 'La especialidad del médico es incorrecta');
    assert.equal(medico.centro_sanitario, centroSanitario, 'El centro sanitario del médico es incorrecto');
  });

  it('Registrar un nuevo enfermero', async () => {
    const DNI_Enfermero = '456789123';
    const especialidad = 'Cuidados Intensivos';
    const centroSanitario = 'Clínica Privada';

    // Registrar un nuevo enfermero
    await historiaClinica.registrarEnfermero(cuentas[3], DNI_Enfermero, especialidad, centroSanitario, { from: cuentas[0] });

    // Verificar si el enfermero está registrado
    const enfermero = await historiaClinica.enfermeros(0);
    assert.equal(enfermero.datos.direccionPublica, cuentas[3], 'La dirección del enfermero es incorrecta');
    assert.equal(enfermero.especialidad, especialidad, 'La especialidad del enfermero es incorrecta');
    assert.equal(enfermero.centro_sanitario, centroSanitario, 'El centro sanitario del enfermero es incorrecto');
  });

  it('Programar una cita', async () => {
    const DNI_Paciente = '123456789';
    const fecha = 1680000000;
    const hora = 10;
    const tipoConsulta = 1;

    // Registrar un nuevo paciente y asignar un médico
    await historiaClinica.registrarPaciente(['123456789', 'Hospital Público'], { from: cuentas[1] });
    await historiaClinica.registrarMedico(cuentas[2], '987654321', 'Pediatría', 'Hospital Infantil', { from: cuentas[0] });

    // Solicitar una cita para el paciente
    await historiaClinica.solicitarCita(DNI_Paciente, fecha, hora, 'Consulta de rutina', tipoConsulta, { from: cuentas[1] });

    // Verificar si la cita está programada
    const cita = await historiaClinica.citas(0);
    assert.equal(cita.paciente.datos.DNI, DNI_Paciente, 'El DNI del paciente en la cita es incorrecto');
    assert.equal(cita.fecha, fecha, 'La fecha de la cita es incorrecta');
    assert.equal(cita.hora, hora, 'La hora de la cita es incorrecta');
    assert.equal(cita.tipoConsulta, tipoConsulta, 'El tipo de consulta en la cita es incorrecto');
  });

  it('Atender una consulta', async () => {
    const DNI_Paciente = '123456789';
    const fecha = 1680000000;
    const hora = 10;

    // Registrar un nuevo paciente y asignar un médico
    await historiaClinica.registrarPaciente(['123456789', 'Hospital Público'], { from: cuentas[1] });
    await historiaClinica.registrarMedico(cuentas[2], '987654321', 'Pediatría', 'Hospital Infantil', { from: cuentas[0] });

    // Solicitar una cita para el paciente
    await historiaClinica.solicitarCita(DNI_Paciente, fecha, hora, 'Consulta de rutina', 1, { from: cuentas[1] });

    // Atender la consulta por el médico asignado
    await historiaClinica.atenderConsulta(DNI_Paciente, fecha, hora, 'Consulta atendida', { from: cuentas[2] });

    // Verificar si la consulta está cerrada
    const consulta = await historiaClinica.consultas(0);
    assert.equal(consulta.estado, 2, 'El estado de la consulta es incorrecto');
    assert.equal(consulta.datos_consulta, 'Consulta atendida', 'Los datos de la consulta son incorrectos');
  });

  it('Modificar una cita', async () => {
    const DNI_Paciente = '123456789';
    const fecha = 1680000000;
    const hora = 10;
    const nuevaFecha = 1700000000;
    const nuevaHora = 14;
    const nuevoTipoConsulta = 2;

    // Registrar un nuevo paciente y asignar un médico
    await historiaClinica.registrarPaciente(['123456789', 'Hospital Público'], { from: cuentas[1] });
    await historiaClinica.registrarMedico(cuentas[2], '987654321', 'Pediatría', 'Hospital Infantil', { from: cuentas[0] });

    // Solicitar una cita para el paciente
    await historiaClinica.solicitarCita(DNI_Paciente, fecha, hora, 'Consulta de rutina', 1, { from: cuentas[1] });

    // Modificar la cita
    await historiaClinica.modificarCita(0, { datos: { direccionPublica: cuentas[2] } }, 'Nueva cita', { datos: { direccionPublica: cuentas[1] } }, nuevaFecha, nuevaHora, nuevoTipoConsulta, { from: cuentas[1] });

    // Verificar si la cita se ha modificado correctamente
    const citaModificada = await historiaClinica.citas(0);
    assert.equal(citaModificada.fecha, nuevaFecha, 'La nueva fecha de la cita es incorrecta');
    assert.equal(citaModificada.hora, nuevaHora, 'La nueva hora de la cita es incorrecta');
    assert.equal(citaModificada.tipoConsulta, nuevoTipoConsulta, 'El nuevo tipo de consulta es incorrecto');
  });

  it('Crear una nueva consulta', async () => {
    const nuevaConsulta = {
      paciente: { datos: { DNI: '123456789', direccionPublica: cuentas[1] } },
      medico: { datos: { direccionPublica: cuentas[2] } },
      fecha: 1720000000,
      hora: 16,
      datos_consulta: 'Consulta de seguimiento',
      estado: 0,
      tipo: 1
    };

    // Crear una nueva consulta
    await historiaClinica.crearConsulta(nuevaConsulta, { from: cuentas[1] });

    // Verificar si la consulta se ha creado correctamente
    const consulta = await historiaClinica.consultas(0);
    assert.equal(consulta.paciente.datos.DNI, nuevaConsulta.paciente.datos.DNI, 'El DNI del paciente en la consulta es incorrecto');
    assert.equal(consulta.fecha, nuevaConsulta.fecha, 'La fecha de la consulta es incorrecta');
    assert.equal(consulta.hora, nuevaConsulta.hora, 'La hora de la consulta es incorrecta');
    assert.equal(consulta.datos_consulta, nuevaConsulta.datos_consulta, 'Los datos de la consulta son incorrectos');
    assert.equal(consulta.estado, nuevaConsulta.estado, 'El estado de la consulta es incorrecto');
    assert.equal(consulta.tipo, nuevaConsulta.tipo, 'El tipo de consulta es incorrecto');
  });
});
