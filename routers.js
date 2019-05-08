var express = require('express')
var ElePrice=require('./models/elePrices')
var dataProcess=require('./dataProcess')

var router=express.Router()

//---主页


router.get('/',function (req,res,next) {

  var user={
    userid:'0100000345',
    username:'hahaa'
  }

  var result={}

  if(req.session.result){
    result=req.session.result
  }

  res.render('index.html',{
    user:user,
    data:result
  })
})

// 算费结果页
router.get('/calculateFee',function (req,res,next) {

  var result=req.session.calculateFee

  if(typeof (result)=="undefined"){
    result={
      err:0
    }
  }

  res.render('calculateFee.html',{
      data:result
  })

})



router.post('/calculateFee',function (req,res,next) {


  // 获得请求参数
  var body=req.body

  // mongo查电价
  ElePrice.findOne({
    priceId:'pr1301'
  },function (err,ret_G) {
    if(err){
      return next(err)
    }

    ElePrice.findOne({
      priceId:'pr1302'
    },function (err,ret_S) {
      if(err){
        return next(err)
      }

      var bkDataFee=dataProcess.calculateFee(body,ret_G,ret_S)

      var lossEnumExes=dataProcess.calculateLossEnumExes(body,bkDataFee)

      var procedureFee=dataProcess.calculateProcedureFee(body,bkDataFee)

      var calculateAllFee=dataProcess.calculateAllFee(bkDataFee,lossEnumExes,procedureFee)

      // 在这里添加session属性
      //把保存的user信息给session
      // console.log(calculateAllFee)
      
      req.session.calculateFee ={
        bkDataFee,
        lossEnumExes,
        procedureFee,
        calculateAllFee
      }

      res.status(200).json({
        err_code:0,
        message:'OK'
      })

    })

  })



})


module.exports=router