import mongoose from 'mongoose'

const PeriodSchema = new mongoose.Schema(
	{
		start: {
			type: Date,
			required: true,
			unique: true,
		},
		end: {
			type: Date,
			required: true,
			unique: true,
		},
		data: {
			type: [
				{
					user: {
						type: mongoose.Schema.Types.ObjectId,
						ref: 'User',
						required: true,
					},
					proceedsUSD: {
						type: Number,
						required: true,
					},
					proceedsRUB: {
						type: Number,
						required: true,
					},
					paid: {
						type: Boolean,
						required: true,
					},
				},
			],
			required: true,
		},
		tax: {
			valueUSD: {
				type: Number,
				required: true,
			},
			valueRUB: {
				type: Number,
				required: true,
			},
		},
		orders: {
			items: {
				type: [mongoose.Schema.Types.ObjectId],
				ref: 'Order',
				required: true,
			},
			summUSD: {
				type: Number,
				required: true,
			},
			summRUB: {
				type: Number,
				required: true,
			},
		},
	},
	{
		timestamps: true,
	}
)

export default mongoose.model('Period', PeriodSchema)
