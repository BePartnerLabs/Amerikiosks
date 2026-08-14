#!/usr/bin/env python3
"""
Renders a machine hero frame sequence out of `template-turntable.blend`, headless.

Empezo siendo un turntable -- una vuelta de 360 grados -- y termino siendo otra
cosa: un barrido parcial que se detiene sobre el frente con un zoom, mas los
anclajes para las cotas. El `.blend` conserva el nombre viejo porque es un
archivo del usuario fuera del repo; los campos `useRotationHero`, `sequencePath`
y `RotationScrubHero` tambien, porque son columnas en produccion y renombrarlos
costaria una migracion a cambio de nada.

This is the first half of the pipeline that ends in `scripts/build-frame-sequence.mjs`:
Blender writes numbered PNGs here, that script turns them into `frame-NNN.webp`
for the scrub hero (`src/components/MachineHero/RotationScrubHero.tsx`).

    /Applications/Blender.app/Contents/MacOS/Blender -b ~/template-turntable.blend \
      --python scripts/blender/machine-sequence.py -- \
      --frames 90 --zoom 85:130 --out ~/Documents/gamma13-hero/v0.01

    # barrido simple, sin zoom
    ... -- --frames 60 --out ~/Documents/gamma12/v0.02

    # solo el frame del pico, para chequear que la maquina no se sale del cuadro
    ... -- --frames 90 --zoom 85:130 --out ~/Documents/gamma13-hero/v0.01 --peek 46

## Por que 360 grados se cierran en N+1 y no en N

El `Empty` gira 0 a 2*pi entre el frame 0 y el frame 61, y la escena renderiza
1..60. El valor en el frame f es 360*f/61, asi que el frame 60 esta a 354.1 y el
frame 1 a 5.9: el salto de vuelta al principio mide lo mismo que cualquier otro
paso. Si el key final estuviera en N, el ultimo frame repetiria el primero y el
loop tendria un hipo de un frame. Para N frames el key va en N+1, siempre.

## La trampa de la API en Blender 5.2

Blender 5.x guarda las curvas en *slotted actions*: `action.fcurves` viene vacio
o no existe, y un loop sobre el falla en silencio -- no tira error, simplemente
no encuentra nada y el script "funciona" sin haber tocado ninguna curva. Las
fcurves reales cuelgan de `action.layers[].strips[].channelbags[].fcurves`. De
ahi el helper `fcurves_of()`; no lo cambies por `action.fcurves` a secas.

## Lo que este script NO hace

No guarda el .blend. La escena en disco queda intacta, asi que dos corridas con
parametros distintos no se pisan y nadie hereda el frame range de la anterior.
"""

import argparse
import json
import math
import os
import sys

import bpy
from bpy_extras.object_utils import world_to_camera_view
from mathutils import Vector

# Nombres de la escena. Vienen del FBX del fabricante mas la limpieza manual
# documentada en el handoff -- si un modelo nuevo los trae distintos, se
# renombra en Blender antes de correr esto, no se parametriza aca.
PIVOT = "Empty"
KEY_LIGHT = "KEY"

# La receta por modelo. Vive al lado de este archivo y no dentro de el porque es
# dato, no codigo: agregar una maquina no deberia tocar el script.
MANIFEST = os.path.join(os.path.dirname(os.path.abspath(__file__)), "machines.json")

# Clave del manifiesto -> destino de argparse. Solo los parametros de recorrido:
# `--out` y `--anchors` son de cada corrida, no del modelo.
MANIFEST_KEYS = {
    "frames": "frames",
    "sweepDeg": "sweep_deg",
    "centerDeg": "center_deg",
    "zoom": "zoom",
    "hold": "hold",
    "shiftPeak": "shift_peak",
    "bodyTop": "body_top",
    "keyLight": "key_light",
    "width": "width",
    "peakFrame": "peak_frame",
}


