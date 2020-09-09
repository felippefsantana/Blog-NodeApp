module.exports = {
    eAdmin: function(req, res, next) {
        if(req.isAuthenticated() && req.user.eAdmin == 1) {
            return next()
        }
        req.flash('error_msg', 'Você deve estar logado e ser Admin para ter acesso!')
        res.redirect('/')
    }
}