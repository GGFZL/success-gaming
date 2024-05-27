let systems = [];
let platforms = [];
let genres = [];
let games = [];

window.onload = function(){
    ajaxCallBack("nav", printNavigation);
    ajaxCallBack("systems", printSystems);
    ajaxCallBack("games", printTrendingGames);

    $("#sort").change(filterChange);
    $("#inStock").change(filterChange);
    printCartLength();
}

/*----------------------------- AJAXCALLBACK -----------------------------*/
function ajaxCallBack(url, result){
    $.ajax({
        url: "assets/data/" + url + ".json",
        method: "get",
        dataType: "json",
        success: function(data){
            result(data);
        },
        error: function(xhr){console.log(xhr);}
    });
}
/* print navigation */
function printNavigation(data) {
    let ispis = "";
    const currentPage = location.pathname.split('/').pop();
    for (let nav of data) {
        if (nav.name === 'Home') {
            ispis += `<li class="nav-item"><a href="${nav.href}" class="nav-link mx-3">${nav.name}</a></li>`;
        } else if ((nav.href === '#about' && (currentPage === 'contact.html' || currentPage === 'author.html' || currentPage === 'cart.html')) ||
            nav.href === currentPage) {
            continue;
        } else {
            ispis += `<li class="nav-item"><a href="${nav.href}" class="nav-link mx-3">${nav.name}</a></li>`;
        }
    }
    $("#navigation").html(ispis);
}

/* print of select lists */
function printSystems(data){
    let html = `<option value="0">Systems</option>`;
    data.forEach(system => {
        html+=`<option value="${system.id}">${system.name}</option>`;
    });
    $('#systems').html(html);
    systems = data;
    $('#systems').change(filterChange);

    ajaxCallBack("platforms", printPlatforms);
}
function printPlatforms(data){
    let html = `<option value="0">Platforms</option>`;
    data.forEach(platform => {
        html+=`<option value="${platform.id}">${platform.name}</option>`;
    });
    $('#platforms').html(html);
    platforms = data;
    $('#platforms').change(filterChange);
    
    ajaxCallBack("genres", printGenres);
}
function printGenres(data){
    let html = `<option value="0">Genres</option>`;
    data.forEach(genre => {
        html+=`<option value="${genre.id}">${genre.name}</option>`;
    });
    $('#genres').html(html);
    genres = data;
    $('#genres').change(filterChange);

    ajaxCallBack("games", function(data){
        setItemLS("games", data);
        printGames(data);
    });
}
/* print games */
function printGames(data){
    data = filterGames(data);
    data = inStockCheck(data);
    data = sort(data);
    let ispis = "";
    if (data.length === 0) {
        $('#noResultsMessage').show();
    } else {
        $('#noResultsMessage').hide();
    for(let g of data){
        ispis += `<div class="col-lg-4 col-md-6 flex-column divzaButton mb-5">
        <figure class="figure">
            <img src="${g.image.src}" class="figure-img img-fluid rounded" alt="${g.image.alt}">
            <figcaption class="figure-caption d-flex justify-content-between text-white ">
                <p>${g.name}</p>
                <p>${g.price} RSD</p>
            </figcaption>
            <input type="button" data-id="${g.id}" value="ADD TO CART" class="cartButton w-100 text-center btn-secondary button btn" />
        </figure>
    </div>`;
    }
}
    $('.gamesDivShop').html(ispis);
    $('.cartButton').click(addToCart);

    games = data;
}   
function filterGames(data) {
    const selectedPlatform = parseInt($('#platforms').val());
    const selectedSystem = parseInt($('#systems').val());
    const selectedGenre = parseInt($('#genres').val());

    return data.filter(game => {
        let platformMatch = !selectedPlatform || game.platformId === selectedPlatform;
        let systemMatch = !selectedSystem || game.systemsId.includes(selectedSystem);
        let genreMatch = !selectedGenre || game.genresId.includes(selectedGenre);

        return platformMatch && systemMatch && genreMatch;
    });
}

function printTrendingGames(data){
    let ispis = "";
    for(let g of data){
        ispis += `<div class="col-lg-4 col-md-6 flex-column divzaButton mb-5">
        <figure class="figure">
            <img src="${g.image.src}" class="figure-img img-fluid rounded" alt="${g.image.alt}">
            <figcaption class="figure-caption d-flex justify-content-between text-white ">
                <p>${g.name}</p>
                <p>${g.price} RSD</p>
            </figcaption>
        </figure>
    </div>`;
        if(g.trending == true){
            $('.gamesDivTrend').html(ispis);
        }
    }
}
/* search dugme */
$('#inputSearch').on('input', function () {
    let searchValue = $(this).val().toLowerCase();
    let searchResult = [];

    if (searchValue.trim() === '') {
        loadAllGames();
    } else {
        ajaxCallBack("games", function (data) {
            searchResult = data.filter(game => game.name.toLowerCase().includes(searchValue));
            printGames(searchResult);
        });
    }
});

