const express = require('express')
const mongoose = require('mongoose')
const router = express.Router()
require('../models/Categoria')
const Categoria = mongoose.model('categorias')
require('../models/Post')
const Post = mongoose.model('posts')
const {eAdmin} = require('../helpers/eAdmin')

router.get('/', eAdmin, (req, res) => {
    res.render('admin/index')
})

// Categorias
router.get('/categorias', eAdmin, (req, res) => {
    Categoria.find().sort( {date: 'desc'} ).lean().then((categorias) => {
        res.render('admin/categorias', { categorias: categorias })
    }).catch((erro) => {
        req.flash('error_msg', 'Ocorreu um erro ao listar as categorias!')
        res.redirect('/admin')
    })
})

router.get('/categorias/add', eAdmin, (req, res) => {
    res.render('admin/addcategorias')
})

router.post('/categorias/nova', eAdmin, (req, res) => {
    
    var erros = []
    
    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
        erros.push({text: "Nome inválido!"})
    }
    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null) {
        erros.push({text: "Slug inválido!"})
    }
    if(req.body.nome.length < 2) {
        erros.push({text: "Nome da categoria muito curto!"})
    }
    if(erros.length > 0) {
        res.render('admin/addcategorias', {erros: erros})
    } else {
        const novaCategoria = {
            nome: req.body.nome,
            slug: req.body.slug
        }
        new Categoria(novaCategoria).save().then(() => {
            req.flash('success_msg', 'Categoria criada com sucesso!')
            res.redirect('/admin/categorias')
        }).catch((erro) => {
            req.flash('error_msg', 'Ocorreu um erro ao salvar a categoria, tente novamente!')
            res.redirect('/admin')
        })
    }

})

router.get('/categorias/edit/:id', eAdmin, (req, res) => {
    Categoria.findOne({_id: req.params.id}).lean().then((categoria) => {
        res.render('admin/editcategorias', {categoria: categoria})
    }).catch((erro) => {
        req.flash('error_msg', 'Essa categoria não existe!')
        res.redirect('/admin/categorias')
    })    
})

router.post('/categorias/edit', eAdmin, (req, res) => {

    var erros = []

    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
        erros.push({text: "Nome inválido!"})
    }
    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null) {
        erros.push({text: "Slug inválido!"})
    }
    if(req.body.nome.length < 2) {
        erros.push({text: "Nome da categoria muito curto!"})
    }
    if(erros.length > 0) {
        res.render('admin/editcategorias', {erros: erros})
    } else {
        Categoria.findOne({_id: req.body.id}).then((categoria) => {
        
            categoria.nome = req.body.nome
            categoria.slug = req.body.slug

            categoria.save().then(() => {
                req.flash('success_msg', 'Categoria editada com sucesso!')
                res.redirect('/admin/categorias')
            }).catch((erro) => {
                req.flash('error_msg', 'Ocorreu interno ao salvar a edição da categoria!')
                res.redirect('/admin/categorias')
            })
        }).catch((erro) => {
            req.flash('error_msg', 'Ocorreu um erro ao editar a categoria!')
            res.redirect('/admin/categorias')
        })
    }

})

router.post('/categorias/deletar', eAdmin, (req, res) => {
    Categoria.deleteOne({_id: req.body.id}).then(() => {
        req.flash('success_msg', 'Categoria deletada com sucesso!')
        res.redirect('/admin/categorias')
    }).catch((erro) => {
        req.flash('error_msg', 'Ocorreu um erro ao deletar a categoria!')
        res.redirect('/admin/categorias')
    })
})


// Postagens
router.get('/posts', eAdmin, (req, res) => {
    Post.find().lean().populate('categoria').sort({data: "desc"}).then((posts) => {
        res.render('admin/posts', {posts: posts})
    }).catch((erro) => {
        req.flash('error_msg', 'Ocorreu um erro ao listar as postagens')
        console.log(erro)
        res.redirect('/admin')
    })
})

router.get('/posts/add', eAdmin, (req, res) => {
    Categoria.find().lean().then((categorias) => {
        res.render('admin/addposts', { categorias: categorias })
    }).catch((erro) => {
        req.flash('error_msg', 'Ocorreu um erro ao carregar o formuláro!')
        res.redirect('/admin')
    })
})

