# Qué pedirle a quien hace los renders

Para la persona que produce las máquinas en Blender. Está fuera del equipo y
fuera de este repositorio, así que está escrito para entenderse **sin abrir el
código**: sin rutas, sin nombres de componentes, y con el porqué solo donde evita
un error.

Son **dos entregables independientes**. Se pueden pedir y entregar por separado, y
hoy el primero es el urgente.

> **Este documento es el «qué pedir», no el «cómo hacerlo».**
>
> La definición técnica —cámara completa, curvas, iluminación, formato de salida y
> un CSV con giro, focal y desplazamiento fotograma por fotograma— está acá:
> **https://claude.ai/code/artifact/1fc366db-aa99-4d68-bc51-5be9cf31bf6d**
>
> Ese es el documento que se le manda para que reproduzca la escena. Éste sirve
> para saber **qué pedirle y en qué orden**, y a propósito no repite sus números:
> dos documentos con los mismos valores terminan diciendo cosas distintas.

---

## 1. Imágenes fijas — una por familia

Se usan en el listado de máquinas, donde la máquina **se sale por arriba de su
tarjeta**. Ese efecto es todo el motivo del pedido.

| Requisito | Detalle |
|---|---|
| Recorte | **A ras en los cuatro lados**, sin margen transparente |
| Proporción | La natural de cada máquina, **sin lienzo común** |
| Formato | PNG con transparencia |
| Tamaño | Lado largo mínimo **1600 px** |
| Sombra | **Sin sombra de piso quemada** en el archivo |
| Cámara | La misma para las cinco |

**Por qué el recorte a ras es el punto crítico.** Los archivos de hoy son cuadrados
de 1920×1920 donde la máquina ocupa entre el **29% y el 53%** del ancho; el resto
es transparencia. Con ese aire la máquina nunca llega al borde de su caja, así que
no hay nada que pueda asomar. Medido sobre los cinco archivos actuales:

| Familia | Contenido real | Ocupa |
|---|---|---|
| Alpha | 935×1564 | 49% |
| Gamma | 961×1547 | 50% |
| Delta | 781×1533 | 41% |
| **Zeta** | **555×1507** | **29%** |
| Kappa | 1016×1533 | 53% |

**Por qué sin sombra quemada.** La pone el sitio por CSS. Una incluida en el PNG se
duplica, y además obliga a dejar margen debajo de la máquina — justo lo que el
recorte a ras viene a eliminar.

Son cinco: Alpha, Gamma, Delta, Zeta y Kappa.

---

## 2. Animaciones de rotación — una por modelo

La máquina gira **mientras el visitante baja por la página**. No es un video ni un
bucle: es una secuencia de imágenes que avanza con el scroll y **se queda quieta en
el último fotograma** cuando se termina de bajar. No vuelve al primero.

### El recorrido no es una vuelta completa

**Son 140°, centrados en el frente.** En la Gamma 13, de −22,5° a +117,5°.

Y esto es lo que más importa que le quede claro, porque es lo que alguien
"corrige" a 360° por sentido común: **con una vuelta completa las dos puntas del
recorrido caen en el perfil angosto de la máquina.** Eso da un mal primer
fotograma —que es el que se ve antes de empezar a bajar— y un mal fotograma de
cierre, que es el que queda en pantalla al terminar. Con 140° centrados en el
frente, arranca y termina en tres cuartos, con volumen.

**El centro es por modelo, no se hereda.** La Gamma 13 va centrada en 47,5° y la
Kappa 13 en 37,5°, porque el frente de cada máquina cae en un ángulo distinto.

### La cantidad de fotogramas es una decisión, no un requisito

90 es **lo que se usó**, no un número obligatorio: no hay ninguna justificación de
90 escrita en el pipeline, y el default del script es 60.

Lo que sí es criterio: **el conteo es la resolución del giro.** Con 140° en 90
fotogramas el paso es de **1,57° por fotograma**; con 60 sería 2,33°. Y el peso
escala lineal — 2,3 MB la secuencia terminada. Si propone otro número, esos son los
dos ejes del canje, no hay un valor mágico.

