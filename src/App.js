const express = require('express');
const carritoRoutes = require("./routes/Carrito.routes");
const productoRoutes = require("./routes/Producto.routes");
const AuthRoutes = require("./routes/Auth.routes");

const adminRoutes = require("./routes/Administrador.routes")
const adminProductoRoutes = require("./routes/ProductoAdmi.routes")
const adminReporteRoutes = require("./routes/Reporte.routes")
const adminMercadoRoutes = require("./routes/Mercadopago")

const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();


const app = express();
app.use(cors({
  origin: ["http://localhost:5173", "https://steelblue-lobster-972024.hostingersite.com"],// tu frontend
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));



app.use(express.json());

app.use(cookieParser())
app.use("/carrito", carritoRoutes);
app.use("/productos", productoRoutes);
app.use("/auth",AuthRoutes);

app.use('/admi/productos', adminProductoRoutes);
app.use('/reportes', adminReporteRoutes);

app.use("/admin", adminRoutes)
app.use("/mercadopago", adminMercadoRoutes);

module.exports = app;