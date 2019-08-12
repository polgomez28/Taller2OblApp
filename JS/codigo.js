$(document).ready(inicia);

window.fn = {};

window.fn.open = function() {
  var menu = document.getElementById('menu');
  menu.open();
};

window.fn.load = function(page) {
  var content = document.getElementById('content');
  var menu = document.getElementById('menu');
  if(page === "mapa.html" && sessionStorage.getItem("NombreUsu") !== null){
    monopatinAdd();
    navigator.geolocation.getCurrentPosition(mostrarMapa);
  }else if(page === "mapa.html" && sessionStorage.getItem("NombreUsu") === null){
      ons.notification.alert("Error: Debe estar logueado");
    content.load("login.html")
    .then(menu.close.bind(menu));
  }else if(page === "cuenta.html" && sessionStorage.getItem("NombreUsu") === null){
    ons.notification.alert("Error: Debe estar logueado");
    content.load("login.html")
    .then(menu.close.bind(menu));
  }else if(page === "saldo.html" && sessionStorage.getItem("NombreUsu") === null){
    ons.notification.alert("Error: Debe estar logueado");
    content.load("login.html")
    .then(menu.close.bind(menu));
  }else if(page === "historial.html" && sessionStorage.getItem("NombreUsu") === null){
    ons.notification.alert("Error: Debe estar logueado");
    content.load("login.html")
    .then(menu.close.bind(menu));
  }
  content.load(page)
    .then(menu.close.bind(menu));
  
};

function inicia() {
    $("#btnRegistro").click(registro);
    $("#contenedorLogin").show();
    $("#contenedorRegistro").hide();
    $("#btnIrRegistro").click(irALogin);
    $(".menu").hide();
    $("#saldosTarjetas").hide();
    $("#map").hide();
    $("#btnMapa").click(mostrarMapa);
    $("#btnLogin").click(login);
    $("#btnVolverLogin").click(mostrarLogin);
    $("#btnObtenerSaldo").click(obtenerSaldo);
    $("#btnAltaTarjeta").click(agregaTarjeta);
    $("#btnObtenerSaldo").click(obtenerSaldo);
    $("#btnCargaSaldo").click(actualizarSaldo);
    $("#btnEliminarTarjeta").click(eliminarTarjeta);
    $("#btnMonopatines").click(monopatinAdd);
}
var listaMono = [], topCinco = [], monActivos = {};
var posicionOrigen, timeStart, timeStop, activoUser = true;
var posicionDestino;
var pos = { lat: -34.397, lng: -56.18 };
// FUNCION PARA REGISTRAR USUARIO
function registro() {
    var user = $("#txtUser").val();
    var pass = $("#txtPassword").val();
    var tmp = "";
    tmp = vacio(user, pass); // llamamos a función para ver si algun campo viene vacio.
    if (tmp) {
        sessionStorage.setItem("NombreUsu", user);
        $.ajax({
            url: "http://oransh.develotion.com/usuarios.php",
            type: "POST",
            datatype: "JSON",
            data: { usuario: user, password: pass },
            success: registroOK,
            error: errorReg
        })
    } else {
        $("#respRegistro").html("ERROR: Usuario y/o clave no pueden ser vacios");
    }

}
function errorReg(request) {
    ons.notification.alert(request.responseJSON.mensaje);
}
function registroOK(response) {
    var idUser;
    var tokenUser;
    idUser = response.id;
    tokenUser = response.token;
    sessionStorage.setItem("idUser", idUser);
    if (tokenUser !== "") {
        sessionStorage.setItem("token", tokenUser);
    }
    $("#respRegistro").html("");
    $("#respRegistro").append("Resgistrado con exito! ");
    $("#respRegistro").append("Ya puedes ir al login ");
}
function login() {
    var user = $("#txtUserLog").val();
    var pass = $("#txtPasslog").val();
    sessionStorage.setItem("NombreUsu", user);
    if (user !== "" || pass !== "") {
        $.ajax({
            url: "http://oransh.develotion.com/login.php",
            type: "POST",
            datatype: "JSON",
            data: { usuario: user, password: pass },
            success: loginOK,
            error: errorLog
        })
    } else {
        alert("ERROR: Usuario y/o clave no pueden ser vacios");
    }
}
function loginOK(response) {
    if (sessionStorage.getItem("token") === "" || response.token !== "") {
        sessionStorage.setItem("token", response.token);
        sessionStorage.setItem("idUser", response.id);
    }
    var idUser = response.id;
    var tokenST = sessionStorage.getItem("token");
    var user = sessionStorage.getItem("NombreUsu");
    ons.notification.alert("Bienvenida " + user + "!");
    document.getElementById("btnlogout").style.display="block"
    
}
function errorLog(request) {
    ons.notification.alert(request.responseJSON.mensaje);
}
function logout(){
    sessionStorage.setItem("NombreUsu", null);
    sessionStorage.setItem("token", null);
    sessionStorage.setItem("idUser", null);
    ons.notification.alert("Te esperamos ponto! ;)");
}
// TARJETA DE CRÉDITO

