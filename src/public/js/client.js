const socket = io();


// when the connection is active
socket.on('connect', () =>{
    console.log('Browser connected :');
});

// disconnected
socket.on('disconnect', () => {
    console.log('Browser disconnected');
});

function init_client() {
    // button in the html page to send the friend request (one for each user showed)
    const addFriendButton = document.getElementById('addFriend')
    // button in the html page to accept pending friend requests
    const acceptFriendRequest = document.getElementById('acceptFriend')

    // when the addFriend button is clicked we use the event to get the receiver username from the html field
    addFriendButton.addEventListener('click', (event)=>{
        // create friend Request object to send with sender username, receiver username,
        // event.target.tagName where tag name user is the field with the friend request target username
        // passing the button so that it can change from add to request sent.
        const friendRequest = { sender: session.passport.user, receiver: event.target.user, addFriendButton: addFriendButton }
        socket.emit('friend.request.sent', friendRequest)
    })

    acceptFriendRequest.addEventListener('click', (event)=>{
        const acceptance = { accepter: session.passport.user, sender: event.targer.user, acceptFriendRequestButton: acceptFriendRequest }
    })
    // change add button text when request successfully sent
    socket.on('request.sent', addFriendButton=>{
        addFriendButton.innerHTML = 'request pending'
    })

}