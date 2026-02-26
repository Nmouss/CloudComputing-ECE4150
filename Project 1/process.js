const API_URL = "https://ys9ss38x6h.execute-api.us-east-1.amazonaws.com/dev";
const PHOTOGALLERY_S3_BUCKET_URL = "photobucket-mouss-4150"; // HELLO


function clearSession() {
    sessionStorage.clear();
    location.href = 'login.html';
};

function getUrlParam(name) {
    const results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
    return results ? results[1] : 0;
}

function processLogin() {
    var username = document.getElementById("username").value;
    var password = document.getElementById("password").value;

    var datadir = {
        username: username,
        password: password
    };

    fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datadir)
    })
    .then(response => response.json())
    .then(data => {
        var result = JSON.parse(data.body);
        console.log(result);
        if (result.result) {
            sessionStorage.setItem('username', result.userdata.username);
            sessionStorage.setItem('name', result.userdata.name);
            sessionStorage.setItem('email', result.userdata.email);
            location.href = 'index.html';
        } else {
            document.getElementById("message").innerHTML = result.message;
        }
        console.log(data);
    })
    .catch(error => {
        console.log(error);
        console.log("Failed");
    });
}

function processSignup() {
    var username = document.getElementById("username").value;
    var password = document.getElementById("password").value;
    var name = document.getElementById("name").value;
    var email = document.getElementById("email").value;

    var datadir = {
        username: username,
        password: password,
        name: name,
        email: email
    };

    fetch(`${API_URL}/signup`, {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datadir)
    })
    .then(response => response.json())
    .then(data => {
        var result = JSON.parse(data.body);
        console.log(result);
        document.getElementById("message").innerHTML = result.message;
        if (result.result) {
            sessionStorage.setItem('username', result.userdata.username);
            document.getElementById("messageaction").innerHTML = `Click <a href="confirmemail.html">here</a> to confirm your email`;
        }
    })
    .catch(() => console.log("Failed"));
}

function loadConfirmEmailPage() {
    var username = document.getElementById("username").value;
    var code = document.getElementById("code").value;

    var datadir = {
        username: username,
        code: code
    };

    fetch(`${API_URL}/confirmemail`, {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datadir)
    })
    .then(response => response.json())
    .then(data => {
        var result = JSON.parse(data.body);
        console.log(result);
        if (result.result) {
            document.getElementById("confirmemail-message").innerHTML = result.message;
            document.getElementById("confirmemail-message-action").innerHTML = `Click <a href="login.html">here</a> to login`;
        } else {
            document.getElementById("confirmemail-message").innerHTML = result.message;
        }
        console.log(data);
    })
    .catch(error => {
        console.log(error);
        console.log("Failed");
    });
}

function uploadPhoto() {
    var title = document.getElementById("title").value;
    var description = document.getElementById("description").value;
    var tags = document.getElementById("tags").value;
    var imageFile = document.getElementById('imagefile').files[0];

    var contenttype = imageFile.type;
    var filename = imageFile.name;
    console.log(imageFile);
    console.log(filename);

    fetch(`${API_URL}/uploadphoto/${filename}`, {
        method: 'PUT',
        headers: { "Content-Type": contenttype },
        body: imageFile
    })
    .then(response => {
        if (response.status === 200) {
            console.log("Uploaded");
            processAddPhoto(filename, title, description, tags);
        }
    })
    .catch(error => console.log(error));
}

function searchPhotos() {
    var query = document.getElementById("query").value;
    console.log(query);
    var datadir = {
        query: query
    };

    fetch(`${API_URL}/search`, {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datadir)
    })
    .then(response => response.json())
    .then(data => {
        sessionStorage.setItem('query', query);
        sessionStorage.setItem('searchdata', JSON.stringify(data));
        location.href = 'search.html';
    })
    .catch(() => console.log("Failed"));
}

