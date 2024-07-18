module.exports = (req, res, next) => {
   return res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    next()
}