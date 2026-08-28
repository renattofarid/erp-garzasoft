export function generateDefaultGesrestHtml(productName: string = "GESREST"): string {
  const upper = productName.toUpperCase();

  return `
<!-- PÁGINA 1: PORTADA -->
<div style="min-height: 850px; position: relative; padding-top: 40px; page-break-after: always;">
  <div style="text-align: right; padding-right: 20px;">
    <h1 style="font-size: 34px; font-weight: bold; color: #eb5454; margin: 0; line-height: 1;">${productName}</h1>
    <div style="font-size: 14px; color: #eb5454; margin-top: 6px; font-weight: 600;">Tu restaurante digital</div>
    <div style="font-size: 11px; color: #555; margin-top: 14px; line-height: 1.6;">
      <div>+51 979 293 176</div>
      <div><a href="mailto:martin.ampuero@garzasoft.com" style="color: #0b4e8c; text-decoration: underline;">martin.ampuero@garzasoft.com</a></div>
    </div>
  </div>

  <div style="margin-top: 480px;">
    <div style="float: left;">
      <div style="font-size: 24px; font-weight: bold; color: #1a1a1a;">Mr. Soft</div>
      <div style="font-size: 11px; color: #0088cc; letter-spacing: 1px;">Development</div>
    </div>
    <div style="float: right; color: #eb5454; font-weight: 600; font-size: 13px; padding-top: 10px;">
      www.gesrest.net
    </div>
    <div style="clear: both;"></div>
  </div>
</div>

<!-- PÁGINA 2: PRESENTACIÓN -->
<div style="min-height: 850px; page-break-after: always; padding-top: 10px;">
  <div style="text-align: right; margin-bottom: 20px;">
    <span style="font-size: 16px; font-weight: 700; color: #eb5454;">${productName}</span><br>
    <span style="font-size: 10px; color: #888;">Tu restaurante digital</span>
  </div>

  <h2 style="color: #eb5454; font-size: 15px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 16px;">PRESENTACIÓN</h2>

  <p style="font-size: 11.5px; line-height: 1.5; margin-bottom: 14px;">
    <strong>${upper}</strong> es el software en nube para gestión de restaurantes. Incluye los módulos siguientes (*) atención de clientes, (*) control de productos en almacén, (*) registro de recetas y sub recetas, (*) seguimiento de ingresos y egresos de caja chica (*) compras y cuentas por pagar (*) sincronización con nuestra plataforma de facturación electrónica.
  </p>

  <p style="font-weight: 600; font-size: 11.5px; margin-top: 14px; margin-bottom: 8px;">
    ${upper} es la herramienta ideal si necesitas conocer:
  </p>

  <ul style="margin: 8px 0 16px 20px; font-size: 11.5px; line-height: 1.5;">
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

  <p style="font-size: 11.5px; line-height: 1.5; margin-top: 24px;">
    Mr. SOFT agradece depositar su confianza en nuestra empresa, le garantizamos el soporte y apoyo necesario para aprovechar al máximo ${upper}, nuestra herramienta para su productividad.
  </p>

  <div style="margin-top: 70px; text-align: center;">
    <div style="width: 260px; border-top: 1px solid #333; margin: 0 auto 6px auto;"></div>
    <div style="font-weight: bold; font-size: 12px; color: #111;">Gilberto Martín Ampuero Pasco</div>
    <div style="font-size: 11px; font-weight: bold; color: #444;">CEO Mr. SOFT</div>
  </div>

  <div style="margin-top: 80px; border-top: 1px solid #ddd; padding-top: 5px; font-size: 10px; color: #777;">
    <span style="float: left;">Un producto de Mr. Soft</span>
    <span style="float: right;">1</span>
    <div style="clear: both;"></div>
  </div>
</div>

<!-- PÁGINA 3: CREDENCIALES DE ACCESO -->
<div style="min-height: 850px; page-break-after: always; padding-top: 10px;">
  <div style="text-align: right; margin-bottom: 20px;">
    <span style="font-size: 16px; font-weight: 700; color: #eb5454;">${productName}</span><br>
    <span style="font-size: 10px; color: #888;">Tu restaurante digital</span>
  </div>

  <h2 style="color: #eb5454; font-size: 15px; font-weight: 700; text-transform: uppercase; margin-bottom: 16px;">CREDENCIALES DE ACCESO</h2>

  <p style="font-size: 11.5px; line-height: 1.5;">
    Para utilizar los servicios de nuestra plataforma <strong>${upper}</strong> debe ingresar al enlace:
  </p>
  <p style="margin: 10px 0; color: #eb5454; font-weight: bold; font-size: 13px;">
    <a href="https://gesrest.net/" style="color: #eb5454;">https://gesrest.net/</a>
  </p>
  <p style="font-size: 11.5px; line-height: 1.5; margin-bottom: 25px;">
    y luego presionar el botón <strong>"LOGIN"</strong> para registrar sus credenciales de acceso.
  </p>

  <div style="border: 1px solid #e5e5e5; border-radius: 8px; padding: 25px; background-color: #fafafa; margin: 20px 0; text-align: center;">
    <div style="font-size: 20px; font-weight: bold; color: #eb5454; margin-bottom: 8px;">
      ${productName}
    </div>
    <div style="font-size: 12px; color: #555; margin-bottom: 16px;">
      El seguimiento de tus ventas, con solo un clic!
    </div>
    <div style="background: #fff; border: 1px solid #ddd; padding: 18px; border-radius: 6px; display: inline-block; width: 75%;">
      <div style="text-align: left; font-size: 11px; color: #666; margin-bottom: 4px;">Nombre de usuario: [ RUC o Usuario ]</div>
      <div style="border: 1px solid #ccc; background: #fdfdfd; height: 24px; margin-bottom: 12px; border-radius: 4px;"></div>
      <div style="text-align: left; font-size: 11px; color: #666; margin-bottom: 4px;">Contraseña: [ Clave Asignada ]</div>
      <div style="border: 1px solid #ccc; background: #fdfdfd; height: 24px; margin-bottom: 16px; border-radius: 4px;"></div>
      <div style="background: #eb5454; color: #fff; font-weight: bold; padding: 8px; border-radius: 4px; font-size: 12px;">
        INICIAR SESIÓN
      </div>
    </div>
  </div>

  <div style="margin-top: 180px; border-top: 1px solid #ddd; padding-top: 5px; font-size: 10px; color: #777;">
    <span style="float: left;">Un producto de Mr. Soft</span>
    <span style="float: right;">2</span>
    <div style="clear: both;"></div>
  </div>
</div>

<!-- PÁGINA 4: PERFILES DE USUARIOS -->
<div style="min-height: 850px; page-break-after: always; padding-top: 10px;">
  <div style="text-align: right; margin-bottom: 20px;">
    <span style="font-size: 16px; font-weight: 700; color: #eb5454;">${productName}</span><br>
    <span style="font-size: 10px; color: #888;">Tu restaurante digital</span>
  </div>

  <h3 style="color: #eb5454; font-weight: bold; font-size: 12px; margin-top: 15px; margin-bottom: 6px; text-transform: uppercase;">PERFIL ADMINISTRADOR</h3>
  <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 11px;">
    <thead>
      <tr style="background-color: #eb5454; color: #fff;">
        <th style="padding: 7px 12px; text-align: center; border: 1px solid #eb5454;">Usuario</th>
        <th style="padding: 7px 12px; text-align: center; border: 1px solid #eb5454;">Clave</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="padding: 6px 12px; text-align: center; border: 1px solid #ddd; font-weight: 600;">20601799317</td>
        <td style="padding: 6px 12px; text-align: center; border: 1px solid #ddd; font-weight: 600;">20601799317</td>
      </tr>
    </tbody>
  </table>

  <h3 style="color: #eb5454; font-weight: bold; font-size: 12px; margin-top: 25px; margin-bottom: 6px; text-transform: uppercase;">PERFIL CAJERO</h3>
  <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 11px;">
    <thead>
      <tr style="background-color: #eb5454; color: #fff;">
        <th style="padding: 7px 12px; text-align: center; border: 1px solid #eb5454;">Usuario</th>
        <th style="padding: 7px 12px; text-align: center; border: 1px solid #eb5454;">Clave</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="padding: 6px 12px; text-align: center; border: 1px solid #ddd; font-weight: 600;">DIEGOMARAKOSE</td>
        <td style="padding: 6px 12px; text-align: center; border: 1px solid #ddd; font-weight: 600;">DIEGOMARAKOSE</td>
      </tr>
      <tr style="background-color: #fafafa;">
        <td style="padding: 6px 12px; text-align: center; border: 1px solid #ddd; font-weight: 600;">LUCARMARAKOSE</td>
        <td style="padding: 6px 12px; text-align: center; border: 1px solid #ddd; font-weight: 600;">LUCARMARAKOSE</td>
      </tr>
      <tr>
        <td style="padding: 6px 12px; text-align: center; border: 1px solid #ddd; font-weight: 600;">MELISAMARAKOSE</td>
        <td style="padding: 6px 12px; text-align: center; border: 1px solid #ddd; font-weight: 600;">MELISAMARAKOSE</td>
      </tr>
    </tbody>
  </table>

  <h3 style="color: #eb5454; font-weight: bold; font-size: 12px; margin-top: 25px; margin-bottom: 4px; text-transform: uppercase;">PERFIL MESERO</h3>
  <p style="font-size: 11px; margin-bottom: 8px;">
    Enlace para credenciales de mesero: <br>
    <a href="https://sistema.gesrest.net/waiter-login/STpasiENipZv" style="color: #0b4e8c; text-decoration: underline; font-weight: 500;">https://sistema.gesrest.net/waiter-login/STpasiENipZv</a>
  </p>
  <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 11px;">
    <thead>
      <tr style="background-color: #eb5454; color: #fff;">
        <th style="padding: 7px 12px; text-align: center; border: 1px solid #eb5454;">Usuario</th>
        <th style="padding: 7px 12px; text-align: center; border: 1px solid #eb5454;">Clave</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="padding: 6px 12px; text-align: center; border: 1px solid #ddd; font-weight: 600;">JAMIRMARAKOSE</td>
        <td style="padding: 6px 12px; text-align: center; border: 1px solid #ddd; font-weight: 600;">1234</td>
      </tr>
      <tr style="background-color: #fafafa;">
        <td style="padding: 6px 12px; text-align: center; border: 1px solid #ddd; font-weight: 600;">JEFFERSONMARAKOSE</td>
        <td style="padding: 6px 12px; text-align: center; border: 1px solid #ddd; font-weight: 600;">1234</td>
      </tr>
      <tr>
        <td style="padding: 6px 12px; text-align: center; border: 1px solid #ddd; font-weight: 600;">JUANJMARAKOSE</td>
        <td style="padding: 6px 12px; text-align: center; border: 1px solid #ddd; font-weight: 600;">1234</td>
      </tr>
      <tr style="background-color: #fafafa;">
        <td style="padding: 6px 12px; text-align: center; border: 1px solid #ddd; font-weight: 600;">LIONELMARAKOSE</td>
        <td style="padding: 6px 12px; text-align: center; border: 1px solid #ddd; font-weight: 600;">1234</td>
      </tr>
      <tr>
        <td style="padding: 6px 12px; text-align: center; border: 1px solid #ddd; font-weight: 600;">MILUSKAMARAKOSE</td>
        <td style="padding: 6px 12px; text-align: center; border: 1px solid #ddd; font-weight: 600;">1234</td>
      </tr>
    </tbody>
  </table>

  <div style="margin-top: 60px; border-top: 1px solid #ddd; padding-top: 5px; font-size: 10px; color: #777;">
    <span style="float: left;">Un producto de Mr. Soft</span>
    <span style="float: right;">3</span>
    <div style="clear: both;"></div>
  </div>
</div>

<!-- PÁGINA 5: PORTAL DE CONTADOR -->
<div style="min-height: 850px; page-break-after: always; padding-top: 10px;">
  <div style="text-align: right; margin-bottom: 20px;">
    <span style="font-size: 16px; font-weight: 700; color: #eb5454;">${productName}</span><br>
    <span style="font-size: 10px; color: #888;">Tu restaurante digital</span>
  </div>

  <h2 style="color: #eb5454; font-size: 14px; font-weight: 700; text-transform: uppercase; margin-bottom: 16px;">CREDENCIALES PARA ACCESO A PORTAL DE CONTADOR</h2>

  <p style="font-size: 11.5px; line-height: 1.5;">
    Para utilizar los servicios de nuestro portal de facturación electrónica debe ingresar al enlace:
  </p>
  <p style="margin: 10px 0; color: #eb5454; font-weight: bold; font-size: 12px;">
    <a href="https://comprobante-e.com" style="color: #eb5454;">https://comprobante-e.com</a> y luego presionar el botón <strong>"PORTAL PARA CONTADORES"</strong>.
  </p>

  <p style="font-size: 11px; color: #444; margin: 16px 0; line-height: 1.4;">
    La plataforma contiene el detalle de los comprobantes electrónicos de venta emitidos por la empresa: <br>
    <strong>20601799317 - MARAKOS GRILL CONCESIONES E.I.R.L</strong>
  </p>

  <h3 style="color: #eb5454; font-weight: bold; font-size: 12px; margin-top: 20px; margin-bottom: 6px; text-transform: uppercase;">CONFIGURACIÓN DE SERIES</h3>
  <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 11px;">
    <tbody>
      <tr>
        <td style="background-color: #eb5454; color: #fff; font-weight: bold; width: 45%; text-align: center; padding: 7px 12px; border: 1px solid #eb5454;">Serie factura</td>
        <td style="padding: 7px 12px; text-align: center; border: 1px solid #ddd; font-weight: bold; font-size: 12px;">F040</td>
      </tr>
      <tr>
        <td style="background-color: #eb5454; color: #fff; font-weight: bold; width: 45%; text-align: center; padding: 7px 12px; border: 1px solid #eb5454;">Serie boleta</td>
        <td style="padding: 7px 12px; text-align: center; border: 1px solid #ddd; font-weight: bold; font-size: 12px;">B040</td>
      </tr>
      <tr>
        <td style="background-color: #eb5454; color: #fff; font-weight: bold; width: 45%; text-align: center; padding: 7px 12px; border: 1px solid #eb5454;">Serie Nota de Crédito</td>
        <td style="padding: 7px 12px; text-align: center; border: 1px solid #ddd; font-weight: bold; font-size: 12px;">NC40</td>
      </tr>
    </tbody>
  </table>

  <h3 style="color: #eb5454; font-weight: bold; font-size: 12px; margin-top: 30px; margin-bottom: 6px; text-transform: uppercase;">CREDENCIALES DE ACCESO</h3>
  <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 11px;">
    <thead>
      <tr style="background-color: #eb5454; color: #fff;">
        <th style="padding: 7px 12px; text-align: center; border: 1px solid #eb5454;">Usuario</th>
        <th style="padding: 7px 12px; text-align: center; border: 1px solid #eb5454;">Clave</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="padding: 6px 12px; text-align: center; border: 1px solid #ddd; font-weight: 600;">20601799317</td>
        <td style="padding: 6px 12px; text-align: center; border: 1px solid #ddd; font-weight: 600;">marakos19</td>
      </tr>
    </tbody>
  </table>

  <div style="margin-top: 150px; border-top: 1px solid #ddd; padding-top: 5px; font-size: 10px; color: #777;">
    <span style="float: left;">Un producto de Mr. Soft</span>
    <span style="float: right;">4</span>
    <div style="clear: both;"></div>
  </div>
</div>

<!-- PÁGINA 6: TUTORIALES DE YOUTUBE (PARTE 1) -->
<div style="min-height: 850px; page-break-after: always; padding-top: 10px;">
  <div style="text-align: right; margin-bottom: 20px;">
    <span style="font-size: 16px; font-weight: 700; color: #eb5454;">${productName}</span><br>
    <span style="font-size: 10px; color: #888;">Tu restaurante digital</span>
  </div>

  <h2 style="color: #eb5454; font-size: 14px; font-weight: 700; text-transform: uppercase; margin-bottom: 12px;">TUTORIALES PARA USO DE ${upper}</h2>

  <p style="font-size: 11px; line-height: 1.4; margin-bottom: 8px;">
    En la plataforma YouTube en el canal oficial de <strong>Mr. Soft</strong> encontrarás vídeos que explican las pantallas y la funcionalidad de nuestra plataforma <strong>${productName}</strong>.
  </p>
  <p style="font-size: 11px; line-height: 1.4; margin-bottom: 12px;">
    De esta manera te ayudamos a lograr un mejor aprovechamiento de nuestra plataforma:
  </p>

  <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 11px;">
    <tr>
      <th style="background-color: #eb5454; color: #fff; padding: 6px 10px; font-weight: bold; width: 25%; text-align: left; border: 1px solid #eb5454;">Plataforma</th>
      <td style="background-color: #fafafa; padding: 6px 10px; border: 1px solid #ddd;">YouTube</td>
    </tr>
    <tr>
      <th style="background-color: #eb5454; color: #fff; padding: 6px 10px; font-weight: bold; width: 25%; text-align: left; border: 1px solid #eb5454;">Canal</th>
      <td style="background-color: #fafafa; padding: 6px 10px; border: 1px solid #ddd;">Mr Soft</td>
    </tr>
    <tr>
      <th style="background-color: #eb5454; color: #fff; padding: 6px 10px; font-weight: bold; width: 25%; text-align: left; border: 1px solid #eb5454;">Nombre</th>
      <td style="background-color: #fafafa; padding: 6px 10px; border: 1px solid #ddd;">Gesrest - Software para restaurantes 🍴</td>
    </tr>
    <tr>
      <th style="background-color: #eb5454; color: #fff; padding: 6px 10px; font-weight: bold; width: 25%; text-align: left; border: 1px solid #eb5454;">Enlace</th>
      <td style="background-color: #fafafa; padding: 6px 10px; border: 1px solid #ddd;"><a href="https://www.youtube.com/playlist?list=PLTwle3OwQTDthaIAsGGGFc8iimt69fSOj" style="color: #eb5454; word-break: break-all;">https://www.youtube.com/playlist?list=PLTwle3OwQTDthaIAsGGGFc8iimt69fSOj</a></td>
    </tr>
  </table>

  <table style="width: 100%; border-collapse: collapse; font-size: 10.5px;">
    <thead>
      <tr style="background-color: #eb5454; color: #fff;">
        <th style="width: 45%; padding: 6px 10px; border: 1px solid #eb5454; text-align: center;">Tutorial</th>
        <th style="width: 55%; padding: 6px 10px; border: 1px solid #eb5454; text-align: center;">Enlace</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="padding: 5px 8px; border: 1px solid #e2e2e2;">Presentación 🍳</td>
        <td style="padding: 5px 8px; border: 1px solid #e2e2e2;"><a href="https://youtu.be/us7pS1mjCZE?si=U_e281AnAOFgZ6q3" style="color: #eb5454;">https://youtu.be/us7pS1mjCZE?si=U_e281AnAOFgZ6q3</a></td>
      </tr>
      <tr style="background-color: #fdfdfd;">
        <td style="padding: 5px 8px; border: 1px solid #e2e2e2;">Recorrido por la plataforma 🍳</td>
        <td style="padding: 5px 8px; border: 1px solid #e2e2e2;"><a href="https://youtu.be/q5zDJpZK85g?si=C4P5cWvuECFXdo5p" style="color: #eb5454;">https://youtu.be/q5zDJpZK85g?si=C4P5cWvuECFXdo5p</a></td>
      </tr>
      <tr>
        <td style="padding: 5px 8px; border: 1px solid #e2e2e2;">¿Cómo ingresar a la plataforma? 🔐</td>
        <td style="padding: 5px 8px; border: 1px solid #e2e2e2;"><a href="https://youtu.be/lL32cakXcus?si=PHxN68vLuE3x7Orp" style="color: #eb5454;">https://youtu.be/lL32cakXcus?si=PHxN68vLuE3x7Orp</a></td>
      </tr>
      <tr style="background-color: #fdfdfd;">
        <td style="padding: 5px 8px; border: 1px solid #e2e2e2;">¿Cómo registrar un pedido en salón? 🍽️</td>
        <td style="padding: 5px 8px; border: 1px solid #e2e2e2;"><a href="https://youtu.be/Wj5bpyReOD8?si=ngv2NGhu7LBMmb27" style="color: #eb5454;">https://youtu.be/Wj5bpyReOD8?si=ngv2NGhu7LBMmb27</a></td>
      </tr>
      <tr>
        <td style="padding: 5px 8px; border: 1px solid #e2e2e2;">¿Cómo registrar una venta rápida? ☕</td>
        <td style="padding: 5px 8px; border: 1px solid #e2e2e2;"><a href="https://youtu.be/VpWpitK87oo?si=4T-BrRv5b7RYb_lB" style="color: #eb5454;">https://youtu.be/VpWpitK87oo?si=4T-BrRv5b7RYb_lB</a></td>
      </tr>
      <tr style="background-color: #fdfdfd;">
        <td style="padding: 5px 8px; border: 1px solid #e2e2e2;">¿Cómo cobrar una mesa? 💰</td>
        <td style="padding: 5px 8px; border: 1px solid #e2e2e2;"><a href="https://youtu.be/t5yrv0Q4f1E?si=DLqBcmI2RSmsTE5T" style="color: #eb5454;">https://youtu.be/t5yrv0Q4f1E?si=DLqBcmI2RSmsTE5T</a></td>
      </tr>
      <tr>
        <td style="padding: 5px 8px; border: 1px solid #e2e2e2;">¿Cómo emitir un comprobante de venta electrónico para SUNAT?</td>
        <td style="padding: 5px 8px; border: 1px solid #e2e2e2;"><a href="https://youtu.be/oxpqPuOw8Sc?si=qR5oqEwde6P0_qMo" style="color: #eb5454;">https://youtu.be/oxpqPuOw8Sc?si=qR5oqEwde6P0_qMo</a></td>
      </tr>
      <tr style="background-color: #fdfdfd;">
        <td style="padding: 5px 8px; border: 1px solid #e2e2e2;">¿Cómo disminuir productos comandados? ⬇️</td>
        <td style="padding: 5px 8px; border: 1px solid #e2e2e2;"><a href="https://youtu.be/CIxr6MPPqoQ?si=vf8ZOxTUKY1NVyWH" style="color: #eb5454;">https://youtu.be/CIxr6MPPqoQ?si=vf8ZOxTUKY1NVyWH</a></td>
      </tr>
      <tr>
        <td style="padding: 5px 8px; border: 1px solid #e2e2e2;">¿Cómo anular un producto registrado? 🚫</td>
        <td style="padding: 5px 8px; border: 1px solid #e2e2e2;"><a href="https://youtu.be/PmF7jkleJdk?si=iZzipLbjgoi3feyT" style="color: #eb5454;">https://youtu.be/PmF7jkleJdk?si=iZzipLbjgoi3feyT</a></td>
      </tr>
      <tr style="background-color: #fdfdfd;">
        <td style="padding: 5px 8px; border: 1px solid #e2e2e2;">¿Cómo anular un pedido completo? 🚫</td>
        <td style="padding: 5px 8px; border: 1px solid #e2e2e2;"><a href="https://youtu.be/Vb8j6sVXH5Q?si=FlM78NRtEwbhAuiH" style="color: #eb5454;">https://youtu.be/Vb8j6sVXH5Q?si=FlM78NRtEwbhAuiH</a></td>
      </tr>
      <tr>
        <td style="padding: 5px 8px; border: 1px solid #e2e2e2;">¿Cómo anular una venta? 🚫</td>
        <td style="padding: 5px 8px; border: 1px solid #e2e2e2;"><a href="https://youtu.be/FD2gI9z7qXk?si=PeN7r-4tdHW_flnV" style="color: #eb5454;">https://youtu.be/FD2gI9z7qXk?si=PeN7r-4tdHW_flnV</a></td>
      </tr>
    </tbody>
  </table>

  <div style="margin-top: 30px; border-top: 1px solid #ddd; padding-top: 5px; font-size: 10px; color: #777;">
    <span style="float: left;">Un producto de Mr. Soft</span>
    <span style="float: right;">5</span>
    <div style="clear: both;"></div>
  </div>
</div>
`;
}
