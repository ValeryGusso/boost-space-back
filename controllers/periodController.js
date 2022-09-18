import PeriodModel from '../models/period.js'

export const createPeriod = async (req, res) => {
	try {
    let overallUSD = 0
    let overallRUB = 0

    req.body.data.map(el => {
      overallUSD += el.proceedsUSD
      overallRUB += el.proceedsRUB
    })

		if (overallRUB > 0 || overallUSD > 0) {
			const doc = new PeriodModel({
				start: req.body.start,
				end: req.body.end,
				data: req.body.data,
				tax: req.body.tax,
				orders: req.body.orders,
			})

			const period = await doc.save()

			res.json(period)
		} else {
			res.status(400).json({
				message: 'Нет информации о периоде',
			})
		}
	} catch (err) {
		res.status(500).json({
			message: 'Не удалось создать период',
		})
	}
}

export const getAllPeriods = async (req, res) => {
  try {
    const periods = await PeriodModel.find().populate('data.user').exec()

    periods.sort((a, b) => a.start < b.start ? -1 : 1)

    res.json(periods)
  } catch (err) {
    res.status(500).json({
			message: 'Не удалось получить информацию о периодах',
		})
  }
}

export const isPaid = async (req, res) => {
  try {
    const id = req.body.id
    const periodId = req.body.period

    const period = await PeriodModel.findById(periodId)

    const updated = period.data
    
    for (let i = 0; i < updated.length; i++) {
      if (updated[i].user == id) {
        updated[i].paid = !updated[i].paid
        break
      }
    }

    await PeriodModel.findByIdAndUpdate(periodId, {
      data: updated
    })

    res.json({success: true})
  } catch (err) {
    res.status(500).json({
			message: 'Не удалось обновить информацию',
		})
  }
}