router.post('/posts/nova', eAdmin, (req, res) => {

    var erros = []

    if(!req.body.titulo || typeof req.body.titulo == undefined || req.body.titulo == null) {
        erros.push({text: "Título inválido!"})
    }
    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null) {
        erros.push({text: "Slug inválido!"})
    }
    if(!req.body.descricao || typeof req.body.descricao == undefined || req.body.descricao == null) {
        erros.push({text: "Descrição inválido!"})
    }
    if(!req.body.conteudo || typeof req.body.conteudo == undefined || req.body.conteudo == null) {
        erros.push({text: "Descrição inválido!"})
    }
    if(req.body.titulo.length < 2) {
        erros.push({text: "Título muito curto!"})
    }
    if(req.body.categoria == 0){
        erros.push({text: 'Categoria inválida! Registre uma categoria'})
    }
    if(erros.length > 0) {
        res.render('admin/addposts', {erros: erros})
    } else {
        const novoPost = {
            titulo: req.body.titulo,
            slug: req.body.slug,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            categoria: req.body.categoria
        }

        new Post(novoPost).save().then(() => {
            req.flash('success_msg', 'Postagem criada com sucesso!')
            res.redirect('/admin/posts')
        }).catch((erro) => {
            req.flash('error_msg', 'Ocorreu um erro ao salvar a postagem!')
            res.redirect('/admin/posts')
        })
    }

})

router.get('/posts/edit/:id', eAdmin, (req, res) => {
    
    Post.findOne({_id: req.params.id}).lean().populate('categoria').then((post) => {
        Categoria.find().lean().then((categorias) => {
            res.render('admin/editposts', {categorias: categorias, post: post})
        }).catch((erro) => {
            req.flash('error_msg', 'Ocorreu um erro ao listar as categorias!')
            res.redirect('/admin/posts')
        })
    }).catch((erro) => {
        req.flash('error_msg', 'Ocorreu um erro ao carregar o formulário de edição!')
        res.redirect('/admin/posts')
    })
     
})

router.post('/posts/edit', eAdmin, (req, res) => {

    var erros = []

    if(!req.body.titulo || typeof req.body.titulo == undefined || req.body.titulo == null) {
        erros.push({text: "Título inválido!"})
    }
    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null) {
        erros.push({text: "Slug inválido!"})
    }
    if(!req.body.descricao || typeof req.body.descricao == undefined || req.body.descricao == null) {
        erros.push({text: "Descrição inválido!"})
    }
    if(!req.body.conteudo || typeof req.body.conteudo == undefined || req.body.conteudo == null) {
        erros.push({text: "Descrição inválido!"})
    }
    if(req.body.titulo.length < 2) {
        erros.push({text: "Título muito curto!"})
    }
    if(req.body.categoria == 0){
        erros.push({text: 'Categoria inválida! Registre uma categoria'})
    }
    if(erros.length > 0) {
        res.render('admin/editposts', {erros: erros})
    } else {
        Post.findOne({_id: req.body.id}).then((post) => {
            
            post.titulo = req.body.titulo
            post.slug = req.body.slug
            post.descricao = req.body.descricao
            post.conteudo = req.body.conteudo
            post.categoria = req.body.categoria

            post.save().then(() => {
                req.flash('success_msg', 'Postagem editada com sucesso!')
                res.redirect('/admin/posts')
            }).catch((erro) => {
                req.flash('error_msg', 'Ocorreu interno ao salvar a edição da postagem!')
                res.redirect('/admin/posts')
            })

        }).catch((erro) => {
            req.flash('error_msg', 'Ocorreu um erro ao editar a postagem!')
            res.redirect('/admin/posts')
        })
    }

})

    // OUTRA FORMA DE DELETAR, PORÉM NÃO TÃO SEGURA, POIS É GET
router.get('/posts/deletar/:id', eAdmin, (req, res) => {
    Post.deleteOne({_id: req.params.id}).then(() => {
        req.flash('success_msg', 'Postagem deletada com sucesso!')
        res.redirect('/admin/posts')
    }).catch((erro) => {
        req.flash('error_msg', 'Ocorreu um erro ao deletar a postagem!')
        res.redirect('/admin/posts')
    })
})



module.exports = router