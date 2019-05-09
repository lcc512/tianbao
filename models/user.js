var mongoose=require('mongoose')
mongoose.connect('mongodb://localhost/tianbao')

var Schema=mongoose.Schema

// 用户ID，用户名称，基本电费，变损电量，执行电价ID，动照比（百分数，不收动照比为0），是否峰谷

var userSchema=new Schema({
  userId:{
    type:String,
    required:true
  },
  userName:{
    type:String,
    required:true
  },
  baseExes:{
    type:Number,
    required:true
  },
  lossNum:{
    type:Number,
    required:true
  },
  priceId:{
    type:String,
    required:true
  },
  ratio:{
    type:Number,
    required:true
  },
  isFengGu:{
    type:Boolean,
    required:true
  }
})

module.exports=mongoose.model('User',userSchema)