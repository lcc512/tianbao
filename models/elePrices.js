var mongoose=require('mongoose')
mongoose.connect('mongodb://localhost/tianbao')

var Schema=mongoose.Schema

var elePriceSchema=new Schema({
  priceId:{
    type:String,
    required:true
  },
  priceTin:{
    type:Number,
    required:true
  },
  pricePeak:{
    type:Number,
    required:true
  },
  priceFlat:{
    type:Number,
    required:true
  },
  priceVal:{
    type:Number,
    required:true
  },
})

module.exports=mongoose.model('ElePrice',elePriceSchema)