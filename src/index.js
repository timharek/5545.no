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
        forecasts: []
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

            //console.log(localData.product)
            var today = new Date()
            var day = today.getDate()
            var month = today.getMonth() + 1
            this.date = day + "." + month
            this.temperature = localData.product.time[0].location.temperature.value
            this.wind = localData.product.time[0].location.windSpeed.mps
            this.rainMin = localData.product.time[1].location.precipitation.minvalue
            this.rainMax = localData.product.time[1].location.precipitation.maxvalue

            this.weatherType = localData.product.time[1].location.symbol.id
            this.weatherImg =  this.getWeatherImage(localData.product.time[1].location.symbol.number)

            this.getForecast(localData.product)
        },
        getCustomWeather: function() {
            this.getWeather(this.$refs.lat.value, this.$refs.lon.value)
        },
        getWeatherImage: function(weatherId) {
            return 'https://api.met.no/weatherapi/weathericon/1.1/?content_type=image%2Fpng&symbol=' + weatherId
        },
        getForecast: function(forecast) {
            console.log(forecast)

            var locForecastsEven = []
            var locForecastsOdd = []

            // Three hour forecast
            for (var i = 4; i < 10; i++) {
                if ((i % 2 == 0)) {
                    locForecastsEven.push({ 
                        temp: forecast.time[i].location.temperature.value,
                        time: this.cleanTime(forecast.time[i].to),
                        /* weather: '', */
                        wind: forecast.time[i].location.windSpeed.mps,
                        wind_desc: forecast.time[i].location.windSpeed.name,
                        /* rain: '', */
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
                this.forecasts.push(forecast)
            });

            console.log(this.forecasts)
        },
        getAverageRain: function(rainMin, rainMax) {
            return (Number(rainMax) + Number(rainMin)) / 2
        },
        cleanTime: function(time) {
            var result = time.substring(11)
            result = result.slice(0, -7)
            return result
        }
    },
    beforeMount() {
        this.getWeather('59.355091', '5.323378') // Vormedal
        Array.prototype.insert = function (index, item) {
            this.splice( index, 0, item )
        }
    }
})