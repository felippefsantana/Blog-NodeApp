const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
require('../models/User')
const User = mongoose.model('users')
const bcrypt = require('bcryptjs')
const passport = require('passport')

router.get('/registro', (req, res) => {
    res.render('users/registro')
})

router.post('/registro', (req, res) => {

    var erros = []

    var nome = req.body.nome
    var email = req.body.email
    var senha = req.body.senha

    if(!req.body.nome || typeof req.body.nome == undefined || typeof req.body.nome == null) {
        erros.push({text: "Nome inválido!"})
    }
    if(!req.body.email || typeof req.body.email == undefined || typeof req.body.email == null) {
        erros.push({text: "E-mail inválido!"})
    }
    if(!req.body.senha || typeof req.body.senha == undefined || typeof req.body.senha == null) {
        erros.push({text: "Senha inválida!"})
    }
    if(req.body.senha.length < 6) {
        erros.push({text: "Senha muito curta!"})
    }
    if(req.body.senha != req.body.senha2) {
        erros.push({text: "As senhas são diferentes. Tente novamente!"})
    }
    if(erros.length > 0) {
        res.render('users/registro', {erros: erros})
    } else {

        User.findOne({email: req.body.email}).then((user) => {
            if(user) {
                req.flash('error_msg', 'Já exite uma conta cadastrada com esse email!')
                res.redirect('/users/registro')
            } else {
                const novoUsuario = new User({
                    nome: req.body.nome,
                    email: req.body.email,
                    senha: req.body.senha
                })
                bcrypt.genSalt(10, (erro, salt) => {
                    bcrypt.hash(novoUsuario.senha, salt, (erro, hash) => {
                        if(erro) {
                            req.flash('error_msg', 'Ocorreu um erro durante o salvamento do usuário!')
                            res.redirect('/')
                        } else {
                            novoUsuario.senha = hash
                            novoUsuario.save().then(() => {
                                req.flash('success_msg', 'Usuário cadastrado com sucesso!')
                                res.redirect('/')
                            }).catch((erro) => {
                                req.flash('error_msg', 'Ocorreu um erro ao criar o usuário. Tente novamente!')
                                res.redirect('/users/registro')
                            })
                        }
                    })
                })
            }
        }).catch((erro) => {
            req.flash('error_msg', 'Ocorreu um erro interno!')
            res.redirect('/')
        })

    }

})

router.get('/login', (req, res) => {
    res.render('users/login')
})

router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next)
})

router.get('/logout', (req, res) => {
    req.logout()
    req.flash('success_msg', 'Deslogado com sucesso!')
    res.redirect('/')
})


module.exports = router