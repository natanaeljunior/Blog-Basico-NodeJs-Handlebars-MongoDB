const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const Categoria =  new Schema ({
      nome:{
          type:String,
          required:true
      },
      slug:{
        type: String,
        required: true

      },
      date:{
        type: Date,
        default: Date.now()
      }

})
            // nome sera usado no referenciamento "categorias"
mongoose.model("categorias", Categoria)
