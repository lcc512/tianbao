// 解决计算精度问题
// var Decimal = require('decimal.js');


/**
 * 计算电度电费
 * @param body 请求对象
 * @param priceObject_G 工业电价对象
 * @param priceObject_S 商业电价对象
 * @returns {{g, s, all, p_G: *, p_S: *}}
 */
function calculateFee(body, priceObject_G, priceObject_S) {

  // console.log(body)

  // 遍历，转换为浮点数
  for (var index in body) {
    body[index]=body[index]||0//input不填东西的时候置为0
    body[index] = parseFloat(body[index])
  }

  var g = {}
  var s = {}
  var all = {}

  //工业商业电量=电量(动照比/100)
  g.ratio = body.ratio||0
  s.ratio = 100 - body.ratio||0

  g.tinNum = body.tinNum * (body.ratio) / 100||0
  g.peakNum = body.peakNum * (body.ratio) / 100||0
  g.flatNum = body.flatNum * (body.ratio) / 100||0
  g.valNum = body.valNum * (body.ratio) / 100||0

  s.tinNum = body.tinNum * (100 - body.ratio) / 100||0
  s.peakNum = body.peakNum * (100 - body.ratio) / 100||0
  s.flatNum = body.flatNum * (100 - body.ratio) / 100||0
  s.valNum = body.valNum * (100 - body.ratio) / 100||0

  // 电费=电量*(动照比/100)*单价
  g.tinExe = body.tinNum * (body.ratio) / 100 * priceObject_G.priceTin||0
  g.peakExe = body.peakNum * (body.ratio) / 100 * priceObject_G.pricePeak||0
  g.flatExe = body.flatNum * (body.ratio) / 100 * priceObject_G.priceFlat||0
  g.valExe = body.valNum * (body.ratio) / 100 * priceObject_G.priceVal||0

  s.tinExe = body.tinNum * (100 - body.ratio) / 100 * priceObject_S.priceTin||0
  s.peakExe = body.peakNum * (100 - body.ratio) / 100 * priceObject_S.pricePeak||0
  s.flatExe = body.flatNum * (100 - body.ratio) / 100 * priceObject_S.priceFlat||0
  s.valExe = body.valNum * (100 - body.ratio) / 100 * priceObject_S.priceVal||0


  g.enumNum = (body.tinNum + body.peakNum + body.flatNum + body.valNum) * body.ratio / 100||0
  s.enumNum = (body.tinNum + body.peakNum + body.flatNum + body.valNum) * (100 - body.ratio) / 100||0

  all.enumNum = g.enumNum + s.enumNum
  
  console.log(100 - body.ratio)
  console.log(s.enumNum)

  g.bkDataFeeAll = g.tinExe + g.peakExe + g.flatExe + g.valExe
  s.bkDataFeeAll = s.tinExe + s.peakExe + s.flatExe + s.valExe

  // 电度电费合计
  all.TotExe = g.bkDataFeeAll + s.bkDataFeeAll

  // 电表补收=电度电费-（工业分段单项电费合计）/动照比

  all.meterRecharge = all.TotExe - g.bkDataFeeAll / ((body.ratio) / 100)

  all.meterBkFee = all.TotExe - all.meterRecharge

  // 基本电费，其他电费一并先放这里，为空的话这里填0
  all.baseExes = body.baseExes||0
  all.otherExes = body.otherExes||0

  // 遍历，保留两位小数
  for (var index in g) {
    g[index] = g[index].toFixed(3)
  }
  for (var index in s) {
    s[index] = s[index].toFixed(3)
  }
  for (var index in all) {
    all[index] = all[index].toFixed(3)
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
    body[index]=body[index]||0//input不填东西的时候置为0
    body[index] = parseFloat(body[index])
  }

  // 变损电费A=（变损电量*动照比/有功电量）*（尖电量*大工业尖单价+峰电量*大工业峰单价+平电量*大工业平单价+谷电量*大工业谷单价）
  // 变损电费A=变损电量*（尖电量*动照比*大工业尖单价+峰电量*动照比*大工业峰单价+平电量*动照比*大工业平单价+谷电量*动照比*大工业谷单价）/有功电量
  var g = {}
  var s = {}
  var all = {}

  g.lossEnumExes = result.g.bkDataFeeAll * (body.lossNum / result.all.enumNum)||0
  s.lossEnumExes = result.s.bkDataFeeAll * (body.lossNum / result.all.enumNum)||0

  all.lossEnumExes = g.lossEnumExes + s.lossEnumExes

  // 遍历，保留三位小数
  for (var index in g) {
    g[index] = g[index].toFixed(3)
  }
  for (var index in s) {
    s[index] = s[index].toFixed(3)
  }
  for (var index in all) {
    all[index] = all[index].toFixed(3)
    console.log(all)
  }

  return {
    g,
    s,
    all

  }
}

