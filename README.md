# Corte del día en tiempo real · Licencias Félix Cuevas

Los tres capturan durante el día en `index.html` (computadora o celular). Tu `Final.html` se va llenando solo con esos datos. Al cierre, solo se escriben los folios finales, se revisa que el cuadre esté en verde y se imprime con los botones de siempre.

## Archivos

| Archivo | Qué es |
|---|---|
| `index.html` | **Pantalla de captura** (nueva). Es la página que abre el enlace de GitHub Pages. |
| `Final.html`, `script.js`, `styles.css` | Tu corte, con los cambios de abajo. |
| `config.js` | **Aquí se pega la configuración de Firebase** (un solo lugar para las dos páginas). |
| `sync.js` | Guarda y lee los datos del día (Firebase o modo demostración). |
| `corte-sync.js` | Llena `Final.html` con la captura y guarda lo que escriban a mano. |
| `CDMX.jpg`, `MAR.jpg`, `ajolote.jpg`, `acta.jpg` | Logos para la impresión. |
| `database.rules.json` | Reglas de seguridad para Firebase. |

## Uso diario

**Ventanillas**
- Folios iniciales de micas verdes y moradas, hasta 2 series de cada una. Al dar «Aceptar», el folio queda bloqueado. Si hay que corregirlo, se tocan dos veces «Corregir».
- Cuando la persona pasa a foto: se toca la **casilla azul** de la hora actual → **HC / HS / MC / MS** → **trámite**. La casilla guarda la hora exacta de la marca.
- Dentro de la misma hora se puede quitar una marca (pide confirmación). Cuando pasa la hora, la columna se bloquea.
- **Mica cancelada:** verde o morada + folio → «Registrar».

**Oficial**
- En la mañana: citas registradas de SEMOVI (y de Finanzas, si quiere).
- Durante el día: «+ Llegó» por cada cita de SEMOVI o de Finanzas que llega.

**Reportes de las 12:00 y 15:00**
- A las **11:50 y 14:50** aparece un aviso rojo arriba en las tres pantallas y suena un pitido corto.
- En «Reportes a superiores» solo se escriben **personas en fila** y **operadores en turno**. Lo demás sale de la captura:
  - Nueva permanente = NP + Rep. NP
  - Impresiones digitales a físicas = Digital 3 años + Digital NP
  - Otras licencias = todas las verdes que no son digitales
- «Copiar mensaje» deja el texto listo para pegarlo en WhatsApp o en un correo. «Marcar como enviado» guarda las cifras de ese momento y quita el aviso para los tres.

**Cierre**
- «Mostrar Corte Final» abre `Final.html` del día.
- Escriban los **folios finales** viendo la última mica física. El badge del módulo 1 dice si cuadra.
- Lo demás (adultos mayores, grupos vulnerables, etc.) se escribe a mano en `Final.html` como siempre, y también se guarda en Firebase.
- Imprimir con los botones de siempre. Para el formato físico, entra primero al módulo 6.

## Qué se llena solo en Final.html (campos con borde azul)

- **Módulo 1:** folios iniciales; afluencia H/M por hora (H = HC + HS, M = MC + MS); el desglose de los 10 trámites; canceladas y **sus folios**.
- **Módulo 4:** total de citas SEMOVI, citas SEMOVI atendidas y **citas de Finanzas atendidas** (campo nuevo).
- **Módulos 5, 6 y 7:** se calculan con tu propio `script.js`, igual que antes.
- **Tesorería y Actas:** quedan en 0. La carátula sigue disponible.

## Cambios a tus archivos

- **Folios cancelados** (la corrección que pediste): aparecen en el módulo 1, en el módulo 4, en el reporte impreso del módulo 6 («FOLIOS CANCELADOS»), en las alertas del módulo 7 y en «Mostrar en texto simple».
- **Fecha del corte:** si se abre un día anterior (`Final.html?fecha=2026-11-22`), la fecha impresa y el nombre del PDF usan ese día.
- **Gráfica de barras:** a veces calculaba alturas negativas cuando los datos cambiaban muy seguido. Ya está corregido.
- **Diseño e impresión:** no se tocaron. En `styles.css` solo se agregaron estilos al final.

## Configuración (una sola vez)

1. En <https://console.firebase.google.com>, crea un proyecto.
2. **Realtime Database** → crear → *Modo bloqueado* → en **Reglas**, pega `database.rules.json`.
3. **Authentication** → activa *Correo electrónico/contraseña* → da de alta a los tres (o una cuenta compartida del módulo).
4. **Configuración del proyecto** → *Tus apps* → `</>` → copia `firebaseConfig` y pégalo en **`config.js`**.
5. Sube **todos** los archivos a un repositorio de GitHub → **Settings → Pages** → rama `main`, carpeta raíz.
6. En Firebase → **Authentication → Dominios autorizados**, agrega `TU_USUARIO.github.io`.

Mientras `config.js` diga `PEGA_AQUI`, todo funciona en **modo demostración**: los datos se quedan en ese navegador. Sirve para probar abriendo la captura y el corte en dos pestañas.
