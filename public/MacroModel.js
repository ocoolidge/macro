//AE = c + MPC(1 - t) + I + G + (X - mY)
//Y = C(Y-T) + I(Y,i) + G

class MacroModel {
	constructor(Y, I, C, G, X, IM, T, t, i, c) {
		this.income = Y
		this.consumption = C
		this.investment = I
		this.governmentExpenditure = G
		this.exports = X
		this.imports = IM
		this.taxRevenue = T
		this.taxRate = t
		this.interestRate = i
		this.autonomousConsumption = c
	}
	
	constructor(Y, Yd, I, C, G, X, IM, S, t, i, c) {
		this.income = Y
		this.disposableIncome = Yd
		this.consumption = C
		this.investment = I
		this.governmentExpenditure = G
		this.exports = X
		this.imports = IM
		this.saving = S
		this.taxRevenue = Y-Yd
		this.taxRate = 1-(Yd/Y)
		this.interestRate = i
		this.autonomousConsumption = c
		this.desiredConsumption = Yd-S
	}
}