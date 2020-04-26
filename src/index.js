var app = new Vue({
    el: '#app',
    data: {
        date: '',
        temperature: '',
        wind: '',
        rainMin: '',
        rainMax: '',
        weatherType: '',
        weatherImg: '',
        nextThreeHours: [],
        forecastNextDays: [],
    },
    methods: {
        getWeatherData: async function(url) {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            })

            return response.json()
        },
        getWeather: async function(lat, lon) {
            const tenMin = 1000 * 60 * 10;
            if (localStorage.getItem('localData') == null || Date.now() - localStorage.getItem('time') > tenMin) {
                console.log("Getting new weather data...")
                const localData = await this.getWeatherData('https://api.met.no/weatherapi/locationforecast/1.9/.json?lat='+ lat + '&lon='+ lon + '')
                localStorage.setItem('localData', JSON.stringify(localData))
                localStorage.setItem('time', Date.now())
            }
            var retrivedData = localStorage.getItem('localData')

            this.setWeather(JSON.parse(retrivedData).product)
        },
        getCustomWeather: function() {
            this.getWeather(this.$refs.lat.value, this.$refs.lon.value)
        },
        setWeather: function(weatherData) {
            this.date = this.getTodaysDate()
            this.temperature = Number(weatherData.time[0].location.temperature.value)
            this.wind = this.roundWindSpeed(weatherData.time[0].location.windSpeed.mps)
            this.rainMin = Number(weatherData.time[1].location.precipitation.minvalue)
            this.rainMax = Number(weatherData.time[1].location.precipitation.maxvalue)

            this.weatherType = weatherData.time[1].location.symbol.id
            this.weatherImg =  this.getWeatherImage(weatherData.time[1].location.symbol.number)

            this.setForecastNextThreeHours(weatherData)
            this.findForecastForNextDays(weatherData)
        },
        getWeatherImage: function(weatherId) {
            return 'https://api.met.no/weatherapi/weathericon/1.1/?content_type=image%2Fpng&symbol=' + weatherId
        },
        setForecastNextThreeHours: function(forecast) {
            // This is for the Met.no API
            var nextThreeHoursEven = []
            var nextThreeHoursOdd = []

            // Three hour forecast
            for (var i = 4; i < 10; i++) {
                if ((i % 2 == 0)) {
                    nextThreeHoursEven.push({ 
                        temp: Number(forecast.time[i].location.temperature.value),
                        time: this.cleanTime(forecast.time[i].to),
                        wind: this.roundWindSpeed(forecast.time[i].location.windSpeed.mps),
                        wind_desc: forecast.time[i].location.windSpeed.name,
                    })
                } else {
                    var rain = this.roundRain(this.getAverageRain(forecast.time[i].location.precipitation.minvalue, forecast.time[i].location.precipitation.maxvalue))
                    nextThreeHoursOdd.push({
                        weather: this.getWeatherImage(forecast.time[i].location.symbol.number),
                        rain: rain,
                    })
                }
            }

            for (var i = 0; i < nextThreeHoursOdd.length; i++) {
                nextThreeHoursOdd[i] = {
                    temp: nextThreeHoursEven[i].temp, 
                    time: nextThreeHoursEven[i].time, 
                    wind: nextThreeHoursEven[i].wind, 
                    wind_desc: nextThreeHoursEven[i].wind_desc, 
                    weather: nextThreeHoursOdd[i].weather, 
                    rain: nextThreeHoursOdd[i].rain}
            }

            nextThreeHoursOdd.forEach(forecast => {
                this.nextThreeHours.push(forecast)
            });
        },
        findForecastForNextDays: function(forecast) {
            var date = new Date().toISOString().substring(0, 10)

            var nextDays = []

            var moreThan1Hour = []

            for (var i = 0; i < forecast.time.length; i++) {
                if (forecast.time[i].from.substring(0, 10) != date) {
                    nextDays.push(forecast.time[i].from)
                }
            }

            for (var i = 0; i < forecast.time.length; i++) {
                var from = forecast.time[i].from.substring(11, 13)
                var to = forecast.time[i].to.substring(11, 13)
                var difference = Number(to) - Number(from)

                if (date != forecast.time[i].to.substring(0, 10)) {
                    if (difference > 1) {
                        moreThan1Hour.push(i)
                    }
                }
            }

            console.log(nextDays)
            console.log(moreThan1Hour)
            console.log(date)

            this.setForecastNextDays(forecast, moreThan1Hour)
        },
        setForecastNextDays: function(forecast, indices) {
            console.log(indices[0])
            console.log(forecast.time[indices[0]].location.minTemperature.value)

            var tempArr = []
            for (var index = 0; index < forecast.time.length; index++) {
                this.forecastNextDays.push({
                    date: String(forecast.time[indices[index]].from).substring(0, 10),
                    time: this.cleanTime(forecast.time[indices[index]].from),
                    tempMax: forecast.time[indices[index]].location.maxTemperature.value,
                    tempMin: forecast.time[indices[index]].location.minTemperature.value,
                    weather: this.getWeatherImage(forecast.time[indices[index]].location.symbol.number),
                    wind: this.roundWindSpeed(forecast.time[indices[index]+1].location.windSpeed.mps),
                    wind_desc: forecast.time[indices[index]+1].location.windSpeed.name,
                })
            }
        },
        getAverageRain: function(rainMin, rainMax) {
            return (Number(rainMax) + Number(rainMin)) / 2
        },
        cleanTime: function(time) {
            var result = time.substring(11)
            result = result.slice(0, -7)
            return result
        },
        roundRain: function(number) {
            return Math.round(Number(number) * 10) / 10
        },
        roundWindSpeed: function(number) {
            return Math.round(Number(number))
        },
        getTodaysDate: function() {
            var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            var date = new Date()
            
            return date.toLocaleDateString(undefined, options)
        }
    },
    beforeMount() {
        this.getWeather('59.355091', '5.323378') // Vormedal
        Array.prototype.insert = function (index, item) {
            this.splice( index, 0, item )
        }
    }
})