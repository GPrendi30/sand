const socket = io();


// when the connection is active
socket.on('connect', () =>{
    console.log('Browser connected :');
});

// disconnected
socket.on("disconnect", () => {
    console.log('Browser disconnected');
});

function init_client() {
    // button in the html page to send the friend request (one for each user showed)
    const addFriendButton = document.getElementById('addFriend')
    // when the button is clicked we use the event to get the receiver username from the html field
    addFriendButton.addEventListener('click', (event)=>{
        // create friend Request object to send with sender username, receiver username,
        // event.target.tagName where tag name user is the field with the friend request target username
        // passing the button so that it can change from add to request sent.
        const friendRequest = { sender: req.user, receiver: event.target.user, addFriendButton: addFriendButton }
        socket.emit('friend.request.sent', friendRequest)
    })

    socket.on('request.sent', addFriendButton=>{
        addFriendButton.innerHTML = 'request pending'
    })
}