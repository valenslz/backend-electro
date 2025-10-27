const ENV = require('./src/config/ENV')
const app = require('./src/App');



app.listen(ENV.PORT, () => console.log(`Servidor corriendo en puerto ${ENV.PORT}`));


