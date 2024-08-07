
module.exports =  noCache = (req, res, next) => {
    res.setHeader('Cache-Control', 'no-store','must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();

};