function loadSearchPage() { // This function is being invoked when we go to the search HTML
    var query = sessionStorage.getItem('query');
    var data = JSON.parse(sessionStorage.getItem('searchdata'));
    console.log(data);
    document.getElementById("searchquery-container").innerHTML = "Showing search results for: " + query;
    var htmlstr = "";
    
    console.log(data.body);

    data.body.forEach(function(value) {
        htmlstr = htmlstr + `<div class="cbp-item idea web-design theme-portfolio-item-v2 theme-portfolio-item-xs"> 
                                <div class="cbp-caption"> 
                                    <div class="cbp-caption-defaultWrap theme-portfolio-active-wrap"> 
                                        <img src="${value.URL}" alt=""> 
                                        <div class="theme-icons-wrap theme-portfolio-lightbox"> 
                                            <a class="cbp-lightbox" href="${value.URL}" data-title="Portfolio"> 
                                                <i class="theme-icons theme-icons-white-bg theme-icons-sm radius-3 icon-focus"></i> 
                                            </a> 
                                        </div> 
                                    </div> 
                                </div> 
                                <div class="theme-portfolio-title-heading"> 
                                    <h4 class="theme-portfolio-title"><a href="viewphoto.html?id=${value.PhotoID}">${value.Title}</a></h4>
                                    <span class="theme-portfolio-subtitle">by ${value.Username}<br>${value.CreationTime}</span> 
                                </div>
                            </div>`;
    });

    document.getElementById('portfolio-4-col-grid-search').innerHTML = htmlstr;
    handlePortfolio4ColGridSearch();
}

function processAddPhoto(filename, title, description, tags) {
    var username = sessionStorage.getItem('username');
    var uploadedFileURL = `https://${PHOTOGALLERY_S3_BUCKET_URL}.s3.amazonaws.com/photos/${filename}`;
    console.log(uploadedFileURL);
    var datadir = {
        username: username,
        title: title,
        description: description,
        tags: tags,
        uploadedFileURL: uploadedFileURL
    };

    fetch(`${API_URL}/photos`, {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datadir)
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        location.href = 'index.html';
    })
    .catch(() => console.log("Failed"));
}

function handlePortfolio4ColGridSearch() {
    jQuery('#portfolio-4-col-grid-search').cubeportfolio({
        filters: '#portfolio-4-col-grid-filter',
        layoutMode: 'grid',
        defaultFilter: '*',
        animationType: 'rotateRoom',
        gapHorizontal: 30,
        gapVertical: 30,
        gridAdjustment: 'responsive',
        mediaQueries: [{ width: 1500, cols: 4 }, { width: 1100, cols: 4 }, { width: 800, cols: 4 }, { width: 550, cols: 2 }, { width: 320, cols: 1 }],
        caption: ' ',
        displayType: 'bottomToTop',
        displayTypeSpeed: 100,
        lightboxDelegate: '.cbp-lightbox',
        lightboxGallery: true,
        lightboxTitleSrc: 'data-title',
        lightboxCounter: '<div class="cbp-popup-lightbox-counter">{{current}} of {{total}}</div>',
    });
}

function handlePortfolio4ColGrid() {
    jQuery('#portfolio-4-col-grid').cubeportfolio({
        filters: '#portfolio-4-col-grid-filter',
        layoutMode: 'grid',
        defaultFilter: '*',
        animationType: 'rotateRoom',
        gapHorizontal: 30,
        gapVertical: 30,
        gridAdjustment: 'responsive',
        mediaQueries: [{ width: 1500, cols: 4 }, { width: 1100, cols: 4 }, { width: 800, cols: 4 }, { width: 550, cols: 2 }, { width: 320, cols: 1 }],
        caption: ' ',
        displayType: 'bottomToTop',
        displayTypeSpeed: 100,
        lightboxDelegate: '.cbp-lightbox',
        lightboxGallery: true,
        lightboxTitleSrc: 'data-title',
        lightboxCounter: '<div class="cbp-popup-lightbox-counter">{{current}} of {{total}}</div>',
    });
}

function checkIfLoggedIn() {
    var email = sessionStorage.getItem('email');
    var username = sessionStorage.getItem('username');
    if (email == null || username == null) {
        location.href = 'login.html';
    }
}

function deleteItem(event) {
    const btn = event.currentTarget || event.target;
    console.log("in the function")
    // function for calling fetch to delete
    console.log(window.location.pathname)
    if (window.location.pathname === "/index.html"){
        var requestData = {
            photoId: btn.dataset.photoid,
            creationTime:  btn.dataset.creationtime
        }
    } 
    else{
        var requestData = {
            photoId: btn.dataset.photo,
            creationTime:  btn.dataset.photo
        }
    }
    fetch(`${API_URL}/delete`, { // post request for delete
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData)
    })
    .then(response => {
        console.log(response.text());
        if (response.status == 200){
            console.log("Deleted");
            location.href = 'index.html';
        }
    })
    .catch(() => console.log("Failed Delete"));
}

