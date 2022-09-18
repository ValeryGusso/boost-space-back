import OrderModel from '../models/order.js'

export const create = async (req, res) => {
	try {
		const doc = new OrderModel({
			date: req.body.date,
			type: req.body.type,
			group: req.body.group,
			price: req.body.price,
			currency: req.body.currency,
			tax: req.body.tax,
			description: req.body.description,
			orderLink: req.body.orderLink,
			priceLink: req.body.priceLink,
			creater: req.userInfo.id,
		})

		const order = await doc.save()

		res.json(order)
	} catch (err) {
		res.status(500).json({
			message: 'Не удалось добавить заказ',
		})
	}
}

export const getAll = async (req, res) => {
	try {
		const orders = await OrderModel.find().populate('group').exec()
		const myOrders = await OrderModel.find({ group: req.userInfo.id }).populate('group').exec()

		orders.sort((a, b) => (a.date < b.date ? -1 : 1))
		myOrders.sort((a, b) => (a.date < b.date ? -1 : 1))

		res.json({ orders, myOrders })
	} catch (err) {
		res.status(500).json({
			message: 'Не удалось загрузить список заказов',
		})
	}
}

export const getPeriod = async (req, res) => {
	try {
		const startDate = new Date(req.body.startDate)
		const endDate = new Date(req.body.endDate)
		const currentPeriod = []
		const myCurrentPeriod = []

		const orders = await OrderModel.find().populate('group').exec()
		const myOrders = await OrderModel.find({ group: req.userInfo.id }).populate('group').exec()

		if (req.body.startDate && req.body.endDate) {
			orders.map(el => {
				if (
					+`${el.date.getFullYear()}${el.date.getMonth() > 10 ? el.date.getMonth() : '0' + el.date.getMonth()}${
						el.date.getDate() > 10 ? el.date.getDate() : '0' + el.date.getDate()
					} ` >=
						+`${startDate.getFullYear()}${
							startDate.getMonth() > 10 ? startDate.getMonth() : '0' + startDate.getMonth()
						}${startDate.getDate() > 10 ? startDate.getDate() : '0' + startDate.getDate()}` &&
					+`${el.date.getFullYear()}${el.date.getMonth() > 10 ? el.date.getMonth() : '0' + el.date.getMonth()}${
						el.date.getDate() > 10 ? el.date.getDate() : '0' + el.date.getDate()
					}` <=
						+`${endDate.getFullYear()}${endDate.getMonth() > 10 ? endDate.getMonth() : '0' + endDate.getMonth()}${
							endDate.getDate() > 10 ? endDate.getDate() : '0' + endDate.getDate()
						}`
				) {
					currentPeriod.push(el)
				}
			})
			myOrders.map(el => {
				if (
					+`${el.date.getFullYear()}${el.date.getMonth() > 10 ? el.date.getMonth() : '0' + el.date.getMonth()}${
						el.date.getDate() > 10 ? el.date.getDate() : '0' + el.date.getDate()
					} ` >=
						+`${startDate.getFullYear()}${
							startDate.getMonth() > 10 ? startDate.getMonth() : '0' + startDate.getMonth()
						}${startDate.getDate() > 10 ? startDate.getDate() : '0' + startDate.getDate()}` &&
					+`${el.date.getFullYear()}${el.date.getMonth() > 10 ? el.date.getMonth() : '0' + el.date.getMonth()}${
						el.date.getDate() > 10 ? el.date.getDate() : '0' + el.date.getDate()
					}` <=
						+`${endDate.getFullYear()}${endDate.getMonth() > 10 ? endDate.getMonth() : '0' + endDate.getMonth()}${
							endDate.getDate() > 10 ? endDate.getDate() : '0' + endDate.getDate()
						}`
				) {
					myCurrentPeriod.push(el)
				}
			})
		} else {
			orders.sort((a, b) => (a.date < b.date ? -1 : 1))
			myOrders.sort((a, b) => (a.date < b.date ? -1 : 1))
		}

		currentPeriod.sort((a, b) => (a.date < b.date ? -1 : 1))
		myCurrentPeriod.sort((a, b) => (a.date < b.date ? -1 : 1))
		res.json({ currentPeriod, myCurrentPeriod, orders, myOrders })
	} catch (err) {
		res.status(500).json({
			message: 'Не удалось загрузить список заказов',
		})
	}
}

export const getOne = async (req, res) => {
	try {
		const orderId = req.params.id
		const order = await OrderModel.findById(orderId)
		res.json(order)
	} catch (err) {
		res.status(500).json({
			message: 'Не удалось загрузить заказ',
		})
	}
}

export const update = async (req, res) => {
	try {
		const orderId = req.params.id

		await OrderModel.findByIdAndUpdate(orderId, {
			date: req.body.date,
			type: req.body.type,
			group: req.body.group,
			price: req.body.price,
			currency: req.body.currency,
			tax: req.body.tax,
			description: req.body.description,
			orderLink: req.body.orderLink,
			priceLink: req.body.priceLink,
		})

		return res.json({ success: true })
	} catch (err) {
		res.status(500).json({
			message: 'Не удалось обновить информацию',
		})
	}
}

export const remove = async (req, res) => {
	try {
		const orderId = req.params.id
		OrderModel.findByIdAndDelete(orderId, (err, doc) => {
			if (err) {
				return res.status(500).json({
					message: 'Не удалось удалить заказ, ошибка базы данных',
					err,
				})
			}

			if (!doc) {
				return res.status(500).json({
					message: 'Не удалось найти заказ в базе данных',
				})
			}

			res.json({
				success: true,
			})
		})
	} catch (err) {
		res.status(500).json({
			message: 'Не удалось удалить заказ',
		})
	}
}
