const { MinKey } = require("mongodb");

function linkClick (href) {
    const url = new URL(href); // parse link address

    if (url.pathname === '/home') {
        getHome();
    } else if (url.pathname === '/discover') {
        getDiscover()
    } else if (url.pathname === '/follow') {
        getFollow();
    } else if (url.pathname === '/friendlist') {
        getFriendList();
    } else if (url.pathname === '/rooms') {
        getRooms();
    } else if (url.pathname === '/exchange') {
        getExchange();
    } else if (url.pathname === '/settings') {
        getSettings();
    } else { console.log('Unknown route'); }
}


function parsePath () {
    const hash = window.location.hash
    if (hash) {
        if (hash === '#dashboard') {
            getHome();
        } else if (hash === '#discover') {
            getDiscover()
        } else if (hash === '#friendlist') {
            getFriendList();
        } else if (hash === '#follow') {
            getFollow();
        } else {
            getHome();
        }
    } else {
        getHome();
    }
}

function getHome () {
    // setting the location
    window.location = '#dashboard'


    const main = document.querySelector('main');

    const user = {
        //_id: id,
        username: 'Average_CTRL+C_Enjoyer',
        email: 'nftlover99@gmail.com',
        name: 'Joe',
        surname: 'Mama',
        ppic: 'images/user1.png',
        bio: 'A looooooooooooooooooooooooooooooooooooooooooooooooooong bio',
        friendlist: [],
        friendrequests: [],
        blocked: [],
        tracking: [],
        recentlyviewed: []
    }

    const friend = { username: 'AverageNFTFan', ppic: 'images/user2.png' }

    user.friendlist = [friend, friend, friend, friend, friend];
    user.friendrequests = [friend, friend];

    const collection = { name: 'CoolCats', img: 'images/user1.png' };

    user.tracking = [collection, collection, collection, collection, collection];
    user.blocked = [];
    
    main.innerHTML = ejs.src_views_profile({ user: user })

    //main.innerHTML = ejs.src_views_index({ friends: [{ name: 'not-geri' }] });

    /*
    NOTHING TO FETCH FOR THE MOMENT
    fetch("/home",
        {
            method: "GET",
            headers: { "Accept": "application/json" }
        }
    ).then(res => {
        if (res.status >= 400) {
            throw new Error(res.status);
        }
        return res.json(); //another promise
    })
        .then(data => ejs.src_views_index(data))
        .then(html => {
            document.getElementById('content').innerHTML = html;

            document.querySelectorAll("#content a").forEach(a => {
                console.log("a");
                a.addEventListener("click", (event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    linkClick(event.currentTarget.href);
                })
            })

        })
        .catch(err => { console.error(err); });

        */
}


// yes
function getFollow () {
    const main = document.querySelector('main');
    fetch('/follow', {
        method: 'GET'
    })
        .then(res => {
            if (res.status >= 400) {
                console.log('error');
            } else if (res.url.includes('/login')) {
                getLogin();
            } else {
                window.location = '#follow?id=none';
                main.innerHTML = ejs.src_views_follow();
            }
        });
}

function getFriendList () {
    const main = document.querySelector('main');

    window.location = '#friendlist?id=none';
    main.innerHTML = ejs.src_views_friendlist({
        friends:
            [
                { name: 'geri' },
                { name: 'geri' },
                { name: 'geri' },
                { name: 'geri' },
                { name: 'geri' },
                { name: 'geri' },
                { name: 'geri' }
            ]
    });

    fetch('/user/friends/61b51e6166ee527f461c77b7', {
        method: 'GET'
    })
        .then(res => {
            if (res.status >= 400) {
                console.log('error');
            } else if (res.url.includes('/login')) {
                getLogin();
            } else {
                window.location = '#friendlist?id=none';
                main.innerHTML = ejs.src_views_friendlist({
                    friends:
                        [
                            { name: 'geri' },
                            { name: 'geri' },
                            { name: 'geri' },
                            { name: 'geri' },
                            { name: 'geri' },
                            { name: 'geri' },
                            { name: 'geri' }
                        ]
                });
            }
        });
}

function getLogin (lastLocation) {
    window.location = '#login';

    document.getElementById('content').innerHTML = ejs.src_views_login();


    // login form submit
    const loginForm = document.querySelector('#loginForm');
    loginForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const formdata = new FormData(event.target);
        fetch(event.target.action, {
            method: 'POST',
            body: formdata
        }).then(res => {
            if (res.url.includes('/login')) {
                getLogin();
            } else getHome();
        });
    });

    // signup form redirect
    const signupRedirect = document.querySelector('#signupRedirect');
    signupRedirect.addEventListener('submit', (event) => {
        event.preventDefault();
        getSignup();
    });
}

