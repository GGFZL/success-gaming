$(document).ready(function(){
    $("#name").blur(function(){
        var regIme = /^[A-Z][a-z]{2,19}$/;
        proveraRegEx(regIme, "#name")
    })
    $("#surname").blur(function(){
        var regPrezime = /^[A-Z][a-z]{2,19}$/;
        proveraRegEx(regPrezime, "#surname")
    })
    $("#email").blur(function(){
        var regEmail = /^[\w\.\-]+\@([a-z0-9]+\.)+[a-z]{2,3}$/;
        proveraRegEx(regEmail, "#email")
    })
    $("#phone").blur(function(){
        var regPhone = /^06[0-9]\/[\d]{3}\-[\d]{3,4}$/;
        proveraRegEx(regPhone, "#phone")
    })
    function proveraRegEx(regEx, element){
        if($(element).val().match(regEx)){
            $(element).addClass("ispravno");
            return false;
        }
        else{
            $(element).removeClass("ispravno");
            $(element).addClass("greska");
            return true;
        }
    }
    $("#send").click(provera);
    function provera(){
        var fieldName = $("#name");
        var fieldSurname = $('#surname');
        var fieldEmail = $("#email");
        var fieldPhone = $("#phone");
        var list = $("#selectList");
        var selectedValue = $('input[name=radioOptions]:checked').val();

        var regIme = /^[A-Z][a-z]{2,19}$/;
        var regPrezime = /^[A-Z][a-z]{2,19}$/;
        var regEmail = /^[\w\.\-]+\@([a-z0-9]+\.)+[a-z]{2,3}$/;
        var regPhone = /^06[0-9]\/[\d]{3}\-[\d]{3,4}$/;
        var brojGresaka = 0;
        if(proveraRegEx(regIme, fieldName)){
            brojGresaka++;
        }
        if(proveraRegEx(regPrezime, fieldSurname)){
            brojGresaka++;
        }
        if(proveraRegEx(regEmail, fieldEmail)){
            brojGresaka++;
        }
        if(proveraRegEx(regPhone, fieldPhone)){
            brojGresaka++;
        }
        if(list.val() !== "0"){
            list.addClass("ispravno")
            $("#listP").addClass("sakrij").removeClass("bg-danger");
        }else{
            list.removeClass("ispravno");
            list.addClass("greska");
            brojGresaka++;
        }
        if (selectedValue !== undefined) {
            $("#listP1").addClass("sakrij").removeClass("bg-danger");
        }else {
            $("#listP1").html("You need to choose an option:").addClass("bg-danger p-1");
            brojGresaka++;
        }
        if(brojGresaka == 0){
            $("#ispis").html("<p class='alert alert-success'>Successfully completed form</p>");
        }
        else{
            $('#ispis').html("<p class='alert alert-danger'>You did not fill out the form correctly, correct the mistakes</p>");
        }
    }
});
/*--- textarea ---*/
document.querySelector("#textArea").addEventListener("keyup", function(){

    let polje = document.querySelector("#textArea");
    let vrednostPolja = polje.value;
    let brojKaraktera = vrednostPolja.length;

    if(brojKaraktera <= 200){
        let ostatak = 200 - Number(brojKaraktera);
        document.querySelector("#brojKaraktera").innerHTML = ostatak;
    }
    else{
        polje.value = vrednostPolja.substring(0, 200);
    }
})