var express=require('express')
var path=require('path')
var router=require('./routers')
var bodyParser=require('body-parser')
var session=require('express-session')


var app=express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:false}))

// 配置session
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false
}))

app.use('/public/',express.static(path.join(__dirname,'./public/')))
app.use('/node_modules/',express.static(path.join(__dirname,'./node_modules/')))

app.engine('html',require('express-art-template'))


app.use(router)

app.use(function (req,res,next) {
  res.render('404.html')
})

app.use(function (err,req,res,next) {
  res.status(500).json({
    err_code:500,
    message:err.message
  })
})

app.listen(3003,function () {
  console.log('tianbao3003,running...')
})