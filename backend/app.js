const express = require('express')
const app = express()
const loanRouter = require('./routes/loan')
const customerRouter = require('./routes/customer')
const bankRouter = require('./routes/bank')
const deductionRouter = require('./routes/deduction')
const bodyParser = require('body-parser')
const facilityRouter = require('./routes/facility')
const categoryRouter = require('./routes/category')
const customerInfoRouter = require('./routes/customerInfo')
const collateralRouter = require('./routes/collateral')
const accountCategoryRouter = require('./routes/accountCategory')
const accountTitleRouter = require('./routes/accountTitle')
const employeeRouter = require('./routes/employee')
const paymentRouter = require('./routes/payment');
const os = require('os');

const getIPv4 = (port) => {
  const networkInterfaces = os.networkInterfaces()
  for (const name of Object.keys(networkInterfaces)) {
    for (const con of networkInterfaces[name]) {
      if(con.family === 'IPv4' && !con.internal)
        return `http://${con.address}:${port}`
    }
  }
}

console.log()
const PORT = 8000
app.use('/api/public', express.static('public'))

app.use(express.static('dist'))
app.use(bodyParser.urlencoded({ extended: false }))

app.use(bodyParser.json())

app.use('/api/loans', loanRouter)
app.use('/api/payments', paymentRouter)
app.use('/api/employee', employeeRouter)
app.use('/api/customers', customerRouter)
app.use('/api/banks', bankRouter)
app.use('/api/deductions', deductionRouter)
app.use('/api/facility', facilityRouter)
app.use('/api/category', categoryRouter)
app.use('/api/customerInfo', customerInfoRouter)
app.use('/api/collateral', collateralRouter)
app.use('/api/account-category', accountCategoryRouter)
app.use('/api/account-title', accountTitleRouter)
app.use('/api/employee', employeeRouter)

app.use('*', express.static('dist'))

app.listen(PORT, () => { console.log(`Server running at  \n${getIPv4(PORT)}`) })
