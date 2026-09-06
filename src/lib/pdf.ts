export async function openPdfFromFetcher(
  fetcher: () => Promise<Blob>,
  title = "Generando PDF..."
): Promise<void> {
  // 1. Abrir la ventana emergente sincrónicamente con el clic del usuario (evita bloqueadores de pop-ups)
  const previewWindow = window.open("", "_blank");

  if (previewWindow) {
    try {
      previewWindow.document.write(`
        <!DOCTYPE html>
        <html lang="es">
          <head>
            <meta charset="utf-8" />
            <title>${title}</title>
            <style>
              body {
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                margin: 0;
                font-family: system-ui, -apple-system, sans-serif;
                background-color: #f8fafc;
                color: #334155;
              }
              .card {
                text-align: center;
                padding: 24px;
                background: #ffffff;
                border-radius: 8px;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
              }
              .spinner {
                width: 32px;
                height: 32px;
                border: 3px solid #e2e8f0;
                border-top-color: #2563eb;
                border-radius: 50%;
                animation: spin 0.8s linear infinite;
                margin: 0 auto 16px;
              }
              @keyframes spin {
                to { transform: rotate(360deg); }
              }
            </style>
          </head>
          <body>
            <div class="card">
              <div class="spinner"></div>
              <h3 style="margin: 0 0 8px; font-size: 18px; color: #0f172a;">${title}</h3>
              <p style="margin: 0; color: #64748b; font-size: 14px;">Por favor espera unos segundos mientras se prepara el documento.</p>
            </div>
          </body>
        </html>
      `);
    } catch {
      // Ignorar errores menores al escribir en la ventana en blanco
    }
  }

  try {
    const blob = await fetcher();

    // Validar si el backend devolvió JSON de error en lugar de un PDF
    if (blob.type === "application/json" || blob.size < 100) {
      const text = await blob.text();
      let message = "El servidor devolvió una respuesta no válida.";
      try {
        const json = JSON.parse(text);
        if (json.message) message = json.message;
      } catch {
        // no es json parseable
      }
      if (previewWindow && !previewWindow.closed) {
        previewWindow.close();
      }
      throw new Error(message);
    }

    const url = URL.createObjectURL(blob);

    if (previewWindow && !previewWindow.closed) {
      previewWindow.location.href = url;
    } else {
      window.open(url, "_blank", "noopener,noreferrer");
    }

    window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
  } catch (error) {
    if (previewWindow && !previewWindow.closed) {
      previewWindow.close();
    }
    throw error;
  }
}
