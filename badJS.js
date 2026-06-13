const userName = new URLSearchParams(location.search).get('name');
document.getElementById('span').innerHTML = userName;
