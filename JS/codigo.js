$(document).ready(inicia);
function inicia(){
    $("#btnRegistro").click(registro);
}
// FUNCION PARA REGISTRAR USUARIO
function registro(){
    var user = $("#txtUser").val();
    var pass = $("#txtPassword").val();
    var tmp = "";
    tmp = vacio(user,pass); // llamamos a función para ver si algun campo viene vacio.
    if(tmp){
        $("#respRegistro").html("ERROR: Usuario y/o clave no pueden ser vacios");
    }else{
        $.ajax({
            url: "http://oransh.develotion.com/usuarios.php",
            type: "POST",
            datatype: "JSON",
            data: {usuario: user, password: pass},
            success: registroOK,
            error: errorReg
        })
    }
    
}
function errorReg(request){
    alert(request.responseJSON.mensaje);
}
function registroOK(response){
    var idUser;
    var tokenUser;
    idUser = response.id;
    tokenUser = response.token;
    $("#respRegistro").append("Resgistrado con exito! " + "Su token es: " + response.token);
}

// FUNCION PARA VALIDAR CAMPOS VACIOS
function vacio(user,pass){
    if(user === "" || pass === ""){
        return true;
    }else{
        return false;
    }
}