def manifest_defaults(slug: str) -> dict:
    """Los valores de un modelo, listos para `set_defaults`.

    Se aplican como *defaults*, no como valores: un flag explicito en la linea
    de comandos los pisa. Asi probar una variante no obliga a editar el JSON ni
    a recordar que el archivo existe.
    """
    try:
        with open(MANIFEST, encoding="utf-8") as handle:
            data = json.load(handle)
    except FileNotFoundError:
        raise SystemExit(f"no existe el manifiesto {MANIFEST}")
    except json.JSONDecodeError as err:
        raise SystemExit(f"{MANIFEST} no es JSON valido: {err}")

    machines = data.get("machines", {})
    if slug not in machines:
        conocidas = ", ".join(sorted(machines)) or "(ninguna)"
        raise SystemExit(f"--machine {slug} no esta en {MANIFEST}. Hay: {conocidas}")

    recipe = machines[slug]
    desconocidas = set(recipe) - set(MANIFEST_KEYS) - {"source", "notes"}
    if desconocidas:
        # Un typo en una clave se traduciria en un render con el default
        # equivocado y sin ninguna señal, que es justo el fallo que este
        # archivo existe para evitar.
        raise SystemExit(f"claves sin uso en la receta de {slug}: {', '.join(sorted(desconocidas))}")

    return {dest: recipe[key] for key, dest in MANIFEST_KEYS.items() if key in recipe}


def parse_args() -> argparse.Namespace:
    # Blender se come todo lo que va antes de `--`.
    argv = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else []

    parser = argparse.ArgumentParser(prog="machine-sequence.py")
    parser.add_argument(
        "--machine",
        default=None,
        help="slug en machines.json; carga su receta, y cualquier otro flag la pisa",
    )
    parser.add_argument("--out", required=True, help="prefijo de salida, ej. ~/Documents/gamma13-hero/v0.01")
    parser.add_argument("--frames", type=int, default=60, help="cantidad de frames a renderizar")
    parser.add_argument("--zoom", default=None, metavar="A:B", help="focal inicial:pico, ej. 85:130")
    parser.add_argument("--key-light", choices=("on", "off"), default="on")
    parser.add_argument("--sweep-deg", type=float, default=360.0, help="cuanto gira en total, default la vuelta entera")
    parser.add_argument("--start-deg", type=float, default=0.0, help="angulo en el primer frame")
    parser.add_argument(
        "--center-deg",
        type=float,
        default=None,
        help="angulo que tiene que caer en el medio del recorrido; pisa a --start-deg",
    )
    parser.add_argument("--peak-frame", type=float, default=None, help="frame del pico, default el del medio")
    parser.add_argument(
        "--hold",
        type=float,
        default=0.0,
        help="fraccion del recorrido que se queda quieta en el pico, ej. 0.4",
    )
    parser.add_argument("--peek", default=None, metavar="F[,F...]", help="renderiza solo esos frames y sale")
    parser.add_argument("--width", type=int, default=None, help="resolucion cuadrada, default la de la escena")
    parser.add_argument(
        "--shift-peak",
        type=float,
        default=None,
        help="shift_y de camara en el pico; sube el encuadre para que el zoom no corte por arriba",
    )
    parser.add_argument("--anchors", default=None, metavar="FILE.json", help="exporta los anclajes de cota proyectados")
    parser.add_argument(
        "--body-top",
        type=float,
        default=1.956,
        help="altura en metros donde termina el gabinete; lo que arranca por encima es topper",
    )
    parser.add_argument("--dry-run", action="store_true", help="no renderiza; util para exportar solo los anclajes")

    # Dos pasadas: la primera solo para saber si hay `--machine`, porque su
    # receta tiene que quedar como default *antes* de parsear de verdad. Al reves
    # no funciona: argparse no distingue un valor que pusiste tu de uno que vino
    # del default, asi que no habria forma de saber cual pisa a cual.
    #
    # Con un parser aparte y no con `parse_known_args` sobre este, que exigiria
    # `--out` en una pasada donde todavia no interesa.
    sniff = argparse.ArgumentParser(add_help=False)
    sniff.add_argument("--machine", default=None)
    preview, _ = sniff.parse_known_args(argv)
    if preview.machine:
        parser.set_defaults(**manifest_defaults(preview.machine))

    args = parser.parse_args(argv)

    if args.frames < 2:
        parser.error("--frames tiene que ser al menos 2")
    if args.peek is not None:
        try:
            args.peek = [int(v) for v in args.peek.split(",")]
        except ValueError:
            parser.error("--peek son numeros de frame separados por coma, ej. 1,24,46")
        for frame in args.peek:
            if not 1 <= frame <= args.frames:
                parser.error(f"--peek {frame} cae fuera del rango 1..{args.frames}")
    if args.zoom is not None:
        try:
            start, peak = (float(v) for v in args.zoom.split(":", 1))
        except ValueError:
            parser.error("--zoom se escribe A:B, ej. 85:130")
        args.zoom = (start, peak)
    if args.center_deg is not None:
        args.start_deg = args.center_deg - args.sweep_deg / 2.0

    return args


