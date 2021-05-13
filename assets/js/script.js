//definig all the elements that will be used throughout the script
var cityInput = document.getElementById('cityInput')
var buttonEl = document.getElementById('get-weather')
var historyEl = document.getElementById('search-list')
var tempEl = document.querySelectorAll('.temp')
var humidityEl = document.querySelectorAll('.humidity')
var windEl = document.querySelectorAll('.wind')
var dateEl = document.querySelectorAll('.date-title')
var imgEl = document.querySelectorAll('.icons')
var currentTitle = document.getElementById('currentWeather')
var curHumidityEl = document.querySelector('.cur-humidity')
var curWindEl = document.querySelector('.cur-wind')
var curTempEl = document.querySelector('.cur-temp')
var curUvEl = document.querySelector('.cur-uv')
var curIconEl = document.querySelectorAll('.current-icon')
var weatherCard = document.querySelector('.weather-card')
var dayCard = document.querySelectorAll('.day-card')
var warningEl = document.querySelector('.warning')

$(weatherCard).hide()
for (var j=0;j<dayCard.length;j++) {
    $(dayCard[j]).hide()
}

// getting the local storage for the search history
var historyList =[]
var searchHistory = localStorage.getItem('history')
if (searchHistory) {
    searchHistory = JSON.parse(searchHistory)
    console.log('search History is not null')
    searchList = searchHistory.length
    console.log('search length', searchList)
    if (searchHistory.length > 10) {
        searchList = 10
    }
    for (var i= 0; i < searchList; i++){
        console.log(searchHistory)
        var listItem = document.createElement('li')
        listItem.textContent = searchHistory[i]
        historyEl.append(listItem)
    }
}
//getting days for the five day forecast, source: stackoverflow https://stackoverflow.com/questions/10032456/how-to-get-next-seven-days-from-x-and-format-in-js/10032641
var aryDates = [];
function GetDates(startDate, daysToAdd) {
    

    for (var i = 0; i <= daysToAdd; i++) {
        var currentDate = new Date();
        currentDate.setDate(startDate.getDate() + i);
        aryDates.push(currentDate.getDate() + " " + MonthAsString(currentDate.getMonth()) + " " + currentDate.getFullYear());
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
    var cityName = cityInput.value
    cityName = cityName.split(', ')
    console.log(cityName)
    cityInput.value = ''
    if (cityName[0] === '') {
        var warning = document.createElement('p')
        warning.textContent = 'Please enter valid city'
        warning.setAttribute('style', 'color: red')
        warningEl.append(warning)
    } else {
        getCoords(cityName)
        // getWeather(cityName)
    }
})

var data = []

var gotCoords = false
var requestFile = "city.list.json"
fetch(requestFile)
    .then(function(response) {
        return response.json()
    })
    .then(function(stuff) {
        data = stuff
        return data
    })

//getting the coordinates of a city
function getCoords(city) {

    if (city.length === 2) {
        for (var i=0; i<data.length; i++) {
            if (city[0].toLowerCase() === data[i].name.toLowerCase() && (data[i].country.toLowerCase() === city[1].toLowerCase() || data[i].state.toLowerCase() === city[1].toLowerCase())) {
                historyList.unshift([data[i].name + ' ' + data[i].country])
                localStorage.setItem('history', JSON.stringify(historyList))
                var listItem = document.createElement('li')
                listItem.textContent = data[i].name + ' ' + data[i].country
                historyEl.append(listItem)
                console.log(data[i].name)
                $(weatherCard).show()
                for (var j=0;j<dayCard.length;j++) {
                    $(dayCard[j]).show()
                }
                console.log('coordinates',data[i].coord)
                cityCoord.lon = (data[i].coord.lon)
                cityCoord.lat = (data[i].coord.lat)
                console.log(cityCoord.lon, cityCoord.lat)
                gotCoords = true
                getUV(cityCoord, (data[i].name + ', ' + data[i].country))
                return cityCoord, gotCoords
            } 
        }
    } else if(city.length === 1){
        for (var i=0; i<data.length; i++) {
            if (city[0].toLowerCase() === data[i].name.toLowerCase()) {
                searchHistory.push([data[i].name + ' ' + data[i].country])
                localStorage.setItem('history', JSON.stringify(searchHistory))
                var listItem = document.createElement('li')
                listItem.textContent = data[i].name + ' ' + data[i].country
                historyEl.append(listItem)
                console.log(data[i].name)
                $(weatherCard).show()
                for (var j=0;j<dayCard.length;j++) {
                    $(dayCard[j]).show()
                }
                console.log('coordinates',data[i].coord)
                cityCoord.lon = (data[i].coord.lon)
                cityCoord.lat = (data[i].coord.lat)
                console.log(cityCoord.lon, cityCoord.lat)
                gotCoords = true
                getUV(cityCoord, (data[i].name + ', ' + data[i].country))
                return cityCoord, gotCoords
            }
        }
    }

}

function getUV(cityCoord, cityName) {
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
            currentConditions(data, cityName)
            for (var i=0; i< 5; i++) {
                var temp = dailyWeather[i].temp.day
                temp = (Number(temp) - 273.15)*(9/5) +32
                var wind = dailyWeather[i].wind_speed
                var humidity = dailyWeather[i].humidity 
                tempEl[i].textContent = 'Temp: ' + String(temp).substring(0,4) + ' F'
                windEl[i].textContent = 'Wind: ' + wind + ' mph'
                humidityEl[i].textContent = 'Humidity: ' + humidity + ' %'
                var icon = dailyWeather[i].weather[0].icon
                getIcons(icon, i)
                dateEl[i].textContent = String(aryDates[i+1])
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

function getCurIcons(icon1) {
    console.log('icon1', icon1)
    var srcCurIcon = `http://openweathermap.org/img/wn/${icon1}@2x.png`
    curIconEl[0].setAttribute('src', srcCurIcon)

}



// setting up the current conditions of the city choosen
function currentConditions(weather, cityName) {
    console.log('cityname' ,cityName)
    var today = moment().format('MM/DD/YYYY')
    console.log(today)
    currentTitle.textContent = cityName + ' ' + today
    var curTemp = weather.current.feels_like
    curTemp = (Number(curTemp) - 273.15)*(9/5) +32
    var curWind = weather.current.wind_speed
    var curHumidity = weather.current.humidity
    var curUv = weather.current.uvi
    var curIcon = weather.current.weather[0].icon
    getCurIcons(curIcon, 0)
    curTempEl.textContent = 'Temp: ' + String(curTemp).substring(0,4) + ' F'
    curWindEl.textContent = 'Wind: ' + curWind + ' mph'
    curHumidityEl.textContent = 'Humidity: ' + curHumidity + ' %'
    curUvEl.textContent =  + curUv 
    if (Number(curUv) <= 4) {
        curUvEl.setAttribute('style', 'background: green')
    } else if(Number(curUv) >= 8) {
        curUvEl.setAttribute('style', 'background: red')
    } else {
        curUvEl.setAttribute('style', 'background: gold')
    }
}





