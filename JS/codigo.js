$(document).ready(inicia);
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
}

// FUNCION PARA REGISTRAR USUARIO
function registro() {
    var user = $("#txtUser").val();
    var pass = $("#txtPassword").val();
    var tmp = "";
    tmp = vacio(user, pass); // llamamos a función para ver si algun campo viene vacio.
    if (tmp) {
        $("#respRegistro").html("ERROR: Usuario y/o clave no pueden ser vacios");
    } else {
        sessionStorage.setItem("NombreUsu", user);
        $.ajax({
            url: "http://oransh.develotion.com/usuarios.php",
            type: "POST",
            datatype: "JSON",
            data: { usuario: user, password: pass },
            success: registroOK,
            error: errorReg
        })

    }

}
function errorReg(request) {
    alert(request.responseJSON.mensaje);
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
    $("#respLogin").html("Bienvenida " + user + "!");
    usuarioLogueado();
}
function errorLog(request) {
    alert(request.responseJSON.mensaje);
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
    }else{
        $("#respAltaTarjeta").html("Error, debe ingresar un nro de tarjeta");
    }
}
function addTarjeta(response) {
        alert(response.mensaje + "su saldo es de: $" + response.saldo);
        $("#respAltaTarjeta").html("su saldo es de: $" + response.saldo);
}
function errorTarjeta(request) {
    if(request.responseJSON.mensaje === "El usuario ya tiene una tarjeta registrada"){
        $("#respAltaTarjeta").html(request.responseJSON.mensaje);
    }
    //alert(request.responseJSON.mensaje);
    //$("#respAltaTarjeta").html(request.responseJSON.mensaje);
}
function actualizarSaldo(){
    var saldo = parseInt($("#txtSaldoTarjeta").val());
    if(!isNaN(saldo) && saldo > 0 && saldo % 100 === 0){
        $.ajax({
            url: "http://oransh.develotion.com/tarjetas.php",
            type: "PUT",
            datatype: "JSON",
            headers: {token: sessionStorage.getItem("token")},
            data: {id: sessionStorage.getItem("idUser"),
            saldo: saldo},
            success: actSaldoOK,
            error: falloSaldo
        })
    }else{
        $("#saldoTarjeta").html("");
        $("#saldoTarjeta").append("Error: valor inválido" + "<br>");
        $("#saldoTarjeta").append("Debe ser múltiplo de 100");
    }
}
function actSaldoOK(response){
    $("#saldoTarjeta").html("");
    $("#saldoTarjeta").append(response.mensaje + "<br>" + "Saldo actual: " + response.saldo);
}
function falloSaldo(request){
    //var resp = request;
    $("#saldoTarjeta").html(request.mensaje);
}
function obtenerSaldo() {
    var token = sessionStorage.getItem("token");
    var idUser = sessionStorage.getItem("idUser");
    if(token!=="" && idUser!==""){
        $.ajax({
            url: "http://oransh.develotion.com/tarjetas.php",
            type: "GET",
            datatype: "JSON",
            headers: { token: token},
            data: { id: idUser},
            success: mostrarSaldo,
            error: errorSaldo
        })
    }else{
        $("#obtenerSaldo").html("Error al consultar saldo, intente más tarde.");
    }
}
function mostrarSaldo(response) {
    $("#obtenerSaldo").html("");
    $("#obtenerSaldo").append("<label>Su saldo actual es:</label>");
    $("#obtenerSaldo").append("<input type='text' disable value=" + response.saldo + " id='respSaldo'>");
}
function errorSaldo(request) {
    alert(request.statusText);
}
function eliminarTarjeta(){
    var id = true, id2 = false;
    $("#delTarjeta").html("");
    $("#delTarjeta").append("<label><h3>Advertencia:</h3> Si elimina su tarjeta no podra utilizar el servicio</label>" + "<br>");
    $("#delTarjeta").append("<input type='button' id='confirmar' value='Eliminar' onclick='eliminar(" + id + ")'" + ">");
    $("#delTarjeta").append("<input type='button' id='denegar' value='Cancelar' onclick='eliminar(" + id2 + ")'" + ">");
}
function eliminar(bandera){
    if(bandera){
        $.ajax({
            url: "http://oransh.develotion.com/tarjetas.php",
            type: "DELETE",
            datatype: "JSON",
            headers: {token: sessionStorage.getItem("token")},
            data: {id: sessionStorage.getItem("idUser")},
            success: delOK,
            error: errorDel
        })
    }else{
        $("#delTarjeta").html("");
    }
}
function delOK(response){
    // Pendiente: iniciar con la verificación de si esta utilizando monopatin
    $("#delTarjeta").html("");
    $("#delTarjeta").append(response.mensaje);
}
function errorDel(request){
    var msj = request.responseText;
    var res = msj.replace("mensaje", "");
    var res2 = res.replace("{", "");
    var res3 = res2.replace("}", "");
    var res4 = res3.replace(/['"]+/g, '');
    var res5 = res4.replace(":", "");
    $("#delTarjeta").html(res5);
}

// INICIA MAPA
var pos ={lat: -34.397, lng: -56.18};
function mostrarMapa(){
    $("#map").show();
    navigator.geolocation.getCurrentPosition(mapaNuevo);
}
function mapaNuevo(pos){
    var map = L.map('map').setView([pos.coords.latitude, pos.coords.longitude], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    L.marker([pos.coords.latitude, pos.coords.longitude]).addTo(map)
    .bindPopup("<div id='pop'>" + "<input type='button' Onclick='mostrarDestino()' value='Multiple Marquer' id='btnPop'>" + "</div>")
    //.openPopup();
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