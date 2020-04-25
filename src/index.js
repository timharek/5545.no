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
        forecastNextDays: []
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
            this.temperature = this.dotToComma(weatherData.time[0].location.temperature.value)
            this.wind = this.roundNumber(weatherData.time[0].location.windSpeed.mps)
            this.rainMin = this.dotToComma(weatherData.time[1].location.precipitation.minvalue)
            this.rainMax = this.dotToComma(weatherData.time[1].location.precipitation.maxvalue)

            this.weatherType = weatherData.time[1].location.symbol.id
            this.weatherImg =  this.getWeatherImage(weatherData.time[1].location.symbol.number)

            this.setForecastNextThreeHours(weatherData)
            this.setForecastNextDays(weatherData)
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
                        temp: this.dotToComma(forecast.time[i].location.temperature.value),
                        time: this.cleanTime(forecast.time[i].to),
                        wind: this.roundNumber(forecast.time[i].location.windSpeed.mps),
                        wind_desc: forecast.time[i].location.windSpeed.name,
                    })
                } else {
                    nextThreeHoursOdd.push({
                        weather: this.getWeatherImage(forecast.time[i].location.symbol.number),
                        rain: this.getAverageRain(forecast.time[i].location.precipitation.minvalue, forecast.time[i].location.precipitation.maxvalue),
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
        setForecastNextDays: function(forecast) {
            // TODO: #2
        },
        getAverageRain: function(rainMin, rainMax) {
            return (Number(rainMax) + Number(rainMin)) / 2
        },
        cleanTime: function(time) {
            var result = time.substring(11)
            result = result.slice(0, -7)
            return result
        },
        roundNumber: function(number) {
            return Math.round(Number(number))
        },
        dotToComma: function(numerWithDot) {
            return numerWithDot.replace(".", ",")
        },
        getTodaysDate: function() {
            var today = new Date()
            var day = today.getDate()
            var month = today.getMonth() + 1
            return day + "." + month
        }
    },
    beforeMount() {
        this.getWeather('59.355091', '5.323378') // Vormedal
        Array.prototype.insert = function (index, item) {
            this.splice( index, 0, item )
        }
    }
})