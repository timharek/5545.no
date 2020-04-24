var app = new Vue({
    el: '#app',
    data: {
        temperature: '',
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

            this.temperature = localData.product.time[0].location.temperature.value
            this.weatherType = localData.product.time[1].location.symbol.id
            this.weatherImg = 'https://api.met.no/weatherapi/weathericon/1.1/?content_type=image%2Fpng&symbol=' + localData.product.time[1].location.symbol.number

            this.getForecast(localData.product)
        },
        getCustomWeather: function() {
            this.getWeather(this.$refs.lat.value, this.$refs.lon.value)
        },
        getForecast: function(forecast) {
            console.log(forecast)

            // Three hour forecast
            for (var i = 4; i < 10; i++) {
                if ((i % 2 == 0)) {
                    this.forecasts.push({ 
                        temp: forecast.time[i].location.temperature.value,
                        time: forecast.time[i].to,
                    })
                } 
            }

            console.log(this.forecasts)
        }
    },
    beforeMount() {
        this.getWeather('59.355091', '5.323378') // Vormedal
    }
})