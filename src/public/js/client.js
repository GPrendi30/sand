const session  = { passport: { user: { id: 1 } } };
const socket = io();

// when the connection is active
socket.on('connect', () =>{
    console.log('Browser connected :');
});

// disconnected
socket.on('disconnect', () => {
    console.log('Browser disconnected');
});

socket.on('tracking_update', update => {
    console.log(update)
    console.log('update received')

})

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
    // track add to tracking list
    const track = document.getElementById('track')
    // untrack remove item from tracking list
    const untrack = document.getElementById('untrack')



    // rooms
    // add admin
    const addAdmin = document.getElementById('addAdmin')
    // remove admin
    const removeAdmin = document.getElementById('removeAdmin')
    // add member
    const addMember = document.getElementById('addMember')
    // button to remove member from room
    const removeMember = document.getElementById('removerMember')
    // set icon
    const setIcon = document.getElementById('setIcon')
    // set name
    const setName = document.getElementById('setName')
    // set description
    const setDesc = document.getElementById('setDesc')
    // join request
    const join = document.getElementById('join')
    // accept join request
    const acceptJoin = document.getElementById('acceptJoin')

    // chat
    // send event
    const send = document.getElementById('send')
    const addUser = document.getElementById('addUser')
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
    //  Tracking
    // general tracking event update (fetched data)
    // adding and removing from user tracking list
    track.addEventListener('click', (event)=>{
        const tracking = { user: session.passport.user, asset: event.target.asset }
        socket.emit('track', tracking)
    })
    socket.on('asset.added', tracking => {
        console.log('asset ' + tracking.asset + 'added to tracklist successfully')
    })

    untrack.addEventListener('click', (event)=>{
        const untracking = { user: session.passport.user, asset: event.target.asset }
        socket.emit('untrack', untracking)
    })
    socket.on('asset.removed', untracking => {
        console.log('asset ' + untracking.asset + 'removed from tracklist successfully')
    })


    // rooms

    // add/remove admin
    addAdmin.addEventListener('click', event => {
        const add = { room: session.passport.room, author: session.passport.user, user: event.target.user }
        socket.emit('add.admin', add)
    })
    socket.on('admin added', add => {
        console.log('admin' + add.user + 'added as admin');
    })

    removeAdmin.addEventListener('click', event => {
        const remove = { room: session.passport.room, admin: session.passport.admin, user: event.target.user }
        socket.emit('remove.admin', remove)
    })
    socket.on('admin removed', remove => {
        console.log('admin' + remove.user + 'removed from admins');
    })


    // add/remove member
    addMember.addEventListener('click', event => {
        const add = { room: session.passport.room, admin: session.passport.user, user: event.target.user }
        socket.emit('add.member', add)
    })
    socket.on('member added', add => {
        console.log('member' + add.user + 'added');
    })

    removeMember.addEventListener('click', event => {
        const remove = { room: session.passport.room, admin: session.passport.user, user: event.target.user }
        socket.emit('remove.member', remove)
    })
    socket.on('member removed', remove => {
        console.log('member' + remove.user + 'removed');
    })

    // room setting
    setIcon.addEventListener('click', event=> {
        const setting = { room: session.passport.room, admin: session.passport.user, icon: 'get icon someway' }
        socket.on('set.icon', setting)
    })

    socket.on('icon.setted', setting => {
        console.log('icon setted successfully')
    })

    setName.addEventListener('click', event=> {
        const setting = { room: session.passport.room, admin: session.passport.user, name: 'get name somehow' }
        socket.on('set.name', setting)
    })
    socket.on('name.added', setting => {
        console.log('name setted successfully')
    })
    setDesc.addEventListener('click', event =>{
        const setting = { room: session.passport.room, admin: session.passport.user, desc: 'get desc somewhere' }
        socket.emit('set.desc', setting)
    })
    socket.on('desc.added', setting => {
        console.log('descsetted successfully')
    })

    // room join request
    join.addEventListener('click', event =>{
        const request = { room: session.passport.room, user: session.passport.user }
        socket.emit('join.request', request)
    })

    socket.on('join.requested', request =>{
        console.log('join requested successfully')
    })

    acceptJoin.addEventListener('click', event =>{
        const request = { room: session.passport.room, user: session.passport.user }
        socket.emit('accept.join.request', request)
    })

    socket.on('joined', request =>{
        console.log('user joined')
    })
    // chat

    send.addEventListener('click', event => {
        const msg = { chat: 'get chat', message: 'get message' }
        socket.emit('send', msg)
    })
    socket.on('message.sent', event => {
        console.log('message  ' + event.message + 'sent successfully')
    })

    addUser.addEventListener('click', event => {
        const chat = { chat: 'get chat', user: 'get user' }
        socket.emit('add.user', chat)
    })

    socket.on('user.added', event => {
        console.log('user  ' + event.user + ' added successfully')
    })

    socket.on('notify', event =>{
        const popup = document.getElementById('popup')
        const time = document.getElementById('time')
        // const notification = { msg: event.msg, time: event.time }
        popup.innerHTML = event.msg
        time.innerHTML = event.time
    })
}