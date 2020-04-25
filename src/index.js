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
        nextThreeHours: []
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
            const localData = await this.getWeatherData('https://api.met.no/weatherapi/locationforecast/1.9/.json?lat='+ lat + '&lon='+ lon + '')
            
            this.setWeather(localData.product)
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

            this.setForecast(weatherData)
        },
        getWeatherImage: function(weatherId) {
            return 'https://api.met.no/weatherapi/weathericon/1.1/?content_type=image%2Fpng&symbol=' + weatherId
        },
        setForecast: function(forecast) {
            console.log(forecast)

            var locForecastsEven = []
            var locForecastsOdd = []

            // Three hour forecast
            for (var i = 4; i < 10; i++) {
                if ((i % 2 == 0)) {
                    locForecastsEven.push({ 
                        temp: this.dotToComma(forecast.time[i].location.temperature.value),
                        time: this.cleanTime(forecast.time[i].to),
                        wind: this.roundNumber(forecast.time[i].location.windSpeed.mps),
                        wind_desc: forecast.time[i].location.windSpeed.name,
                    })
                } else {
                    locForecastsOdd.push({
                        weather: this.getWeatherImage(forecast.time[i].location.symbol.number),
                        rain: this.getAverageRain(forecast.time[i].location.precipitation.minvalue, forecast.time[i].location.precipitation.maxvalue),
                    })
                }
            }

            for (var i = 0; i < locForecastsOdd.length; i++) {
                locForecastsOdd[i] = {
                    temp: locForecastsEven[i].temp, 
                    time: locForecastsEven[i].time, 
                    wind: locForecastsEven[i].wind, 
                    wind_desc: locForecastsEven[i].wind_desc, 
                    weather: locForecastsOdd[i].weather, 
                    rain: locForecastsOdd[i].rain}
            }

            locForecastsOdd.forEach(forecast => {
                this.nextThreeHours.push(forecast)
            });
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