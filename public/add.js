// Make connection
var socket = io.connect(`http://localhost:4000`);

//Query DOM
var num1 = document.getElementById('num1');
    num2 = document.getElementById('num2');
    btn = document.getElementById('add');
    out =  document.getElementById('out');


btn.addEventListener('click',function(){
    console.log("clicked");
    socket.emit("add",{
        n1: num1.value,
        n2: num2.value
    });
});
//Listening for event
socket.on("result",function(data){
    out.innerHTML += '<p><strong>Sum = '+ data.result+'</strong></p>';

})