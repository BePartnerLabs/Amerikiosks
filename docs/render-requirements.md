# Qué pedirle a quien hace los renders

Para pasarle a la persona que produce las máquinas en Blender. Está fuera del
equipo y fuera de este repositorio, así que este documento está escrito para que
se entienda **sin abrir el código**: sin rutas, sin nombres de componentes, y con
el porqué solo donde evita un error.

Son **dos entregables independientes**. Se pueden pedir y entregar por separado, y
hoy el primero es el que hace falta.

---

## 1. Imágenes fijas — una por familia

Se usan en el listado de máquinas, donde la máquina **se sale por arriba de su
tarjeta**. Ese efecto es todo el motivo de este pedido.

| Requisito | Detalle |
|---|---|
| Recorte | **A ras en los cuatro lados**, sin margen transparente |
| Proporción | La natural de cada máquina, **sin lienzo común** |
| Formato | PNG con transparencia |
| Tamaño | Lado largo mínimo **1600 px** |
| Sombra | **Sin sombra de piso quemada** en el archivo |
| Cámara | La misma para las cinco |

**Por qué el recorte a ras es el punto crítico.** Los archivos que tenemos hoy son
cuadrados de 1920×1920 donde la máquina ocupa entre el **29% y el 53%** del ancho;
el resto es transparencia. Con ese aire alrededor la máquina nunca llega al borde
de su caja, así que no hay nada que pueda asomar. Medido sobre los cinco archivos
actuales:

| Familia | Contenido real | Ocupa |
|---|---|---|
| Alpha | 935×1564 | 49% |
| Gamma | 961×1547 | 50% |
| Delta | 781×1533 | 41% |
| **Zeta** | **555×1507** | **29%** |
| Kappa | 1016×1533 | 53% |

**Por qué sin sombra quemada.** La sombra la pone el sitio por CSS. Una incluida
en el PNG se duplica, y además obliga a dejar margen debajo de la máquina, que es
exactamente lo que el recorte a ras viene a eliminar.

Son cinco: Alpha, Gamma, Delta, Zeta y Kappa.

---

## 2. Animaciones de rotación — una por modelo

La máquina gira **mientras el visitante baja por la página**. No es un video ni un
bucle: es una secuencia de imágenes que avanza con el scroll y **se queda quieta
en el último fotograma** cuando se termina de bajar.

Eso tiene una consecuencia que conviene decirle: **el último fotograma es la pose
final que queda en pantalla**, así que conviene que se sostenga sola. No vuelve al
primero.

| Requisito | Detalle |
|---|---|
| Cantidad | 90 fotogramas *(ver «Pendiente de confirmar»)* |
| Recorrido | El mismo que la secuencia ya entregada de la Gamma 13 |
| Formato | PNG con transparencia |
| Nombres | Numerados correlativamente; **el prefijo no importa** |
| Tamaño | Ancho mínimo **1600 px** |
| Sombra | Sin sombra de piso quemada |
| Cámara | La misma para todos los modelos |

**Sobre los nombres:** nuestro script de conversión toma los dígitos del final del
nombre e ignora lo que venga antes, así que sirve lo que escriba Blender —
`0001.png`, `10001.png` o `v0.010001.png` funcionan igual. No hace falta que
renombre nada.

**Sobre el tamaño:** pedimos 1600 y publicamos a 1200. A 1600 con calidad 90 la
secuencia pesa 4,8 MB; a 1200 con calidad 80 pesa 2,3 MB y a tamaño de pantalla no
se distingue, porque el área donde se ve mide unos 700 px.

---

## 3. El archivo de cotas (va con las animaciones)

Junto a los fotogramas necesitamos un `anchors.json` que diga, **para cada
fotograma**, dónde caen las cuatro esquinas del gabinete dentro de la imagen.

- Coordenadas normalizadas de **0 a 1**.
- Origen **arriba a la izquierda**.

Con eso el sitio dibuja las flechas de medidas encima de la máquina, siguiéndola
mientras gira.

**Los números los pone el sitio, no el JSON.** Salen de la ficha técnica cargada en
el panel. El JSON solo dice *dónde* va cada flecha; la ficha dice *qué* se lee. Es
deliberado: la geometría del modelo trae tolerancias de CAD, y la ficha es lo que
el operador va a medir contra su puerta.

Si esta parte complica, **se puede entregar después**: la animación funciona igual,
solo que sin las cotas dibujadas.

---

## Pendiente de confirmar con él

Tres cosas que este documento no puede afirmar porque el pipeline de Blender vive
en su repositorio y no en el nuestro:

- **Cuántos grados recorre la cámara.** La secuencia se consume como scrub, así que
  una vuelta completa no es un requisito técnico — media vuelta funcionaría igual.
  El dato correcto es el que él usó en la Gamma 13.
- **Si 90 fotogramas es el estándar o fue circunstancial.** Hay registro de una
  exportación anterior de 60. Si hay una razón para 90, va escrita; si no, se pide
  «los mismos que la Gamma 13».
- **Si el `anchors.json` lo produce su script solo** o es un paso aparte. Si es
  automático, ni hace falta mencionárselo.

Mientras no estén confirmadas, **la referencia es la Gamma 13**: ya está publicada
y funcionando, así que «igual que esa» es una especificación válida y verificable.

---

## Lo que no va en el mensaje

El versionado de carpetas, la conversión a WebP y la subida son nuestros. Él
entrega los fotogramas y las imágenes; el resto lo hace el equipo.
