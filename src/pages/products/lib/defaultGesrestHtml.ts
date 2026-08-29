export function getDefaultGesrestPages(productName: string = "GESREST"): string[] {
  const upper = productName.toUpperCase();

  return [
    // PÁGINA 1: PORTADA
    `
<div style="text-align: right; padding-right: 10px;">
  <h1 style="font-size: 36px; font-weight: bold; color: #eb5454; margin: 0; line-height: 1;">${productName}</h1>
  <div style="font-size: 14px; color: #eb5454; margin-top: 6px; font-weight: 600;">Tu restaurante digital</div>
  <div style="font-size: 12px; color: #555; margin-top: 16px; line-height: 1.6;">
    <div>+51 979 293 176</div>
    <div><a href="mailto:martin.ampuero@garzasoft.com" style="color: #0b4e8c; text-decoration: underline;">martin.ampuero@garzasoft.com</a></div>
  </div>
</div>

<div style="margin-top: 550px;">
  <div style="float: left;">
    <div style="font-size: 26px; font-weight: bold; color: #1a1a1a;">Mr. Soft</div>
    <div style="font-size: 11px; color: #0088cc; letter-spacing: 1.5px;">DEVELOPMENT</div>
  </div>
  <div style="float: right; color: #eb5454; font-weight: bold; font-size: 14px; padding-top: 10px;">
    www.gesrest.net
  </div>
  <div style="clear: both;"></div>
</div>
`,

    // PÁGINA 2: PRESENTACIÓN
    `
<div style="text-align: right; margin-bottom: 25px;">
  <span style="font-size: 16px; font-weight: 700; color: #eb5454;">${productName}</span><br>
  <span style="font-size: 10px; color: #888;">Tu restaurante digital</span>
</div>

<h2 style="color: #eb5454; font-size: 16px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 18px;">PRESENTACIÓN</h2>

<p style="font-size: 12px; line-height: 1.6; margin-bottom: 16px; color: #222;">
  <strong>${upper}</strong> es el software en nube para gestión de restaurantes y negocios. Incluye los módulos siguientes (*) atención de clientes, (*) control de productos en almacén, (*) registro de recetas y sub recetas, (*) seguimiento de ingresos y egresos de caja chica (*) compras y cuentas por pagar (*) sincronización con nuestra plataforma de facturación electrónica.
</p>

<p style="font-weight: bold; font-size: 12px; margin-top: 18px; margin-bottom: 10px; color: #222;">
  ${upper} es la herramienta ideal si necesitas conocer:
</p>

<ul style="margin: 8px 0 20px 24px; font-size: 12px; line-height: 1.6; color: #333;">
  <li>Detalle de los productos que vendes.</li>
  <li>Detalle de los productos compras.</li>
  <li>Detalle de los productos en tu almacén.</li>
  <li>El personal responsable de cada operación en tu negocio.</li>
  <li>El importe total y detalle de dinero en caja diaria.</li>
  <li>Detalle de gastos.</li>
  <li>El tiempo de atención / preparación de cocina y bar.</li>
  <li>La estadística de venta de platos en el restaurante.</li>
  <li>La productividad por mesero, plato, turno, salón, otros.</li>
</ul>

<p style="font-size: 12px; line-height: 1.6; margin-top: 30px; color: #222;">
  Mr. SOFT agradece depositar su confianza en nuestra empresa, le garantizamos el soporte y apoyo necesario para aprovechar al máximo ${upper}, nuestra herramienta para su productividad.
</p>

<div style="margin-top: 70px; text-align: center;">
  <div style="width: 260px; border-top: 1px solid #333; margin: 0 auto 6px auto;"></div>
  <div style="font-weight: bold; font-size: 12px; color: #111;">Gilberto Martín Ampuero Pasco</div>
  <div style="font-size: 11px; font-weight: bold; color: #555;">CEO Mr. SOFT</div>
</div>
`,

    // PÁGINA 3: CREDENCIALES DE ACCESO
    `
<div style="text-align: right; margin-bottom: 25px;">
  <span style="font-size: 16px; font-weight: 700; color: #eb5454;">${productName}</span><br>
  <span style="font-size: 10px; color: #888;">Tu restaurante digital</span>
</div>

<h2 style="color: #eb5454; font-size: 16px; font-weight: 700; text-transform: uppercase; margin-bottom: 18px;">CREDENCIALES DE ACCESO</h2>

<p style="font-size: 12px; line-height: 1.6;">
  Para utilizar los servicios de nuestra plataforma <strong>${upper}</strong> debe ingresar al enlace:
</p>
<p style="margin: 12px 0; color: #eb5454; font-weight: bold; font-size: 14px;">
  <a href="https://gesrest.net/" style="color: #eb5454; text-decoration: underline;">https://gesrest.net/</a>
</p>
<p style="font-size: 12px; line-height: 1.6; margin-bottom: 30px;">
  y luego presionar el botón <strong>"LOGIN"</strong> para registrar sus credenciales de acceso.
</p>

<div style="border: 1px solid #e5e5e5; border-radius: 10px; padding: 35px 25px; background-color: #fafafa; margin: 25px 0; text-align: center;">
  <div style="font-size: 22px; font-weight: bold; color: #eb5454; margin-bottom: 6px;">
    ${productName}
  </div>
  <div style="font-size: 13px; color: #666; margin-bottom: 20px;">
    El seguimiento de tus ventas, con solo un clic!
  </div>
  <div style="background: #fff; border: 1px solid #ddd; padding: 22px; border-radius: 8px; display: inline-block; width: 80%; box-shadow: 0 2px 6px rgba(0,0,0,0.05);">
    <div style="text-align: left; font-size: 11px; color: #666; margin-bottom: 5px;">Nombre de usuario: [ RUC o Usuario ]</div>
    <div style="border: 1px solid #ccc; background: #fdfdfd; height: 28px; margin-bottom: 14px; border-radius: 4px;"></div>
    <div style="text-align: left; font-size: 11px; color: #666; margin-bottom: 5px;">Contraseña: [ Clave Asignada ]</div>
    <div style="border: 1px solid #ccc; background: #fdfdfd; height: 28px; margin-bottom: 18px; border-radius: 4px;"></div>
    <div style="background: #eb5454; color: #fff; font-weight: bold; padding: 10px; border-radius: 6px; font-size: 12px; letter-spacing: 0.5px;">
      INICIAR SESIÓN
    </div>
  </div>
</div>
`,

    // PÁGINA 4: PERFILES DE USUARIOS
    `
<div style="text-align: right; margin-bottom: 25px;">
  <span style="font-size: 16px; font-weight: 700; color: #eb5454;">${productName}</span><br>
  <span style="font-size: 10px; color: #888;">Tu restaurante digital</span>
</div>

<h3 style="color: #eb5454; font-weight: bold; font-size: 13px; margin-top: 15px; margin-bottom: 8px; text-transform: uppercase;">PERFIL ADMINISTRADOR</h3>
<table style="width: 100%; border-collapse: collapse; margin-bottom: 22px; font-size: 11.5px;">
  <thead>
    <tr style="background-color: #eb5454; color: #fff;">
      <th style="padding: 8px 12px; text-align: center; border: 1px solid #eb5454;">Usuario</th>
      <th style="padding: 8px 12px; text-align: center; border: 1px solid #eb5454;">Clave</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding: 7px 12px; text-align: center; border: 1px solid #ddd; font-weight: 600;">20601799317</td>
      <td style="padding: 7px 12px; text-align: center; border: 1px solid #ddd; font-weight: 600;">20601799317</td>
    </tr>
  </tbody>
</table>

<h3 style="color: #eb5454; font-weight: bold; font-size: 13px; margin-top: 25px; margin-bottom: 8px; text-transform: uppercase;">PERFIL CAJERO</h3>
<table style="width: 100%; border-collapse: collapse; margin-bottom: 22px; font-size: 11.5px;">
  <thead>
    <tr style="background-color: #eb5454; color: #fff;">
      <th style="padding: 8px 12px; text-align: center; border: 1px solid #eb5454;">Usuario</th>
      <th style="padding: 8px 12px; text-align: center; border: 1px solid #eb5454;">Clave</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding: 7px 12px; text-align: center; border: 1px solid #ddd; font-weight: 600;">DIEGOMARAKOSE</td>
      <td style="padding: 7px 12px; text-align: center; border: 1px solid #ddd; font-weight: 600;">DIEGOMARAKOSE</td>
    </tr>
    <tr style="background-color: #fafafa;">
      <td style="padding: 7px 12px; text-align: center; border: 1px solid #ddd; font-weight: 600;">LUCARMARAKOSE</td>
      <td style="padding: 7px 12px; text-align: center; border: 1px solid #ddd; font-weight: 600;">LUCARMARAKOSE</td>
    </tr>
    <tr>
      <td style="padding: 7px 12px; text-align: center; border: 1px solid #ddd; font-weight: 600;">MELISAMARAKOSE</td>
      <td style="padding: 7px 12px; text-align: center; border: 1px solid #ddd; font-weight: 600;">MELISAMARAKOSE</td>
    </tr>
  </tbody>
</table>

<h3 style="color: #eb5454; font-weight: bold; font-size: 13px; margin-top: 25px; margin-bottom: 6px; text-transform: uppercase;">PERFIL MESERO</h3>
<p style="font-size: 11.5px; margin-bottom: 10px;">
  Enlace para credenciales de mesero: <br>
  <a href="https://sistema.gesrest.net/waiter-login/STpasiENipZv" style="color: #0b4e8c; text-decoration: underline; font-weight: 500;">https://sistema.gesrest.net/waiter-login/STpasiENipZv</a>
</p>
<table style="width: 100%; border-collapse: collapse; margin-bottom: 22px; font-size: 11.5px;">
  <thead>
    <tr style="background-color: #eb5454; color: #fff;">
      <th style="padding: 8px 12px; text-align: center; border: 1px solid #eb5454;">Usuario</th>
      <th style="padding: 8px 12px; text-align: center; border: 1px solid #eb5454;">Clave</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding: 7px 12px; text-align: center; border: 1px solid #ddd; font-weight: 600;">JAMIRMARAKOSE</td>
      <td style="padding: 7px 12px; text-align: center; border: 1px solid #ddd; font-weight: 600;">1234</td>
    </tr>
    <tr style="background-color: #fafafa;">
      <td style="padding: 7px 12px; text-align: center; border: 1px solid #ddd; font-weight: 600;">JEFFERSONMARAKOSE</td>
      <td style="padding: 7px 12px; text-align: center; border: 1px solid #ddd; font-weight: 600;">1234</td>
    </tr>
    <tr>
      <td style="padding: 7px 12px; text-align: center; border: 1px solid #ddd; font-weight: 600;">JUANJMARAKOSE</td>
      <td style="padding: 7px 12px; text-align: center; border: 1px solid #ddd; font-weight: 600;">1234</td>
    </tr>
    <tr style="background-color: #fafafa;">
      <td style="padding: 7px 12px; text-align: center; border: 1px solid #ddd; font-weight: 600;">LIONELMARAKOSE</td>
      <td style="padding: 7px 12px; text-align: center; border: 1px solid #ddd; font-weight: 600;">1234</td>
    </tr>
    <tr>
      <td style="padding: 7px 12px; text-align: center; border: 1px solid #ddd; font-weight: 600;">MILUSKAMARAKOSE</td>
      <td style="padding: 7px 12px; text-align: center; border: 1px solid #ddd; font-weight: 600;">1234</td>
    </tr>
  </tbody>
</table>
`,

    // PÁGINA 5: PORTAL DE CONTADOR
    `
<div style="text-align: right; margin-bottom: 25px;">
  <span style="font-size: 16px; font-weight: 700; color: #eb5454;">${productName}</span><br>
  <span style="font-size: 10px; color: #888;">Tu restaurante digital</span>
</div>

<h2 style="color: #eb5454; font-size: 15px; font-weight: 700; text-transform: uppercase; margin-bottom: 18px;">CREDENCIALES PARA ACCESO A PORTAL DE CONTADOR</h2>

<p style="font-size: 12px; line-height: 1.6;">
  Para utilizar los servicios de nuestro portal de facturación electrónica debe ingresar al enlace:
</p>
<p style="margin: 12px 0; color: #eb5454; font-weight: bold; font-size: 13px;">
  <a href="https://comprobante-e.com" style="color: #eb5454; text-decoration: underline;">https://comprobante-e.com</a> y luego presionar el botón <strong>"PORTAL PARA CONTADORES"</strong>.
</p>

<p style="font-size: 11.5px; color: #444; margin: 18px 0; line-height: 1.5;">
  La plataforma contiene el detalle de los comprobantes electrónicos de venta emitidos por la empresa: <br>
  <strong>20601799317 - MARAKOS GRILL CONCESIONES E.I.R.L</strong>
</p>

<h3 style="color: #eb5454; font-weight: bold; font-size: 13px; margin-top: 25px; margin-bottom: 8px; text-transform: uppercase;">CONFIGURACIÓN DE SERIES</h3>
<table style="width: 100%; border-collapse: collapse; margin-bottom: 22px; font-size: 11.5px;">
  <tbody>
    <tr>
      <td style="background-color: #eb5454; color: #fff; font-weight: bold; width: 45%; text-align: center; padding: 8px 12px; border: 1px solid #eb5454;">Serie factura</td>
      <td style="padding: 8px 12px; text-align: center; border: 1px solid #ddd; font-weight: bold; font-size: 13px;">F040</td>
    </tr>
    <tr>
      <td style="background-color: #eb5454; color: #fff; font-weight: bold; width: 45%; text-align: center; padding: 8px 12px; border: 1px solid #eb5454;">Serie boleta</td>
      <td style="padding: 8px 12px; text-align: center; border: 1px solid #ddd; font-weight: bold; font-size: 13px;">B040</td>
    </tr>
    <tr>
      <td style="background-color: #eb5454; color: #fff; font-weight: bold; width: 45%; text-align: center; padding: 8px 12px; border: 1px solid #eb5454;">Serie Nota de Crédito</td>
      <td style="padding: 8px 12px; text-align: center; border: 1px solid #ddd; font-weight: bold; font-size: 13px;">NC40</td>
    </tr>
  </tbody>
</table>

<h3 style="color: #eb5454; font-weight: bold; font-size: 13px; margin-top: 35px; margin-bottom: 8px; text-transform: uppercase;">CREDENCIALES DE ACCESO</h3>
<table style="width: 100%; border-collapse: collapse; margin-bottom: 22px; font-size: 11.5px;">
  <thead>
    <tr style="background-color: #eb5454; color: #fff;">
      <th style="padding: 8px 12px; text-align: center; border: 1px solid #eb5454;">Usuario</th>
      <th style="padding: 8px 12px; text-align: center; border: 1px solid #eb5454;">Clave</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding: 7px 12px; text-align: center; border: 1px solid #ddd; font-weight: 600;">20601799317</td>
      <td style="padding: 7px 12px; text-align: center; border: 1px solid #ddd; font-weight: 600;">marakos19</td>
    </tr>
  </tbody>
</table>
`,

    // PÁGINA 6: TUTORIALES DE YOUTUBE (PARTE 1)
    `
<div style="text-align: right; margin-bottom: 20px;">
  <span style="font-size: 16px; font-weight: 700; color: #eb5454;">${productName}</span><br>
  <span style="font-size: 10px; color: #888;">Tu restaurante digital</span>
</div>

<h2 style="color: #eb5454; font-size: 15px; font-weight: 700; text-transform: uppercase; margin-bottom: 12px;">TUTORIALES PARA USO DE ${upper}</h2>

<p style="font-size: 11.5px; line-height: 1.5; margin-bottom: 8px;">
  En la plataforma YouTube en el canal oficial de <strong>Mr. Soft</strong> encontrarás vídeos que explican las pantallas y la funcionalidad de nuestra plataforma <strong>${productName}</strong>.
</p>
<p style="font-size: 11.5px; line-height: 1.5; margin-bottom: 14px;">
  De esta manera te ayudamos a lograr un mejor aprovechamiento de nuestra plataforma:
</p>

<table style="width: 100%; border-collapse: collapse; margin-bottom: 18px; font-size: 11.5px;">
  <tr>
    <th style="background-color: #eb5454; color: #fff; padding: 7px 10px; font-weight: bold; width: 25%; text-align: left; border: 1px solid #eb5454;">Plataforma</th>
    <td style="background-color: #fafafa; padding: 7px 10px; border: 1px solid #ddd;">YouTube</td>
  </tr>
  <tr>
    <th style="background-color: #eb5454; color: #fff; padding: 7px 10px; font-weight: bold; width: 25%; text-align: left; border: 1px solid #eb5454;">Canal</th>
    <td style="background-color: #fafafa; padding: 7px 10px; border: 1px solid #ddd;">Mr Soft</td>
  </tr>
  <tr>
    <th style="background-color: #eb5454; color: #fff; padding: 7px 10px; font-weight: bold; width: 25%; text-align: left; border: 1px solid #eb5454;">Nombre</th>
    <td style="background-color: #fafafa; padding: 7px 10px; border: 1px solid #ddd;">Gesrest - Software para restaurantes 🍴</td>
  </tr>
  <tr>
    <th style="background-color: #eb5454; color: #fff; padding: 7px 10px; font-weight: bold; width: 25%; text-align: left; border: 1px solid #eb5454;">Enlace</th>
    <td style="background-color: #fafafa; padding: 7px 10px; border: 1px solid #ddd;"><a href="https://www.youtube.com/playlist?list=PLTwle3OwQTDthaIAsGGGFc8iimt69fSOj" style="color: #eb5454; word-break: break-all;">https://www.youtube.com/playlist?list=PLTwle3OwQTDthaIAsGGGFc8iimt69fSOj</a></td>
  </tr>
</table>

<table style="width: 100%; border-collapse: collapse; font-size: 11px;">
  <thead>
    <tr style="background-color: #eb5454; color: #fff;">
      <th style="width: 45%; padding: 7px 10px; border: 1px solid #eb5454; text-align: center;">Tutorial</th>
      <th style="width: 55%; padding: 7px 10px; border: 1px solid #eb5454; text-align: center;">Enlace</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding: 6px 8px; border: 1px solid #e2e2e2;">Presentación 🍳</td>
      <td style="padding: 6px 8px; border: 1px solid #e2e2e2;"><a href="https://youtu.be/us7pS1mjCZE?si=U_e281AnAOFgZ6q3" style="color: #eb5454;">https://youtu.be/us7pS1mjCZE?si=U_e281AnAOFgZ6q3</a></td>
    </tr>
    <tr style="background-color: #fdfdfd;">
      <td style="padding: 6px 8px; border: 1px solid #e2e2e2;">Recorrido por la plataforma 🍳</td>
      <td style="padding: 6px 8px; border: 1px solid #e2e2e2;"><a href="https://youtu.be/q5zDJpZK85g?si=C4P5cWvuECFXdo5p" style="color: #eb5454;">https://youtu.be/q5zDJpZK85g?si=C4P5cWvuECFXdo5p</a></td>
    </tr>
    <tr>
      <td style="padding: 6px 8px; border: 1px solid #e2e2e2;">¿Cómo ingresar a la plataforma? 🔐</td>
      <td style="padding: 6px 8px; border: 1px solid #e2e2e2;"><a href="https://youtu.be/lL32cakXcus?si=PHxN68vLuE3x7Orp" style="color: #eb5454;">https://youtu.be/lL32cakXcus?si=PHxN68vLuE3x7Orp</a></td>
    </tr>
    <tr style="background-color: #fdfdfd;">
      <td style="padding: 6px 8px; border: 1px solid #e2e2e2;">¿Cómo registrar un pedido en salón? 🍽️</td>
      <td style="padding: 6px 8px; border: 1px solid #e2e2e2;"><a href="https://youtu.be/Wj5bpyReOD8?si=ngv2NGhu7LBMmb27" style="color: #eb5454;">https://youtu.be/Wj5bpyReOD8?si=ngv2NGhu7LBMmb27</a></td>
    </tr>
    <tr>
      <td style="padding: 6px 8px; border: 1px solid #e2e2e2;">¿Cómo registrar una venta rápida? ☕</td>
      <td style="padding: 6px 8px; border: 1px solid #e2e2e2;"><a href="https://youtu.be/VpWpitK87oo?si=4T-BrRv5b7RYb_lB" style="color: #eb5454;">https://youtu.be/VpWpitK87oo?si=4T-BrRv5b7RYb_lB</a></td>
    </tr>
    <tr style="background-color: #fdfdfd;">
      <td style="padding: 6px 8px; border: 1px solid #e2e2e2;">¿Cómo cobrar una mesa? 💰</td>
      <td style="padding: 6px 8px; border: 1px solid #e2e2e2;"><a href="https://youtu.be/t5yrv0Q4f1E?si=DLqBcmI2RSmsTE5T" style="color: #eb5454;">https://youtu.be/t5yrv0Q4f1E?si=DLqBcmI2RSmsTE5T</a></td>
    </tr>
    <tr>
      <td style="padding: 6px 8px; border: 1px solid #e2e2e2;">¿Cómo emitir un comprobante de venta electrónico para SUNAT?</td>
      <td style="padding: 6px 8px; border: 1px solid #e2e2e2;"><a href="https://youtu.be/oxpqPuOw8Sc?si=qR5oqEwde6P0_qMo" style="color: #eb5454;">https://youtu.be/oxpqPuOw8Sc?si=qR5oqEwde6P0_qMo</a></td>
    </tr>
    <tr style="background-color: #fdfdfd;">
      <td style="padding: 6px 8px; border: 1px solid #e2e2e2;">¿Cómo disminuir productos comandados? ⬇️</td>
      <td style="padding: 6px 8px; border: 1px solid #e2e2e2;"><a href="https://youtu.be/CIxr6MPPqoQ?si=vf8ZOxTUKY1NVyWH" style="color: #eb5454;">https://youtu.be/CIxr6MPPqoQ?si=vf8ZOxTUKY1NVyWH</a></td>
    </tr>
    <tr>
      <td style="padding: 6px 8px; border: 1px solid #e2e2e2;">¿Cómo anular un producto registrado? 🚫</td>
      <td style="padding: 6px 8px; border: 1px solid #e2e2e2;"><a href="https://youtu.be/PmF7jkleJdk?si=iZzipLbjgoi3feyT" style="color: #eb5454;">https://youtu.be/PmF7jkleJdk?si=iZzipLbjgoi3feyT</a></td>
    </tr>
    <tr style="background-color: #fdfdfd;">
      <td style="padding: 6px 8px; border: 1px solid #e2e2e2;">¿Cómo anular un pedido completo? 🚫</td>
      <td style="padding: 6px 8px; border: 1px solid #e2e2e2;"><a href="https://youtu.be/Vb8j6sVXH5Q?si=FlM78NRtEwbhAuiH" style="color: #eb5454;">https://youtu.be/Vb8j6sVXH5Q?si=FlM78NRtEwbhAuiH</a></td>
    </tr>
    <tr>
      <td style="padding: 6px 8px; border: 1px solid #e2e2e2;">¿Cómo anular una venta? 🚫</td>
      <td style="padding: 6px 8px; border: 1px solid #e2e2e2;"><a href="https://youtu.be/FD2gI9z7qXk?si=PeN7r-4tdHW_flnV" style="color: #eb5454;">https://youtu.be/FD2gI9z7qXk?si=PeN7r-4tdHW_flnV</a></td>
    </tr>
    <tr style="background-color: #fdfdfd;">
      <td style="padding: 6px 8px; border: 1px solid #e2e2e2;">¿Cómo cambiar mi contraseña? 🔑</td>
      <td style="padding: 6px 8px; border: 1px solid #e2e2e2;"><a href="https://youtu.be/tpvKMZCnBJU?si=ExWy3dp12PR3RrfP" style="color: #eb5454;">https://youtu.be/tpvKMZCnBJU?si=ExWy3dp12PR3RrfP</a></td>
    </tr>
    <tr>
      <td style="padding: 6px 8px; border: 1px solid #e2e2e2;">¿Cómo crear una nueva categoría de productos? 🍕</td>
      <td style="padding: 6px 8px; border: 1px solid #e2e2e2;"><a href="https://youtu.be/SSn6IofCquI?si=wV5WsuLmauEDpGEm" style="color: #eb5454;">https://youtu.be/SSn6IofCquI?si=wV5WsuLmauEDpGEm</a></td>
    </tr>
  </tbody>
</table>
`,

    // PÁGINA 7: TUTORIALES DE YOUTUBE (PARTE 2)
    `
<div style="text-align: right; margin-bottom: 25px;">
  <span style="font-size: 16px; font-weight: 700; color: #eb5454;">${productName}</span><br>
  <span style="font-size: 10px; color: #888;">Tu restaurante digital</span>
</div>

<table style="width: 100%; border-collapse: collapse; font-size: 11px;">
  <thead>
    <tr style="background-color: #eb5454; color: #fff;">
      <th style="width: 45%; padding: 7px 10px; border: 1px solid #eb5454; text-align: center;">Tutorial</th>
      <th style="width: 55%; padding: 7px 10px; border: 1px solid #eb5454; text-align: center;">Enlace</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding: 6px 8px; border: 1px solid #e2e2e2;">¿Cómo crear un nuevo producto? 🍔</td>
      <td style="padding: 6px 8px; border: 1px solid #e2e2e2;"><a href="https://youtu.be/WguSM1eJ62o?si=KBgl_GVv2o_RDE02" style="color: #eb5454;">https://youtu.be/WguSM1eJ62o?si=KBgl_GVv2o_RDE02</a></td>
    </tr>
    <tr style="background-color: #fdfdfd;">
      <td style="padding: 6px 8px; border: 1px solid #e2e2e2;">¿Cómo registrar mis gastos? 💸</td>
      <td style="padding: 6px 8px; border: 1px solid #e2e2e2;"><a href="https://youtu.be/vV_rctLu4gs?si=09wlGN8Hy-7mKbVH" style="color: #eb5454;">https://youtu.be/vV_rctLu4gs?si=09wlGN8Hy-7mKbVH</a></td>
    </tr>
    <tr>
      <td style="padding: 6px 8px; border: 1px solid #e2e2e2;">¿Cómo configurar mis productos favoritos? ⭐</td>
      <td style="padding: 6px 8px; border: 1px solid #e2e2e2;"><a href="https://youtu.be/cjzyNOTF11M?si=QRPyi5iL7xJi4Ndb" style="color: #eb5454;">https://youtu.be/cjzyNOTF11M?si=QRPyi5iL7xJi4Ndb</a></td>
    </tr>
    <tr style="background-color: #fdfdfd;">
      <td style="padding: 6px 8px; border: 1px solid #e2e2e2;">¿Cómo controlar mi inventario? 📦</td>
      <td style="padding: 6px 8px; border: 1px solid #e2e2e2;"><a href="https://youtu.be/PODRHCv0iis?si=Nd3cwxW1cDf0sExB" style="color: #eb5454;">https://youtu.be/PODRHCv0iis?si=Nd3cwxW1cDf0sExB</a></td>
    </tr>
    <tr>
      <td style="padding: 6px 8px; border: 1px solid #e2e2e2;">¿Cómo crear ingredientes? 🥦</td>
      <td style="padding: 6px 8px; border: 1px solid #e2e2e2;"><a href="https://youtu.be/63yQtPY1g8U?si=tZaYkX9E_Zef9L5p" style="color: #eb5454;">https://youtu.be/63yQtPY1g8U?si=tZaYkX9E_Zef9L5p</a></td>
    </tr>
    <tr style="background-color: #fdfdfd;">
      <td style="padding: 6px 8px; border: 1px solid #e2e2e2;">¿Cómo crear productos compuestos? 🍲</td>
      <td style="padding: 6px 8px; border: 1px solid #e2e2e2;"><a href="https://youtu.be/w0y2YNaiL8Y?si=PeZMC-hNZ23JJ_kD" style="color: #eb5454;">https://youtu.be/w0y2YNaiL8Y?si=PeZMC-hNZ23JJ_kD</a></td>
    </tr>
    <tr>
      <td style="padding: 6px 8px; border: 1px solid #e2e2e2;">¿Cómo configurar tus recetas? 🍳</td>
      <td style="padding: 6px 8px; border: 1px solid #e2e2e2;"><a href="https://youtu.be/3Uvo7p23LYw?si=WBdvuuxqv1nhC1yy" style="color: #eb5454;">https://youtu.be/3Uvo7p23LYw?si=WBdvuuxqv1nhC1yy</a></td>
    </tr>
    <tr style="background-color: #fdfdfd;">
      <td style="padding: 6px 8px; border: 1px solid #e2e2e2;">¿Cómo hacer entradas/salidas de stock de productos? 🚚</td>
      <td style="padding: 6px 8px; border: 1px solid #e2e2e2;"><a href="https://youtu.be/Z3bksX0WrEQ?si=i_SoeGvpqxMmQsWl" style="color: #eb5454;">https://youtu.be/Z3bksX0WrEQ?si=i_SoeGvpqxMmQsWl</a></td>
    </tr>
    <tr>
      <td style="padding: 6px 8px; border: 1px solid #e2e2e2;">¿Cómo ver mi stock de productos? 📄</td>
      <td style="padding: 6px 8px; border: 1px solid #e2e2e2;"><a href="https://youtu.be/2J_U0EFy_as?si=XyT-NXrQy_bDNdjL" style="color: #eb5454;">https://youtu.be/2J_U0EFy_as?si=XyT-NXrQy_bDNdjL</a></td>
    </tr>
    <tr style="background-color: #fdfdfd;">
      <td style="padding: 6px 8px; border: 1px solid #e2e2e2;">¿Cómo ver el kárdex de inventario? 📄</td>
      <td style="padding: 6px 8px; border: 1px solid #e2e2e2;"><a href="https://youtu.be/XWo2kdtXhTY?si=wXFc-tOy2mWENXa8" style="color: #eb5454;">https://youtu.be/XWo2kdtXhTY?si=wXFc-tOy2mWENXa8</a></td>
    </tr>
    <tr>
      <td style="padding: 6px 8px; border: 1px solid #e2e2e2;">¿Cómo aperturar caja? 💰</td>
      <td style="padding: 6px 8px; border: 1px solid #e2e2e2;"><a href="https://youtu.be/SD-8vguX89M?si=S2-PMcHO-WSonuFp" style="color: #eb5454;">https://youtu.be/SD-8vguX89M?si=S2-PMcHO-WSonuFp</a></td>
    </tr>
    <tr style="background-color: #fdfdfd;">
      <td style="padding: 6px 8px; border: 1px solid #e2e2e2;">¿Cómo cerrar caja? 💰</td>
      <td style="padding: 6px 8px; border: 1px solid #e2e2e2;"><a href="https://youtu.be/U3CI98ky6J0?si=_t8lqqHNvXhUqTdA" style="color: #eb5454;">https://youtu.be/U3CI98ky6J0?si=_t8lqqHNvXhUqTdA</a></td>
    </tr>
    <tr>
      <td style="padding: 6px 8px; border: 1px solid #e2e2e2;">¿Cómo registrar un pedido de PedidosYa o Rappi? 📲</td>
      <td style="padding: 6px 8px; border: 1px solid #e2e2e2;"><a href="https://youtu.be/9MydaU3mDTU?si=o6R3KNEdMEACw78h" style="color: #eb5454;">https://youtu.be/9MydaU3mDTU?si=o6R3KNEdMEACw78h</a></td>
    </tr>
  </tbody>
</table>
`,

    // PÁGINA 8: TUTORIALES DE YOUTUBE (PARTE 3)
    `
<div style="text-align: right; margin-bottom: 25px;">
  <span style="font-size: 16px; font-weight: 700; color: #eb5454;">${productName}</span><br>
  <span style="font-size: 10px; color: #888;">Tu restaurante digital</span>
</div>

<table style="width: 100%; border-collapse: collapse; font-size: 11px;">
  <thead>
    <tr style="background-color: #eb5454; color: #fff;">
      <th style="width: 45%; padding: 7px 10px; border: 1px solid #eb5454; text-align: center;">Tutorial</th>
      <th style="width: 55%; padding: 7px 10px; border: 1px solid #eb5454; text-align: center;">Enlace</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding: 6px 8px; border: 1px solid #e2e2e2;">¿Cómo mover una mesa? 🔄</td>
      <td style="padding: 6px 8px; border: 1px solid #e2e2e2;"><a href="https://youtu.be/FRe96ByPZxM?si=MXSUOl1VE0yVWOdM" style="color: #eb5454;">https://youtu.be/FRe96ByPZxM?si=MXSUOl1VE0yVWOdM</a></td>
    </tr>
    <tr style="background-color: #fdfdfd;">
      <td style="padding: 6px 8px; border: 1px solid #e2e2e2;">¿Cómo cambiar el nombre de un producto para comprobante? ✏️</td>
      <td style="padding: 6px 8px; border: 1px solid #e2e2e2;"><a href="https://youtu.be/zDpZ4-uWMJc?si=jOkHB--8OGUn7qjr" style="color: #eb5454;">https://youtu.be/zDpZ4-uWMJc?si=jOkHB--8OGUn7qjr</a></td>
    </tr>
    <tr>
      <td style="padding: 6px 8px; border: 1px solid #e2e2e2;">¿Cómo aplicar descuento a un producto? 🏷️</td>
      <td style="padding: 6px 8px; border: 1px solid #e2e2e2;"><a href="https://youtu.be/U5eX_8jTDgY?si=H7U9yRSBJCypStVo" style="color: #eb5454;">https://youtu.be/U5eX_8jTDgY?si=H7U9yRSBJCypStVo</a></td>
    </tr>
    <tr style="background-color: #fdfdfd;">
      <td style="padding: 6px 8px; border: 1px solid #e2e2e2;">¿Cómo aplicar un descuento a todo mi pedido? 🏷️</td>
      <td style="padding: 6px 8px; border: 1px solid #e2e2e2;"><a href="https://youtu.be/llZV8dp1syA?si=73bM1QqpQjWpm9UV" style="color: #eb5454;">https://youtu.be/llZV8dp1syA?si=73bM1QqpQjWpm9UV</a></td>
    </tr>
    <tr>
      <td style="padding: 6px 8px; border: 1px solid #e2e2e2;">¿Cómo dar una cortesía completa? 🎁</td>
      <td style="padding: 6px 8px; border: 1px solid #e2e2e2;"><a href="https://youtu.be/AXgsL2WLEIs?si=6AgM33O5DLKlWu6Q" style="color: #eb5454;">https://youtu.be/AXgsL2WLEIs?si=6AgM33O5DLKlWu6Q</a></td>
    </tr>
    <tr style="background-color: #fdfdfd;">
      <td style="padding: 6px 8px; border: 1px solid #e2e2e2;">¿Cómo dividir cuenta por productos? ✂️</td>
      <td style="padding: 6px 8px; border: 1px solid #e2e2e2;"><a href="https://youtu.be/lCa6ip__usc?si=HE5KfVXP9r6mocIz" style="color: #eb5454;">https://youtu.be/lCa6ip__usc?si=HE5KfVXP9r6mocIz</a></td>
    </tr>
    <tr>
      <td style="padding: 6px 8px; border: 1px solid #e2e2e2;">¿Cómo dividir cuenta por montos? ✂️</td>
      <td style="padding: 6px 8px; border: 1px solid #e2e2e2;"><a href="https://youtu.be/H8Yp0EQCuro?si=eOuDEQTPNOMQaMGX" style="color: #eb5454;">https://youtu.be/H8Yp0EQCuro?si=eOuDEQTPNOMQaMGX</a></td>
    </tr>
    <tr style="background-color: #fdfdfd;">
      <td style="padding: 6px 8px; border: 1px solid #e2e2e2;">¿Cómo cambiar el medio de pago de una venta? 💵</td>
      <td style="padding: 6px 8px; border: 1px solid #e2e2e2;"><a href="https://youtu.be/wIVYEN2lG3E?si=rwe-AqCN0Yu2WRGX" style="color: #eb5454;">https://youtu.be/wIVYEN2lG3E?si=rwe-AqCN0Yu2WRGX</a></td>
    </tr>
    <tr>
      <td style="padding: 6px 8px; border: 1px solid #e2e2e2;">¿Cómo hacer un comprobante de venta electrónico por consumo?</td>
      <td style="padding: 6px 8px; border: 1px solid #e2e2e2;"><a href="https://youtu.be/U-kLc65qoKg?si=NuUGff4cn1_Rpcvu" style="color: #eb5454;">https://youtu.be/U-kLc65qoKg?si=NuUGff4cn1_Rpcvu</a></td>
    </tr>
    <tr style="background-color: #fdfdfd;">
      <td style="padding: 6px 8px; border: 1px solid #e2e2e2;">¿Cómo hacer un comprobante de venta electrónico por glosa?</td>
      <td style="padding: 6px 8px; border: 1px solid #e2e2e2;"><a href="https://youtu.be/2Np51QFi7pE?si=wcbMZCpGvygSMplQ" style="color: #eb5454;">https://youtu.be/2Np51QFi7pE?si=wcbMZCpGvygSMplQ</a></td>
    </tr>
    <tr>
      <td style="padding: 6px 8px; border: 1px solid #e2e2e2;">¿Cómo enviar un comprobante por correo o WhatsApp? 📩</td>
      <td style="padding: 6px 8px; border: 1px solid #e2e2e2;"><a href="https://youtu.be/LIwf62k48XU?si=vHt2RBnI10JAVJNK" style="color: #eb5454;">https://youtu.be/LIwf62k48XU?si=vHt2RBnI10JAVJNK</a></td>
    </tr>
    <tr style="background-color: #fdfdfd;">
      <td style="padding: 6px 8px; border: 1px solid #e2e2e2;">¿Cómo hacer una venta al crédito? 💳</td>
      <td style="padding: 6px 8px; border: 1px solid #e2e2e2;"><a href="https://youtu.be/jxRReJbF7f8?si=0Z8EF1g9GfgYrj9Q" style="color: #eb5454;">https://youtu.be/jxRReJbF7f8?si=0Z8EF1g9GfgYrj9Q</a></td>
    </tr>
    <tr>
      <td style="padding: 6px 8px; border: 1px solid #e2e2e2;">¿Cómo pagar una venta al crédito? 💵</td>
      <td style="padding: 6px 8px; border: 1px solid #e2e2e2;"><a href="https://youtu.be/fwKCn4O_Jjg?si=-5x-opgNTzdLk1Jo" style="color: #eb5454;">https://youtu.be/fwKCn4O_Jjg?si=-5x-opgNTzdLk1Jo</a></td>
    </tr>
  </tbody>
</table>
`,
  ];
}

export function generateDefaultGesrestHtml(productName: string = "GESREST"): string {
  const pages = getDefaultGesrestPages(productName);
  const total = pages.length;

  return pages
    .map((content, idx) => `
<div class="a4-page-sheet" style="min-height: 1050px; position: relative; padding: 50px; background: #ffffff; margin: 0 auto 30px auto; box-shadow: 0 4px 15px rgba(0,0,0,0.12); page-break-after: always; box-sizing: border-box;">
  <div class="page-content" style="font-size: 12px; line-height: 1.5; color: #1a1a1a;">
    ${content}
  </div>
  <div style="position: absolute; bottom: 35px; left: 50px; right: 50px; border-top: 1px solid #ddd; padding-top: 6px; font-size: 10px; color: #777;">
    <span style="float: left;">Un producto de Mr. Soft</span>
    <span style="float: right;">${idx + 1} / ${total}</span>
    <div style="clear: both;"></div>
  </div>
</div>
`).join("\n");
}
