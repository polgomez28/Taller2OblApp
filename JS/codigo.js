$(document).ready(inicia);
function inicia() {
    $("#btnRegistro").click(registro);
    $("#contenedorLogin").show();
    $("#contenedorRegistro").hide();
    $("#btnIrRegistro").click(irALogin);
    $(".menu").hide();
    $("#saldosTarjetas").hide();
    $("#btnLogin").click(login);
    $("#btnVolverLogin").click(mostrarLogin);
    $("#btnObtenerSaldo").click(obtenerSaldo);
    $("#btnAltaTarjeta").click(agregaTarjeta);
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
// VALIDAR Y AGREGAR TARJETA DE CRÉDITO
function agregaTarjeta() {
    var tarjeta = $("#txtNroTarjeta").val();

    if (tarjeta !== "") {
        $.ajax({
            url: "http://oransh.develotion.com/tarjetas.php",
            type: "POST",
            datatype: "JSON",
            headers: { token: sessionStorage.getItem("token") },
            data: { id: sessionStorage.getItem("idUser"), numero: tarjeta },
            success: addTarjeta,
            error: errorTarjeta
        })
    }
}
function addTarjeta(response) {
    var saldo = response;
    alert(response.mensaje + "su saldo es de: $" + response.saldo);
}
function errorTarjeta(request) {
    alert(request.responseJSON.mensaje);
}

function obtenerSaldo() {
    var idUser = 32;
    var tokenUser = "d5a892548e13d436a8e5eb485eab67b9";

    $.ajax({
        url: "http://http://oransh.develotion.com/tarjetas.php",
        type: "GET",
        datatype: "JSON",
        data: { id: 32 },
        headers: { token: "d5a892548e13d436a8e5eb485eab67b9" },
        success: mostrarSaldo,
        error: errorSaldo
    })
}
function mostrarSaldo(response) {
    $("#saldoTarjeta").html("");
    $("#saldoTarjeta").append("<label>Su saldo actual es:</label>");
    $("#saldoTarjeta").append("<input type='text' disable value=" + response.saldo + " id='respSaldo'>");
}
function errorSaldo(request) {
    alert(request.statusText);

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
}