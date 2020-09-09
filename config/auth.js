const localStrategy = require('passport-local').Strategy
const mongoose = require('mongoose')
const passport = require('passport')
const bcrypt = require('bcryptjs')

// Model de usuário
require('../models/User')
const User = mongoose.model('users')

module.exports = function() {

    passport.use(new localStrategy({usernameField: "email", passwordField: "senha"}, (email, senha, done) => {
        User.findOne({email: email}).then((user) => {
            if(!user) {
                return done(null, false, {message: "Essa conta não existe!"})
            }
            bcrypt.compare(senha, user.senha, (erro, batem) => {
                if(batem) {
                    return done(null, user)
                } else {
                    return done(null, false, {message: "Senha incorreta!"})
                }
            })
        })
        
    }))

    // Salvar dados em uma sessão
    passport.serializeUser((user, done) => {
        done(null, user.id)
    })
    passport.deserializeUser((id, done) => {
        User.findById(id, (erro, user) => {
            done(erro, user)
        })
    })

}