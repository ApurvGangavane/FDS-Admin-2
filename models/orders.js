const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var date = getDate();

const cartSchema = new Schema({
    name: {
        type: String
    },
    price: {
        type: Number
    },
    productImage:{
        type: String
    },
    quantity: {
        type: Number
    
    }
});

const orderSchema = Schema({
    _id : mongoose.Schema.Types.ObjectId,
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    cart: [cartSchema],
    dateOrdered: {type: String},
    deliveryAddress: { type: String},
    paymentmethod: { type: String },
    cartTotal: { type: Number},
    status: {
        type: String, 
        enum: ['accept', 'reject']
      },
      stage: {
        type: String,
        enum: ['initial', 'preparing', 'prepared', 'pickedup', 'history'],
        default : 'initial'
      },
      lat: {
          type: String
      },
      long: {
          type: Number
      }
});

cartSchema.virtual('amt').get(function () {
    let subamt = 0;
    subamt = subamt + (this.price * this.quantity);
    return subamt;
  })


function getDate(){
  let date_ob = new Date();
  let date = ("0" + date_ob.getDate()).slice(-2);
  let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
  let year = date_ob.getFullYear();
  let hours = date_ob.getHours();
  let minutes = date_ob.getMinutes();
  date = year + "-" + month + "-" + date + " " + hours + ":" + minutes ;
  return date;
}


module.exports = mongoose.model('Order', orderSchema);

