// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract HistoriaClinica {
    mapping(string => Paciente) public pacientes;
    Medico[] public medicos;
    Enfermero[] public enfermeros;
     Cita[] public citas;
    Consulta[] public consultas;

    address public owner;

    constructor() {
        owner = msg.sender; // el primer usuario en crear el contrato se convierte en el owner o admin
    }

    enum tipo_consulta {
        urgencias,
        especialidad
    }
    enum tipo_organizacion {
        publica,
        privada
    }
    enum estado_consulta {
        programada,cancelada,cerrada
    }

    struct Persona {
        address direccionPublica;
        string DNI;
    }

    struct Paciente {
        Persona datos;
        string centro_sanitario;
        uint medico_asignado;
        string datos_paciente;
    }

    struct Medico {
        Persona datos; //Herencia
        string especialidad;
        string centro_sanitario;
        uint numero_pacientes;
    }

    struct Enfermero {
        Persona datos; //Herencia
        string especialidad;
        string centro_sanitario;
    }
    
    struct Consulta {
        Paciente paciente;
        Medico medico;
        uint8 hora;
        uint256 fecha;
        string datos_consulta;
        estado_consulta estado;
        tipo_consulta tipo;
    }

    struct Cita {
        Paciente paciente;
        Medico medico;
        uint fecha;
        uint8 hora;
        string datos_cita;
        tipo_consulta tipoConsulta;
    }

function registrarPaciente(string memory _DNI, string memory _centroSanitario, string memory _datosPaciente) public {
    require(pacientes[_DNI].datos.direccionPublica == address(0), "Este paciente ya esta registrado");
    Persona memory datosPersonales = Persona({
    direccionPublica: msg.sender,
    DNI: _DNI
});

pacientes[_DNI] = Paciente({
    centro_sanitario: _centroSanitario,
    datos: datosPersonales,
    medico_asignado: type(uint256).max, //aún no tiene médico asignado
    datos_paciente: _datosPaciente
});
asignarMedico(_DNI);

}

    function registrarMedico(address _direccionMedico, string memory _DNI, string memory _especialidad, string memory _centro_sanitario) public {
    require(msg.sender == owner, "Solo el administrador tiene permisos para ejecutar esta funcion");
        Persona memory datosPersonales = Persona(_direccionMedico,_DNI);
        medicos.push(Medico({
        centro_sanitario: _centro_sanitario,
        datos:datosPersonales,
        especialidad: _especialidad,
        numero_pacientes:0
    }));
}

 function registrarEnfermero(address _direccionEnfermero ,string memory _DNI, string memory _especialidad, string memory _centro_sanitario) public {
        require(msg.sender == owner, "Solo el administrador tiene permisos para ejecutar esta funcion");
        Persona memory datosPersonales = Persona (_direccionEnfermero,_DNI);
        enfermeros.push(Enfermero({
        especialidad: _especialidad,
        centro_sanitario: _centro_sanitario,
        datos : datosPersonales
    }));

    }

    function asignarMedico(string memory _DNI) public returns (uint) {
        // Comprobamos si hay médicos disponibles
         require(medicos.length > 0, "No hay medicos disponibles");
        uint i = 0;
        Paciente memory p = pacientes[_DNI]; //Buscamos el indice del paciente por DNI
        string memory nombreCentroSanitario = p.centro_sanitario; // Obtenemos centro sanitario del paciente
        uint indiceMedicoConMenosPacientes; //Posicion del array del medico con menos pacientes
        uint256 minimoPacientes = type(uint256).max;
        while (i < medicos.length) {
            //Comprobamos especialidad, centro sanitario, y obtenemos el médico con menos pacientes asignados
            if (
                keccak256(bytes(medicos[i].especialidad)) ==
                keccak256(bytes("General")) &&
                keccak256(bytes(medicos[i].centro_sanitario)) ==
                keccak256(bytes(nombreCentroSanitario)) &&
                medicos[i].numero_pacientes < minimoPacientes
            ) {
                minimoPacientes = medicos[i].numero_pacientes;
                indiceMedicoConMenosPacientes = i; //Médico válido encontrado
            }
            i++;
        }
        medicos[indiceMedicoConMenosPacientes].numero_pacientes++; //Aumentamos pacientes de ese médico
        pacientes[_DNI].medico_asignado=indiceMedicoConMenosPacientes; //Asignamos médico al paciente
        return indiceMedicoConMenosPacientes;
    }

    
 //Paciente pide una cita