### Un requisito duro que depende del conteo

En un arco parcial como éste, **la última clave de animación va en el fotograma N**,
no en N+1. El N+1 solo corresponde en una vuelta completa de 360°, donde repetiría
al primero. Si arma la animación con la última clave en N+1 sobre un arco parcial,
**el recorrido queda corto y el cierre no llega al ángulo final.**

### El resto

| Requisito | Detalle |
|---|---|
| Formato | PNG con transparencia |
| Nombres | Numerados correlativamente; **el prefijo no importa** |
| Tamaño | Ancho mínimo **1600 px** |
| Sombra | Sin sombra de piso quemada |

**Sobre los nombres:** nuestro conversor toma los dígitos del final e ignora lo que
venga antes, así que sirve lo que escriba Blender — `0001.png`, `10001.png` o
`v0.010001.png` funcionan igual. No hace falta renombrar nada.

**Sobre el tamaño:** pedimos 1600 y publicamos a 1200. A 1600 con calidad 90 la
secuencia pesa 4,8 MB; a 1200 con calidad 80 pesa 2,3 MB, y a tamaño de pantalla no
se distingue porque el área donde se ve mide unos 700 px.

---

## 3. Las cotas — no se las pedimos, pero necesitamos su cámara

Sobre la máquina que gira se dibujan las flechas de medidas, que la siguen mientras
rota. Salen de un archivo de anclajes que dice, fotograma por fotograma, dónde caen
las **ocho esquinas de la caja** del gabinete y qué par une cada cota.

**Ese archivo lo generamos nosotros**, en la misma corrida que produce los
fotogramas. No es un paso manual y no hay que pedírselo.

### Puede cambiar el encuadre

No está obligado a clavar nuestra cámara. **Los anclajes se recalculan contra
cualquier cámara** — están comprobados contra una escena con otra posición, otro
azimut, otra focal y otro barrido, y salieron correctos.

Reproducir nuestra cámara sigue siendo **lo recomendable**, porque la Gamma 13 ya
está publicada con ella y es lo que hace que las máquinas se vean de la misma
familia. Pero es una recomendación estética, no una restricción técnica.

### Si la cambia, necesitamos su cámara — no alcanza con los fotogramas

Sirve cualquiera de estas tres:

- La **cámara exportada con su animación**, en FBX o Alembic.
- El **archivo de escena**, si trabaja en Blender.
- Los **números planos**: posición y rotación de cámara, sensor, y focal,
  desplazamiento y giro fotograma por fotograma. Es el mismo formato del CSV que
  se le pasa, pero al revés.

**Lo único irrecuperable es no tener nada de eso.** De los PNG solos habría que
resolver la cámara por match-move contra el modelo, que es frágil y aproximado — y
no vale la pena cuando alcanza con que adjunte un archivo.

### Dos condiciones que se mantienen pase lo que pase

- La máquina **apoyada en z=0 y centrada sobre el eje de giro**.
- **Cuadro cuadrado.** Si cambia la relación de aspecto cambia la proyección, y hay
  que saberlo de antemano.

### Los números los pone la ficha, no la geometría

El archivo de anclajes trae la medida de la malla, y sirve para **ubicar** la
flecha. El número que se **muestra** sale de la ficha del fabricante cargada en el
panel: el modelo trae tolerancias de CAD, y la ficha es lo que el operador va a
medir contra su puerta.

---

## Estado, para no pedir de más

- **Gamma 13** — secuencia publicada y funcionando. Es la referencia: «igual que
  esa» es una especificación válida y verificable.
- **Kappa 13** — ya renderizada, 90 fotogramas a 1600 px. **No se puede publicar
  todavía porque falta su ficha técnica**, sin la cual las cotas quedan sin número.
- **Las cinco imágenes fijas** — ninguna entregada. Es lo que hay que pedir ahora.

---

## Lo que no va en el mensaje

El versionado de carpetas, la conversión a WebP y la subida son nuestros. Él
entrega fotogramas e imágenes; el resto lo hace el equipo.
