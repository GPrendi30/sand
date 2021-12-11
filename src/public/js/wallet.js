const connectWeb3 = async () => {
    let web3;
    if (window.ethereum || window.web3) {
        if (window.ethereum) { // modern dapp browsers and metamask
            web3 = new Web3(window.ethereum);
            try {
                // Request account access if needed
                await window.ethereum.enable();
                console.log('Web3 enabled!');
            } catch (error) {
                console.log('user denied account access');
            }
        } else if (window.web3) { // legacy dapp browsers and wallets
            web3 = window.web3;
        }
    } else {
        alert('Non-Ethereum browser detected. \nYou should consider trying an ETHEREUM wallet!')
    }

    return web3;
}