function solicitarCita(string memory _DNI, uint256 _fecha, uint8 _hora, string memory _datos_consulta, string memory _datos_cita, tipo_consulta _tipoConsulta) public {
    require(pacientes[_DNI].medico_asignado < type(uint256).max, "El paciente no tiene un medico asignado");
    require(_hora >= 8 && _hora <= 18, "La clinica solo atiende entre las 8:00 y las 18:00.");
    require(_fecha >= block.timestamp, "No se pueden programar citas anteriores a este momento.");

    bool huecoLibre = true;
    Paciente memory paciente = pacientes[_DNI];
    Medico memory medico = medicos[paciente.medico_asignado]; //Medico que el paciente tiene asignado
    for (uint i = 0; i < citas.length && citas[i].fecha>block.timestamp; i++) { 
        //Comprobamos que sea el medico que tiene asignado el paciente 
        if(citas[i].medico.datos.direccionPublica == medico.datos.direccionPublica){ 
        //Comprobamos que haya un rango de 15 minutos disponibles despues de la cita
        if (citas[i].fecha == _fecha && citas[i].hora == _hora || citas[i].fecha == _fecha && citas[i].hora > _hora - 15 minutes) {
            huecoLibre = false;
            }
            }
    }
        if (huecoLibre) {
    //Asignamos la nueva cita
        citas.push(
        Cita({
            medico: medico,
            paciente: paciente,
            fecha: _fecha,
            hora: _hora,
            datos_cita:_datos_cita,
            tipoConsulta: _tipoConsulta
        }));

    //Creamos la consulta
        consultas.push(
        Consulta({
        paciente:paciente,
        medico:medico,
        fecha: _fecha,
        hora:_hora,
        datos_consulta:_datos_consulta,
        estado: estado_consulta.programada,
        tipo: _tipoConsulta
    }));

    } else {
        revert("No hay hueco libre para la cita en el horario solicitado para el paciente sugerido.");
    }

}
 
function atenderConsulta (string memory _DNI, uint _fecha, uint _hora, string memory _datos_consulta) public {
    Paciente memory paciente = pacientes[_DNI];
    require(msg.sender ==  medicos[pacientes[_DNI].medico_asignado].datos.direccionPublica, "Solo el medico puede atender la consulta"); 
    bool consultaEncontrada = false;
    for(uint i = 0; i < consultas.length; i++) {
        if(consultas[i].fecha == _fecha && consultas[i].hora == _hora && keccak256(bytes(paciente.datos.DNI)) == keccak256(bytes(_DNI))) {
            consultaEncontrada = true;
            consultas[i].datos_consulta = _datos_consulta;
            consultas[i].estado = estado_consulta.cerrada; //consulta cerrada
        }
    }
    require(consultaEncontrada == true, "No se encontro una consulta programada con los datos especificados");
}

function modificarCita(uint8 indice, Medico memory _medico, string memory _datos_cita, Paciente memory _paciente, uint _nuevaFecha, uint8 _nuevaHora, tipo_consulta _nuevoTipoConsulta) public {
    require((indice < citas.length) && (msg.sender == _medico.datos.direccionPublica || msg.sender == _paciente.datos.direccionPublica), "la cita no existe o no hay permisos suficientes");
    require(_nuevaHora >= 8 && _nuevaHora <= 18, "La clinica solo atiende entre las 8:00 y las 18:00.");
    require(_nuevaFecha >= block.timestamp, "No se pueden programar citas anteriores a este momento.");
    //Actualizamos datos de la futura consulta médica
     for (uint i = 0; i < consultas.length; i++) {
        if (consultas[i].fecha == citas[indice].fecha &&
            consultas[i].hora == citas[indice].hora &&
            keccak256(bytes(consultas[i].paciente.datos.DNI)) == keccak256(bytes(_paciente.datos.DNI))) {
            consultas[i].fecha= _nuevaFecha;
            consultas[i].hora= _nuevaHora;
            consultas[i].fecha= _nuevaFecha;
            consultas[i].tipo= _nuevoTipoConsulta;
}
     }
    citas[indice].fecha=_nuevaFecha;
    citas[indice].hora=_nuevaHora;
    citas[indice].datos_cita=_datos_cita;
    citas[indice].tipoConsulta = _nuevoTipoConsulta;
    
}
//Medico crea consulta (especialidad o no)
function crearConsulta(Consulta memory nuevaConsulta) public {
    consultas.push(nuevaConsulta);
}
}