def fcurves_of(action):
    """Todas las fcurves de una action, con o sin slots (Blender 5.x)."""
    found = []
    for layer in getattr(action, "layers", []):
        for strip in layer.strips:
            for channelbag in strip.channelbags:
                found.extend(channelbag.fcurves)
    return found or list(getattr(action, "fcurves", []))


def action_of(datablock):
    anim = getattr(datablock, "animation_data", None)
    return anim.action if anim and anim.action else None


def arc_end_frame(frames: int, sweep_deg: float) -> float:
    """Frame donde el giro cierra su recorrido.

    La vuelta entera cierra en N+1 y no en N: el frame N+1 vuelve a mostrar lo
    mismo que el frame 1, asi que dejarlo fuera del render es lo que hace que el
    salto del ultimo frame al primero mida igual que cualquier otro paso. Si
    cerrara en N, el ultimo frame repetiria al primero y el loop tendria un hipo.

    Un arco parcial no vuelve sobre si mismo -- no hay frame repetido que sacar --
    y sus dos puntas son posiciones que si queremos ver, asi que cierra en N.
    """
    return float(frames + 1) if abs(sweep_deg) >= 360.0 else float(frames)


def set_rotation_arc(pivot, end_frame: float, start_deg: float, sweep_deg: float) -> None:
    """Reescribe el giro del pivote como un arco lineal del frame 1 a `end_frame`.

    Lineal no es cosmetico: con Bezier el giro acelera y frena, y atado al scroll
    se siente elastico -- el dedo se mueve parejo y la maquina no.

    Reescribe en vez de correr los keys que ya estan porque el template solo trae
    la vuelta entera desde cero, y cualquier otro recorrido -- medio giro centrado
    en el frente, por ejemplo -- necesita las dos puntas puestas a mano.
    """
    action = action_of(pivot)
    if action is None:
        raise SystemExit(f"'{pivot.name}' no tiene animacion; la escena no es el template esperado")

    spin = next(
        (c for c in fcurves_of(action) if c.data_path == "rotation_euler" and c.array_index == 2),
        None,
    )
    if spin is None:
        raise SystemExit(f"no encontre la curva de rotation_euler Z en '{pivot.name}'")

    # Las curvas de X e Y existen y valen cero; se aplanan al mismo rango para que
    # no queden keys sueltos mas alla del final del arco.
    for curve in fcurves_of(action):
        if curve.data_path != "rotation_euler" or curve.array_index == 2:
            continue
        for key in sorted(curve.keyframe_points, key=lambda k: k.co[0])[-1:]:
            key.co[0] = end_frame
        for key in curve.keyframe_points:
            key.interpolation = "LINEAR"
        curve.update()

    keys = sorted(spin.keyframe_points, key=lambda k: k.co[0])
    if len(keys) < 2:
        raise SystemExit(f"la curva de giro de '{pivot.name}' tiene menos de dos keys")

    for key, (frame, degrees) in zip(keys, ((1.0, start_deg), (end_frame, start_deg + sweep_deg))):
        key.co = (frame, math.radians(degrees))
        key.handle_left = (frame - 1, math.radians(degrees))
        key.handle_right = (frame + 1, math.radians(degrees))
        key.interpolation = "LINEAR"
    spin.update()