// Function to load all games
function loadAllGames() {
    ajaxCallBack("games", function (data) {
        printGames(data);
    });
}

/* input numbers */
$('input[name="minPrice"], input[name="maxPrice"]').click(function() {
    $(this).val("");
});

$('input[name="minPrice"], input[name="maxPrice"]').keyup(function(e) {
    let minPrice = $('input[name="minPrice"]').val();
    let maxPrice = $('input[name="maxPrice"]').val();
    
    ajaxCallBack("games", function(games) {
        let filteredProducts = [];
        for (let g of games) {
            if (g.price >= minPrice && g.price <= maxPrice) {
                filteredProducts.push(g);
            }
        }
        printGames(filteredProducts);
    });
});

/* sorting */
function sort(data){
    const sortType = document.getElementById('sort').value;
    if(sortType == 'asc'){
        return data.sort((a,b) => a.price > b.price ? 1 : -1);
    }else if(sortType == 'desc'){
        return data.sort((a,b) => a.price < b.price ? 1 : -1);
    }else{
        return data.sort(function(a,b){
            if(sortType == 'nameAsc'){
                if(a.name < b.name){
                    return -1;
                }
                else if(a.name > b.name){
                    return 1;
                }
                else {return 0;}
            }
            if(sortType == 'nameDesc'){
                if(a.name > b.name){
                    return -1;
                }
                else if(a.name < b.name){
                    return 1;
                }
                else {return 0;}
            }
        })
    }
}
/* inStock */
function inStockCheck(data){
    var isInStock = $("input[name='inStock']:checked").val();
    if(isInStock == true){
        return data.filter(x => x.inStock);
    }if(isInStock == false){
        return data.filter(x => !x.inStock);
    }
    return data;
}
/* filter change */
function filterChange(){
    ajaxCallBack("games", printGames);
}
/*----------------------------- header animations -----------------------------*/
$(window).scroll(function() {
    if ($(this).scrollTop() > 0) {
      $('header').addClass('dark').animate({opacity: 1}, 1000);
    } else {
      $('header').removeClass('dark').animate({opacity: 0.8}, 1000);
    }
});
/* ----------------------------------------------- local storage ------------------------------------------------ */
function setItemLS(game, data){
    localStorage.setItem(game, JSON.stringify(data));
}
function getGameFromLocalStorage(name){
    return JSON.parse(localStorage.getItem(name));
}
function addToCart() {
    let id = $(this).data('id');
    let gamesFromLS = getGameFromLocalStorage('gameCart') || [];
  
    let gameIndex = gamesFromLS.findIndex(g => g.id === id);
    if (gameIndex !== -1) {
      gamesFromLS[gameIndex].quantity++;
    } else {
      gamesFromLS.push({id: id, quantity: 1});
    }
  
    setItemLS('gameCart', gamesFromLS);
    printCartLength();
    animateCartIcon();
}

function printCartLength() {
    // kad god se klikne na dugme 'ADD TO CART' povecava se broj
    let gamesFromLS = getGameFromLocalStorage('gameCart') || [];

    let totalQuantity = gamesFromLS.reduce((number, currentGame) => {
        return number + currentGame.quantity;
    }, 0);
    if (window.location.href === "https://successgaming.netlify.app/cart") {
        //https://successgaming.netlify.app/cart
        //http://127.0.0.1/WP2_SAJT_POPRAVNI/cart.html
    if (!gamesFromLS.length) {
        emptyCart();
    } else {
        displayCart();
    }
    if (totalQuantity === 0) {
        $('#gameNumbers').html(`${showEmpty}`);
      } else {
        $('#gameNumbers').html(`${totalQuantity}`);
      }
}

$('#gameNumbers').html(`${totalQuantity}`);
}

