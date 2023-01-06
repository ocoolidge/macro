let t = 0.13
let i = 0.07
let mpc = 0.2
let mpi = 0.1
let c = 10
let C = 200
let EX = 50
let IM = 70
let INV = 30
let TRANSF = 20
let G = 40
let T = C * t
let MS = 20
let gap = 5

let GDP = C + INV + G + (EX - IM)
let aGDP = GDP + gap
let NS = GDP - C - G
let PubS = T - G
let PrivS = GDP - T - G



console.log("GDP: " + GDP)
console.log("actual GDP: " + aGDP)
console.log("National Savings: " + NS)
console.log("Private Savings: " + PrivS)
console.log("Public Savings: " + PubS)