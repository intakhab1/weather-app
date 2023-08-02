const userTab = document.querySelector("[data-user-weather]")
const searchTab = document.querySelector("[data-search-weather]")

const userContainer= document.querySelector(".weather-container")

const grantAccessScreen = document.querySelector(".grant-location-container")
const userWeatherScreen = document.querySelector(".user-weather-info-container")
const searchInput = document.querySelector("[data-search-input]")
const searchScreen = document.querySelector("[data-search-form]")
const loadingScreen = document.querySelector(".loading-container")

const grantAccessButton = document.querySelector("[data-grant-access]")


// initial requirement
const API_KEY = "e836297f92c10ceaf63d1ddf87fd4e7d";
let currentTab = userTab;
currentTab.classList.add("current-tab")
getFromSessionStorage();  // initially load Your screen if we have stored the Coordinates in local session storage





// Event listerners
// 1 - On userTab
userTab.addEventListener("click" , ()=>{
    switchTab(userTab); // switch to user tab if user clicked on user tab
})

// 2 - On searchTAb
searchTab.addEventListener("click" , ()=>{
    switchTab(searchTab); // switch to user tab if user clicked on user tab
})

// 3 - on Grant Access button
grantAccessButton.addEventListener('click' , getLocation);

// 4 - on searchScreen/searchForm
searchScreen.addEventListener('submit' , (e)=>{
    e.preventDefault();

    if(searchInput.value === "") return;
    fetchSearchWeatherInfo(searchInput.value);
    }
)


// Funtions

// 1- grant location

function getLocation(){
    if(navigator.geolocation){ // check if browser support geolocation or not , if yes then getCurrentPosition
        navigator.geolocation.getCurrentPosition(showPosition);
    }
    else{
        // show an alert for no geolocation support by the browser
    }
}
function showPosition(position){
    const userCoordinates = {
        lat : position.coords.latitude,
        lon : position.coords.longitude,
    }
    sessionStorage.setItem("user-coordinates" , JSON.stringify(userCoordinates)); // Now save the userCoordinates in local session storage
    fetchUserWeatherInfo(userCoordinates); // API CALL
}


// 2- To switch between tabs (your weather and Search weather)

function switchTab(clickedTab){
    if(clickedTab != currentTab){
        currentTab.classList.remove("current-tab");
        currentTab = clickedTab;
        currentTab.classList.add("current-tab");

        // 1 - Clicked On Search Weather Tab
        if(!searchScreen.classList.contains("active")){   // we know initially that our current Tab is UserTab and it is obvious that user had clicked on Search Tab
            grantAccessScreen.classList.remove("active");
            userWeatherScreen.classList.remove("active");
            searchScreen.classList.add("active");
        }
        // 2 - Clicked on Your Weather Tab
        else{
            grantAccessScreen.classList.remove("active");
            userWeatherScreen.classList.remove("active");
            searchScreen.classList.remove("active");
            // to display weather info on your weather screen -> check local storage
            getFromSessionStorage(); // this function gives the live coordinates of user to get weather if we switch back to userTab
        }
    }
}

// 3 fucntion to get coordinates from local session storage if we have store them
function getFromSessionStorage(){
    const userCoordinates = sessionStorage.getItem("user-coordinate")
    
    if(!userCoordinates){  // if user coordinates not present in local storage then show grant access screen
        grantAccessScreen.classList.add("active");
    }else{
        const coordinates = JSON.parse(userCoordinates);
        fetchUserWeatherInfo(coordinates);
    }
}

// API's -> 1- Search Weather, 2- Your Weather


// 1- Search Weather API -> base on City Name 

async function fetchSearchWeatherInfo(city){
    // step 1 -> remove previous screens and show LOADING SCREEN
    userWeatherScreen.classList.remove("active")
    grantAccessScreen.classList.remove("active");
    loadingScreen.classList.add("active"); // SHOW LOADING SCREEN till API CALL

        try{

        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`);
        const data = await response.json();
        
        loadingScreen.classList.remove("active");
        userWeatherScreen.classList.add("active");
        renderWeatherInfo(data);

    }catch(err){

    }

}


// 2- Your Weather API -> based on Coordinates -> latitude and longitude

async function fetchUserWeatherInfo(coordinate){
    // step 1 -> remove previous screens and and show LOADING SCREEN
    grantAccessScreen.classList.remove("active");
    searchScreen.classList.remove("active");
    loadingScreen.classList.add("active"); // SHOW LOADING SCREEN till API CALL

    // step 2-> fetch coordinates
    const {lat, lon} = coordinate;  //latitude and longitude to find user location and show the weather

    // step 3-> make API call
    try{
        const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`)
        const data = await res.json();

        // step4-> Remove LOADING SCREEN after successfull API CALL
        loadingScreen.classList.remove("active") 

        // step 5-> Now show USER SCREEN and RENDER/ADD Weather Data in it 
        userWeatherScreen.classList.add("active")
        renderWeatherInfo(data);

    }catch(err){
        loadingScreen.classList.remove("active")
    }
}

function renderWeatherInfo(data){
    // fetch all elements which need to be dynamically updated On base of API response
    const cityName  = document.querySelector("[data-city-name]");
    const countryFlagIcon = document.querySelector("[data-country-flag-icon]");
    
    const weatherCondition  = document.querySelector("[data-weather-description]");
    const weatherConditionIcon = document.querySelector("[data-weather-icon]");
    const temp = document.querySelector("[data-temp]");
    
    const windSpeed = document.querySelector("[data-wind-speed]");
    const humidity = document.querySelector("[data-humidity]");
    const clouds = document.querySelector("[data-clouds]");
    
    // fetch data from API response
    cityName.innerText = data?.name;
    countryFlagIcon.src = `https://flagcdn.com/144x108/${data?.sys?.country.toLowerCase()}.png`;
    weatherCondition.innerText = data?.weather?.[0]?.description;
    weatherConditionIcon.src = `https://openweathermap.org/img/w/${data?.weather?.[0]?.icon}.png`;
    temp.innerText = `${data?.main?.temp} °C` ;
    windSpeed.innerText = `${data?.wind?.speed} m/s` ;
    humidity.innerText = `${data?.main?.humidity}%` ;
    clouds.innerText = `${data?.clouds?.all}%` ;

}





