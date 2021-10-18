// Make connection
var socket = io.connect(`http://localhost:4000`);

//Query DOM
var num1 = document.getElementById('num1');
    num2 = document.getElementById('num2');
    btn = document.getElementById('add');
    out =  document.getElementById('out');
    hosp_name = document.getElementById('name');
    loc =  document.getElementById('location');
    covi =  document.getElementById('Covishield');
    cov =  document.getElementById('Covaxin');
    john =  document.getElementById('john');
    pfizer =  document.getElementById('pfizer');
let vacci = null;
btn.addEventListener('click',function(){
    console.log("clicked");
    var select = document.getElementById('vaccine');
    vacci = select.options[select.selectedIndex].value; 
    console.log(vacci);
    socket.emit("Book(TOKEN_REQUEST)");
});

//Listening for event
socket.on("result",function(data){
    out.innerHTML += '<p><strong>Vaccine '+ data.result+'</strong></p>';
    socket.emit("update");

})
socket.on("GIVE_TOKEN",()=>{
    console.log("token recieved");
    socket.emit("EXECUTE_CS",{
        vacc: vacci,
        quantity: 1
    });
})
socket.on("done",()=>{
    socket.emit("RETURN_TOKEN");
})
socket.on("wait",function(data){
    console.log("waiting");

})
socket.on("data",(data)=>{
    console.log(data);
    hosp_name.innerHTML = data[0].name;
    loc.innerHTML = "Location :"+ data[0].location;
    cov.innerHTML = "Covaxin : " + data[0]["vaccine"]["covaxin"];
    covi.innerHTML = "Covishield : " + data[0]["vaccine"]["covishield"];
    john.innerHTML = "Johnson and Johnson : " + data[0]["vaccine"]["johnson and johnson"];
    pfizer.innerHTML = "Pfizer :" + data[0]["vaccine"]["pfizer"];
})
