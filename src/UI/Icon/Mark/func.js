let domCount = 0;
let spriteCount = 0;

// 生成文本标签标题
function genDomTitle () {
  domCount++
  return `文本标签${domCount}`
}

// 生成文本标签标题
function genSpriteTitle () {
  spriteCount++
  return `精灵标签${spriteCount}`
}

export {
  genDomTitle, genSpriteTitle
}