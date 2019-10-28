// Carregando Modulos

const express = require('express')
const handlebars = require('express-handlebars')
const bodyParser = require("body-parser")
const app = express()
const admin = require("./routes/admin") // grupo de rotas /admin
const path = require('path') // modulo para manipular pastas

const mongoose = require("mongoose")
const session = require("express-session")
const flash = require("connect-flash") // tipo de sessao que só aparece uma vez

require("./models/Postagem")
const Postagem = mongoose.model("postagens")

require("./models/Categoria")
const Categoria = mongoose.model("categorias")

const usuarios = require("./routes/usuario")
const passport =  require("passport")
require("./config/auth")(passport)

const db = require("./config/db")
// Configuraçoes 
// SESSAO 
app.use(session( {
  secret: "chave",
  resave: true,
  saveUninitialized: true
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(flash())

//Midleware
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg")
  res.locals.error_msg = req.flash("error_msg")
  res.locals.error =  req.flash("error")
  res.locals.user =  req.user || null;
  next()
})

// BODY-PARSER
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
// HANDLEBARS
app.engine('handlebars', handlebars({ defaultLayout: 'main' }))
app.set('view engine', 'handlebars')
// MONGOOSE
mongoose.Promise = global.Promise;
mongoose.connect(db.mongoURI).then(() => {
  console.log("Conectado ao Mongo")

}).catch((err) => {
  console.log("Erro ao se conectar" + err)

})
// PUBLIC ARQUIVOS ESTATICOS
app.use(express.static(path.join(__dirname, "public")))

//midleware
app.use((req, res, next) => {
  console.log("Midleware")
  next()
})

// Rotas
app.get('/', (req, res) => {
  Postagem.find().populate("categoria").sort({ data: "desc" }).then((postagens) => {

    res.render("index", { postagens: postagens })

  }).catch((err) => {

    req.flash("error_msg", "Houve um Erro Interno")
    res.redirect("/404")
  })

})
app.get("/404", (req, res) => {
  res.sed('Erro 404!')
})

app.get("/postagem/:slug",(req,res)=>{
  Postagem.findOne({slug: req.params.slug}).then((postagem)=>{
    if(postagem){
      res.render("postagem/index",{postagem: postagem})
    }else{
      req.flash("error_msg", "Esta postagem não existe")
      res.redirect("/")
    }
  }).catch((err) => {

    req.flash("error_msg", "houve um erro interno!")
    res.redirect("/")
  })

})

app.get("/categorias", (req,res)=>{
    Categoria.find().then((categorias)=>{
      res.render("categorias/index", {categorias: categorias})
    }).catch((err)=>{

      req.flash("error_msg", "Houve um erro interno ao listar as categorias")
      res.redirect("/")
    })

})


app.get("/categorias/:slug", (req,res)=>{
  Categoria.findOne({slug: req.params.slug}).then((categoria)=>{
    if(categoria){
      Postagem.find({categoria: categoria._id}).then((postagens)=>{
         res.render("categorias/postagens", {postagens: postagens, categoria: categoria})
      }).catch((err)=>{
        req.flash("error_msg"," Houve um erro ao listar os posts")
        res.redirect("/")
      })
    }else{
      req.flash("error_msg", "Esta categoria não existe")
      res.redirect("/")
    }
  }).catch((err)=>{
    req.flash("error_msg", "Houve um erro interno ao carregar a pagina desta categoria")
    res.redirect("/")
  })
})




app.use('/admin', admin)
app.use('/usuarios', usuarios)


const PORT = process.env.PORT ||8081
app.listen(PORT, () => {
  console.log("Servidor rodando!!")

})
