var Fred = require('fred-api')

apiKey = process.env.FRED_KEY
fred = new Fred('5f11050cc1fbd2254dcee4489d8ae9fa')

fred.getSeries({series_id: 'GNPCA'}, function(error, result) {
    console.log(result)
})