//import express from 'express';
const express = require('express');
const path = require('path');
const bodyParser = require("body-parser");
const app = express();
const port = 3000;
const { Pool } = require('pg');
const multer = require('multer');

//const express = require('express');
//const path = require('path');const multer = require('multer');


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

//----------- UPLOAD ARQUIVO INICIO---------------------//
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, '/home/osboxes/Public/nodeuploadimg/uploads')
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + path.extname(file.originalname))
    }
  });
   
const upload = multer({ storage: storage });
  


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