function searchTagLoad(element) {
    sessionStorage.setItem("query", element.textContent.trim());
    // Function that will be used to generate when searching by tag
    var datadir = {
        query: element.textContent.trim()
    }

    fetch(`${API_URL}/searchTag`, { // make a more sophisticated lambda function for searching.
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datadir)
    })
    .then(response => response.json())
    .then(data => {
        sessionStorage.setItem('searchdata', JSON.stringify(data));
        location.href = 'searchTag.html';
    })
    .catch(() => console.log("error"));
}

function updatePhoto(photo_data) {
    data = {
        ID: photo_data
    }

    fetch(`${API_URL}/getdata`, {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        console.log(data.body.Item.Description);

        // These are needed for actually storing in the session
        sessionStorage.setItem('Description', data.body.Item.Description);
        sessionStorage.setItem('Tags', data.body.Item.Tags);
        sessionStorage.setItem('Title', data.body.Item.Title);
        sessionStorage.setItem("ImageLink", data.body.Item.URL);
        sessionStorage.setItem("PhotoID", photo_data);
        location.href = 'updatephoto.html';
    })
    .catch(() => console.log("Failed"));
}

function updatePhotoData(){ // we are here
    // I need to get the data from the document
    console.log("hello");
    var photoID = (document.getElementById("photoID").textContent.split(" "))[1];
    var title = document.getElementById("title").value;
    var description = document.getElementById("description").value;
    var tags = document.getElementById("tags").value;

    var data_update = {
        PhotoID: photoID,
        Title: title,
        Description: description,
        Tags: tags
    }

    fetch(`${API_URL}/update`, {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data_update)
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        location.href = 'index.html';
    })
}

function loadUpdatePhotoPage(){
    console.log(window.location.pathname);
 
    const imgElement = document.getElementById("display-image");
    const titleInput = document.getElementById("title");
    const descInput = document.getElementById("description");
    const tagsInput = document.getElementById("tags");
    const photoIDHTML = document.getElementById("photoID");

    console.log(photoIDHTML);
    console.log(sessionStorage.getItem("PhotoID"));

    if (imgElement) imgElement.src = sessionStorage.getItem("ImageLink") || "";
    titleInput.value = sessionStorage.getItem("Title") || "";
    descInput.value  = sessionStorage.getItem("Description") || "";
    tagsInput.value  = sessionStorage.getItem("Tags") || "";
    photoIDHTML.textContent = "Uploaded: " + sessionStorage.getItem("PhotoID") || "";
}

function loadHomePage() {
    checkIfLoggedIn();
    document.getElementById("userdata-container").innerHTML = "Logged in as " + sessionStorage.getItem('name') + " (" + sessionStorage.getItem('username') + ")";
    var htmlstr = "";

    fetch(`${API_URL}/photos`, {
        method: 'GET',
        headers: { "Content-Type": "application/json" }
    })
    .then(response => response.json())
    .then(data => {
        data.body.forEach(function(value) {
            console.log(value.URL);
            htmlstr = htmlstr + `<div class="cbp-item idea web-design theme-portfolio-item-v2 theme-portfolio-item-xs"> 
                                    <div class="cbp-caption"> 
                                        <div class="cbp-caption-defaultWrap theme-portfolio-active-wrap"> 
                                            <img src="${value.URL}" alt=""> 
                                            <div class="theme-icons-wrap theme-portfolio-lightbox"> 
                                                <a class="cbp-lightbox" href="${value.URL}" data-title="Portfolio"> <i class="theme-icons theme-icons-white-bg theme-icons-sm radius-3 icon-focus"></i> </a> 
                                            </div> 
                                        </div> 
                                    </div> 
                                    <div class="theme-portfolio-title-heading"> 
                                        <h4 class="theme-portfolio-title">
                                            <a href="viewphoto.html?id=${value.PhotoID}">${value.Title}</a>
                                        </h4> 
                                        <span class="theme-portfolio-subtitle">
                                            by ${value.Username}<br>
                                            ${value.CreationTime}
                                        </span> 
                                        <span style="padding: 1em;position: relative;">
                                            <button data-photoid="${value.PhotoID}" data-creationtime="${value.CreationTime}" class="home_delete btn-danger">Delete</button>
                                        </span> 
                                    </div> 
                                </div>`;
        });
        const grid = document.getElementById('portfolio-4-col-grid');
        grid.innerHTML = htmlstr;
        
        grid.querySelectorAll('.home_delete').forEach(btn => {
            btn.addEventListener('click', function(event) {
                console.log(`${API_URL}/delete`);
                deleteItem(event);
            });
        });

        handlePortfolio4ColGrid();
    })
    .catch(() => console.log("Failed"));
}