function getSignup () {
    window.location = '#signup';

    document.getElementById('content').innerHTML = ejs.src_views_signup();
    // signup form submit
    const signupForm = document.querySelector('#signupForm');
    signupForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const formdata = new FormData(event.target);
        fetch(event.target.action, {
            method: 'POST',
            body: formdata
        }).then(res => {
            if (res.url.includes('signup')) {
                getSignup()
            } else getLogin();
        });
    });

    // login form redirect
    const loginRedirect = document.querySelector('#loginRedirect');
    loginRedirect.addEventListener('submit', (event) => {
        event.preventDefault();
        getLogin();
    });
}

// yes
function getDiscover () {
    window.location = '#discover?id=none';

    const main = document.querySelector('main');

    // main.innerHTML = ejs.src_views_discover();

    fetch('/discover',
        {
            method: 'GET',
            headers: { Accept: 'application/json' }
        }
    ).then(res => {
        if (res.status >= 400) {
            throw new Error(res.status);
        }
        return res.json(); // another promise
    })
        .then(data => ejs.src_views_discover({ data }))
        .then(html => {
            main.innerHTML = html;
        })
        .catch(err => { console.error(err); });
}


// yes
function getRooms () {
    fetch('/rooms',
        {
            method: 'GET',
            headers: { Accept: 'application/json' }
        }
    ).then(res => {
        if (res.status >= 400) {
            console.log('error');
        } else if (res.url.includes('/login')) {
            getLogin();
        } else {
            window.location = '#rooms?id=none';

            const main = document.querySelector('main');
            main.innerHTML = ejs.src_views_rooms(); // work in progress
        }
    })
        .catch(err => { console.error(err); });
}

function getExchange () {
    window.location = '#exchange?id=none';
    const main = document.querySelector('main');

    main.innerHTML = ejs.src_views_wip(); // work in progress


    fetch('/exchange',
        {
            method: 'GET',
            headers: { Accept: 'application/json' }
        }
    ).then(res => {
        if (res.status >= 400) {
            throw new Error(res.status);
        }
        return res.json(); // another promise
    })
        .then(data => ejs.src_views_exchange(data))
        .then(html => {
            // main.innerHTML = html; there is no main yet
        })
        .catch(err => { console.error(err); });
}

function getSettings () {
    window.location = '#settings'
    const main = document.querySelector('#content');
    fetch('/user/settings/61ad6f782ca3a5597924d09f',
        {
            method: 'GET',
            headers: { Accept: 'application/json' }
        }
    ).then(res => {
        if (res.status >= 400) {
            throw new Error(res.status);
        }
        return res; // another promise
    })

        .then(async res => {
            if (res.url.includes('/login')) {
                getLogin()
            } else {
                const data = await res.json();
                main.innerHTML = ejs.src_views_settings({ result: data });

                main.querySelector('#regenerate_image').onclick = () => {
                    fetch('/user/identicon/random')
                        .then(res => res.blob())
                        .then(blob => {
                            const url = URL.createObjectURL(blob);
                            console.log(blob)
                            main.querySelector('#picture').src = url;
                        })
                }


                main.querySelectorAll('form').forEach(form => {
                    form.addEventListener('submit', (event) => {
                        event.preventDefault();
                        const form = new FormData(event.target);


                        const method = event.target.method;
                        fetch(event.target.action, {
                            method: method,
                            body: form
                        }).then(res => {
                            alert('Profile updated')
                            getSettings();
                        });
                    });
                })
            }
        })
        .catch(err => { console.error(err); });
}

// function getDiscoverSingleCollection() {
//     window.location = '#discover?id=single_collection';

//     const main = document.querySelector('main');

//     fetch('/discover/',
//         {
//             method: 'GET',
//             headers: { Accept: 'application/json' }
//         }
//     ).then(res => {
//         if (res.status >= 400) {
//             throw new Error(res.status);
//         }
//         return res.json(); // another promise
//     })
//         .then(data => ejs.src_views_discover({ data }))
//         .then(html => {
//             main.innerHTML = html;
//         })
//         .catch(err => { console.error(err); });
// }
