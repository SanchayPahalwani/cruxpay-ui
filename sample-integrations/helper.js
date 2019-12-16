
function hideDom(id) {
    var arr;
    if (!Array.isArray(id)) {
        arr = [id];
    } else {
        arr = id;
    }
    arr.forEach(function (domid) {
        document.getElementById(domid).style.display = 'none';
    });
}

function showDom(id) {
    var arr;
    if (!Array.isArray(id)) {
        arr = [id];
    } else {
        arr = id;
    }
    arr.forEach(function (domid) {
        document.getElementById(domid).style.display = 'initial';
    });
}

function displayUserInformation(user) {
    hideDom('coinswitch-container');
    document.getElementById('newPayIDName').textContent = 'newPayIDName: ' + user.newPayIDName;
    document.getElementById('encryptedNewPayIDPass').textContent = 'encryptedNewPayIDPass: ' + user.encryptedNewPayIDPass;
    showDom('userInformation');
}

function displayLoginContainer() {
    hideDom('userInformation');
    showDom('coinswitch-container');
}

function initSpinner() {
    var spinner = new Spinner().spin();
    document.getElementById('spinner').appendChild(spinner.el);
}
