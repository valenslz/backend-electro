// const express = require("express");
// const Mercadopago = require("mercadopago");
// const ENV = require("../config/ENV");

// const router = express.Router();

// // Inicializar Mercado Pago usando el nuevo SDK
// const client = new Mercadopago.MercadoPagoConfig({
//   accessToken: ENV.MP_ACCESS_TOKEN,
// });

// const preference = new Mercadopago.Preference(client);

// router.post("/create_preference", async (req, res) => {
//   try {
//     const { cartItems, total } = req.body;

//     const items = cartItems.map(item => ({
//       title: item.nombre,
//       quantity: Number(item.qty || 1),
//       unit_price: Number(item.precio),
//       currency_id: "COP",
//     }));

//     const body = {
//       items,
//       back_urls: {
//         success: "http://localhost:5173/pago-exitoso",
//         failure: "http://localhost:5173/pago-fallido",
//         pending: "http://localhost:5173/pago-pendiente",
//       },
//       auto_return: "approved",
//     };

//     const result = await preference.create({ body });
//     res.json({ id: result.id });
//   } catch (error) {
//     console.error("❌ Error creando preferencia:", error);
//     res.status(500).json({ error: "Error al crear la preferencia de pago" });
//   }
// });

// module.exports = router;
// const express = require("express");
// const { MercadoPagoConfig, Preference } = require("mercadopago");
// const ENV = require("../config/ENV");

// const router = express.Router();

// const client = new MercadoPagoConfig({
//   accessToken: ENV.MP_ACCESS_TOKEN,
// });

// router.post("/create_preference", async (req, res) => {
//   try {
//     const { cartItems, total } = req.body;

//     console.log("🛒 Datos recibidos:", req.body);

//     if (!cartItems || cartItems.length === 0) {
//       return res.status(400).json({ error: "El carrito está vacío" });
//     }

//     const items = cartItems.map(item => ({
//       title: item.nombre,
//       quantity: Number(item.qty || 1),
//       unit_price: Number(item.precio),
//       currency_id: "COP",
//     }));

//     console.log("🧾 Items para MP:", items);

//     const preference = new Preference(client);

//     const result = await preference.create({
//       body: {
//         items,
//         back_urls: {
//           success: "http://localhost:5173/pago-exitoso",
//           failure: "http://localhost:5173/pago-fallido",
//           pending: "http://localhost:5173/pago-pendiente"
//         },
//         auto_return: "approved",
//       },
//     });

//     console.log("✅ Preferencia creada:", result);
//     res.json({ id: result.id });
//   } catch (error) {
//     console.error("❌ Error creando preferencia:", error);
//     res.status(500).json({ error: "Error al crear la preferencia de pago" });
//   }
// });

// module.exports = router;

const express = require("express");
const { MercadoPagoConfig, Preference } = require("mercadopago");
const ENV = require("../config/ENV");

const router = express.Router();

const client = new MercadoPagoConfig({
  accessToken: ENV.MP_ACCESS_TOKEN,
});

router.post("/create_preference", async (req, res) => {
  try {
    const { cartItems, total } = req.body;

    console.log("🛒 Datos recibidos:", req.body);

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ error: "El carrito está vacío" });
    }

    // ✅ Limpieza de precios
    const items = cartItems.map(item => {
  const cleanPrice = Number(
    String(item.precio || item.precio_unitario || 0)
      .replace(/[^0-9.]/g, "")
      .trim()
  );

  return {
    title: item.nombre,
    quantity: Number(item.qty || item.cantidad || 1),
    unit_price: cleanPrice,
    currency_id: "COP",
  };
});


    console.log("🧾 Items para MP:", items);

    // ⚠️ Validación antes de enviar
    if (items.some(i => isNaN(i.unit_price))) {
      console.error("❌ Precio inválido detectado en items:", items);
      return res.status(400).json({ error: "Precio inválido en items" });
    }

    const preference = new Preference(client);

    const result = await preference.create({
      body: {
        items,
        back_urls: {
          success: "http://localhost:5173/pago-exitoso",
          failure: "http://localhost:5173/pago-fallido",
          pending: "http://localhost:5173/pago-pendiente",
        },
        // auto_return: "approved",
      },
    });

    console.log("✅ Preferencia creada:", result);
    res.json({ id: result.id });
  } catch (error) {
    console.error("❌ Error creando preferencia:", error);
    res.status(500).json({ error: "Error al crear la preferencia de pago" });
  }
});

module.exports = router;