def animate_focal(
    camera,
    start: float,
    peak: float,
    peak_frame: float,
    end_frame: float,
    hold: float = 0.0,
) -> None:
    """Focal start -> peak -> start, con easing suave en cada parada.

    El zoom es por focal y no por dolly, asi que la perspectiva se comprime a
    medida que sube: es el efecto buscado, pero tambien agranda al sujeto. Que
    recorte en el pico es aceptable aca -- el pico esta puesto sobre el frente y
    el recorte es lo que convierte el plano general en un plano de producto.

    `hold` es la fraccion del recorrido que se queda quieta en el pico. Sin hold,
    el cierre del zoom es un instante y el ojo no llega a leer nada: la gracia es
    quedarse un rato mostrando producto, pantalla y tecnologia, y recien despues
    abrir a la maquina entera. Con dos keys del mismo valor y handles
    auto-clamped, el tramo del medio queda plano de verdad -- sin ese clamp,
    Bezier hace panza y el zoom sigue moviendose despacito donde deberia estar
    detenido.
    """
    ease_property(camera.data, "lens", start, peak, peak_frame, end_frame, hold)


def ease_property(
    datablock,
    prop: str,
    start: float,
    peak: float,
    peak_frame: float,
    end_frame: float,
    hold: float = 0.0,
    clear: bool = True,
) -> None:
    """Anima una propiedad start -> peak -> start con el mismo perfil de curva.

    Compartido entre el focal y el shift de camara a proposito: los dos tienen
    que moverse *exactamente* juntos. Si el shift usara otra curva, el reencuadre
    iria adelantado o atrasado respecto del zoom y la maquina se deslizaria
    dentro del cuadro en vez de quedarse quieta mientras se acerca.
    """
    if clear:
        # El template podria traer una curva de una corrida anterior en la UI. Se
        # descarta para que el resultado no dependa de lo que hubiera.
        if action_of(datablock) is not None:
            datablock.animation_data_clear()

    span = end_frame - 1.0
    dwell = max(0.0, min(hold, 1.0)) * span / 2.0
    stops = [(1.0, start), (peak_frame - dwell, peak)]
    if dwell > 0.0:
        stops.append((peak_frame + dwell, peak))
    stops.append((end_frame, start))

    for frame, value in stops:
        setattr(datablock, prop, value)
        datablock.keyframe_insert(prop, frame=frame)

    setattr(datablock, prop, start)

    for curve in fcurves_of(action_of(datablock)):
        if curve.data_path != prop:
            continue
        for key in curve.keyframe_points:
            key.interpolation = "BEZIER"
            key.handle_left_type = "AUTO_CLAMPED"
            key.handle_right_type = "AUTO_CLAMPED"
        curve.update()


def body_box(pivot, body_top: float):
    """Caja del gabinete en el espacio local del pivote, sin el topper.

    Medida sobre la malla, no tomada de la ficha. El modelo **no esta centrado en
    X**: su bounding box va de -1.135 a 0.793, o sea el centro cae en -0.171. Una
    caja ideal armada con los milimetros de la ficha y centrada en el pivote deja
    las cotas corridas 17 cm, apuntando al aire al lado de la maquina.

    El topper queda afuera a proposito. Vuela ~50 mm por lado sobre el gabinete y
    suma 431 mm de alto, asi que incluirlo daria 2387 mm donde la ficha dice 1956
    y la cota contradiria a la tabla de specs de al lado. Se separa por altura:
    todo lo que *empieza* por encima de `body_top` es topper.
    """
    to_local = pivot.matrix_world.inverted()
    lo = Vector((1e9, 1e9, 1e9))
    hi = Vector((-1e9, -1e9, -1e9))
    found = False

    for obj in bpy.data.objects:
        if obj.type != "MESH" or obj.hide_render:
            continue
        corners = [to_local @ (obj.matrix_world @ Vector(c)) for c in obj.bound_box]
        if min(c.z for c in corners) >= body_top:
            continue  # topper
        for corner in corners:
            for axis in range(3):
                lo[axis] = min(lo[axis], corner[axis])
                hi[axis] = max(hi[axis], corner[axis])
        found = True

    if not found:
        raise SystemExit(f"no quedo ninguna malla por debajo de body_top={body_top}")
    return lo, hi


