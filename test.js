
var User=require('./models/user')


var body={
  userId:"0100000123",
  userName:"测试用户",
  baseExes:123.123,
  lossNum:900.98,
  priceId:"pr1303",
  ratio:99.9,
  isFengGu:true
}





new User(body).save(function (err, user) {
  if (err) {
    console.log(err)
  }
  
})