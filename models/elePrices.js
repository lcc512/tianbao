var mongoose=require('mongoose')
mongoose.connect('mongodb://localhost/tianbao')

var Schema=mongoose.Schema

var elePriceSchema=new Schema({
  priceId:{
    type:String,
    required:true
  },
  priceTin:{
    type:String,
    required:true
  },
  pricePeak:{
    type:String,
    required:true
  },
  priceFlat:{
    type:String,
    required:true
  },
  priceVal:{
    type:String,
    required:true
  },
})

module.exports=mongoose.model('ElePrice',elePriceSchema)