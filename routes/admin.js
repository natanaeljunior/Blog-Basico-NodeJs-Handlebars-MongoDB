const express = require('express')
const router = express.Router()
const mongoose = require("mongoose")
require("../models/Categoria")
const Categoria = mongoose.model("categorias")
require("../models/Postagem")
const Postagem = mongoose.model("postagens")
const {eAdmin} = require("../helpers/eAdmin")




router.get('/',eAdmin, (req, res) => {
    res.render("admin/index")

})
router.get('/posts',eAdmin, (req, res) => {
    res.send("Pagina de posts")

})
router.get('/categorias',eAdmin, (req, res) => {

    Categoria.find().sort({ date: 'desc' }).then((categorias) => {
        res.render("admin/categorias", { categorias: categorias })

    }).catch((err) => {
        req.flash("error_msg", "?Houve um erro ao salvar a categoria!")
        res.redirect("/admin")
    })
})
router.get('/categorias/add',eAdmin, (req, res) => {
    res.render("admin/addcategoria")
})
router.post('/categorias/nova',eAdmin, (req, res) => {
    var erros = []

    if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
        erros.push({ texto: "Nome Inválido" })
    }

    if (!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null) {
        erros.push({ texto: "Slug Inválido" })
    }
    if (erros.length > 0) {
        res.render("admin/addcategoria", { erros: erros })

    } else {

        // cria categoria no banco de dados
        const novacategoria = {
            nome: req.body.nome,
            slug: req.body.slug
        }

        new Categoria(novacategoria).save().then(() => {
            req.flash("success_msg", "Categoria Cadastrada com Sucesso!")
            res.redirect("/admin/categorias")
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao salvar a categoria!")
            res.redirect("/admin")
        })
    }
})

router.get("/categorias/edit/:id",eAdmin, (req, res) => {
    Categoria.findOne({ _id: req.params.id }).then((categoria) => {
        res.render("admin/editcategoria", { categoria: categoria })

    }).catch((err) => {
        req.flash("error_msg", "Essa categoria nao existe")
        res.redirect("/admin/categorias")
    })


})

router.post("/categorias/edit",eAdmin, (req, res) => {

    Categoria.findOne({ _id: req.body.id }).then((categoria) => {
        categoria.nome = req.body.nome
        categoria.slug = req.body.slug

        categoria.save().then(() => {
            req.flash("success_msg", "Categoria Alterada com Sucesso!")
            res.redirect("/admin/categorias")
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro interno ao salvar a edição da categoria")
        })

    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao editar a Categoria")
        res.redirect("/admin/categorias")

    })
})

router.post("/categorias/deletar",eAdmin, (req, res) => {
    Categoria.remove({ _id: req.body.id }).then(() => {
        req.flash("success_msg", "Categoria Deletada com sucesso!")
        res.redirect("/admin/categorias")
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao Deletar Categoria")
        res.redirect("/admin/categorias")
    })

})

router.get("/postagens",eAdmin, (req, res) => {
    Postagem.find().populate("categoria").sort({ data: "desc" }).then((postagens) => {
        res.render("admin/postagens", { postagens: postagens })

    }).catch((err) => {
        req.flash("error_msg", "houve um erro ao listar as postagens")
        res.redirect("/admin")
    })

})

router.get("/postagens/add",eAdmin, (req, res) => {
    Categoria.find().then((categorias) => {
        res.render("admin/addpostagem", { categorias: categorias })

    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao carregar o formulario")
        res.redirect("/admin")

    })

})

router.post("/postagens/nova",eAdmin, (req, res) => {
    var erros = []
    if (req.body.categoria == "0") {
        erros.push({ texto: "Categoria Inválida, registre uma categoria" })
    }
    if (erros.length > 0) {
        res.render("admin/addpostagem", { erros: erros })
    } else {
        const novaPostagem = {
            titulo: req.body.titulo,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            categoria: req.body.categoria,
            slug: req.body.slug
        }

        new Postagem(novaPostagem).save().then(() => {
            req.flash("success_msg", "Postagem Criada com sucesso!")
            res.redirect("/admin/postagens")
        }).catch((err) => {
            req.flash("error_msg", "Houvre um erro durante o salvamento da postagem!")
            res.redirect("/admin/postagens")
        })
    }

})


router.get("/postagens/edit/:id",eAdmin, (req, res) => {
    Postagem.findOne({ _id: req.params.id }).then((postagem) => {
        Categoria.find().then((categorias) => {
        res.render("admin/editpostagens", { categorias: categorias, postagem: postagem })
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao listar as categorias")
            res.redirect("/admin/postagens")
        })
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao carregar formulario de edição!")
        res.redirect("/admin/postagens")
    })


})


router.post("/postagem/edit",eAdmin, (req, res) => {

    Postagem.findOne({ _id: req.body.id }).then((postagem) => {
        postagem.titulo = req.body.titulo
        postagem.slug = req.body.slug
        postagem.descricao = req.body.descricao
        postagem.conteudo = req.body.conteudo
        postagem.categoria = req.body.categoria

        postagem.save().then(() => {
            req.flash("success_msg", "Postagem Alterada com Sucesso!")
            res.redirect("/admin/postagens")
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro interno ao salvar a edição da postagem")
        })

    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao editar a Postagem")
        res.redirect("/admin/categorias")

    })
})

router.get("/postagens/deletar/:id",eAdmin,(req,res)=>{

    Postagem.remove({_id: req.params.id}).then(()=>{
        req.flash("success_msg", "Postagem Excluida com Sucesso!")
        res.redirect("/admin/postagens")
    }).catch(()=>{
        req.flash("error_msg", "Erro ao Excluir Postagem!")
        res.redirect("/admin/postagens")
    })
})



module.exports = router
