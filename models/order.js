import mongoose from 'mongoose'

const OrderSchema = new mongoose.Schema(
	{
		date: {
			type: Date,
			required: true,
		},
		type: {
			type: String,
			required: true,
		},
		group: {
			type: [mongoose.Schema.Types.ObjectId],
			ref: 'User',
			required: true,
		},
		price: {
			type: Number,
			required: true,
		},
		currency: {
			type: String,
			required: true,
		},
		tax: {
			type: Number,
			required: true,
		},
		creater: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		description: String,
		orderLink: String,
		priceLink: String,
	},
	{
		timestamps: true,
	}
)

export default mongoose.model('Order', OrderSchema)
