const { session } = require("passport");

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
    // button in the html page to unfriend friends
    const unfriend = document.getElementById('unfriend')
    // button to add user to blacklist
    

    // when the addFriend button is clicked we use the event to get the receiver username from the html field
    addFriendButton.addEventListener('click', (event)=>{
        // create friend Request object to send with sender username, receiver username,
        // event.target.tagName where tag name user is the field with the friend request target username
        // passing the button so that it can change from add to request sent.
        const friendRequest = { sender: session.passport.user, receiver: event.target.user }
        socket.emit('friend.request.sent', friendRequest)
    })
    // accept friend request when clicking on accept button
    acceptFriendRequest.addEventListener('click', (event)=>{
        const acceptance = { receiver: session.passport.user, sender: event.targer.user }
        socket.emit('friend.request.accepted', acceptance)
    })
    // friend request successfully sent
    socket.on('request.sent', function () {
        console.log('request sent')
    })
    //friend request accepted
    socket.on('friend.added.to.sender.friendlist', newFriend => {
        console.log('you are now ' + newFriend.newfriend + '\'s friend')
    })

    unfriend.addEventListener('click', (event)=>{
        const unfriend = { user: session.passport.user, friend: event.targer.user }
        socket.emit('unfriend', unfriend);
    })
    socket.on('friend.removed', unfriend) {
        console.log( unfriend.friend + ' removed form friendlist')
    }


}
