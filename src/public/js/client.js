const socket = io();


// when the connection is active
socket.on('connect', () =>{
    console.log('Browser connected :');
});

// disconnected
socket.on('disconnect', () => {
    console.log('Browser disconnected');
});

const user = 'me';
function initClient () {
    // ************************************** BUTTONS **************************************
    // button in the html page to send the friend request (one for each user showed)
    const addFriendButton = document.getElementById('addFriend')
    // button in the html page to accept pending friend requests
    const acceptFriendRequest = document.getElementById('acceptFriend')
    // button in the html page to unfriend friends
    const unfriend = document.getElementById('unfriend')
    // button to add user to blacklist
    const blockuser = document.getElementById('blockUser')
    // button to unlock a blcoked user
    const unlockuser = document.getElementById('unlockuser')
    // ************************************** END BUTTONS **********************************

    // ************************************** Friend Request **************************************

    // when the addFriend button is clicked we use the event to get the receiver username from the html field
    addFriendButton.addEventListener('click', (event)=>{
        // create friend Request object to send with sender username, receiver username,
        // event.target.tagName where tag name user is the field with the friend request target username
        // passing the button so that it can change from add to request sent.
        const friendRequest = { sender: user, receiver: event.target.user }
        socket.emit('friend.request.sent', friendRequest)
    })

    // friend request successfully sent
    socket.on('request.sent', function () {
        console.log('request sent')
    })

    // ************************************** END Friend Request ***********************************

    // ************************************** Accept Friend Request **************************************

    // accept friend request when clicking on accept button
    acceptFriendRequest.addEventListener('click', (event)=>{
        const acceptance = { receiver: user, sender: event.target.user }
        socket.emit('friend.request.accepted', acceptance)
    })

    // friend request successfully accepted
    socket.on('friend.added.to.sender.friendlist', newFriend => {
        console.log('you are now ' + newFriend.newfriend + '\'s friend')
    })

    // ************************************** END Accept Friend Request **************************************

    // ************************************** UNFRIEND **************************************
    // unfriend friend
    unfriend.addEventListener('click', (event)=>{
        const unfriend = { user: user, friend: event.target.user }
        socket.emit('unfriend', unfriend);
    })
    // unfriend successfull
    socket.on('friend.removed', unfriend =>{
        console.log(unfriend.friend + ' removed form friendlist')
    })
    // ************************************** END UNFRIEND **************************************

    blockuser.addEventListener('click', (event)=>{
        const blocked = { user: user, friend: event.target.user }
        socket.emit('block.friend', blocked)
    })
    socket.on('friend.successfully.blocked', blocked => {
        console.log('friend successfully blocked for ever and ever')
    })

    unlockuser.addEventListener('click', (event)=>{
        const unlocked = { user: user, friend: event.target.user }
        socket.emit('unlock.friend', unlocked)
    })
    socket.on('friend.successfully.ulocked', unlocked=>{
        console.log(unlocked.friend + 'unlocked')
    })
}
