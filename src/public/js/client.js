let socket = io();


// when the connection is active
socket.on("connect", () =>{
    console.log("Browser connected :)");
});

// disconnected
socket.on("disconnect", () => {
    console.log("Browser disconnected :(");
});

