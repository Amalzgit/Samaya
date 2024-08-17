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

        if(status === 'Cancelled' || status === 'Returned'){
            for (const item of order.items) {
                const product = await Product.findById(item.product);

                if (!product) {
                    console.error(`Product with ID ${item.product} not found.`);
                    continue; 
                }

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

const showOrderdetails =async(req,res)=>{
    try {
        const orderId =req.params.orderId;
        const order =await Order.findById(orderId)
        .populate('items.product')
        .populate('user','name email')

        if(!order){
            return res.status(404).render("error",{message:'Order not foud'});
        }
        res.render('admin_order_details',{order ,layout:false})
    } catch (error) {
        console.error("Error fetching Order" , error);
        res.status(500).render('error',{message:'An error occurred while fetching Order!!'})
    }
}

const handleReturnRequest = async (req, res) => {
    const { orderId, itemId } = req.params;
    const { action } = req.body;
    
    try {
      // Fetch the order and populate product details
      const order = await Order.findById(orderId).populate('items.product');
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
  
      // Find the item within the order
      const item = order.items.id(itemId);
      if (!item) {
        return res.status(404).json({ message: 'Item not found in order' });
      }
  
      // Ensure that the item has a pending return request
      if (item.status !== 'Return Requested') {
        return res.status(400).json({ message: 'This item does not have a pending return request' });
      }
  
      // Handle acceptance of the return request
      if (action === 'accept') {
        // Update stock only if return is accepted
        const product = await Product.findById(item.product._id);
        if (product) {
          product.stock += item.quantity;
          await product.save();
        }
        
        // Update the item's status to 'Return Accepted'
        item.status = 'Return Accepted';
        
      } else if (action === 'reject') {
        // Update the item's status to 'Return Rejected'
        item.status = 'Return Rejected';
        
      } else {
        return res.status(400).json({ message: 'Invalid action specified' });
      }
  
      // Save the updated order
      await order.save();
  
      res.json({ message: `Return request ${action}ed successfully`, orderStatus: order.status });
    } catch (error) {
      console.error('Error handling return request:', error);
      res.status(500).json({ message: 'An error occurred while processing the return request.' });
    }
  };
  
module.exports={
    getOrderList,
    updateOrderStatus,
    showOrderdetails,
    handleReturnRequest
}