function loadAddPhotosPage() {
    checkIfLoggedIn();
    document.getElementById("userdata-container").innerHTML = "Logged in as " + sessionStorage.getItem('name') + " (" + sessionStorage.getItem('username') + ")";
}

function loadViewPhotoPage() {
    checkIfLoggedIn();
    document.getElementById("userdata-container").innerHTML = "Logged in as " + sessionStorage.getItem('name') + " (" + sessionStorage.getItem('username') + ")";
    var PhotoID = getUrlParam('id');
    var htmlstr = "";
    var tagstr = "";


    fetch(`${API_URL}/photos/${PhotoID}`, {
        method: 'GET',
        headers: { "Content-Type": "application/json" }
    })
    .then(response => response.json())
    .then(data => {
        var photo = data.body[0];
        htmlstr = htmlstr + `<img class="img-responsive" src="${photo.URL}" alt=""> 
            <div style="display: block;position: relative;float: right;margin: 1em;">
                <button id="photo_update" data-photo="${photo.PhotoID}">Update</button> 
                <button id="photo_delete" data-photo="${photo.PhotoID}">Delete</button>
            </div>
            <div class="blog-grid-content"> 
                <h2 class="blog-grid-title-lg">
                    <a class="blog-grid-title-link" href="#">${photo.Title}</a>
                </h2> 
                <p>By: ${photo.Username}</p> 
                <p>Uploaded: ${photo.CreationTime}</p> 
                <p>${photo.Description}</p>
            </div>`;
        const container = document.getElementById('viewphoto-container');
        container.innerHTML = htmlstr;
        
        document.getElementById('photo_update').addEventListener('click', function() {
            console.log("UPDATE!!!!", this.getAttribute('data-photo'));
            const data = this.getAttribute('data-photo');
            updatePhoto(data);

            // This is where we lock in and take the world
        });
        document.getElementById('photo_delete').addEventListener('click', function(event) { // this function is not working right now
            console.log(`${API_URL}/delete`);
            deleteItem(event);
        });

        var tags = photo.Tags.split(',');
        tags.forEach(function(value) {
            tagstr = tagstr + `<li><a onclick="searchTagLoad(this)" class="radius-50" href="#">${value}</a></li>`; // added on click
        });
        document.getElementById('tags-container').innerHTML = tagstr;
    })
    .catch(() => console.log("Failed"));
}

document.addEventListener("DOMContentLoaded", function() {
    const loginForm = document.getElementById("loginform");
    if (loginForm) loginForm.addEventListener("submit", function(event) {
        event.preventDefault();
        processLogin();
    });

    const signupForm = document.getElementById("signupform");
    if (signupForm) signupForm.addEventListener("submit", function(event) {
        event.preventDefault();
        processSignup();
    });

    const addPhotoForm = document.getElementById("addphotoform");
    if (addPhotoForm) addPhotoForm.addEventListener("submit", function(event) {
        event.preventDefault();
        uploadPhoto();
    });

    const searchForm = document.getElementById("searchform");
    if (searchForm) searchForm.addEventListener("submit", function(event) {
        event.preventDefault();
        searchPhotos();
    });

    const confirmEmailForm = document.getElementById("confirmemail-form");
    if (confirmEmailForm) confirmEmailForm.addEventListener("submit", function(event) {
        event.preventDefault();
        loadConfirmEmailPage();
    });

    const logoutLink = document.getElementById("logoutlink");
    if (logoutLink) logoutLink.addEventListener("click", function(event) {
        event.preventDefault();
        clearSession();
    });
    const updateInformation = document.getElementById("update-information");
    if (updateInformation) updateInformation.addEventListener("submit", function(event){
        event.preventDefault();
        updatePhotoData();
    })

    var pathname = window.location.pathname;

    if (pathname == '/index.html' || pathname === '/') {
        loadHomePage();
    } else if (pathname == '/addphoto.html') {
        loadAddPhotosPage();
    } else if (pathname == "/viewphoto.html") {
        loadViewPhotoPage();
    } else if (pathname == "/search.html") {
        loadSearchPage(); 
    } else if (pathname == "/confirmemail.html") {
        var username = sessionStorage.getItem('username');
        if (document.getElementById("username")) document.getElementById("username").value = username;
    } else if (pathname == "/searchTag.html") { // Making new HTML is the solution
        loadSearchPage();
    }
    else if (pathname == "/updatephoto.html"){
        loadUpdatePhotoPage();
    }
});
