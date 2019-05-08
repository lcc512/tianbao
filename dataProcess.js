/**
 * 计算电度电费
 * @param body 请求对象
 * @param priceObject_G 工业电价对象
 * @param priceObject_S 商业电价对象
 * @returns {{g, s, all, p_G: *, p_S: *}}
 */
function calculateFee(body, priceObject_G, priceObject_S) {

  // console.log(body)
  // console.log(priceObject)

  // 遍历，转换为浮点数
  for (var index in body) {
    body[index] = parseFloat(body[index])
  }

  var g = {}
  var s = {}
  var all = {}

  //工业商业电量=电量(动照比/100)
  g.ratio = body.ratio
  s.ratio = 100 - body.ratio

  g.tinNum = body.tinNum * (body.ratio) / 100
  g.peakNum = body.peakNum * (body.ratio) / 100
  g.flatNum = body.flatNum * (body.ratio) / 100
  g.valNum = body.valNum * (body.ratio) / 100

  s.tinNum = body.tinNum * (100 - body.ratio) / 100
  s.peakNum = body.peakNum * (100 - body.ratio) / 100
  s.flatNum = body.flatNum * (100 - body.ratio) / 100
  s.valNum = body.valNum * (100 - body.ratio) / 100

  // 电费=电量*(动照比/100)*单价
  g.tinExe = body.tinNum * (body.ratio) / 100 * priceObject_G.priceTin
  g.peakExe = body.peakNum * (body.ratio) / 100 * priceObject_G.pricePeak
  g.flatExe = body.flatNum * (body.ratio) / 100 * priceObject_G.priceFlat
  g.valExe = body.valNum * (body.ratio) / 100 * priceObject_G.priceVal

  s.tinExe = body.tinNum * (100 - body.ratio) / 100 * priceObject_S.priceTin
  s.peakExe = body.peakNum * (100 - body.ratio) / 100 * priceObject_S.pricePeak
  s.flatExe = body.flatNum * (100 - body.ratio) / 100 * priceObject_S.priceFlat
  s.valExe = body.valNum * (100 - body.ratio) / 100 * priceObject_S.priceVal


  g.enumNum = (body.tinNum + body.peakNum + body.flatNum + body.valNum) * body.ratio / 100
  s.enumNum = (body.tinNum + body.peakNum + body.flatNum + body.valNum) * (100 - body.ratio) / 100

  all.enumNum = g.enumNum + s.enumNum

  g.bkDataFeeAll = g.tinExe + g.peakExe + g.flatExe + g.valExe
  s.bkDataFeeAll = s.tinExe + s.peakExe + s.flatExe + s.valExe

  // 电度电费合计
  all.TotExe = g.bkDataFeeAll + s.bkDataFeeAll


  // 遍历，保留两位小数
  for (var index in g) {
    g[index] = g[index].toFixed(2)
  }
  for (var index in s) {
    s[index] = s[index].toFixed(2)
  }
  for (var index in all) {
    all[index] = all[index].toFixed(2)
  }


  return {
    g,
    s,
    all,
    p_G: priceObject_G,
    p_S: priceObject_S,

  }

}


/**
 * 计算变损
 * @param body 请求体
 * @param result 电度电费方法返回的对象
 * @returns {{g, s, all}}
 */
function calculateLossEnumExes(body, result) {

  // 遍历，转换为浮点数
  for (var index in body) {
    body[index] = parseFloat(body[index])
  }

  // 变损电费A=（变损电量*动照比/有功电量）*（尖电量*大工业尖单价+峰电量*大工业峰单价+平电量*大工业平单价+谷电量*大工业谷单价）
  // 变损电费A=变损电量*（尖电量*动照比*大工业尖单价+峰电量*动照比*大工业峰单价+平电量*动照比*大工业平单价+谷电量*动照比*大工业谷单价）/有功电量
  var g = {}
  var s = {}
  var all = {}

  g.lossEnumExes = result.g.bkDataFeeAll*(body.lossNum  / result.all.enumNum)
  s.lossEnumExes = result.s.bkDataFeeAll*(body.lossNum  / result.all.enumNum)
  
  // console.log(g)

  all.lossEnumExes = g.lossEnumExes + s.lossEnumExes


  // 遍历，保留两位小数
  for (var index in g) {
    g[index] = g[index].toFixed(2)
  }
  for (var index in s) {
    s[index] = s[index].toFixed(2)
  }
  for (var index in all) {
    all[index] = all[index].toFixed(2)
  }

  return {
    g,
    s,
    all

  }


}

//计算奖惩
function calculateProcedureFee(body, resultBkdata) {

  // 遍历，转换为浮点数
  for (var index in body) {
    body[index] = parseFloat(body[index])
  }

  var g = {}
  var s = {}
  var all = {}

  // 基金附加费用
  // 基金及附加金额A=基金及附加单价*（有功电度A+变损电量A）
  g.surcharge=0.0291*(resultBkdata.g.enumNum+body.lossNum*body.ratio)
  s.surcharge=0.0291*(resultBkdata.s.enumNum+body.lossNum*(100-body.ratio)/100)

  // 奖惩电费
  // 功率因数调整电费A=（基本电费+电度电费A-基金及附加金额A）*系数A(大工业0.9标准值)
  g.procedureFee=(body.baseExes+resultBkdata.g.bkDataFeeAll-g.surcharge)*body.power_G
  // 功率因数调整电费B=（电度电费B-基金及附加金额B）*系数B（一般工商业0.85标准值）
  s.procedureFee=(resultBkdata.s.bkDataFeeAll-s.surcharge)*body.power_S

  all.procedureFee=g.procedureFee+s.procedureFee



  // 遍历，保留两位小数
  for (var index in g) {
    g[index] = g[index].toFixed(2)
  }
  for (var index in s) {
    s[index] = s[index].toFixed(2)
  }
  for (var index in all) {
    all[index] = all[index].toFixed(2)
  }

  return {
    g,
    s,
    all

  }

}

module.exports = {
  calculateFee,
  calculateLossEnumExes,
  calculateProcedureFee
}