def export_anchors(path: str, scene, camera, pivot, frames: int, body_top: float) -> None:
    """Escribe, frame por frame, donde cae cada esquina del gabinete en la imagen.

    Esto es lo que permite que las cotas vivan en HTML en vez de horneadas en el
    PNG: el front dibuja la flecha entre dos puntos proyectados y la re-dibuja en
    cada frame, asi que queda clavada a la geometria aunque la maquina gire y la
    focal se mueva. El texto sigue siendo texto -- se traduce, se togglea entre
    pulgadas y centimetros, lo lee un lector de pantalla y lo indexa Google, nada
    de lo cual pasa con un numero adentro de una imagen.

    Las coordenadas van normalizadas 0..1 con el origen arriba a la izquierda,
    que es como las quiere CSS: `left: x*100%; top: y*100%`. Blender las entrega
    con el origen abajo, de ahi el `1 - y`.

    No recalcula la rotacion a mano: hace `frame_set` y lee la matriz que quedo.
    Asi los anclajes salen del mismo movimiento que se esta renderizando, sea el
    que sea, y no de una copia de la formula que puede quedar desincronizada.
    """
    lo, hi = body_box(pivot, body_top)
    corners = {
        f"{'x1' if sx > 0 else 'x0'}{'y1' if sy > 0 else 'y0'}{'z1' if sz > 0 else 'z0'}": Vector(
            (hi.x if sx > 0 else lo.x, hi.y if sy > 0 else lo.y, hi.z if sz > 0 else lo.z)
        )
        for sx in (-1, 1)
        for sy in (-1, 1)
        for sz in (-1, 1)
    }

    # Cada cota vive sobre una cara. La normal de esa cara decide si la cota se
    # muestra: medir el ancho sobre un frente que esta casi de perfil dibuja una
    # flecha de dos pixeles con un numero al lado que no se entiende a que apunta.
    faces = {"height": Vector((0, -1, 0)), "width": Vector((0, -1, 0)), "depth": Vector((1, 0, 0))}
    center = (lo + hi) / 2.0

    projected = []
    for frame in range(1, frames + 1):
        scene.frame_set(frame)
        spin = pivot.matrix_world.to_3x3()
        eye = camera.matrix_world.translation
        points = {}
        for name, local in corners.items():
            uv = world_to_camera_view(scene, camera, pivot.matrix_world @ local)
            points[name] = [round(uv.x, 4), round(1.0 - uv.y, 4)]
        facing = {}
        for name, normal in faces.items():
            world_normal = (spin @ normal).normalized()
            to_eye = (eye - (pivot.matrix_world @ center)).normalized()
            facing[name] = round(max(0.0, world_normal.dot(to_eye)), 4)
        projected.append({"frame": frame, "p": points, "facing": facing})

    payload = {
        "measuredMm": {
            "height": round((hi.z - lo.z) * 1000),
            "width": round((hi.x - lo.x) * 1000),
            "depth": round((hi.y - lo.y) * 1000),
        },
        # Que par de esquinas une cada cota. El front elige cual dibujar segun el
        # angulo; las tres estan siempre disponibles.
        "edges": {
            "height": ["x0y0z0", "x0y0z1"],
            "width": ["x0y0z0", "x1y0z0"],
            "depth": ["x1y0z0", "x1y1z0"],
        },
        "frames": projected,
    }
    with open(os.path.expanduser(path), "w") as handle:
        json.dump(payload, handle)
    print(f"anclajes: {path} -- gabinete medido {payload['measuredMm']} mm")


def peek_prefix(out: str) -> str:
    """Los peeks van a una carpeta hermana, nunca al lado de la secuencia.

    `build-frame-sequence.mjs` toma un directorio y se lleva todo .png que
    termine en digitos. Un peek guardado ahi entraria como un frame mas, en la
    posicion equivocada y sin que nada avise.
    """
    folder, prefix = os.path.split(out)
    return os.path.join(f"{folder}-peek", prefix or "frame")


