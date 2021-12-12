
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

    main.innerHTML = ejs.src_views_index({ friends: [{ name: 'not-geri' }] });

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
        .then(data => ejs.views_index(data))
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

function getFollow () {
    window.location = '#follow?id=none';

    const main = document.querySelector('main');

    main.innerHTML = ejs.src_views_follow();
}

function getFriendList () {
    window.location = '#friendlist?id=none';

    const main = document.querySelector('main');

    main.innerHTML = ejs.src_views_friendlist({ friends: [{ name: 'geri' }, { name: 'geri' }, { name: 'geri' }, { name: 'geri' }, { name: 'geri' }, { name: 'geri' }, { name: 'geri' }] });
}

function getDiscover () {
    window.location = '#dicover?id=none';

    const main = document.querySelector('main');

    main.innerHTML = ejs.src_views_discover();
}

function getRooms () {
    window.location = '#rooms?id=none';

    const main = document.querySelector('main');

    main.innerHTML = ejs.src_views_wip(); // work in progress
}

function getExchange () {
    window.location = '#exchange?id=none';

    const main = document.querySelector('main');

    main.innerHTML = ejs.src_views_wip(); // work in progress
}