function emptyCart(){
    let html = `
    <div class="col-12 flex-column justify-content-center align-items-center">
        <div class="col-12 p-3 justify-content-center d-flex">
            <i class="fas fa-shopping-cart"></i>
        </div>
        <div class="col-12 justify-content-center d-flex">
            <h3>Your cart is empty</h3>
        </div>
        <div class="col-12 p-3 justify-content-center d-flex">
            <a href="shop.html" class="text-white" id="aBackToGames">Back to games</a>
        </div>
    </div>
    `;
    $("#cartContent").html(html);
}
function displayCart(){
    let gamesFromLS = getGameFromLocalStorage('gameCart');

    ajaxCallBack("games", function(data){
        let gamesDisplay = [];

        for(let game of gamesFromLS){
            let foundGame = data.find(g => g.id === game.id);
            if(foundGame){
                gamesDisplay.push({...foundGame, quantity: game.quantity});
            }
        }

        generateGame(gamesDisplay);
    });
}
function generateGame(gamesDisplay){
    let html = `<h3>Cart<h3>`;
    let totalPrice = 0;
    for(let g of gamesDisplay){
      let gamePrice = g.price * g.quantity;
      totalPrice += gamePrice;
      html += `
      <div class="row d-flex justify-content-center align-items-center mt-5" id="gamesCartrow">
        <div class="col-lg-4">
          <img src="${g.image.src}" class="img-fluid" alt="${g.image.alt}">
        </div>
        <div class="col-lg-3 justify-content-center d-flex">
          <p>${g.name}</p>
        </div>
        <div class="col-lg-2 d-flex justify-content-center">
          <button class="btn btn-secondary btn-sm" onclick="decreaseQuantity(${g.id})"><i class="text-white fas fa-minus"></i></button>
          <span class="mx-3">${g.quantity}</span>
          <button class="btn btn-secondary btn-sm" onclick="increaseQuantity(${g.id})"><i class="text-white fas fa-plus"></i></button>
        </div>
        <div class="col-lg-2 mt-2 justify-content-center d-flex">
          <p>${gamePrice} RSD</p>
        </div>
        <div class="col-lg-1 justify-content-center d-flex">
          <button class="button btn text-white" onclick="removeFromCart(${g.id})"><i class="fa fa-times" aria-hidden="true"></i></button>
        </div>
      </div>
      `;
    }
    html +=`<button id="clearCartButton" onclick="clearAll()" class="button btn text-white mt-3 mb-2">CLEAR CART</button>`;
    totalPrice +=" RSD";
    $("#totalPrice").html(totalPrice);
    $("#cartContent").html(html);
  };
function removeFromCart(id) {
    let gamesFromLS = getGameFromLocalStorage('gameCart') || [];
    let gameIndex = gamesFromLS.findIndex(g => g.id === id);
    if (gameIndex !== -1) {
      gamesFromLS.splice(gameIndex, 1);
      setItemLS('gameCart', gamesFromLS);
      printCartLength();
      displayCart();
    }
  }
  
function animateCartIcon(){
    let cartIcon = $('.cart');
    cartIcon.animate({
        opacity: 0.2
    }, 100, function() {
        cartIcon.animate({
            opacity: 1
        }, 100);
    });
}

function increaseQuantity(id) {
    let gamesFromLS = getGameFromLocalStorage('gameCart') || [];
    let gameIndex = gamesFromLS.findIndex(g => g.id === id);
  
    if (gameIndex !== -1) {
      gamesFromLS[gameIndex].quantity++;
      setItemLS('gameCart', gamesFromLS);
      printCartLength();
      displayCart();
    }
}
  
function decreaseQuantity(id) {
let gamesFromLS = getGameFromLocalStorage('gameCart') || [];
let gameIndex = gamesFromLS.findIndex(g => g.id === id);

    if (gameIndex !== -1) {
        if (gamesFromLS[gameIndex].quantity === 1) {
        return; // exit the function if quantity is already at 1
        } else {
        gamesFromLS[gameIndex].quantity--;
        }

        setItemLS('gameCart', gamesFromLS);
        printCartLength();
        displayCart();
    }
}

$("#finish").click(function (event) {
    event.preventDefault();
    let gamesFromLS = getGameFromLocalStorage('gameCart') || [];

    if (gamesFromLS.length === 0) {
        alert("Your cart is empty. Add some games before finishing shopping.");
    } else {
        let message;

        if (gamesFromLS.length === 1) {
            let game = gamesFromLS[0];
            message = `Congratulations! You have successfully completed your purchase. Your activation code${game.quantity > 1 ? 's' : ''} for the bought game will be sent to your email address.`;
        } else {
            message = `Congratulations! You have successfully completed your purchase. Your activation codes for the bought games will be sent to your email address.`;
        }

        alert(message);
        clearAll();
    }
});

function clearAll() {
    localStorage.setItem('gameCart', JSON.stringify([]));
    $("#totalPrice").html("0 RSD");
    printCartLength();
    displayCart();
  }