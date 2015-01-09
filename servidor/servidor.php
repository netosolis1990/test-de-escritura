<?php
//Le decimos a PHP que vamos a devolver objetos JSON
header('Content-type: application/json');

//Importamos la libreria de ActiveRecord
require_once 'php-activerecord/ActiveRecord.php';
require('Pusher.php');
//Configuracion de ActiveRecord
ActiveRecord\Config::initialize(function($cfg)
{
	//Ruta de una carpeta que contiene los modelos de la BD (tablas)
	$cfg->set_model_directory('models');
	//Creamos la conexion
	$cfg->set_connections(array(
		'development' => 'mysql://USUARIO:PASS@HOST/NOMBRE_BD'));
});

//Peticion para devolver los diferentes puntajes guardados en la BD
if(isset($_GET['getResultados'])){
	//Hacemos la consulta
	$rapidos = Rapido::find_by_sql('SELECT * FROM rapido ORDER BY palabras DESC LIMIT 5');
	//Devolvemos los registros de la BD en un formato JSON
	echo json_encode(datosJSON($rapidos));
}

//Peticion para guardar un nuevo puntaje y repartirlo a los demas usuarios
if(isset($_GET['nuevoResultado'])){
	unset($_GET['nuevoResultado']);
	$marcador = Rapido::create($_GET);
	if($marcador){
		$res['scs'] = true;
		$rapidos = Rapido::find_by_sql('SELECT * FROM rapido ORDER BY palabras DESC LIMIT 5');
		/*creamos un objeto pusher*/
		$pusher = new Pusher('KEY', 'SECRET', 'API_ID');
		//enviamos los datos del marcador recibido a todos los clientes conectados
		$pusher->trigger('puntaje', 'nuevo', array('puntajes' => datosJSON($rapidos)));
		echo json_encode($res);
	}
	else{
		$res['scs'] = false;
		$res['msg'] = 'Error al agregar el marcador';
		echo json_encode($res);
	}
}


//funcion que convierte objetos regresados por la BD a JSON
function datosJSON($data, $options = null) {
	$out = "[";
	foreach( $data as $row) { 
		if ($options != null)
			$out .= $row->to_json($options);
		else 
			$out .= $row->to_json();
		$out .= ",";
	}
	$out = rtrim($out, ',');
	$out .= "]";
	return $out;
}
?>