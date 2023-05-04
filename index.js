//import express from 'express';
const express = require('express');
const path = require('path');
const bodyParser = require("body-parser");
const app = express();
const port = 3000;
const { Pool } = require('pg');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');


//aceitando EJS
app.set('view engine', 'ejs');
app.set('views', './views');

//NECESSARIO PARA PASSAR DADOS DO FORMULARIO PARA OUTRA PAGINA
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//NECESSARIO PARA USAR O ARQUIVOS DE OUTRA PASTA
//REMOVE ERRO DE MIME TYPE CSS
app.use(express.static(path.join(__dirname, 'css')));
app.use(express.static(path.join(__dirname, 'views')));
app.use(express.static(path.join(__dirname, '/')));

//////////////Configura local do arquivo feito upload-INICIO//////////////////
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, '/home/osboxes/Public/nodeuploadimg/uploads')
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + path.extname(file.originalname))
    }
  });
   
const upload = multer({ storage: storage });
///////////////////////////-FIM-/////////////////////////////////////


// Configura��o do banco de dados
const pool = new Pool({
    user: 'postgres',
    host: '127.0.0.1',
    database: 'postgres',
    password: 'root',
    port: 5432, // porta padr�o do Postgres
});

// Conex�o com o banco de dados
pool.connect((err, client, release) => {
    if (err) {
        return console.error('Erro ao conectar ao banco de dados', err.stack);
    }
    console.log('Conex�o estabelecida com sucesso ao banco de dados');
});

//SOBE O SERVIDOR
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});



app.get('/', (req, res) => {

    pool.query('SELECT codigo,nome,cel FROM clientes order by nome', (error, results) => {
        if (error) {
            throw error;
        }

        res.render('home', { varTitle: "Sistema de Vendas - HOME", pessoas: results.rows, nome:'NOME' });

    });
});

app.get('/deletar/:codigo', (req, res) => {

    pool.query('delete from clientes where codigo = $1',[req.params.codigo] ,(error, results) => {
        if (error) {
            throw error;
        }

        res.redirect('/');

    });
});

app.get('/add', (req, res) => {

    res.render('add', { varTitle: "Sistema de Vendas - ADD", nome:'NOME' });

   
});

//INSERIR
app.post('/inserir', (req, res) => {
    var cols = [req.body.nome, req.body.cel];
  
    pool.query('insert into clientes (nome,cel) values($1,$2)', cols, (error, results) => {
        if (error) {
            throw error;
        }

        res.redirect('/');



    });
});

app.get('/upload', (req, res) => {

    res.render('upload', { varTitle: "Sistema de Vendas - UPLOAD", nome:'NOME' });

   
});

app.get('/upload_progressBar', (req, res) => {

    res.render('upload_barraprogresso', { varTitle: "Sistema de Vendas - UPLOAD-BARRA", nome:'NOME' });

   
});

//----------- UPLOAD ARQUIVO INICIO---------------------//  

app.post('/upload_img', upload.single('image'), (req, res, next) => {
  const file = req.file;
  if (!file) {
    const error = new Error('Please select an file to upload');
    error.httpStatusCode = 400;
    return next(error);
  }
  res.send('file uploaded successfully');
  
});
//----------- UPLOAD ARQUIVO FIM ---------------------//


//----------- UPLOAD ARQUIVO COM BARRA DE PROGRESSO INICIO ---------------------//


app.post('/upload_progressBar', upload.single('image'), (req, res, next) => {
  const file = req.file;
  if (!file) {
    const error = new Error('Please select an image to upload');
    error.httpStatusCode = 400;
    return next(error);
  }

  const formData = new FormData();
  formData.append('image', file.buffer, {
    filename: file.originalname,
    contentType: file.mimetype,
    knownLength: file.size
  });

  

  axios.post('http://localhost:3000/upload_progressBar', formData, {
    headers: {
      ...formData.getHeaders(),
      'Content-Length': formData.getLengthSync()
    },
    onUploadProgress: function (progressEvent) {
      const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
      console.log(`Upload Progress: ${progress}%`);
    }
  }).then(response => {
    console.log(response.data);
    res.send('Image uploaded successfully');
  }).catch(error => {
    console.error(error);
    res.status(500).send('Internal Server Error');
  });
});