/**
 * 计算奖惩
 * @param body 请求体
 * @param resultBkdata 电度电费返回对象
 * @returns {{g, s, all}}
 */
function calculateProcedureFee(body, resultBkdata) {

  // 遍历，转换为浮点数
  for (var index in body) {
    body[index]=body[index]||0//input不填东西的时候置为0
    body[index] = parseFloat(body[index])
  }

  var g = {}
  var s = {}
  var all = {}

  // 基金附加费用
  // 基金及附加金额A=基金及附加单价*（有功电度A+变损电量A）

  g.surcharge = 0.0291 * (parseFloat(resultBkdata.g.enumNum) + body.lossNum * (body.ratio / 100))||0
  s.surcharge = 0.0291 * (parseFloat(resultBkdata.s.enumNum) + body.lossNum * (1 - body.ratio / 100))||0

  // 奖惩电费
  // 功率因数调整电费A=（基本电费+电度电费A-基金及附加金额A）*系数A(大工业0.9标准值)

  g.procedureFee = (body.baseExes + parseFloat(resultBkdata.g.bkDataFeeAll) - parseFloat(g.surcharge)) * body.power_G||0
  // 功率因数调整电费B=（电度电费B-基金及附加金额B）*系数B（一般工商业0.85标准值）
  s.procedureFee = (parseFloat(resultBkdata.s.bkDataFeeAll) - s.surcharge) * body.power_S||0

  all.procedureFee = g.procedureFee + s.procedureFee




  // 遍历，保留两位小数
  for (var index in g) {
    g[index] = g[index].toFixed(3)
  }
  for (var index in s) {
    s[index] = s[index].toFixed(3)
  }
  for (var index in all) {
    all[index] = all[index].toFixed(3)
  }

  return {
    g,
    s,
    all

  }

}


//计算合计
function calculateAllFee(resultBkdata, lossEnumExes, procedureFee) {

  // 遍历，转换为浮点数
  for (var index in resultBkdata.all) {
    resultBkdata.all[index] = parseFloat(resultBkdata.all[index])
  }
  for (var index in lossEnumExes.all) {
    lossEnumExes.all[index] = parseFloat(lossEnumExes.all[index])
  }
  for (var index in procedureFee.all) {
    procedureFee.all[index] = parseFloat(procedureFee.all[index])
  }


  var all = {}


  // 电费合计=电度电费+基本电费+变损电费+奖惩电费+其他电费

  // 应收合计=基本电费+变损+奖惩+其他+动照比差额电费

  all.allFee = resultBkdata.all.TotExe + resultBkdata.all.baseExes + lossEnumExes.all.lossEnumExes + procedureFee.all.procedureFee + resultBkdata.all.otherExes||0
  all.shouldallFee = resultBkdata.all.baseExes + lossEnumExes.all.lossEnumExes + procedureFee.all.procedureFee + resultBkdata.all.otherExes + resultBkdata.all.meterRecharge||0


  // 遍历，保留两位小数
  for (var index in all) {
    all[index] = all[index].toFixed(3)
  }

  return {
    all
  }

}


// 处理新增批量用户
function addManyUsers(data) {

  var arr = data.split(/#/)

  arr.pop()

  var retArr = []

  arr.forEach(function (item, index, arr) {
    retArr[index] = arr[index].split(/\t/)

    retArr[index].pop()

    retArr[index][0] = retArr[index][0].replace(/\s/g, '')

  })


  var usersCollection = []

  retArr.forEach(function (item, index, arr) {

    var user = {
      userId: item[0],
      userName: item[1],
      baseExes: item[2],
      lossNum: item[3],
      priceId: item[4],
      ratio: item[5],
      isFengGu: item[6]
    }


    usersCollection.push(user)

  })

  return usersCollection
}

// 处理新增批量电价
function addManyPrice(data) {

  var arr = data.split(/#/)

  arr.pop()

  var retArr = []

  arr.forEach(function (item, index, arr) {
    retArr[index] = arr[index].split(/\t/)

    retArr[index].pop()

    retArr[index][0] = retArr[index][0].replace(/\s/g, '')

  })


  var usersCollection = []

  retArr.forEach(function (item, index, arr) {

    var user = {
      priceId: item[0],
      priceTin: item[1],
      pricePeak: item[2],
      priceFlat: item[3],
      priceVal: item[4]
    }


    usersCollection.push(user)

  })

  return usersCollection
}


module.exports = {
  calculateFee,
  calculateLossEnumExes,
  calculateProcedureFee,
  calculateAllFee,
  addManyUsers,
  addManyPrice
}