// Carregando módulos
const express = require("express")
const app = express()
const handlebars = require("express-handlebars")
const bodyParser = require("body-parser")
const admin = require('./routes/admin')
const path = require('path')
const mongoose = require("mongoose")
const session = require('express-session')
const flash = require('connect-flash')
const moment = require('moment')
require('./models/Post')
const Post = mongoose.model('posts')
require('./models/Categoria')
const Categoria = mongoose.model('categorias')
const users = require('./routes/user')
const passport = require('passport')
require('./config/auth')(passport)

// Configs
    // Sessão
    app.use(session({
        secret: "cursodenode",
        resave: true,
        saveUninitialized: true
    }))

    app.use(passport.initialize())
    app.use(passport.session())

    app.use(flash())

    //Midlleware
    app.use((req, res, next) => {
        res.locals.success_msg = req.flash('success_msg') // Variável global
        res.locals.error_msg = req.flash('error_msg') // Variável global
        res.locals.error = req.flash('error') // Variável global
        res.locals.user = req.user || null
        next()
    })

    // Body Parser
    app.use(bodyParser.urlencoded({extended: true}))
    app.use(bodyParser.json())

    // Handlebars
    app.engine('handlebars', handlebars({
        defaultLayout: 'main',
        helpers: {
            formatDate: (date) => {return moment(date).format('DD/MM/YYYY HH:mm')}
        }
    }))
    app.set('view engine', 'handlebars')

    // Mongoose
    mongoose.Promise = global.Promise
    mongoose.connect('mongodb://localhost/nodeapp', { 
        useUnifiedTopology: true, 
        useNewUrlParser: true 
    }).then(() => {
        console.log('Conectado ao MongoDB')
    }).catch((erro) => {
        console.log('Ocorreu um erro ao se conectar: ' + erro)
    })

    // Public
    app.use(express.static('public'))

// Rotas
    // Usuario
    app.get('/', (req, res) => {
        Post.find().lean().populate('categoria').sort({data: "desc"}).then((posts) => {
            res.render('index', {posts: posts})
        }).catch((erro) => {
            req.flash('error_msg', 'Ocorreu um erro interno ao listar as postagens!')
            res.redirect('/404')
        })
    })

    app.get('/post/:slug', (req, res) => {

        Post.findOne({slug: req.params.slug}).lean().populate('categoria').then((post) => {
            if(post) {
                res.render('post/index', {post: post})
            } else {
                req.flash('error_msg', 'Não foi possível encontrar a postagem solicitada!')
                res.redirect('/')
            }
        }).catch((erro) => {
            req.flash('error_msg', 'Ocorreu um erro interno!')
            res.redirect('/')
        })

    })

    app.get('/categorias', (req, res) => {
        Categoria.find().lean().then((categorias) => {
            res.render('categories/index', {categorias: categorias})
        }).catch((erro) => {
            req.flash('error_msg', 'Ocorreu um erro ao listar as categorias!')
            res.redirect('/')
        })
    })

    app.get('/categorias/:slug', (req, res) => {

        Categoria.findOne({slug: req.params.slug}).lean().then((categoria) => {

            if(categoria) {
                Post.find({categoria: categoria._id}).lean().sort({data: "desc"}).then((posts) => {
                    res.render('categories/posts', {posts: posts, categoria: categoria})
                }).catch((erro) => {
                    req.flash('error_msg', 'Ocorreu um erro ao listar as postagens!')
                    res.redirect('/categorias')
                })
            } else {
                req.flash('error_msg', 'Não foi possível encontrar a categoria solicitada!')
                res.redirect('/categorias')
            }

        }).catch((erro) => {
            req.flash('error_msg', 'Ocorreu um erro interno ao carregar a página da categoria solicitada!')
            res.redirect('/categorias')
        })

    })

    app.get('/404', (req, res) => {
        res.send('Erro 404!')
    })

    // Admin
    app.use('/admin', admin)

    // Usuario
    app.use('/users', users)

// Outros
const port = 8081
app.listen(port, () => {
    console.log("Servidor aberto...")
})