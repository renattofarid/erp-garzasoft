export function getDefaultGesrestPages(productName: string = "GESREST"): string[] {
  const upper = productName.toUpperCase();

  const headerLogoHtml = `
<div style="float: right; text-align: right; margin-bottom: 20px; clear: right;">
  <div style="display: inline-flex; align-items: center; gap: 8px; justify-content: flex-end; text-align: right;">
    <svg width="32" height="32" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="45" stroke="#eb5454" stroke-width="9" fill="none"/>
      <path d="M30 48 H70 V52 C70 63 61 72 50 72 C39 72 30 63 30 52 Z" fill="#eb5454"/>
      <path d="M42 30 V42 M50 26 V42 M58 30 V42" stroke="#eb5454" stroke-width="4" stroke-linecap="round"/>
    </svg>
    <div style="text-align: left; line-height: 1.15;">
      <span style="font-size: 18px; font-weight: 800; color: #eb5454; letter-spacing: -0.5px;">${productName}</span><br>
      <span style="font-size: 9px; color: #eb5454; font-weight: 600;">Tu restaurante digital</span>
    </div>
  </div>
</div>
<div style="clear: both;"></div>
`;

  return [
    // PÁGINA 1: PORTADA
    `
<div style="position: absolute; top: -38pt; left: -45pt; width: 595pt; height: 810pt; pointer-events: auto; z-index: 0; overflow: hidden; margin: 0; padding: 0;">
  <img src="/fondo_gesrest.png" alt="Fondo Gesrest" style="position: absolute; top: -240pt; left: -525pt; width: 1350pt; height: 1350pt; max-width: none; max-height: none; display: block;" />
</div>

<div style="position: relative; z-index: 1; padding: 8pt; min-height: 720pt;">
  <!-- Logo y Contacto Superior Derecho (Grande) -->
  <div style="text-align: right; margin-top: 20pt; margin-right: 5pt;">
    <div style="display: inline-flex; align-items: center; gap: 7pt; justify-content: flex-end; text-align: right;">
      <svg width="40" height="40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="45" stroke="#eb5454" stroke-width="9" fill="none"/>
        <path d="M30 48 H70 V52 C70 63 61 72 50 72 C39 72 30 63 30 52 Z" fill="#eb5454"/>
        <path d="M42 30 V42 M50 26 V42 M58 30 V42" stroke="#eb5454" stroke-width="4" stroke-linecap="round"/>
      </svg>
      <div style="text-align: left; line-height: 1.15;">
        <span style="font-size: 24pt; font-weight: 800; color: #eb5454; letter-spacing: -0.5px;">${productName}</span><br>
        <span style="font-size: 10pt; color: #eb5454; font-weight: 600;">Tu restaurante digital</span>
      </div>
    </div>
    <div style="font-size: 10pt; color: #444; line-height: 1.8; margin-top: 6pt;">
      <div>+51 979 293 176</div>
      <div><a href="mailto:martin.ampuero@garzasoft.com" style="color: #0b4e8c; text-decoration: underline;">martin.ampuero@garzasoft.com</a></div>
    </div>
  </div>

  <!-- Logo Mr. Soft (Inferior Izquierdo) -->
  <div style="position: absolute; bottom: 25pt; left: 25pt; z-index: 1;">
    <div style="font-size: 21pt; font-weight: bold; color: #1a1a1a;">Mr. Soft</div>
    <div style="font-size: 9pt; color: #0088cc; letter-spacing: 2px;">DEVELOPMENT</div>
  </div>

  <!-- Enlace Inferior Derecho -->
  <div style="position: absolute; bottom: 25pt; right: 25pt; z-index: 1;">
    <a href="https://www.gesrest.net" target="_blank" rel="noopener noreferrer" style="color: #eb5454; font-weight: 700; font-size: 12pt; text-decoration: none;">
      www.gesrest.net
    </a>
  </div>
</div>
`,

    // PÁGINA 2: PRESENTACIÓN
    `
${headerLogoHtml}

<h2 style="color: #eb5454; font-size: 16px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 18px;">PRESENTACIÓN</h2>

<p style="font-size: 12px; line-height: 1.6; margin-bottom: 16px; color: #222;">
  <strong>${upper}</strong> es el software en nube para gestión de restaurantes. Incluye los módulos siguientes (*) atención de clientes, (*) control de productos en almacén, (*) registro de recetas y sub recetas, (*) seguimiento de ingresos y egresos de caja chica (*) compras y cuentas por pagar (*) sincronización con nuestra plataforma de facturación electrónica.
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

<p style="font-size: 12px; line-height: 1.6; margin-top: 26px; color: #222;">
  Mr. SOFT agradece depositar su confianza en nuestra empresa, le garantizamos el soporte y apoyo necesario para aprovechar al máximo ${upper}, nuestra herramienta para su productividad.
</p>

<div style="margin-top: 50px; text-align: center;">
  <div style="width: 220px; font-family: 'Brush Script MT', cursive; font-size: 26px; color: #2b3a4a; margin: 0 auto 4px auto;">
    G. Ampuero
  </div>
  <div style="width: 260px; border-top: 1px solid #333; margin: 0 auto 6px auto;"></div>
  <div style="font-weight: bold; font-size: 12px; color: #111;">Gilberto Martín Ampuero Pasco</div>
  <div style="font-size: 11px; font-weight: bold; color: #555;">CEO Mr. SOFT</div>
</div>
`,

    // PÁGINA 3: CREDENCIALES DE ACCESO
    `
${headerLogoHtml}

<h2 style="color: #eb5454; font-size: 16px; font-weight: 700; text-transform: uppercase; margin-bottom: 18px;">CREDENCIALES DE ACCESO</h2>

<p style="font-size: 12px; line-height: 1.6;">
  Para utilizar los servicios de nuestra plataforma <strong>${upper}</strong> debe ingresar al enlace:
</p>
<p style="margin: 12px 0; color: #eb5454; font-weight: bold; font-size: 14px;">
  <a href="https://gesrest.net/" target="_blank" rel="noopener noreferrer" style="color: #eb5454; text-decoration: underline;">https://gesrest.net/</a>
</p>
<p style="font-size: 12px; line-height: 1.6; margin-bottom: 24px;">
  y luego presionar el botón <strong>"LOGIN"</strong> para registrar sus credenciales de acceso.
</p>

<div style="border: 1px solid #e5e5e5; border-radius: 8px; padding: 25px 20px; background-color: #fafafa; margin: 20px 0; text-align: center;">
  <div style="background: linear-gradient(135deg, #eb5454 0%, #ff7676 100%); color: #fff; padding: 18px 24px; border-radius: 6px; margin-bottom: 16px; box-shadow: 0 2px 6px rgba(235,84,84,0.25);">
    <div style="font-size: 20px; font-weight: 800; letter-spacing: 0.5px;">El seguimiento de tus ventas, con solo un clic!</div>
  </div>
  <div style="background: #fff; border: 1px solid #ddd; padding: 20px; border-radius: 6px; display: inline-block; width: 75%; box-shadow: 0 2px 6px rgba(0,0,0,0.05); text-align: left;">
    <div style="font-size: 11px; color: #666; margin-bottom: 4px;">Nombre de usuario: [ RUC o Usuario ]</div>
    <div style="border: 1px solid #ccc; background: #fdfdfd; height: 26px; margin-bottom: 12px; border-radius: 4px;"></div>
    <div style="font-size: 11px; color: #666; margin-bottom: 4px;">Contraseña: [ Clave Asignada ]</div>
    <div style="border: 1px solid #ccc; background: #fdfdfd; height: 26px; margin-bottom: 16px; border-radius: 4px;"></div>
    <div style="background: #eb5454; color: #fff; font-weight: bold; padding: 9px; border-radius: 5px; font-size: 12px; text-align: center; letter-spacing: 0.5px;">
      INICIAR SESIÓN
    </div>
  </div>
</div>
`,

    // PÁGINA 4: PERFILES DE USUARIOS
    `
${headerLogoHtml}

<h3 style="color: #eb5454; font-weight: bold; font-size: 13px; margin-top: 10px; margin-bottom: 8px; text-transform: uppercase;">PERFIL ADMINISTRADOR</h3>
<table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 11.5px;">
  <thead>
    <tr style="background-color: #eb5454; color: #fff;">
      <th style="padding: 8px 12px; text-align: center; border: 1px solid #d1d5db; width: 50%; color: #fff;">Usuario</th>
      <th style="padding: 8px 12px; text-align: center; border: 1px solid #d1d5db; width: 50%; color: #fff;">Clave</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding: 7px 12px; text-align: center; border: 1px solid #d1d5db; font-weight: 600;">20601799317-2</td>
      <td style="padding: 7px 12px; text-align: center; border: 1px solid #d1d5db; font-weight: 600;">20601799317</td>
    </tr>
  </tbody>
</table>

<h3 style="color: #eb5454; font-weight: bold; font-size: 13px; margin-top: 20px; margin-bottom: 8px; text-transform: uppercase;">PERFIL CAJERO</h3>
<table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 11.5px;">
  <thead>
    <tr style="background-color: #eb5454; color: #fff;">
      <th style="padding: 8px 12px; text-align: center; border: 1px solid #d1d5db; width: 50%; color: #fff;">Usuario</th>
      <th style="padding: 8px 12px; text-align: center; border: 1px solid #d1d5db; width: 50%; color: #fff;">Clave</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding: 7px 12px; text-align: center; border: 1px solid #d1d5db; font-weight: 600;">SONIAMARAKOST</td>
      <td style="padding: 7px 12px; text-align: center; border: 1px solid #d1d5db; font-weight: 600;">SONIAMARAKOST</td>
    </tr>
  </tbody>
</table>

<h3 style="color: #eb5454; font-weight: bold; font-size: 13px; margin-top: 20px; margin-bottom: 6px; text-transform: uppercase;">PERFIL MESERO</h3>
<p style="font-size: 11.5px; margin-bottom: 8px;">
  Enlace para credenciales de mesero: <br>
  <a href="https://sistema.gesrest.net/waiter-login/69ndbKNyJBMO" target="_blank" rel="noopener noreferrer" style="color: #0b4e8c; text-decoration: underline; font-weight: 500;">https://sistema.gesrest.net/waiter-login/69ndbKNyJBMO</a>
</p>
<table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 11.5px;">
  <thead>
    <tr style="background-color: #eb5454; color: #fff;">
      <th style="padding: 8px 12px; text-align: center; border: 1px solid #d1d5db; width: 50%; color: #fff;">Usuario</th>
      <th style="padding: 8px 12px; text-align: center; border: 1px solid #d1d5db; width: 50%; color: #fff;">Clave</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding: 7px 12px; text-align: center; border: 1px solid #d1d5db; font-weight: 600;">ALEXANDERMARAKOST</td>
      <td style="padding: 7px 12px; text-align: center; border: 1px solid #d1d5db; font-weight: 600;">1234</td>
    </tr>
    <tr style="background-color: #fafafa;">
      <td style="padding: 7px 12px; text-align: center; border: 1px solid #d1d5db; font-weight: 600;">APOYO1MARAKOST</td>
      <td style="padding: 7px 12px; text-align: center; border: 1px solid #d1d5db; font-weight: 600;">1234</td>
    </tr>
    <tr>
      <td style="padding: 7px 12px; text-align: center; border: 1px solid #d1d5db; font-weight: 600;">APOYO2MARAKOST</td>
      <td style="padding: 7px 12px; text-align: center; border: 1px solid #d1d5db; font-weight: 600;">1234</td>
    </tr>
    <tr style="background-color: #fafafa;">
      <td style="padding: 7px 12px; text-align: center; border: 1px solid #d1d5db; font-weight: 600;">APOYO3MARAKOST</td>
      <td style="padding: 7px 12px; text-align: center; border: 1px solid #d1d5db; font-weight: 600;">1234</td>
    </tr>
    <tr>
      <td style="padding: 7px 12px; text-align: center; border: 1px solid #d1d5db; font-weight: 600;">MARKOMARAKOST</td>
      <td style="padding: 7px 12px; text-align: center; border: 1px solid #d1d5db; font-weight: 600;">1234</td>
    </tr>
    <tr style="background-color: #fafafa;">
      <td style="padding: 7px 12px; text-align: center; border: 1px solid #d1d5db; font-weight: 600;">SARAMARAKOST</td>
      <td style="padding: 7px 12px; text-align: center; border: 1px solid #d1d5db; font-weight: 600;">1234</td>
    </tr>
  </tbody>
</table>
`,

    // PÁGINA 5: PORTAL DE CONTADOR
    `
${headerLogoHtml}

<h2 style="color: #eb5454; font-size: 15px; font-weight: 700; text-transform: uppercase; margin-bottom: 16px;">CREDENCIALES PARA ACCESO A PORTAL DE CONTADOR</h2>

<p style="font-size: 12px; line-height: 1.6;">
  Para utilizar los servicios de nuestro portal de facturación electrónica debe ingresar al enlace:
</p>
<p style="margin: 10px 0; color: #eb5454; font-weight: bold; font-size: 13px;">
  <a href="https://comprobante-e.com" target="_blank" rel="noopener noreferrer" style="color: #eb5454; text-decoration: underline;">https://comprobante-e.com</a> y luego presionar el botón <strong>"PORTAL PARA CONTADORES"</strong>.
</p>

<!-- 3 Blue Banner Cards -->
<div style="display: flex; gap: 10px; margin: 18px 0;">
  <div style="flex: 1; background: #0284c7; color: #fff; padding: 14px 8px; border-radius: 6px; text-align: center; font-size: 11px; font-weight: bold;">
    Consulta tus Comprobantes
  </div>
  <div style="flex: 1; background: #0369a1; color: #fff; padding: 14px 8px; border-radius: 6px; text-align: center; font-size: 11px; font-weight: bold;">
    Facturador en Web
  </div>
  <div style="flex: 1; background: #075985; color: #fff; padding: 14px 8px; border-radius: 6px; text-align: center; font-size: 11px; font-weight: bold;">
    Portal para Contadores
  </div>
</div>

<p style="font-size: 11.5px; color: #333; margin: 16px 0; line-height: 1.5;">
  La plataforma contiene el detalle de los comprobantes electrónicos de venta emitidos por la empresa: <br>
  <strong>20601799317 - MARAKOS GRILL CONCESIONES E.I.R.L</strong>
</p>

<h3 style="color: #eb5454; font-weight: bold; font-size: 13px; margin-top: 20px; margin-bottom: 8px; text-transform: uppercase;">CONFIGURACIÓN DE SERIES</h3>
<table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 11.5px;">
  <tbody>
    <tr>
      <td style="background-color: #eb5454; color: #fff; font-weight: bold; width: 45%; text-align: center; padding: 8px 12px; border: 1px solid #d1d5db;">Serie factura</td>
      <td style="padding: 8px 12px; text-align: center; border: 1px solid #d1d5db; font-weight: bold; font-size: 13px;">F041</td>
    </tr>
    <tr>
      <td style="background-color: #eb5454; color: #fff; font-weight: bold; width: 45%; text-align: center; padding: 8px 12px; border: 1px solid #d1d5db;">Serie boleta</td>
      <td style="padding: 8px 12px; text-align: center; border: 1px solid #d1d5db; font-weight: bold; font-size: 13px;">B041</td>
    </tr>
    <tr>
      <td style="background-color: #eb5454; color: #fff; font-weight: bold; width: 45%; text-align: center; padding: 8px 12px; border: 1px solid #d1d5db;">Serie Nota de Crédito</td>
      <td style="padding: 8px 12px; text-align: center; border: 1px solid #d1d5db; font-weight: bold; font-size: 13px;">NC41</td>
    </tr>
  </tbody>
</table>

<h3 style="color: #eb5454; font-weight: bold; font-size: 13px; margin-top: 22px; margin-bottom: 8px; text-transform: uppercase;">CREDENCIALES DE ACCESO</h3>
<table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 11.5px;">
  <thead>
    <tr style="background-color: #eb5454; color: #fff;">
      <th style="padding: 8px 12px; text-align: center; border: 1px solid #d1d5db; width: 50%; color: #fff;">Usuario</th>
      <th style="padding: 8px 12px; text-align: center; border: 1px solid #d1d5db; width: 50%; color: #fff;">Clave</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding: 7px 12px; text-align: center; border: 1px solid #d1d5db; font-weight: 600;">20601799317</td>
      <td style="padding: 7px 12px; text-align: center; border: 1px solid #d1d5db; font-weight: 600;">marakos19</td>
    </tr>
  </tbody>
</table>
`,

    // PÁGINA 6: TUTORIALES DE YOUTUBE (PARTE 1)
    `
${headerLogoHtml}

<h2 style="color: #eb5454; font-size: 15px; font-weight: 700; text-transform: uppercase; margin-bottom: 12px;">TUTORIALES PARA USO DE ${upper}</h2>

<p style="font-size: 11.5px; line-height: 1.5; margin-bottom: 8px; color: #222;">
  En la plataforma YouTube en el canal oficial de <strong>Mr. Soft</strong> encontrarás vídeos que explican las pantallas y la funcionalidad de nuestra plataforma <strong>${productName}</strong>.
</p>
<p style="font-size: 11.5px; line-height: 1.5; margin-bottom: 14px; color: #222;">
  De esta manera te ayudamos a lograr un mejor aprovechamiento de nuestra plataforma para Gestión de Restaurantes:
</p>

<table style="width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 11.5px; border: 1px solid #d1d5db;">
  <tr>
    <th style="background-color: #eb5454; color: #fff; padding: 7px 10px; font-weight: bold; width: 25%; text-align: left; border: 1px solid #d1d5db;">Plataforma</th>
    <td style="background-color: #fafafa; padding: 7px 10px; border: 1px solid #d1d5db;">YouTube</td>
  </tr>
  <tr>
    <th style="background-color: #eb5454; color: #fff; padding: 7px 10px; font-weight: bold; width: 25%; text-align: left; border: 1px solid #d1d5db;">Canal</th>
    <td style="background-color: #fafafa; padding: 7px 10px; border: 1px solid #d1d5db;">Mr Soft</td>
  </tr>
  <tr>
    <th style="background-color: #eb5454; color: #fff; padding: 7px 10px; font-weight: bold; width: 25%; text-align: left; border: 1px solid #d1d5db;">Nombre</th>
    <td style="background-color: #fafafa; padding: 7px 10px; border: 1px solid #d1d5db;">Gesrest - Software para restaurantes 🍴</td>
  </tr>
  <tr>
    <th style="background-color: #eb5454; color: #fff; padding: 7px 10px; font-weight: bold; width: 25%; text-align: left; border: 1px solid #d1d5db;">Enlace</th>
    <td style="background-color: #fafafa; padding: 7px 10px; border: 1px solid #d1d5db;"><a href="https://www.youtube.com/playlist?list=PLTwle3OwQTDthaIAsGGGFc8iimt69fSOj" target="_blank" rel="noopener noreferrer" style="color: #eb5454; text-decoration: underline; word-break: break-all;">https://www.youtube.com/playlist?list=PLTwle3OwQTDthaIAsGGGFc8iimt69fSOj</a></td>
  </tr>
</table>

<table style="width: 100%; border-collapse: collapse; font-size: 11.5px; border: 1px solid #d1d5db;">
  <thead>
    <tr style="background-color: #eb5454; color: #fff;">
      <th style="width: 45%; padding: 8px 12px; border: 1px solid #d1d5db; text-align: center; color: #fff; font-size: 12px;">Tutorial</th>
      <th style="width: 55%; padding: 8px 12px; border: 1px solid #d1d5db; text-align: center; color: #fff; font-size: 12px;">Enlace</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding: 7px 10px; border: 1px solid #d1d5db;">Presentación 🍳</td>
      <td style="padding: 7px 10px; border: 1px solid #d1d5db;"><a href="https://youtu.be/us7pS1mjCZE?si=U_e281AnAOFgZ6q3" target="_blank" rel="noopener noreferrer" style="color: #eb5454; text-decoration: underline; word-break: break-all;">https://youtu.be/us7pS1mjCZE?si=U_e281AnAOFgZ6q3</a></td>
    </tr>
    <tr style="background-color: #fafafa;">
      <td style="padding: 7px 10px; border: 1px solid #d1d5db;">Recorrido por la plataforma 🍳</td>
      <td style="padding: 7px 10px; border: 1px solid #d1d5db;"><a href="https://youtu.be/q5zDJpZK85g?si=C4P5cWvuECFXdo5p" target="_blank" rel="noopener noreferrer" style="color: #eb5454; text-decoration: underline; word-break: break-all;">https://youtu.be/q5zDJpZK85g?si=C4P5cWvuECFXdo5p</a></td>
    </tr>
    <tr>
      <td style="padding: 7px 10px; border: 1px solid #d1d5db;">¿Cómo ingresar a la plataforma? 🔐</td>
      <td style="padding: 7px 10px; border: 1px solid #d1d5db;"><a href="https://youtu.be/lL32cakXcus?si=PHxN68vLuE3x7Orp" target="_blank" rel="noopener noreferrer" style="color: #eb5454; text-decoration: underline; word-break: break-all;">https://youtu.be/lL32cakXcus?si=PHxN68vLuE3x7Orp</a></td>
    </tr>
    <tr style="background-color: #fafafa;">
      <td style="padding: 7px 10px; border: 1px solid #d1d5db;">¿Cómo registrar un pedido en salón? 📝</td>
      <td style="padding: 7px 10px; border: 1px solid #d1d5db;"><a href="https://youtu.be/Wj5bpyReOD8?si=ngv2NGhu7LBMmb27" target="_blank" rel="noopener noreferrer" style="color: #eb5454; text-decoration: underline; word-break: break-all;">https://youtu.be/Wj5bpyReOD8?si=ngv2NGhu7LBMmb27</a></td>
    </tr>
    <tr>
      <td style="padding: 7px 10px; border: 1px solid #d1d5db;">¿Cómo registrar una venta rápida? ☕</td>
      <td style="padding: 7px 10px; border: 1px solid #d1d5db;"><a href="https://youtu.be/VpWpitK87oo?si=4T-BrRv5b7RYb_lB" target="_blank" rel="noopener noreferrer" style="color: #eb5454; text-decoration: underline; word-break: break-all;">https://youtu.be/VpWpitK87oo?si=4T-BrRv5b7RYb_lB</a></td>
    </tr>
    <tr style="background-color: #fafafa;">
      <td style="padding: 7px 10px; border: 1px solid #d1d5db;">¿Cómo cobrar una mesa? 💰</td>
      <td style="padding: 7px 10px; border: 1px solid #d1d5db;"><a href="https://youtu.be/t5yrv0Q4f1E?si=DLqBcmI2RSmsTE5T" target="_blank" rel="noopener noreferrer" style="color: #eb5454; text-decoration: underline; word-break: break-all;">https://youtu.be/t5yrv0Q4f1E?si=DLqBcmI2RSmsTE5T</a></td>
    </tr>
    <tr>
      <td style="padding: 7px 10px; border: 1px solid #d1d5db;">¿Cómo emitir un comprobante de venta electrónico para SUNAT? 🧾</td>
      <td style="padding: 7px 10px; border: 1px solid #d1d5db;"><a href="https://youtu.be/oxpqPuOw8Sc?si=qR5oqEwde6P0_qMo" target="_blank" rel="noopener noreferrer" style="color: #eb5454; text-decoration: underline; word-break: break-all;">https://youtu.be/oxpqPuOw8Sc?si=qR5oqEwde6P0_qMo</a></td>
    </tr>
    <tr style="background-color: #fafafa;">
      <td style="padding: 7px 10px; border: 1px solid #d1d5db;">¿Cómo disminuir productos comandados? ⬇️</td>
      <td style="padding: 7px 10px; border: 1px solid #d1d5db;"><a href="https://youtu.be/CIxr6MPPqoQ?si=vf8ZOxTUKY1NVyWH" target="_blank" rel="noopener noreferrer" style="color: #eb5454; text-decoration: underline; word-break: break-all;">https://youtu.be/CIxr6MPPqoQ?si=vf8ZOxTUKY1NVyWH</a></td>
    </tr>
    <tr>
      <td style="padding: 7px 10px; border: 1px solid #d1d5db;">¿Cómo anular un producto registrado? 🚫</td>
      <td style="padding: 7px 10px; border: 1px solid #d1d5db;"><a href="https://youtu.be/PmF7jkleJdk?si=iZzipLbjgoi3feyT" target="_blank" rel="noopener noreferrer" style="color: #eb5454; text-decoration: underline; word-break: break-all;">https://youtu.be/PmF7jkleJdk?si=iZzipLbjgoi3feyT</a></td>
    </tr>
    <tr style="background-color: #fafafa;">
      <td style="padding: 7px 10px; border: 1px solid #d1d5db;">¿Cómo anular un pedido completo? 🚫</td>
      <td style="padding: 7px 10px; border: 1px solid #d1d5db;"><a href="https://youtu.be/Vb8j6sVXH5Q?si=FlM78NRtEwbhAuiH" target="_blank" rel="noopener noreferrer" style="color: #eb5454; text-decoration: underline; word-break: break-all;">https://youtu.be/Vb8j6sVXH5Q?si=FlM78NRtEwbhAuiH</a></td>
    </tr>
    <tr>
      <td style="padding: 7px 10px; border: 1px solid #d1d5db;">¿Cómo anular una venta? 🚫</td>
      <td style="padding: 7px 10px; border: 1px solid #d1d5db;"><a href="https://youtu.be/FD2gI9z7qXk?si=PeN7r-4tdHW_flnV" target="_blank" rel="noopener noreferrer" style="color: #eb5454; text-decoration: underline; word-break: break-all;">https://youtu.be/FD2gI9z7qXk?si=PeN7r-4tdHW_flnV</a></td>
    </tr>
  </tbody>
</table>
`,

    // PÁGINA 7: TUTORIALES DE YOUTUBE (PARTE 2)
    `
${headerLogoHtml}

<table style="width: 100%; border-collapse: collapse; font-size: 11.5px; border: 1px solid #d1d5db;">
  <thead>
    <tr style="background-color: #eb5454; color: #fff;">
      <th style="width: 45%; padding: 8px 12px; border: 1px solid #d1d5db; text-align: center; color: #fff; font-size: 12px;">Tutorial</th>
      <th style="width: 55%; padding: 8px 12px; border: 1px solid #d1d5db; text-align: center; color: #fff; font-size: 12px;">Enlace</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding: 7px 10px; border: 1px solid #d1d5db;">¿Cómo cambiar mi contraseña? 🔑</td>
      <td style="padding: 7px 10px; border: 1px solid #d1d5db;"><a href="https://youtu.be/tpvKMZCnBJU?si=ExWy3dp12PR3RrfP" target="_blank" rel="noopener noreferrer" style="color: #eb5454; text-decoration: underline; word-break: break-all;">https://youtu.be/tpvKMZCnBJU?si=ExWy3dp12PR3RrfP</a></td>
    </tr>
    <tr style="background-color: #fafafa;">
      <td style="padding: 7px 10px; border: 1px solid #d1d5db;">¿Cómo crear una nueva categoría de productos? 🍕</td>
      <td style="padding: 7px 10px; border: 1px solid #d1d5db;"><a href="https://youtu.be/SSn6IofCquI?si=wV5WsuLmauEDpGEm" target="_blank" rel="noopener noreferrer" style="color: #eb5454; text-decoration: underline; word-break: break-all;">https://youtu.be/SSn6IofCquI?si=wV5WsuLmauEDpGEm</a></td>
    </tr>
    <tr>
      <td style="padding: 7px 10px; border: 1px solid #d1d5db;">¿Cómo crear un nuevo producto? 🍔</td>
      <td style="padding: 7px 10px; border: 1px solid #d1d5db;"><a href="https://youtu.be/WguSM1eJ62o?si=KBgl_GVv2o_RDE02" target="_blank" rel="noopener noreferrer" style="color: #eb5454; text-decoration: underline; word-break: break-all;">https://youtu.be/WguSM1eJ62o?si=KBgl_GVv2o_RDE02</a></td>
    </tr>
    <tr style="background-color: #fafafa;">
      <td style="padding: 7px 10px; border: 1px solid #d1d5db;">¿Cómo registrar mis gastos? 💸</td>
      <td style="padding: 7px 10px; border: 1px solid #d1d5db;"><a href="https://youtu.be/vV_rctLu4gs?si=09wlGN8Hy-7mKbVH" target="_blank" rel="noopener noreferrer" style="color: #eb5454; text-decoration: underline; word-break: break-all;">https://youtu.be/vV_rctLu4gs?si=09wlGN8Hy-7mKbVH</a></td>
    </tr>
    <tr>
      <td style="padding: 7px 10px; border: 1px solid #d1d5db;">¿Cómo configurar mis productos favoritos? ⭐</td>
      <td style="padding: 7px 10px; border: 1px solid #d1d5db;"><a href="https://youtu.be/cjzyNOTF11M?si=QRPyi5iL7xJi4Ndb" target="_blank" rel="noopener noreferrer" style="color: #eb5454; text-decoration: underline; word-break: break-all;">https://youtu.be/cjzyNOTF11M?si=QRPyi5iL7xJi4Ndb</a></td>
    </tr>
    <tr style="background-color: #fafafa;">
      <td style="padding: 7px 10px; border: 1px solid #d1d5db;">¿Cómo controlar mi inventario? 📦</td>
      <td style="padding: 7px 10px; border: 1px solid #d1d5db;"><a href="https://youtu.be/PODRHCv0iis?si=Nd3cwxW1cDf0sExB" target="_blank" rel="noopener noreferrer" style="color: #eb5454; text-decoration: underline; word-break: break-all;">https://youtu.be/PODRHCv0iis?si=Nd3cwxW1cDf0sExB</a></td>
    </tr>
    <tr>
      <td style="padding: 7px 10px; border: 1px solid #d1d5db;">¿Cómo crear ingredientes? 🧂</td>
      <td style="padding: 7px 10px; border: 1px solid #d1d5db;"><a href="https://youtu.be/63yQtPY1g8U?si=tZaYkX9E_Zef9L5p" target="_blank" rel="noopener noreferrer" style="color: #eb5454; text-decoration: underline; word-break: break-all;">https://youtu.be/63yQtPY1g8U?si=tZaYkX9E_Zef9L5p</a></td>
    </tr>
    <tr style="background-color: #fafafa;">
      <td style="padding: 7px 10px; border: 1px solid #d1d5db;">¿Cómo crear productos compuestos? 🍲</td>
      <td style="padding: 7px 10px; border: 1px solid #d1d5db;"><a href="https://youtu.be/w0y2YNaiL8Y?si=PeZMC-hNZ23JJ_kD" target="_blank" rel="noopener noreferrer" style="color: #eb5454; text-decoration: underline; word-break: break-all;">https://youtu.be/w0y2YNaiL8Y?si=PeZMC-hNZ23JJ_kD</a></td>
    </tr>
    <tr>
      <td style="padding: 7px 10px; border: 1px solid #d1d5db;">¿Cómo configurar tus recetas? 🍳</td>
      <td style="padding: 7px 10px; border: 1px solid #d1d5db;"><a href="https://youtu.be/3Uvo7p23LYw?si=WBdvuuxqv1nhC1yy" target="_blank" rel="noopener noreferrer" style="color: #eb5454; text-decoration: underline; word-break: break-all;">https://youtu.be/3Uvo7p23LYw?si=WBdvuuxqv1nhC1yy</a></td>
    </tr>
    <tr style="background-color: #fafafa;">
      <td style="padding: 7px 10px; border: 1px solid #d1d5db;">¿Cómo hacer entradas/salidas de stock de productos? 🚚</td>
      <td style="padding: 7px 10px; border: 1px solid #d1d5db;"><a href="https://youtu.be/Z3bksX0WrEQ?si=i_SoeGvpqxMmQsWl" target="_blank" rel="noopener noreferrer" style="color: #eb5454; text-decoration: underline; word-break: break-all;">https://youtu.be/Z3bksX0WrEQ?si=i_SoeGvpqxMmQsWl</a></td>
    </tr>
    <tr>
      <td style="padding: 7px 10px; border: 1px solid #d1d5db;">¿Cómo ver mi stock de productos? 📄</td>
      <td style="padding: 7px 10px; border: 1px solid #d1d5db;"><a href="https://youtu.be/2J_U0EFy_as?si=XyT-NXrQy_bDNdjL" target="_blank" rel="noopener noreferrer" style="color: #eb5454; text-decoration: underline; word-break: break-all;">https://youtu.be/2J_U0EFy_as?si=XyT-NXrQy_bDNdjL</a></td>
    </tr>
    <tr style="background-color: #fafafa;">
      <td style="padding: 7px 10px; border: 1px solid #d1d5db;">¿Cómo ver el kárdex de inventario? 📄</td>
      <td style="padding: 7px 10px; border: 1px solid #d1d5db;"><a href="https://youtu.be/XWo2kdtXhTY?si=wXFc-tOy2mWENXa8" target="_blank" rel="noopener noreferrer" style="color: #eb5454; text-decoration: underline; word-break: break-all;">https://youtu.be/XWo2kdtXhTY?si=wXFc-tOy2mWENXa8</a></td>
    </tr>
    <tr>
      <td style="padding: 7px 10px; border: 1px solid #d1d5db;">¿Cómo aperturar caja? 💰</td>
      <td style="padding: 7px 10px; border: 1px solid #d1d5db;"><a href="https://youtu.be/SD-8vguX89M?si=S2-PMcHO-WSonuFp" target="_blank" rel="noopener noreferrer" style="color: #eb5454; text-decoration: underline; word-break: break-all;">https://youtu.be/SD-8vguX89M?si=S2-PMcHO-WSonuFp</a></td>
    </tr>
    <tr style="background-color: #fafafa;">
      <td style="padding: 7px 10px; border: 1px solid #d1d5db;">¿Cómo cerrar caja? 💰</td>
      <td style="padding: 7px 10px; border: 1px solid #d1d5db;"><a href="https://youtu.be/U3CI98ky6J0?si=_t8lqqHNvXhUqTdA" target="_blank" rel="noopener noreferrer" style="color: #eb5454; text-decoration: underline; word-break: break-all;">https://youtu.be/U3CI98ky6J0?si=_t8lqqHNvXhUqTdA</a></td>
    </tr>
    <tr>
      <td style="padding: 7px 10px; border: 1px solid #d1d5db;">¿Cómo registrar un pedido de PedidosYa o Rappi? 📲</td>
      <td style="padding: 7px 10px; border: 1px solid #d1d5db;"><a href="https://youtu.be/9MydaU3mDTU?si=o6R3KNEdMEACw78h" target="_blank" rel="noopener noreferrer" style="color: #eb5454; text-decoration: underline; word-break: break-all;">https://youtu.be/9MydaU3mDTU?si=o6R3KNEdMEACw78h</a></td>
    </tr>
    <tr style="background-color: #fafafa;">
      <td style="padding: 7px 10px; border: 1px solid #d1d5db;">¿Cómo mover una mesa? 🔄</td>
      <td style="padding: 7px 10px; border: 1px solid #d1d5db;"><a href="https://youtu.be/FRe96ByPZxM?si=MXSUOl1VE0yVWOdM" target="_blank" rel="noopener noreferrer" style="color: #eb5454; text-decoration: underline; word-break: break-all;">https://youtu.be/FRe96ByPZxM?si=MXSUOl1VE0yVWOdM</a></td>
    </tr>
    <tr>
      <td style="padding: 7px 10px; border: 1px solid #d1d5db;">¿Cómo cambiar el nombre de un producto para mi comprobante de venta electrónico? 📝</td>
      <td style="padding: 7px 10px; border: 1px solid #d1d5db;"><a href="https://youtu.be/zDpZ4-uWMJc?si=jOkHB--8OGUn7qjr" target="_blank" rel="noopener noreferrer" style="color: #eb5454; text-decoration: underline; word-break: break-all;">https://youtu.be/zDpZ4-uWMJc?si=jOkHB--8OGUn7qjr</a></td>
    </tr>
  </tbody>
</table>
`,

    // PÁGINA 8: TUTORIALES DE YOUTUBE (PARTE 3)
    `
${headerLogoHtml}

<table style="width: 100%; border-collapse: collapse; font-size: 11.5px; border: 1px solid #d1d5db;">
  <thead>
    <tr style="background-color: #eb5454; color: #fff;">
      <th style="width: 45%; padding: 8px 12px; border: 1px solid #d1d5db; text-align: center; color: #fff; font-size: 12px;">Tutorial</th>
      <th style="width: 55%; padding: 8px 12px; border: 1px solid #d1d5db; text-align: center; color: #fff; font-size: 12px;">Enlace</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding: 7px 10px; border: 1px solid #d1d5db;">¿Cómo aplicar descuento a un producto? 🏷️</td>
      <td style="padding: 7px 10px; border: 1px solid #d1d5db;"><a href="https://youtu.be/U5eX_8jTDgY?si=H7U9yRSBJCypStVo" target="_blank" rel="noopener noreferrer" style="color: #eb5454; text-decoration: underline; word-break: break-all;">https://youtu.be/U5eX_8jTDgY?si=H7U9yRSBJCypStVo</a></td>
    </tr>
    <tr style="background-color: #fafafa;">
      <td style="padding: 7px 10px; border: 1px solid #d1d5db;">¿Cómo aplicar un descuento a todo mi pedido? 🏷️</td>
      <td style="padding: 7px 10px; border: 1px solid #d1d5db;"><a href="https://youtu.be/llZV8dp1syA?si=73bM1QqpQjWpm9UV" target="_blank" rel="noopener noreferrer" style="color: #eb5454; text-decoration: underline; word-break: break-all;">https://youtu.be/llZV8dp1syA?si=73bM1QqpQjWpm9UV</a></td>
    </tr>
    <tr>
      <td style="padding: 7px 10px; border: 1px solid #d1d5db;">¿Cómo dar una cortesía completa? 🎁</td>
      <td style="padding: 7px 10px; border: 1px solid #d1d5db;"><a href="https://youtu.be/AXgsL2WLEIs?si=6AgM33O5DLKlWu6Q" target="_blank" rel="noopener noreferrer" style="color: #eb5454; text-decoration: underline; word-break: break-all;">https://youtu.be/AXgsL2WLEIs?si=6AgM33O5DLKlWu6Q</a></td>
    </tr>
    <tr style="background-color: #fafafa;">
      <td style="padding: 7px 10px; border: 1px solid #d1d5db;">¿Cómo dividir cuenta por productos? ✂️</td>
      <td style="padding: 7px 10px; border: 1px solid #d1d5db;"><a href="https://youtu.be/lCa6ip__usc?si=HE5KfVXP9r6mocIz" target="_blank" rel="noopener noreferrer" style="color: #eb5454; text-decoration: underline; word-break: break-all;">https://youtu.be/lCa6ip__usc?si=HE5KfVXP9r6mocIz</a></td>
    </tr>
    <tr>
      <td style="padding: 7px 10px; border: 1px solid #d1d5db;">¿Cómo dividir cuenta por montos? ✂️</td>
      <td style="padding: 7px 10px; border: 1px solid #d1d5db;"><a href="https://youtu.be/H8Yp0EQCuro?si=eOuDEQTPNOMQaMGX" target="_blank" rel="noopener noreferrer" style="color: #eb5454; text-decoration: underline; word-break: break-all;">https://youtu.be/H8Yp0EQCuro?si=eOuDEQTPNOMQaMGX</a></td>
    </tr>
    <tr style="background-color: #fafafa;">
      <td style="padding: 7px 10px; border: 1px solid #d1d5db;">¿Cómo cambiar el medio de pago de una venta? 💵</td>
      <td style="padding: 7px 10px; border: 1px solid #d1d5db;"><a href="https://youtu.be/wIVYEN2lG3E?si=rwe-AqCN0Yu2WRGX" target="_blank" rel="noopener noreferrer" style="color: #eb5454; text-decoration: underline; word-break: break-all;">https://youtu.be/wIVYEN2lG3E?si=rwe-AqCN0Yu2WRGX</a></td>
    </tr>
    <tr>
      <td style="padding: 7px 10px; border: 1px solid #d1d5db;">¿Cómo hacer un comprobante de venta electrónico por consumo? 🧾</td>
      <td style="padding: 7px 10px; border: 1px solid #d1d5db;"><a href="https://youtu.be/U-kLc65qoKg?si=NuUGff4cn1_Rpcvu" target="_blank" rel="noopener noreferrer" style="color: #eb5454; text-decoration: underline; word-break: break-all;">https://youtu.be/U-kLc65qoKg?si=NuUGff4cn1_Rpcvu</a></td>
    </tr>
    <tr style="background-color: #fafafa;">
      <td style="padding: 7px 10px; border: 1px solid #d1d5db;">¿Cómo hacer un comprobante de venta electrónico por glosa? 🧾</td>
      <td style="padding: 7px 10px; border: 1px solid #d1d5db;"><a href="https://youtu.be/2Np51QFi7pE?si=wcbMZCpGvygSMplQ" target="_blank" rel="noopener noreferrer" style="color: #eb5454; text-decoration: underline; word-break: break-all;">https://youtu.be/2Np51QFi7pE?si=wcbMZCpGvygSMplQ</a></td>
    </tr>
    <tr>
      <td style="padding: 7px 10px; border: 1px solid #d1d5db;">¿Cómo enviar un comprobante por correo o WhatsApp? 📩</td>
      <td style="padding: 7px 10px; border: 1px solid #d1d5db;"><a href="https://youtu.be/LIwf62k48XU?si=vHt2RBnI10JAVJNK" target="_blank" rel="noopener noreferrer" style="color: #eb5454; text-decoration: underline; word-break: break-all;">https://youtu.be/LIwf62k48XU?si=vHt2RBnI10JAVJNK</a></td>
    </tr>
    <tr style="background-color: #fafafa;">
      <td style="padding: 7px 10px; border: 1px solid #d1d5db;">¿Cómo hacer una venta al crédito? 💳</td>
      <td style="padding: 7px 10px; border: 1px solid #d1d5db;"><a href="https://youtu.be/jxRReJbF7f8?si=0Z8EF1g9GfgYrj9Q" target="_blank" rel="noopener noreferrer" style="color: #eb5454; text-decoration: underline; word-break: break-all;">https://youtu.be/jxRReJbF7f8?si=0Z8EF1g9GfgYrj9Q</a></td>
    </tr>
    <tr>
      <td style="padding: 7px 10px; border: 1px solid #d1d5db;">¿Cómo pagar una venta al crédito? 💵</td>
      <td style="padding: 7px 10px; border: 1px solid #d1d5db;"><a href="https://youtu.be/fwKCn4O_Jjg?si=-5x-opgNTzdLk1Jo" target="_blank" rel="noopener noreferrer" style="color: #eb5454; text-decoration: underline; word-break: break-all;">https://youtu.be/fwKCn4O_Jjg?si=-5x-opgNTzdLk1Jo</a></td>
    </tr>
  </tbody>
</table>
`,
  ];
}