def main() -> None:
    args = parse_args()
    scene = bpy.context.scene

    key_light = bpy.data.objects.get(KEY_LIGHT)
    if key_light is None:
        raise SystemExit(f"no existe la luz '{KEY_LIGHT}' en la escena")
    # El template venia con la KEY excluida del render y nadie se dio cuenta:
    # gamma-12/v0.01 esta iluminada solo con FILL + RIM + interior + HDRI.
    key_light.hide_render = args.key_light == "off"

    pivot = bpy.data.objects.get(PIVOT)
    if pivot is None:
        raise SystemExit(f"no existe el pivote '{PIVOT}' en la escena")
    # Un key de Location en el pivote revierte el centrado en cada refresh --
    # el modelo orbita descentrado y el giro se ve como un bamboleo.
    pivot_action = action_of(pivot)
    if pivot_action and any(c.data_path == "location" for c in fcurves_of(pivot_action)):
        print(f"AVISO: '{PIVOT}' tiene keyframes de Location. Borralos antes de renderizar en serio.")

    end_frame = arc_end_frame(args.frames, args.sweep_deg)
    peak_frame = args.peak_frame if args.peak_frame is not None else (1.0 + end_frame) / 2.0
    set_rotation_arc(pivot, end_frame, args.start_deg, args.sweep_deg)

    camera = scene.camera
    if camera is None:
        raise SystemExit("la escena no tiene camara activa")
    if args.zoom is not None:
        animate_focal(camera, args.zoom[0], args.zoom[1], peak_frame, end_frame, args.hold)

    if args.shift_peak is not None:
        # El shift viaja con el focal, no en vez de el. En las puntas el encuadre
        # ya esta bien; lo que se rompe es solo el pico, donde el sujeto crece
        # ~1.5x y se sale por arriba dejando aire abajo. Un shift fijo arreglaria
        # el pico y desencuadraria todo lo demas.
        #
        # `clear=False` porque el focal ya vive en esta misma action: limpiarla
        # otra vez borraria la curva de lens que se acaba de escribir.
        ease_property(
            camera.data,
            "shift_y",
            camera.data.shift_y,
            args.shift_peak,
            peak_frame,
            end_frame,
            args.hold,
            clear=False,
        )

    render = scene.render
    render.film_transparent = True
    render.image_settings.file_format = "PNG"
    render.image_settings.color_mode = "RGBA"
    if args.width is not None:
        render.resolution_x = render.resolution_y = args.width
        render.resolution_percentage = 100

    degrees_per_frame = args.sweep_deg / (end_frame - 1.0)
    angle_at = lambda frame: args.start_deg + (frame - 1.0) * degrees_per_frame
    print(
        f"secuencia: {args.frames} frames, {args.sweep_deg:g} grados desde {args.start_deg:g} "
        f"({degrees_per_frame:.2f} por frame, cierre en {end_frame:g}), "
        f"KEY {'on' if not key_light.hide_render else 'off'}, "
        f"zoom {args.zoom or 'sin zoom'} con pico en el frame {peak_frame:g} "
        f"({angle_at(peak_frame):.1f} grados), hold {args.hold:g}"
    )

    # Antes de renderizar: si algo esta mal medido, se ve aca y no en 20 minutos.
    if args.anchors is not None:
        export_anchors(args.anchors, scene, camera, pivot, args.frames, args.body_top)

    if args.dry_run:
        return

    if args.peek is not None:
        render.filepath = peek_prefix(os.path.expanduser(args.out))
        for frame in args.peek:
            print(f"  peek frame {frame} -> {angle_at(frame):.1f} grados")
            scene.frame_start = scene.frame_end = frame
            bpy.ops.render.render(animation=True)
        return

    render.filepath = os.path.expanduser(args.out)
    scene.frame_start = 1
    scene.frame_end = args.frames
    bpy.ops.render.render(animation=True)


if __name__ == "__main__":
    main()
