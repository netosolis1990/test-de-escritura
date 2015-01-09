var preguntas;
var buena;

$(document).ready(function() {
    //Estos seran los textos que apareceran para copiar
    preguntas = new Array();
    preguntas[0] = "Sabina Deitrick has closely studied Pittsburgh from the loss of its main industry, steel, to its rebirth as a smaller city with different industries. She says the reuse of existing land and spaces and the reinvention of urban life is important if cities are to succeed. Professor Deitrick notes that a city's ability to educate and train its people is important to jobs and new industries. Even new industries based on old ideas.Around the world, people leave rural farm jobs to go to the city. Yet now there is growing demand for farm products grown close to the cities where they are used. Urban farming is taking hold in some of the world's biggest cities. Sabina Deitrick says studies show that urban farming is one area where woman can earn more than men do.And that's the VOA Special English Economics Report, written by Mario Ritter. I'm Steve Ember.";
    preguntas[1] = "James Gordon Brown (born 20 February 1951) is a British Labour Party politician, who has been a Member of Parliament (MP) since 1983, currently for Kirkcaldy and Cowdenbeath. He served as the Prime Minister of the United Kingdom and Leader of the Labour Party from 2007 until 2010. Brown became Prime Minister in June 2007, after the resignation of Tony Blair and three days after becoming leader of the governing Labour Party. Immediately before this, he had served as Chancellor of the Exchequer in the Labour Government from 1997 to 2007. His tenure ended in May 2010, when he resigned as Prime Minister and Leader of the Labour Party.";
    preguntas[2] = "The Prince Charles, Prince of Wales (Charles Philip Arthur George Mountbatten-Windsor) (born 14 November 1948), is the eldest son of Queen Elizabeth II and Prince Philip, Duke of Edinburgh. He is heir apparent to the thrones of the United Kingdom and 15 other Commonwealth Realms. He has held the title of Prince of Wales since 1958 and is styled HRH The Prince of Wales, and in Scotland, HRH The Prince Charles, Duke of Rothesay. Constitutionally he is the second most senior member of the British Royal Family after the Queen. The Prince of Wales is well known for his extensive charity work, particularly for the Prince's Trust. He also carries out a full schedule of royal duties, and increasingly is taking on more royal roles from his ageing parents. The Prince is also well known for his high profile marriages to the late Diana, Princess of Wales and subsequently to Camilla, Duchess of Cornwall.";
    preguntas[3] = "William was the son of the unmarried Robert I, Duke of Normandy, by Robert's mistress Herleva. His illegitimate status and his youth caused some difficulties for him after he succeeded his father, as did the anarchy that plagued the first years of his rule. During his childhood and adolescence, members of the Norman aristocracy battled each other, both for control of the child duke and for their own ends. In 1047 William was able to quash a rebellion and begin to establish his authority over the duchy, a process that was not complete until about 1060. His marriage in the 1050s to Matilda of Flanders provided him with a powerful ally in the neighbouring county of Flanders. By the time of his marriage, William was able to arrange the appointments of his supporters as bishops and abbots in the Norman church. His consolidation of power allowed him to expand his horizons, and by 1062 William was able to secure control of the neighbouring county of Maine.";
    //inicializamos pusher con la KEY
    var pusher = new Pusher('9cc0bc2e04c995ae545e');
    //suscribirse al canal de comunicacion
    var channel = pusher.subscribe('puntaje');
    //escuchar un evento llamado nuevo, que cuando se active entonces es por que alguien termino el test
    //entonces se crea la tabla con los puntajes mas altos
    channel.bind('nuevo', function(json) {
        //Creamos una tabla dinamica con mustache para mostrar los puntajes mas altos
        var template = "<table id='table' class='table table-striped table-bordered' cellspacing='0' width='100%''><thead><th>Nombre</th><th>Puntaje</th></thead><tbody>";
        template += "{{#usuarios}}<tr><td>{{usuario}}</td><td>{{palabras}}</td></tr>{{/usuarios}}";
        template += "</tbody></table>";
        datos = '{"usuarios":'+json.puntajes+"}";
        var html = Mustache.to_html(template, $.parseJSON(datos));
        //actualizamos el div 'tabla' con el template creado por mustache
        $('#tabla').html(html);
        //usando la libreria DataTableJS para crear una paginacion y poder buscar los resgistros http://www.datatables.net/
        $('#table').DataTable();
        unload();
    });

    //Se selecciona al azar uno de los textos
    buena = Math.round(Math.random()*3);
    $('#pregunta').html(preguntas[buena]);
    //Se iniciliza el cronometro en 45 seg
    var cron = 45;
    //Se usa la funcion setInterval para ir quitando los segundos al cronometro
    var inter = setInterval(function(){
        $('#tiempo').html(cron--);
        //cuando el cronometro llege a 0 se comparan las palabras que se escribiron con las del texto y se envian al servidor
        if(cron < 0){
            clearInterval(inter);
            $('#respuesta').attr('readonly', 'true');
            var preg = preguntas[buena].split(' ');
            var resp = $('#respuesta').val().split(' ');
            var palabras = 0;
            for (var i = 0; i < preg.length; i++) {
                if(preg[i] == resp[i]){
                    palabras++;
                }
            };
            nota('success','<strong>Tus palabras correctas: '+palabras+'</strong>');
            if(!localStorage['usuario_palabras']){
                bootbox.prompt('Tu nombre',function(res){
                    if(res && $.trim(res)!=''){
                        localStorage['usuario_palabras'] = res;
                        enviarPuntaje(localStorage['usuario_palabras'],palabras);
                    }else{
                        nota('error','No tienes nombre?');
                        return;
                    }
                });
            }else{
                enviarPuntaje(localStorage['usuario_palabras'],palabras);
            }
            
        }
    },1000);
    //Cargamos los puntajes de la base de datos
    $.getJSON('servidor/servidor.php', {getResultados: true}, function(json, textStatus) {
        var template = "<table id='table' class='table table-striped table-bordered' cellspacing='0' width='100%''><thead><th>Nombre</th><th>Puntaje</th></thead><tbody>";
        template += "{{#usuarios}}<tr><td>{{usuario}}</td><td>{{palabras}}</td></tr>{{/usuarios}}";
        template += "</tbody></table>";
        datos = '{"usuarios":'+json+"}";
        var html = Mustache.to_html(template, $.parseJSON(datos));
        //actualizamos el div 'tabla' con el template creado por mustache
        $('#tabla').html(html);
        //usando la libreria DataTableJS para crear una paginacion y poder buscar los resgistros http://www.datatables.net/
        $('#table').DataTable();
        unload();
    });
    
});

//Funcion que envia el puntaje al servidor
function enviarPuntaje(usuario,puntaje){
    params = {
        usuario:usuario,
        palabras:puntaje,
        nuevoResultado:true
    }
    $.get('servidor/servidor.php',params, function(data) {
    });
}


//Funciones para quitar y poner el loader
function load(){
    $('#loader').show();
}

function unload(){
    $('#loader').hide();
}

//Funcion para enviar notificaciones
function nota(op,msg,time){
    if(time == undefined)time = 10000;
    var n = noty({
        text: msg,
        theme: 'defaultTheme',
        animation: {
            open: {height: 'toggle'}, 
            close: {height: 'toggle'},
            easing: 'swing', 
            speed: 500,
        },
        type:op,
        timeout:time,
        layout: 'topRight',
        maxVisible: 5
    });
}