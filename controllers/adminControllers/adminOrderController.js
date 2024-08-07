const Order =require ('../../models/orderModel')
const Product =require('../../models/productModel')


const getOrderList = async (req,res)=>{
    const orders = await Order.find().populate("user")
    try {
        return res.render('orderList',{orders})
    } catch (error) {
        console.error("order list view error:",error);
        
    }
}

const updateOrderStatus = async(req,res)=>{
    const { orderId } = req.params;
    const { status } = req.body;

    try {
        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if(status === 'Cancelled'){
            for (const item of order.items) {
                // Find the product by ID
                const product = await Product.findById(item.product);

                if (!product) {
                    console.error(`Product with ID ${item.product} not found.`);
                    continue; // Continue to the next product
                }

                // Restore the stock
                product.stock += item.quantity;
                await product.save();
            }
        }
       

        order.status = status;
        await order.save();

        res.json({ message: 'Order status updated successfully!' });
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ message: 'An error occurred while updating the order status.' });
    }
};





module.exports={
    getOrderList,
    updateOrderStatus
}