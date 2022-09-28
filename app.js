var bodyParser = require("body-parser"),
    methodOverride = require("method-override"),
    crypto = require('crypto'),
    path = require('path'),
    expressSanitizer = require("express-sanitizer"),
    mongoose = require("mongoose"),
    express = require("express"),
    multer = require('multer'),
    GridFsStorage = require('multer-gridfs-storage'),
    Grid = require('gridfs-stream'),
    User = require("./models/user"),
    passport = require("passport"),
    LocalStrategy = require("passport-local"),
    app = express()
    
var mongoURI = 'mongodb://localhost:27017/pts';

var conn = mongoose.createConnection(mongoURI);

//CONFIGURAÇÃO DO APP
mongoose.connect(mongoURI, { useNewUrlParser: true });
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressSanitizer());
app.use(methodOverride("_method"));

app.use(require("express-session")({
    secret: "bm us awesome",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//Connection Stream
let gfs;

conn.once('open', function(){
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection('uploads');
});

//Create Storage Engine
var storage = new GridFsStorage({
    url: mongoURI,
    file: (req, file) => {
        return new Promise((resolve, reject) => {
            crypto.randomBytes(16,(err, buf) => {
                if(err) {
                    return reject(err);
                }
                var filename = buf.toString('hex') + path.extname(file.originalname);
                var fileInfo = {
                    filename: filename,
                    bucketName: 'uploads'
                };
                resolve(fileInfo);
            });
        });
    }
});

var upload = multer({ storage });

//MONGOOSE/CONFIGURAÇÃO DO MODEL RESIDENTE
var residenteSchema = new mongoose.Schema({
    image: String,
    nome: String,
    cargo: String,
    empresa: String,
    descricao: String,
    email: String,
    telefone: String,
    created: {type: Date, default: Date.now}
});

//CONFIGURAÇÃO DO MODEL GESTORES
var gestorSchema = new mongoose.Schema({
    image: String,
    nome: String,
    cargo: String,
    descricao: String,
    email: String,
    telefone: String,
    created: {type: Date, default: Date.now}
});

//CONFIGURAÇÃO DO MODEL PARCEIROS
var parceiroSchema = new mongoose.Schema({
    image: String,
    nome: String,
    descricao: String,
    objetivo: String,
    prjDesenvolvimento: String,
    prjInteresse: String,
    area: String,
    site: String,
    created: {type: Date, default: Date.now}
});

//CONFIGURAÇÃO DO MODEL NOTÍCIAS
var noticiaSchema = new mongoose.Schema({
    image: String,
    titulo: String,
    desc: String,
    created: {type: Date, default: Date.now}
});

var Residente = mongoose.model("Residente", residenteSchema);
var Gestor = mongoose.model("Gestor", gestorSchema);

var Startup = mongoose.model("Startup", parceiroSchema);
var Universidade = mongoose.model("Universidade", parceiroSchema);
var Empresa = mongoose.model("Empresa", parceiroSchema);

var Noticia = mongoose.model("Noticia", noticiaSchema);
var Agenda = mongoose.model("Agenda", noticiaSchema);

//RESTFULL ROUTES
app.get("/", function(req,res){
    res.redirect("/login");
});

//INDEX ROUTE
app.get("/residentes", isLoggedIn, function(req, res){
    //RETORNANDO TODOS OS RESIDENTES DO BANCO DE DADOS
    Residente.find({}).sort('created').exec(function(err, residentes){
        if(err){
            console.log(err);
        } else{
            res.render("index", {residentes: residentes});
        }
    });
});

app.get("/gestores", isLoggedIn, function(req, res){
    //RETORNANDO TODOS OS GESTORES DO BANCO DE DADOS
    Gestor.find({}).sort('created').exec(function(err, gestores){
        if(err){
            console.log(err);
        } else{
            res.render("gestores", {gestores: gestores});
        }
    });
});

app.get("/startups", isLoggedIn, function(req, res){
    //RETORNANDO TODAS AS STARTUPS DO BANCO DE DADOS
    Startup.find({}).sort('-created').exec(function(err, startups){
        if(err){
            console.log(err);
        } else{
            res.render("startups", {startups: startups});
        }
    });
});

app.get("/universidades", isLoggedIn, function(req, res){
    //RETORNANDO TODAS AS STARTUPS DO BANCO DE DADOS
    Universidade.find({}).sort('-created').exec(function(err, universidades){
        if(err){
            console.log(err);
        } else{
            res.render("universidades", {universidades: universidades});
        }
    });
});

app.get("/empresas", isLoggedIn, function(req, res){
    //RETORNANDO TODAS AS STARTUPS DO BANCO DE DADOS
    Empresa.find({}).sort('-created').exec(function(err, empresas){
        if(err){
            console.log(err);
        } else{
            res.render("empresas", {empresas: empresas});
        }
    });
});

app.get("/noticias", isLoggedIn, function(req, res){
    //RETORNANDO TODAS AS STARTUPS DO BANCO DE DADOS
    Noticia.find({}).sort('-created').exec(function(err, noticias){
        if(err){
            console.log(err);
        } else{
            res.render("noticias", {noticias: noticias});
        }
    });
});

app.get("/agendas", isLoggedIn, function(req, res){
    //RETORNANDO TODAS AS STARTUPS DO BANCO DE DADOS
    Agenda.find({}).sort('-created').exec(function(err, agendas){
        if(err){
            console.log(err);
        } else{
            res.render("agendas", {agendas: agendas});
        }
    });
});

//JOGANDO OS DADOS DOS RESIDENTES DO BANCO DE DADOS EM JSON NA ROUTE /residentes/json
app.get("/residentes/json", function(req, res){
    Residente.find({}).sort('created').exec(function(err, residentes){
        return res.end(JSON.stringify(residentes));
    });
});

app.get("/gestores/json", function(req, res){
    Gestor.find({}).sort('created').exec(function(err, gestores){
    	console.log('teste');
        return res.end(JSON.stringify(gestores));
    });
});

app.get("/startups/json", function(req, res){
    Startup.find({}).sort('-created').exec(function(err, startups){
        return res.end(JSON.stringify(startups));
    });
});

app.get("/universidades/json", function(req, res){
    Universidade.find({}).sort('-created').exec(function(err, universidades){
        return res.end(JSON.stringify(universidades));
    });
});

app.get("/empresas/json", function(req, res){
    Empresa.find({}).sort('-created').exec(function(err, empresas){
        return res.end(JSON.stringify(empresas));
    });
});

app.get("/noticias/json", function(req, res){
    Noticia.find({}).sort('-created').exec(function(err, noticias){
        return res.end(JSON.stringify(noticias));
    });
});

app.get("/agendas/json", function(req, res){
    Agenda.find({}).sort('-created').exec(function(err, agendas){
        return res.end(JSON.stringify(agendas));
    });
});

//NEW ROUTE
app.get("/residentes/cadastrar", isLoggedIn, function(req, res){
    res.render("residentecadastro");
});

app.get("/gestores/cadastrar", isLoggedIn, function(req, res){
    res.render("gestorcadastro");
});

app.get("/startups/cadastrar", isLoggedIn, function(req, res){
    res.render("startupcadastro");
});

app.get("/universidades/cadastrar", isLoggedIn, function(req, res){
    res.render("universidadecadastro");
});

app.get("/empresas/cadastrar", isLoggedIn, function(req, res){
    res.render("empresacadastro");
});

app.get("/noticias/cadastrar", isLoggedIn, function(req, res){
    res.render("noticiacadastro");
});

app.get("/agendas/cadastrar", isLoggedIn, function(req, res){
    res.render("agendacadastro");
});

var filedir;

//CREATE ROUTE
app.post("/residentes", upload.single('file'), function(req,res){
    //create residente
    req.body.residente.body = req.sanitize(req.body.residente.body);
    Residente.create(req.body.residente, function(err, newResidente){
        if(err){
            res.render("residentecadastro");
        }else{
            res.redirect("/residentes");
            
            gfs.files.findOne({}, {sort:{$natural:-1}}, (err, file) => {
                    filedir = 'https://webdevbootcamp-vkano.c9users.io/image/' + file.filename;
                    Residente.updateOne({_id: newResidente.id}, {$set: {image: filedir}}, {upserts: true}, (err, alt) => {
                        if(err){
                            console.log(err);
                        }
                    });
                });
        };
    });
});



app.post("/gestores", upload.single('file'), function(req,res){
    //create residente
    req.body.gestor.body = req.sanitize(req.body.gestor.body);
    Gestor.create(req.body.gestor, function(err, newGestor){
        if(err){
            res.render("gestorcadastro");
        }else{
            //redirect to the index
            res.redirect("/gestores");
            
            gfs.files.findOne({}, {sort:{$natural:-1}}, (err, file) => {
                    filedir = 'https://webdevbootcamp-vkano.c9users.io/image/' + file.filename;
                    Gestor.updateOne({_id: newGestor.id}, {$set: {image: filedir}}, {upserts: true}, (err, alt) => {
                        if(err){
                            console.log(err);
                        }
                    });
                });
        }
    });
});

app.post("/startups", upload.single('file'), function(req,res){
    //create residente
    req.body.startup.body = req.sanitize(req.body.startup.body);
    Startup.create(req.body.startup, function(err, newStartup){
        if(err){
            res.render("startupcadastro");
        }else{
            //redirect to the index
            res.redirect("/startups");
            
            gfs.files.findOne({}, {sort:{$natural:-1}}, (err, file) => {
                    filedir = 'https://webdevbootcamp-vkano.c9users.io/image/' + file.filename;
                    Startup.updateOne({_id: newStartup.id}, {$set: {image: filedir}}, {upserts: true}, (err, alt) => {
                        if(err){
                            console.log(err);
                        }
                    });
                });
        }
    });
});

app.post("/universidades", upload.single('file'), function(req,res){
    //create residente
    req.body.universidade.body = req.sanitize(req.body.universidade.body);
    Universidade.create(req.body.universidade, function(err, newUniversidade){
        if(err){
            res.render("universidadecadastro");
        }else{
            //redirect to the index
            res.redirect("/universidades");
            
            gfs.files.findOne({}, {sort:{$natural:-1}}, (err, file) => {
                    filedir = 'https://webdevbootcamp-vkano.c9users.io/image/' + file.filename;
                    Universidade.updateOne({_id: newUniversidade.id}, {$set: {image: filedir}}, {upserts: true}, (err, alt) => {
                        if(err){
                            console.log(err);
                        }
                    });
                });
        }
    });
});

app.post("/empresas", upload.single('file'), function(req,res){
    //create residente
    req.body.empresa.body = req.sanitize(req.body.empresa.body);
    Empresa.create(req.body.empresa, function(err, newEmpresa){
        if(err){
            res.render("empresacadastro");
        }else{
            //redirect to the index
            res.redirect("/empresas");
            
            gfs.files.findOne({}, {sort:{$natural:-1}}, (err, file) => {
                    filedir = 'https://webdevbootcamp-vkano.c9users.io/image/' + file.filename;
                    Empresa.updateOne({_id: newEmpresa.id}, {$set: {image: filedir}}, {upserts: true}, (err, alt) => {
                        if(err){
                            console.log(err);
                        }
                    });
                });
        }
    });
});

app.post("/noticias", upload.single('file'), function(req,res){
    //create residente
    req.body.noticia.body = req.sanitize(req.body.noticia.body);
    Noticia.create(req.body.noticia, function(err, newNoticia){
        if(err){
            res.render("noticiacadastro");
        }else{
            //redirect to the index
            res.redirect("/noticias");
            
            gfs.files.findOne({}, {sort:{$natural:-1}}, (err, file) => {
                    filedir = 'https://webdevbootcamp-vkano.c9users.io/image/' + file.filename;
                    Noticia.updateOne({_id: newNoticia.id}, {$set: {image: filedir}}, {upserts: true}, (err, alt) => {
                        if(err){
                            console.log(err);
                        }
                    });
                });
        }
    });
});

app.post("/agendas", upload.single('file'), function(req,res){
    //create residente
    req.body.agenda.body = req.sanitize(req.body.agenda.body);
    Agenda.create(req.body.agenda, function(err, newAgenda){
        if(err){
            res.render("agendacadastro");
        }else{
            //redirect to the index
            res.redirect("/agendas");
            
            gfs.files.findOne({}, {sort:{$natural:-1}}, (err, file) => {
                    filedir = 'https://webdevbootcamp-vkano.c9users.io/image/' + file.filename;
                    Agenda.updateOne({_id: newAgenda.id}, {$set: {image: filedir}}, {upserts: true}, (err, alt) => {
                        if(err){
                            console.log(err);
                        }
                    });
                });
        }
    });
});

//ROUTE WITH IMAGE
app.get('/image/:filename', (req, res) => {
    gfs.files.findOne({filename: req.params.filename},(err, file) => {
        //check if image
        if(file.contentType === 'image/jpeg' || file.contentType === 'image/png') {
            // Read Output to Browser
            var readstream = gfs.createReadStream(file.filename);
            readstream.pipe(res);
        } else {
            res.status(404).json({
                       err: 'Not a Image'
        });
        }
    });
});


//SHOW ROUTE
app.get("/residentes/:id", isLoggedIn, function(req, res){
    Residente.findById(req.params.id, function(err, foundResidente){
        if(err){
            res.redirect("/residentes");
        }else{
            res.render("show", {residentes: foundResidente});
        }
    });
});

app.get("/gestores/:id", isLoggedIn, function(req, res){
    Gestor.findById(req.params.id, function(err, foundGestor){
        if(err){
            res.redirect("/gestores");
        }else{
            res.render("showgestor", {gestores: foundGestor});
        }
    });
});

app.get("/universidades/:id", isLoggedIn, function(req, res){
    Universidade.findById(req.params.id, function(err, foundUniversidade){
        if(err){
            res.redirect("/universidades");
        }else{
            res.render("showuniversidade", {universidade: foundUniversidade});
        }
    });
});

app.get("/startups/:id", isLoggedIn, function(req, res){
    Startup.findById(req.params.id, function(err, foundStartup){
        if(err){
            res.redirect("/startups");
        }else{
            res.render("showstartup", {startup: foundStartup});
        }
    });
});

app.get("/empresas/:id", isLoggedIn, function(req, res){
    Empresa.findById(req.params.id, function(err, foundEmpresa){
        if(err){
            res.redirect("/empresas");
        }else{
            res.render("showempresa", {empresa: foundEmpresa});
        }
    });
});

app.get("/noticias/:id", isLoggedIn, function(req, res){
    Noticia.findById(req.params.id, function(err, foundNoticia){
        if(err){
            res.redirect("/noticias");
        }else{
            res.render("shownoticia", {noticia: foundNoticia});
        }
    });
});

app.get("/agendas/:id", isLoggedIn, function(req, res){
    Agenda.findById(req.params.id, function(err, foundAgenda){
        if(err){
            res.redirect("/agendas");
        }else{
            res.render("showagenda", {agenda: foundAgenda});
        }
    });
});


//EDIT ROUTE
app.get("/residentes/:id/edit", isLoggedIn, function(req, res) {
    Residente.findById(req.params.id, function(err, foundResidente){
        if(err){
            res.redirect("/residentes");
        }else{
            res.render("edit", {residentes: foundResidente});
        }
    });
});

app.get("/gestores/:id/edit", isLoggedIn, function(req, res) {
    Gestor.findById(req.params.id, function(err, foundGestor){
        if(err){
            res.redirect("/gestores");
        }else{
            res.render("editgestor", {gestores: foundGestor});
        }
    });
});

app.get("/startups/:id/edit", isLoggedIn, function(req, res) {
    Startup.findById(req.params.id, function(err, foundStartup){
        if(err){
            res.redirect("/startups");
        }else{
            res.render("editstartup", {startup: foundStartup});
        }
    });
});

app.get("/universidades/:id/edit", isLoggedIn, function(req, res) {
    Universidade.findById(req.params.id, function(err, foundUniversidade){
        if(err){
            res.redirect("/universidades");
        }else{
            res.render("edituniversidade", {universidade: foundUniversidade});
        }
    });
});

app.get("/empresas/:id/edit", isLoggedIn, function(req, res) {
    Empresa.findById(req.params.id, function(err, foundEmpresa){
        if(err){
            res.redirect("/empresas");
        }else{
            res.render("editempresa", {empresa: foundEmpresa});
        }
    });
});

app.get("/noticias/:id/edit", isLoggedIn, function(req, res) {
    Noticia.findById(req.params.id, function(err, foundNoticia){
        if(err){
            res.redirect("/noticias");
        }else{
            res.render("editnoticia", {noticia: foundNoticia});
        }
    });
});

app.get("/agendas/:id/edit", isLoggedIn, function(req, res) {
    Agenda.findById(req.params.id, function(err, foundAgenda){
        if(err){
            res.redirect("/agendas");
        }else{
            res.render("editagenda", {agenda: foundAgenda});
        }
    });
});

//UPDATE ROUTE
app.put("/residentes/:id", isLoggedIn, function(req, res){
    req.body.residente.body = req.sanitize(req.body.residente.body);
    Residente.findByIdAndUpdate(req.params.id, req.body.residente, function(err, updatedResidente) {
        if(err){
            res.redirect("/residentes");
        }else{
            res.redirect("/residentes/" + req.params.id);
        }
    });
});

app.put("/gestores/:id", isLoggedIn, function(req, res){
    req.body.gestor.body = req.sanitize(req.body.gestor.body);
    Gestor.findByIdAndUpdate(req.params.id, req.body.gestor, function(err, updatedGestor) {
        if(err){
            res.redirect("/gestores");
        }else{
            res.redirect("/gestores/" + req.params.id);
        }
    })
});

app.put("/startups/:id", isLoggedIn, function(req, res){
    req.body.startup.body = req.sanitize(req.body.startup.body);
    Startup.findByIdAndUpdate(req.params.id, req.body.startup, function(err, updatedStartup) {
        if(err){
            res.redirect("/startups");
        }else{
            res.redirect("/startups/" + req.params.id);
        }
    })
});
 
app.put("/universidades/:id", isLoggedIn, function(req, res){
    req.body.universidade.body = req.sanitize(req.body.universidade.body);
    Universidade.findByIdAndUpdate(req.params.id, req.body.universidade, function(err, updatedUniversidade) {
        if(err){
            res.redirect("/universidades");
        }else{
            res.redirect("/universidades/" + req.params.id);
        }
    })
});

app.put("/empresas/:id", isLoggedIn, function(req, res){
    req.body.empresa.body = req.sanitize(req.body.empresa.body);
    Empresa.findByIdAndUpdate(req.params.id, req.body.empresa, function(err, updatedEmpresa) {
        if(err){
            res.redirect("/empresas");
        }else{
            res.redirect("/empresas/" + req.params.id);
        }
    })
});

app.put("/noticias/:id", isLoggedIn, function(req, res){
    req.body.noticia.body = req.sanitize(req.body.noticia.body);
    Noticia.findByIdAndUpdate(req.params.id, req.body.noticia, function(err, updatedNoticia) {
        if(err){
            res.redirect("/noticias");
        }else{
            res.redirect("/noticias/" + req.params.id);
        }
    })
});

app.put("/agendas/:id", isLoggedIn, function(req, res){
    req.body.agenda.body = req.sanitize(req.body.agenda.body);
    Agenda.findByIdAndUpdate(req.params.id, req.body.agenda, function(err, updatedAgenda) {
        if(err){
            res.redirect("/agendas");
        }else{
            res.redirect("/agendas/" + req.params.id);
        }
    })
});

app.post("/residentes/:id", upload.single('file'),(req, res) => {
    Residente.findOne({_id: req.params.id}, (err, foundResidente) => {
        if(err){
            res.redirect("/residentes");
        }else{
            res.redirect("/residentes/" + req.params.id);
            gfs.files.findOne({}, {sort:{$natural:-1}}, (err, file) => {
                filedir = 'https://webdevbootcamp-vkano.c9users.io/image/' + file.filename;
                Residente.updateOne({_id: foundResidente.id}, {$set: {image: filedir}}, {upserts: true}, (err, alt) => {
                        if(err){
                            console.log(err);
                        }
                    });
                });
        }
    });
});

app.post("/gestores/:id", upload.single('file'),(req, res) => {
    Gestor.findOne({_id: req.params.id}, (err, foundGestor) => {
        if(err){
            res.redirect("/gestores");
        }else{
            res.redirect("/gestores/" + req.params.id);
            gfs.files.findOne({}, {sort:{$natural:-1}}, (err, file) => {
                filedir = 'https://webdevbootcamp-vkano.c9users.io/image/' + file.filename;
                Gestor.updateOne({_id: foundGestor.id}, {$set: {image: filedir}}, {upserts: true}, (err, alt) => {
                        if(err){
                            console.log(err);
                        }
                    });
                });
        }
    });
});

app.post("/startups/:id", upload.single('file'),(req, res) => {
    Startup.findOne({_id: req.params.id}, (err, foundStartup) => {
        if(err){
            res.redirect("/startups");
        }else{
            res.redirect("/startups/" + req.params.id);
            gfs.files.findOne({}, {sort:{$natural:-1}}, (err, file) => {
                filedir = 'https://webdevbootcamp-vkano.c9users.io/image/' + file.filename;
                Startup.updateOne({_id: foundStartup.id}, {$set: {image: filedir}}, {upserts: true}, (err, alt) => {
                        if(err){
                            console.log(err);
                        }
                    });
                });
        }
    });
});

app.post("/universidades/:id", upload.single('file'),(req, res) => {
    Universidade.findOne({_id: req.params.id}, (err, foundUniversidade) => {
        if(err){
            res.redirect("/universidades");
        }else{
            res.redirect("/universidades/" + req.params.id);
            gfs.files.findOne({}, {sort:{$natural:-1}}, (err, file) => {
                filedir = 'https://webdevbootcamp-vkano.c9users.io/image/' + file.filename;
                Universidade.updateOne({_id: foundUniversidade.id}, {$set: {image: filedir}}, {upserts: true}, (err, alt) => {
                        if(err){
                            console.log(err);
                        }
                    });
                });
        }
    });
});

app.post("/empresas/:id", upload.single('file'),(req, res) => {
    Empresa.findOne({_id: req.params.id}, (err, foundEmpresa) => {
        if(err){
            res.redirect("/empresas");
        }else{
            res.redirect("/empresas/" + req.params.id);
            gfs.files.findOne({}, {sort:{$natural:-1}}, (err, file) => {
                filedir = 'https://webdevbootcamp-vkano.c9users.io/image/' + file.filename;
                Empresa.updateOne({_id: foundEmpresa.id}, {$set: {image: filedir}}, {upserts: true}, (err, alt) => {
                        if(err){
                            console.log(err);
                        }
                    });
                });
        }
    });
});

app.post("/noticias/:id", upload.single('file'),(req, res) => {
    Noticia.findOne({_id: req.params.id}, (err, foundNoticia) => {
        if(err){
            res.redirect("/noticias");
        }else{
            res.redirect("/noticias/" + req.params.id);
            gfs.files.findOne({}, {sort:{$natural:-1}}, (err, file) => {
                filedir = 'https://webdevbootcamp-vkano.c9users.io/image/' + file.filename;
                Noticia.updateOne({_id: foundNoticia.id}, {$set: {image: filedir}}, {upserts: true}, (err, alt) => {
                        if(err){
                            console.log(err);
                        }
                    });
                });
        }
    });
});

app.post("/agendas/:id", upload.single('file'),(req, res) => {
    Agenda.findOne({_id: req.params.id}, (err, foundAgenda) => {
        if(err){
            res.redirect("/agendas");
        }else{
            res.redirect("/agendas/" + req.params.id);
            gfs.files.findOne({}, {sort:{$natural:-1}}, (err, file) => {
                filedir = 'https://webdevbootcamp-vkano.c9users.io/image/' + file.filename;
                Agenda.updateOne({_id: foundAgenda.id}, {$set: {image: filedir}}, {upserts: true}, (err, alt) => {
                        if(err){
                            console.log(err);
                        }
                    });
                });
        }
    });
});

//DESTROY ROUTE
app.delete("/residentes/:id", isLoggedIn, function(req, res){
    Residente.findByIdAndRemove(req.params.id, function(err, deletedResidente){
        var str;
            str = deletedResidente.image;
        var sub = "'" + str.substring(46) + "'";
        if(err){
            res.redirect("/residentes");
        }else{
            res.redirect("/residentes");
        }
    });
});

app.delete("/gestores/:id", isLoggedIn, function(req, res){
    Gestor.findByIdAndRemove(req.params.id, function(err, deletedGestor){
        if(err){
            res.redirect("/gestores");
        }else{
            res.redirect("/gestores");
        }
    });
});

app.delete("/startups/:id", isLoggedIn, function(req, res){
    Startup.findByIdAndRemove(req.params.id, function(err, deletedStartup){
        if(err){
            res.redirect("/startups");
        }else{
            res.redirect("/startups");
        }
    });
});

app.delete("/universidades/:id", isLoggedIn, function(req, res){
    Universidade.findByIdAndRemove(req.params.id, function(err, deletedUniversidade){
        if(err){
            res.redirect("/universidades");
        }else{
            res.redirect("/universidades");
        }
    });
});

app.delete("/empresas/:id", isLoggedIn, function(req, res){
    Empresa.findByIdAndRemove(req.params.id, function(err, deletedEmpresa){
        if(err){
            res.redirect("/empresas");
        }else{
            res.redirect("/empresas");
        }
    });
});

app.delete("/noticias/:id", isLoggedIn, function(req, res){
    Noticia.findByIdAndRemove(req.params.id, function(err, deletedNoticia){
        if(err){
            res.redirect("/noticias");
        }else{
            res.redirect("/noticias");
        }
    });
});

app.delete("/agendas/:id", isLoggedIn, function(req, res){
    Agenda.findByIdAndRemove(req.params.id, function(err, deletedAgenda){
        if(err){
            res.redirect("/agendas");
        }else{
            res.redirect("/agendas");
        }
    });
});

//AuthRoutes
//show register froms
app.get("/register", isLoggedIn, function(req, res){
    res.render("register");
});

//handle sign up logic
app.post("/register", isLoggedIn, function(req, res){
    var newUser = new User({username: req.body.username})
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            console.log(err);
            return res.render("register");
        }
        passport.authenticate("local")(req, res, function(){
            res.redirect("/residentes");
        });
    });
});

//show login form
app.get("/login", function(req, res) {
    res.render("login");
});

//handling login logic
app.post("/login", passport.authenticate("local", 
        {successRedirect: "/residentes",
         failureRedirect: "/login"
        }), function(req, res) {
    
});

//logout route
app.get("/logout", function(req, res) {
    req.logout();
    res.redirect("/login");
});

function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}

//START SERVER
app.listen(process.env.PORT, process.env.IP, function(){
    console.log("The server has started");
});