function agregaTarjeta() {
    var tarjeta = $("#txtNroTarjeta").val();
    var token = sessionStorage.getItem("token");
    var idUser = sessionStorage.getItem("idUser");
    if (tarjeta !== "") {
        $.ajax({
            url: "http://oransh.develotion.com/tarjetas.php",
            type: "POST",
            datatype: "JSON",
            headers: { token: token },
            data: { id: idUser, numero: tarjeta },
            success: addTarjeta,
            error: errorTarjeta
        })
    } else {
        ons.notification.alert("Error, debe ingresar un nro de tarjeta");
    }
}
function addTarjeta(response) {
    ons.notification.alert(response.mensaje + "su saldo es de: $" + response.saldo);
}
function errorTarjeta(request) {
    if (request.responseJSON.mensaje === "El usuario ya tiene una tarjeta registrada") {
        ons.notification.alert(request.responseJSON.mensaje);
        //$("#respAltaTarjeta").html(request.responseJSON.mensaje);
    }
    //alert(request.responseJSON.mensaje);
    //$("#respAltaTarjeta").html(request.responseJSON.mensaje);
}
function actualizarSaldo(costo,resta) {
    if(costo===""){
        var saldo = parseInt($("#txtSaldoTarjeta").val());
    }else{
        saldo = costo;
    }
    if(resta){
            $.ajax({
                url: "http://oransh.develotion.com/tarjetas.php",
                type: "PUT",
                datatype: "JSON",
                headers: { token: sessionStorage.getItem("token") },
                data: {
                    id: sessionStorage.getItem("idUser"),
                    saldo: saldo
                },
                success: actSaldoOK,
                error: falloSaldo
            })
    }else{
        if (!isNaN(saldo) && saldo % 100 === 0) {
            $.ajax({
                url: "http://oransh.develotion.com/tarjetas.php",
                type: "PUT",
                datatype: "JSON",
                headers: { token: sessionStorage.getItem("token") },
                data: {
                    id: sessionStorage.getItem("idUser"),
                    saldo: saldo
                },
                success: actSaldoOK,
                error: falloSaldo
            })
        } else {
            $("#saldoTarjeta").html("");
            $("#saldoTarjeta").append("Error: valor inválido" + "<br>");
            $("#saldoTarjeta").append("Debe ser múltiplo de 100");
        }
    }
    
    
}
function actSaldoOK(response) {
    if(response.saldo < 0){
        ons.notification.alert("Inhabilitado por saldo negativo: " + response.saldo);
        activoUser = false;
    }else{
        ons.notification.alert(response.mensaje + "<br>" + "Saldo actual: " + response.saldo);
    }
}
function falloSaldo(request) {
    //var resp = request;
    $("#saldoTarjeta").html(request.mensaje);
}
function obtenerSaldo() {
    var token = sessionStorage.getItem("token");
    var idUser = sessionStorage.getItem("idUser");
    if (token !== "" && idUser !== "") {
        $.ajax({
            url: "http://oransh.develotion.com/tarjetas.php",
            type: "GET",
            datatype: "JSON",
            headers: { token: token },
            data: { id: idUser },
            success: mostrarSaldo,
            error: errorSaldo
        })
    } else {
        $("#obtenerSaldo").html("Error al consultar saldo, intente más tarde.");
    }
}
function mostrarSaldo(response) {
    $("#obtenerSaldo").html("");
    $("#obtenerSaldo").append("<label>Su saldo actual es:</label>");
    $("#obtenerSaldo").append("<input type='text' disable value=" + response.saldo + " id='respSaldo'>");
}
function errorSaldo(request) {
    ons.notification.alert(request.responseJSON.mensaje);
}
function eliminarTarjeta() {
    var id = true, id2 = false;
    $("#delTarjeta").html("");
    $("#delTarjeta").append("<label><h3>Advertencia:</h3> Si elimina su tarjeta no podra utilizar el servicio</label>" + "<br>");
    $("#delTarjeta").append("<p style='margin-top: 30px;'>");
    $("#delTarjeta").append("<ons-button onclick='eliminar(" + id + ")'" + ">" + "Eliminar" + "</ons-button>" + "<p></p>");
    $("#delTarjeta").append("<ons-button onclick='eliminar(" + id2 + ")'" + ">" + "Cancelar" + "</ons-button>");
    $("#delTarjeta").append("</p>");
}
function eliminar(bandera) {
    if (bandera) {
        $.ajax({
            url: "http://oransh.develotion.com/tarjetas.php",
            type: "DELETE",
            datatype: "JSON",
            headers: { token: sessionStorage.getItem("token") },
            data: { id: sessionStorage.getItem("idUser") },
            success: delOK,
            error: errorDel
        })
    } else {
        $("#delTarjeta").html("");
    }
}
function delOK(response) {
    // Pendiente: iniciar con la verificación de si esta utilizando monopatin
    $("#delTarjeta").html("");
    $("#delTarjeta").append(response.mensaje);
}
function errorDel(request) {
    var msj = request.responseText;
    var res = msj.replace("mensaje", "");
    var res2 = res.replace("{", "");
    var res3 = res2.replace("}", "");
    var res4 = res3.replace(/['"]+/g, '');
    var res5 = res4.replace(":", "");
    $("#delTarjeta").html(res5);
}
// llamada a funcion para traer array monopatines.
function monopatinAdd() {
    if (sessionStorage.getItem("NombreUsu") !== "") {
        $.ajax({
            url: "http://oransh.develotion.com/monopatines.php",
            type: "GET",
            datatype: "JSON",
            headers: { token: sessionStorage.getItem("token") },
            success: monopatinesOK,
            error: errorMonopatines
        })
    }
}
function monopatinesOK(response) {
    var tmpmonopatines = response.monopatines;
    var monopatines = {};

    var contador = 0;
    for (var i = 0; i < tmpmonopatines.length; i++) {
        monopatines = tmpmonopatines[i];
        if (monopatines["bateria"] !== 0) {
            listaMono[contador] = monopatines;
            contador++
        }
    }
}
function errorMonopatines(request) {
    alert(request.responseText);
}

function ubicarMon(pos) {

    var tmp = {}, contador = 0, distancia = 0;
    for (i = 0; i < listaMono.length; i++) {
        tmp = listaMono[i];
        
            lat2 = tmp.latitud;
            lon2 = tmp.longitud;
            Number.prototype.toRad = function () {
                return this * Math.PI / 180;
            }
            
            var lat1 = pos.coords.latitude;
            var lon1 = pos.coords.longitude;

            var R = 6371; // km 

            var x1 = lat2 - lat1;
            var dLat = x1.toRad();
            var x2 = lon2 - lon1;
            var dLon = x2.toRad();
            var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(lat1.toRad()) * Math.cos(lat2.toRad()) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
            var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            var d = R * c;

        if (contador === 0){distancia = d;}
        if (d <= distancia && contador < 5) {
                topCinco[contador] = tmp;
                contador++ 
        }

    }
}
// DESBLOQUEO MONOPATIN

// INICIA MAPA

function mostrarMapa() {
    //$("#map").show();
    navigator.geolocation.getCurrentPosition(mapaNuevo);
}
function mapaNuevo(pos) {
    ubicarMon(pos);

    var map = L.map('map').setView([pos.coords.latitude, pos.coords.longitude], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    L.marker([pos.coords.latitude, pos.coords.longitude]).addTo(map)
        .bindPopup("Estas aquí!")
    
    //OBTENEMOS LONGITUD Y  LATITUD POR MONOPATINES
    for(var i=0;i<topCinco.length;i++){
        tmpTop = topCinco[i];
        var latitud = tmpTop["latitud"];
        var longitud = tmpTop["longitud"];
        var codigo = tmpTop["codigo"];
        var popup = "<p>Monopatin: " + codigo + "</p>" +
                    "<ons-button id='btnDesbloquear' onclick='desbloquear(" + i + ")'>" +
                    "Desbloquear" + "</ons-button>" +
                    "<ons-button id='btnBloquear' onclick='bloquear(" + i + ")' style='display: none; background: red;''>" +
                    "Bloquear" + "</ons-button>"
        L.marker([latitud, longitud]).addTo(map)
        .bindPopup(popup);
    }
    
}
function desbloquear(codigo){
    var token = sessionStorage.getItem("token");
    var idUser = sessionStorage.getItem("idUser");
    if (token !== "" && idUser !== "") {
        $.ajax({
            url: "http://oransh.develotion.com/tarjetas.php",
            type: "GET",
            datatype: "JSON",
            headers: { token: token },
            data: { id: idUser },
            success: verificarTarjeta,
            error: errorCard
        })
    }else{
        ons.notification.alert("Error: Debes estar logueado");
    }
}
function verificarTarjeta(response){
        if(activoUser){
            timeStart = new Date();
            timeStart = timeStart.getTime();
            document.getElementById("btnBloquear").style.display="block";
            document.getElementById("btnDesbloquear").style.display="none";    
        }else{
            ons.notification.alert("Usuario no habilitado, debe cargar saldo");
        }
        
}
function errorCard(request){
    ons.notification.alert(request.responseJSON.mensaje);
}
function bloquear(id){
    timeStop = new Date();
    var timeReal, costo, resta = true;
    timeStop = timeStop.getTime();
    tmp = topCinco[id];
    timeReal = ((timeStop - timeStart)/1000);
    costo = (timeReal * 2) + 46;
    document.getElementById("btnBloquear").style.display="none";
    document.getElementById("btnDesbloquear").style.display="block";
    ons.notification.alert("Costo del viaje: $" + costo);
    costo = costo*(-1);
    actualizarSaldo(costo,resta);

}

// FUNCIONES GENERICAS
function vacio(user, pass) {
    if (user === "" || pass === "") {
        return false;
    } else {
        return true;
    }
}
//FUNCIÓN MOSTRAR LOGIN
function mostrarLogin() {
    $("#contenedorRegistro").hide();
    $("#contenedorLogin").show();
}
function irALogin() {
    $("#contenedorRegistro").show();
    $("#contenedorLogin").hide();
}
function usuarioLogueado() {
    $("#saldosTarjetas").show();
    $("#contenedorLogin").hide();
    $("#contenedorRegistro").hide();
}