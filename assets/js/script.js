//definig all the elements that will be used throughout the script
var cityInput = document.getElementById('cityInput')
var buttonEl = document.getElementById('get-weather')
var historyEl = document.getElementById('search-list')
var tempEl = document.querySelectorAll('.temp')
var humidityEl = document.querySelectorAll('.humidity')
var windEl = document.querySelectorAll('.wind')
var dateEl = document.querySelectorAll('.date-title')
var imgEl = document.querySelectorAll('.icons')


// getting the local storage for the search history
var searchHistory = [localStorage.getItem('history')]
searchHistory = searchHistory[0].split(',')
for (var i=0; i < 10; i++){
    var listItem = document.createElement('li')
    listItem.textContent = searchHistory[searchHistory.length - i]
    historyEl.append(listItem)
}

//getting days for the five day forecast, source: stackoverflow https://stackoverflow.com/questions/10032456/how-to-get-next-seven-days-from-x-and-format-in-js/10032641
var aryDates = [];
function GetDates(startDate, daysToAdd) {
    

    for (var i = 0; i <= daysToAdd; i++) {
        var currentDate = new Date();
        currentDate.setDate(startDate.getDate() + i);
        aryDates.push(DayAsString(currentDate.getDay()) + ", " + currentDate.getDate() + " " + MonthAsString(currentDate.getMonth()) + " " + currentDate.getFullYear());
    }

    return aryDates;
}

function MonthAsString(monthIndex) {
    var d = new Date();
    var month = new Array();
    month[0] = "January";
    month[1] = "February";
    month[2] = "March";
    month[3] = "April";
    month[4] = "May";
    month[5] = "June";
    month[6] = "July";
    month[7] = "August";
    month[8] = "September";
    month[9] = "October";
    month[10] = "November";
    month[11] = "December";

    return month[monthIndex];
}

function DayAsString(dayIndex) {
    var weekdays = new Array(7);
    weekdays[0] = "Sunday";
    weekdays[1] = "Monday";
    weekdays[2] = "Tuesday";
    weekdays[3] = "Wednesday";
    weekdays[4] = "Thursday";
    weekdays[5] = "Friday";
    weekdays[6] = "Saturday";

    return weekdays[dayIndex];
}

var startDate = new Date();
var aryDates = GetDates(startDate, 7);
console.log(aryDates)

var cityCoord = {}

// adding event listener to button for searching weather by city
buttonEl.addEventListener('click', function(event){
    // var cityName = cityInput.value
    var cityName = 'Chicago'
    cityInput.value = ''
    if (cityName.value == '') {
        var warning = document.createElement('p')
        warning.textContent = 'Please enter valid city'
        cityInput.append(warning)
    } else {
        searchHistory.push(cityName)
        localStorage.setItem('history', [searchHistory])
        getCoords(cityName)
        // getWeather(cityName)
    }
})

var gotCoords = false

//getting the coordinates of a city
function getCoords(city) {
    var requestFile = "city.list.json"
    fetch(requestFile)
        .then(function(response) {
            return response.json()
        })
        .then(function(data) {
            for (var i=0; i<data.length; i++) {
                if (city === data[i].name && data[i].country === 'US') {
                    console.log('coordinates',data[i].coord)
                    cityCoord.lon = (data[i].coord.lon)
                    cityCoord.lat = (data[i].coord.lat)
                    console.log(cityCoord.lon, cityCoord.lat)
                    gotCoords = true
                    getUV(cityCoord)
                    return cityCoord, gotCoords
                }   
            }
            
        })
}

function getUV(cityCoord) {
    if (gotCoords === true) {
        var lat = cityCoord.lat
        var lon = cityCoord.lon
        var api_key = '47f43b87ff3e52c0849cb88fe67bc91e'
        var requestUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&appid=${api_key}`

        fetch(requestUrl)
        .then(function(response) {
            return response.json()
        })
        .then(function(data) {
            console.log(data)
            var dailyWeather = data.daily 
            for (var i=0; i< 5; i++) {
                var temp = dailyWeather[i].temp.day
                temp = (Number(temp) - 273.15)*(9/5) +32
                var wind = dailyWeather[i].wind_speed
                var humidity = dailyWeather[i].humidity
                tempEl[i].textContent = 'Temp: ' + String(temp).substring(0,4) + 'F'
                windEl[i].textContent = 'Wind: ' + wind + 'mph'
                humidityEl[i].textContent = 'Humidity: ' + humidity + '%'
                var icon = dailyWeather[i].weather[0].icon
                getIcons(icon, i)
                dateEl.textContent = String(aryDates[i+1])
                console.log(aryDates[i])
                console.log(temp, wind, humidity)
            }
            
        })
    }
}    

//getting the icon for the weather for each day
function getIcons(icon, i) {
    console.log(icon)
    var srcIcon = `http://openweathermap.org/img/wn/${icon}@2x.png`
    imgEl[i].setAttribute('src', srcIcon)

}





