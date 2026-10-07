const express = require('express');
const router = express.Router(); // Corrected: Call Router() to instantiate it properly
const Order = require('../models/Orders');

// Define the route for order data
router.post('/orderData', async (req, res) => {
    // Validate required fields
    const email = req.body.email;
    let data = req.body.order_data;
    if (!email) {
        return res.status(400).json({ success: false, error: 'Email is required' });
    }
    if (!Array.isArray(data)) {
        return res.status(400).json({ success: false, error: 'order_data must be an array' });
    }

    await data.splice(0, 0, { Order_date: req.body.order_date });

    try {
        let eId = await Order.findOne({ email: req.body.email });
        console.log(eId);

        if (eId === null) {
            // Create a new order if none exists for the email
            await Order.create({
                email: req.body.email,
                order_data: [data],
            }).then(() => {
                res.json({ success: true });
            });
        } else {
            // Update the existing order data
            await Order.findOneAndUpdate(
                { email: req.body.email },
                { $push: { order_data: data } }
            ).then(() => {
                res.json({ success: true });
            });
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Server Error: " + error.message);
    }
});

// Define the route for fetching order data
router.post('/myOrderData', async (req, res) => {
    try {
        let myData = await Order.findOne({ email: req.body.email });
        res.json({ orderData: myData });
    } catch (error) {
        res.status(500).send("Error: " + error.message);
    }
});

module.exports = router;



// const express = require('express')
// const router = express.Router
// const Order = require('../models/Orders')



// router.post('/orderData', async (req, res) => {
//     let data = req.body.order_data
//     await data.splice(0, 0, {Order_date:req.body.order_date})
   
//     let eId = await Order.findOne({ 'email': req.body.email })    
//     console.log(eId)
//     if (eId===null) {
//         try {
            
//             await Order.create({
//                 email: req.body.email,
//                 order_data:[data]
//             }).then(() => {
//                 res.json({ success: true })
//             })
//         } catch (error) {
//             console.log(error.message)
//             res.send("Server Error", error.message)

//         }
//     }

//     else {
//         try {
//             await Order.findOneAndUpdate({email:req.body.email},
//                 { $push:{ order_data: data} }).then(() => {
//                     res.json({ success: true })
//                 })
//         } catch (error) {
            
//             res.send("Server Error", error.message)
//         }
//     }
// })

// router.post('/myOrderData', async (req, res) => {
//     try {
//         //console.log(req.body.email)
//         let myData = await Order.findOne({ 'email': req.body.email })
//         //console.log(eId)
//         res.json({orderData:myData})
//     } catch (error) {
//         res.send("Error",error.message)
//     }
    

// });

// module.exports = router;  
