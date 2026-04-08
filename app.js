// app.js
var createError = require('http-errors');
var express = require('express');
const bodyParser = require("body-parser");
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');
const http = require("http");

require('dotenv').config({ debug: false, silent: true, quiet: true });

// ================== ROUTES ==================
var itemRouter = require('./routes/itemRoutes');
var uomRouter = require('./routes/itemRoutes');
var stockRouter = require('./routes/itemRoutes');
var CategoryRouter = require('./routes/itemRoutes');
var WorkerRouter = require('./routes/itemRoutes');
var CustomerRouter = require('./routes/itemRoutes');
var SalesRouter = require('./routes/itemRoutes');
var MachineProRouter = require('./routes/itemRoutes');
var toolRouter = require('./routes/itemRoutes');





var CurrentStockRouter = require('./routes/itemRoutes');
var InwardRouter = require('./routes/itemRoutes');
var LineFeedOutRouter = require('./routes/itemRoutes');
var LineFeedInRouter = require('./routes/itemRoutes');

var ActivecategoryRouter = require('./routes/itemRoutes');
var activeuomRouter = require('./routes/itemRoutes');


var activeitemRouter = require('./routes/itemRoutes');
var ActiveworkerRouter = require('./routes/itemRoutes');
var ActiveMachineRouter = require('./routes/itemRoutes');

var ActivesalproRouter = require('./routes/itemRoutes');

// const loginRoutes = require("./routes/itemRoutes");

var dashRouter = require('./routes/itemRoutes');

var toolInwardRouter = require('./routes/itemRoutes');
var activetoolRouter = require('./routes/itemRoutes');

//var invoiceRouter = require('./routes/itemRoutes');
var custdropRouter = require('./routes/itemRoutes');

var deliveryRouter = require('./routes/itemRoutes');

var returndeliveryRouter = require('./routes/itemRoutes');


var ToolStockRouter = require('./routes/itemRoutes');

var workOrderRouter = require('./routes/itemRoutes');
const { version } = require('os');


const PORT = process.env.PORT || 8001;

var app = express();

// ================== VIEW ENGINE ==================
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// ================== CORS ==================
app.use(cors({
  origin: ["http://localhost:3000"],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ================== BODY PARSERS ==================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(logger('dev'));

const { log: showLog } = console;

// ================== ROUTES ==================
app.use('/items', itemRouter);
app.use('/tool', toolRouter);
app.use('/uom', uomRouter);
app.use('/stock', stockRouter);
app.use('/categories', CategoryRouter);
app.use('/workers', WorkerRouter);
app.use('/customers', CustomerRouter);
app.use('/sales', SalesRouter);
app.use('/machines', MachineProRouter);
//app.use('/invoice', invoiceRouter);

app.use('/currentstock', CurrentStockRouter);
app.use('/inward', InwardRouter);
//app.use('/linefeedouts', LineFeedOutRouter);
app.use('/linefeedin', LineFeedInRouter);
app.use('/activecategories', ActivecategoryRouter);
app.use('/activeuoms', activeuomRouter);



app.use('/toolinward', toolInwardRouter);




app.use('/activeitems', activeitemRouter);
app.use('/activeworkers', ActiveworkerRouter);
app.use('/activemachines', ActiveMachineRouter);


app.use('/activetools', activetoolRouter);
app.use('/dashboard', dashRouter);

// app.use("/auth", loginRoutes);


app.use('/custdrop', custdropRouter);

app.use('/delivery', deliveryRouter);

app.use('/returndelivery', returndeliveryRouter);

app.use('/Toolstock', ToolStockRouter);


app.use('/workorder', workOrderRouter);





// ================== HEALTH CHECK ==================
app.get('/', (req, res) => {
  res.json({ status: 1, message: "API running successfully", version: "1.0.4" });
});

// ================== 404 HANDLER ==================
app.use(function (req, res, next) {
  next(createError(404));
});

// ================== ERROR HANDLER ==================
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.json({
    status: 0,
    message: err.message || "Internal server error"
  });
});

// ================== SERVER ==================
let server = http.createServer(app);

server.listen(PORT, () => showLog(`Server running on http://localhost:${PORT}`));

module.exports = app;