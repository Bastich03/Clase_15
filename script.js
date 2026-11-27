document.addEventListener("DOMContentLoaded", () => {
    // ───── 1. Datos de rankings y cuadrículas ─────
    const datos = {
        universidades: { total: 1504, origen: 185, destino: 87 },
        // QS publica a la U. de Chile en un tramo (151-200), no en un puesto exacto
        escuelas: { total: 303, origen: [151, 200], destino: 7 },
    };

    document.querySelectorAll("[data-dato]").forEach((el) => {
        const [grupo, campo] = el.dataset.dato.split(".");
        const valor = datos[grupo][campo];
        el.textContent = Array.isArray(valor) ? valor.join("-") : valor;
    });

    const ranking = (id, { total, origen, destino }) => {
        const [desde, hasta] = [origen].flat().length > 1 ? origen : [origen, origen];
        const min = Math.min(desde, destino);
        const max = Math.max(hasta, destino);
        const celdas = Array.from({ length: total }, (_, i) => {
            const n = i + 1;
            const clase =
                n === destino ? "destino" : n >= desde && n <= hasta ? "origen" : n > min && n < max ? "entre" : "";
            return `<span class="${clase}">${n}</span>`;
        });
        document.getElementById(id).innerHTML = celdas.join("");
    };

    ranking("universidades", datos.universidades);
    ranking("escuelas", datos.escuelas);

    // ───── 2. Gráficos de radar (Chart.js) ─────
    const indicadores = {
        comparaUniversidades: {
            "Reputación académica": { origen: 92, destino: 84.5 },
            "Citas por académico": { origen: 16, destino: 54.2 },
            "Proporción académicos/estudiantes": { origen: 9.9, destino: 8.9 },
            "Red de investigación internacional": { origen: 76.8, destino: 84.2 },
            "Académicos internacionales": { origen: 10.6, destino: 75.9 },
            "Reputación entre empleadores": { origen: 85.1, destino: 93.6 },
            "Estudiantes internacionales": { origen: 8.2, destino: 72.9 },
        },
        comparaEscuelas: {
            "Reputación académica": { origen: 52.5, destino: 82.8 },
            "Reputación entre empleadores": { origen: 78.5, destino: 87.4 },
            "% estudiantes internacionales (universidad)": { origen: 5.7, destino: 25.1 },
            "% académicos internacionales (universidad)": { origen: 7, destino: 28 },
        },
    };

    const dividirEtiqueta = (texto, max = 18) => {
    const lineas = [];
    let actual = "";
    for (const palabra of texto.split(" ")) {
        if ((actual + " " + palabra).trim().length > max && actual) {
            lineas.push(actual);
            actual = palabra;
        } else {
            actual = (actual + " " + palabra).trim();
        }
    }
    if (actual) lineas.push(actual);
    return lineas;
};

const radar = (id) => {
    const canvas = document.getElementById(id);
    const filas = Object.entries(indicadores[id]);
    new Chart(canvas, {
        type: "radar",
        data: {
            labels: filas.map(([nombre]) => dividirEtiqueta(nombre)),
            datasets: [
                {
                    label: "Universidad de Chile",
                    data: filas.map(([, v]) => v.origen),
                    borderColor: "blue",
                    backgroundColor: "rgba(0, 0, 255, 0.1)",
                },
                {
                    label: "Politécnico de Milán",
                    data: filas.map(([, v]) => v.destino),
                    borderColor: "red",
                    backgroundColor: "rgba(255, 0, 0, 0.1)",
                },
            ],
        },
        options: {
            layout: {
                padding: 12,
            },
            scales: {
                r: {
                    min: 0,
                    max: 100,
                    pointLabels: {
                        font: {
                            size: 11,
                        },
                    },
                },
            },
        },
    });
};

    radar("comparaUniversidades");
    radar("comparaEscuelas");

    // ───── 3. Mapa (Leaflet) — Campus Bovisa, Via Durando 10 ─────
    const coordsBovisa = [45.5051, 9.1656];
    const map = L.map("map").setView(coordsBovisa, 15);

    L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}",
        { maxZoom: 16, attribution: "Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ" }
    ).addTo(map);

    L.marker(coordsBovisa)
        .addTo(map)
        .bindPopup("<b>Politécnico de Milán</b><br />Campus Bovisa (Via Durando 10).")
        .openPopup();

    // ───── 4. Infografía interactiva SVG ─────
    const svg = document.getElementById("infografia-postulacion");
    const NS = "http://www.w3.org/2000/svg";

    const VIAS = {
        fau: {
            nombre: "Nivel FAU",
            apertura: "2026-09-22",
            cierre: "2026-10-31",
            enlace: [
                "Ver convocatoria FAU oficial",
                "https://fau.uchile.cl/dari/convocatorias/convocatoria-movilidad-internacional-pregrado-fau-12027",
            ],
            pasos: [
                {
                    titulo: "Revisa los requisitos",
                    resumen: "Toca cada uno que ya cumplas",
                    checklist: [
                        "Ser estudiante regular de Arquitectura, Diseño o Geografía",
                        "Cursar al menos el 3.er semestre al postular",
                        "Tener el Bachiller (120 SCT) al iniciar la movilidad",
                        "Contar con al menos 6 créditos convalidables",
                        "Promedio histórico mínimo de 4,5",
                        "No tener matrícula de gracia al postular",
                        "Estar al día con el arancel",
                    ],
                },
                {
                    titulo: "Reúne y envía tus documentos",
                    resumen: "Formulario FAU, archivos en PDF",
                    checklist: [
                        "Carta de motivación académica (1 plana, aprox. 500 palabras)",
                        "Certificado de idioma o carta de compromiso",
                        "Pasaporte o comprobante de cita para obtenerlo",
                        "3 universidades en orden de prioridad",
                        "6 asignaturas tentativas para tu 1.ª prioridad",
                    ],
                    notas: ["Algunos destinos piden además portafolio."],
                },
                {
                    titulo: "Selección",
                    resumen: "Ranking por rendimiento académico",
                    notas: [
                        "Los cupos se distribuyen según un ranking basado en tu rendimiento académico.",
                        "El resultado llega a tu correo. Si no obtienes destino, se ofrecen los cupos disponibles en una segunda comunicación.",
                        "Politécnico de Milán: 1 cupo semestral para Arquitectura y Diseño; pide italiano B1 al momento de irse.",
                    ],
                },
                {
                    titulo: "Adjudicación",
                    resumen: "7 días corridos para responder",
                    notas: [
                        "Acepta o rechaza el cupo con un documento firmado.",
                        "Si aceptas, prepara el contrato de estudios provisorio, el certificado de salud física y mental y la acreditación de idioma.",
                    ],
                },
                {
                    titulo: "Admisión en destino",
                    resumen: "Espera tu carta de aceptación",
                    notas: [
                        "Postula según el proceso de la universidad extranjera. La nominación no garantiza la admisión.",
                        "Con la carta de aceptación puedes iniciar visa, seguro, pasajes y alojamiento.",
                    ],
                },
            ],
        },
        pme: {
            nombre: "Nivel Central (PME)",
            apertura: "2026-09-21",
            cierre: "2026-10-21",
            enlace: [
                "Ver bases PME oficiales",
                "https://uchile.cl/dam/jcr:92131a8f-4540-4f7a-a0bd-d33e63a5cec4/BASES%20CONVOCATORIA%20SEMESTRAL%20PRIMAVERA%202027.docx.pdf",
            ],
            pasos: [
                {
                    titulo: "Revisa los requisitos",
                    resumen: "Toca cada uno que ya cumplas",
                    checklist: [
                        "Ser estudiante regular con matrícula vigente",
                        "Cursar al menos el 3.er semestre al postular",
                        "Tener 1 semestre o más pendiente y cursos por convalidar",
                        "No estar en causal de eliminación ni deber repetir un ramo durante el intercambio",
                        "Contar con respaldo de la Facultad",
                        "Acreditar el idioma que pida el destino",
                    ],
                },
                {
                    titulo: "Reúne y envía tus documentos",
                    resumen: "Formulario PME, 3 universidades en países distintos",
                    checklist: [
                        "Cédula de identidad (ambos lados)",
                        "Certificado de alumno regular",
                        "Historial de notas y promedio por semestre",
                        "CV en formato PME (máx. 2 páginas)",
                        "Carta de motivación (máx. 2 planas)",
                        "Carta de recomendación académica",
                        "Carta de la Oficina de Relaciones Internacionales",
                        "Video de presentación (máx. 1 minuto)",
                    ],
                    notas: [
                        "Si aplica: certificado de idioma, de actividades extracurriculares y FOCES (para ayuda de viaje).",
                    ],
                },
                {
                    titulo: "Selección por puntaje",
                    resumen: "Máximo 15 puntos; toca cada factor",
                    puntaje: true,
                },
                {
                    titulo: "Resultados y confirmación",
                    resumen: "13 al 20 de noviembre de 2026",
                    notas: [
                        "Evaluación: 22 de octubre al 12 de noviembre.",
                        "Publicación de resultados: 13 de noviembre.",
                        "Confirmación del cupo: hasta el 20 de noviembre.",
                        "Puedes quedar en cualquiera de tus 3 preferencias.",
                    ],
                },
            ],
        },
    };

    const FACTORES = [
        {
            n: "Notas",
            p: 7,
            c: "#34414f",
            d: "El puntaje equivale a tu promedio (máx. 7). Bajo 4,0 no es evaluable.",
        },
        {
            n: "Carta y video",
            p: 4,
            c: "#62758a",
            d: "De 1 a 4 puntos según claridad del proyecto, aporte al país y a la universidad, y formato.",
        },
        {
            n: "Extracurriculares",
            p: 4,
            c: "#9aaabb",
            d: "Opcional: organizaciones estudiantiles, selecciones deportivas, voluntariados, ayudantías o programa PARES.",
        },
    ];

    const AYUDAS = [
        ["Asia Pacífico", 3.5, 4],
        ["Europa", 3, 4],
        ["Norteamérica", 3, 2],
        ["Latinoamérica", 2, 5],
    ];

    const RUTAS = {
        fau: {
            sub: "Convenios de tu facultad",
            escalas: ["Requisitos", "Documentos", "Selección", "Adjudicación", "Admisión"],
        },
        pme: {
            sub: "Convenios de toda la U",
            escalas: ["Requisitos", "Documentos", "Puntaje", "Resultados"],
        },
    };

    const AVION =
        "M17 0q0 -3 -6 -3H4L-4 -15H-8L-4 -3H-11L-14 -8H-17L-15 0L-17 8H-14L-11 3H-4L-8 15H-4L4 3H11q6 0 6 -3Z";

    const estado = { via: "fau", paso: 0, factor: 0, marcas: new Set() };
    const CLAVE = "ruta-intercambio";
    try {
        JSON.parse(localStorage.getItem(CLAVE) || "[]").forEach((m) => estado.marcas.add(m));
    } catch (e) {}
    const guardar = () => {
        try {
            localStorage.setItem(CLAVE, JSON.stringify([...estado.marcas]));
        } catch (e) {}
    };

    let W = 0,
        avionEn = null,
        cuadro = 0;

    const el = (tag, attrs = {}, padre = svg) => {
        const e = document.createElementNS(NS, tag);
        for (const k in attrs) e.setAttribute(k, attrs[k]);
        padre.appendChild(e);
        return e;
    };

    const rect = (g, x, y, w, h, fill, extra = {}) =>
        el("rect", { x, y, width: w, height: h, rx: 6, fill, ...extra }, g);

    const texto = (g, str, x, y, ancho, { size = 15, peso = 400, clase = "", ancla = "start" } = {}) => {
        const t = el("text", { "font-size": size, "font-weight": peso, class: clase, "text-anchor": ancla }, g);
        const alto = size * 1.35;
        let linea = [],
            n = 0;
        let s = el("tspan", { x, y: y + size }, t);
        for (const palabra of str.split(" ")) {
            linea.push(palabra);
            s.textContent = linea.join(" ");
            if (s.getComputedTextLength() > ancho && linea.length > 1) {
                linea.pop();
                s.textContent = linea.join(" ") + " ";
                linea = [palabra];
                s = el("tspan", { x, y: y + size + ++n * alto }, t);
                s.textContent = palabra;
            }
        }
        return (n + 1) * alto;
    };

    const control = (g, clave, rol, etiqueta, accion, extra = {}) => {
        const c = el("g", { role: rol, tabindex: 0, "data-k": clave, "aria-label": etiqueta, ...extra }, g);
        const activar = () => {
            accion();
            dibujar();
            (svg.querySelector(`[data-k="${clave}"]`) || svg.querySelector(`[data-k="paso-${estado.paso}"]`))?.focus({
                preventScroll: true,
            });
        };
        c.addEventListener("click", activar);
        c.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                activar();
            }
        });
        return c;
    };

    const completo = (via, i) => {
        const lista = VIAS[via].pasos[i].checklist;
        return !!lista && lista.every((_, j) => estado.marcas.has(`${via}-${i}-${j}`));
    };

    const fecha = (iso) => new Date(iso + "T00:00:00");
    const corta = (iso) => fecha(iso).toLocaleDateString("es-CL", { day: "numeric", month: "short" }).replace(".", "");

    function selector(y) {
        Object.entries(VIAS).forEach(([k, v], i) => {
            const activo = k === estado.via,
                w = (W - 8) / 2,
                x = i * (w + 8);
            const c = control(
                svg,
                "via-" + k,
                "button",
                v.nombre,
                () => {
                    estado.via = k;
                    estado.paso = 0;
                    avionEn = null;
                },
                { "aria-pressed": activo }
            );
            const fondo = rect(c, x + 1, y, w - 2, 10, activo ? "#34414f" : "#fff", {
                class: "caja",
                stroke: "slategray",
                "stroke-width": 1.5,
            });
            let h = texto(c, v.nombre, x + w / 2, y + 9, w - 12, {
                size: W < 420 ? 13 : 16,
                peso: 700,
                ancla: "middle",
                clase: activo ? "blanco" : "",
            });
            h += texto(c, RUTAS[k].sub, x + w / 2, y + 9 + h, w - 8, {
                size: W < 420 ? 11 : 13,
                ancla: "middle",
                clase: activo ? "claro" : "suave",
            });
            fondo.setAttribute("height", Math.max(56, h + 18));
        });
        return y + (W < 330 ? 84 : 68);
    }

    function tablero(via, y) {
        const hoy = new Date(),
            cierre = new Date(via.cierre + "T23:59:59");
        const situacion = hoy > cierre ? "CERRADA" : hoy >= fecha(via.apertura) ? "ABIERTA" : "POR ABRIR";
        rect(svg, 0, y, W, 58, "#34414f");
        texto(svg, "Postulación · 2.º semestre 2027", 12, y + 8, W - 24, { size: 12, clase: "claro" });
        texto(svg, `${corta(via.apertura)} → ${corta(via.cierre)} 2026`, 12, y + 27, W - 110, {
            size: W < 420 ? 14 : 18,
            peso: 700,
            clase: "blanco",
        });
        rect(svg, W - 92, y + 27, 80, 22, "#dbe2ea", { rx: 3 });
        texto(svg, situacion, W - 52, y + 30, 80, { size: 12, peso: 700, ancla: "middle", clase: "tinta" });
        y += 66;
        if (situacion === "CERRADA")
            y += texto(svg, "Usa estas fechas como referencia para la próxima convocatoria.", 0, y, W, {
                size: 12,
                clase: "suave",
            });
        return y + 6;
    }

    function ruta(via, y) {
        const nombres = RUTAS[estado.via].escalas,
            n = nombres.length;
        texto(svg, "SCL · Santiago", 0, y, W / 2, { size: 12, peso: 700, clase: "suave" });
        texto(svg, "Tu destino", W, y, W / 2, { size: 12, peso: 700, ancla: "end", clase: "suave" });
        const margen = 34,
            paso = (W - margen * 2) / (n - 1);
        const pts = nombres.map((_, i) => [margen + i * paso, y + (i % 2 ? 66 : 104)]);
        const tramo = (hasta) =>
            pts.slice(1, hasta + 1).reduce((d, [x, py], i) => {
                const [ax, ay] = pts[i],
                    m = (ax + x) / 2;
                return `${d} C${m} ${ay} ${m} ${py} ${x} ${py}`;
            }, `M${pts[0][0]} ${pts[0][1]}`);
        const largo = (i) => {
            if (i === 0) return 0;
            const p = el("path", { d: tramo(i), fill: "none" });
            const l = p.getTotalLength();
            p.remove();
            return l;
        };
        const camino = el("path", {
            d: tramo(n - 1),
            fill: "none",
            stroke: "slategray",
            "stroke-width": 2,
            "stroke-dasharray": "3 6",
            "stroke-linecap": "round",
        });
        const destino = largo(estado.paso);
        const recorrido = el("path", { d: tramo(n - 1), fill: "none", stroke: "#34414f", "stroke-width": 3 });

        pts.forEach(([x, py], i) => {
            const activo = estado.paso === i,
                listo = completo(estado.via, i);
            const c = control(
                svg,
                "paso-" + i,
                "button",
                `Paso ${i + 1}: ${via.pasos[i].titulo}${listo ? " (listo)" : ""}`,
                () => (estado.paso = i),
                { "aria-current": activo ? "step" : "false" }
            );
            rect(c, x - paso / 2, py - 30, paso, 60, "transparent");
            el(
                "circle",
                {
                    cx: x,
                    cy: py,
                    r: activo ? 17 : 14,
                    fill: activo || listo ? "#34414f" : "#fff",
                    stroke: "slategray",
                    "stroke-width": 2,
                    class: "caja",
                },
                c
            );
            texto(c, listo ? "✓" : String(i + 1), x, py - 10, 30, {
                size: 14,
                peso: 700,
                ancla: "middle",
                clase: activo || listo ? "blanco" : "",
            });
            texto(c, nombres[i], x, i % 2 ? py - 40 : py + 22, 120, {
                size: W < 420 ? 11 : 13,
                peso: activo ? 700 : 400,
                ancla: "middle",
            });
        });

        const avion = el("g", { "aria-hidden": "true", "pointer-events": "none" });
        el("path", { d: AVION, fill: "#34414f" }, avion);
        const total = camino.getTotalLength();
        const mover = (l) => {
            const p = camino.getPointAtLength(l);
            const desvio = ((y + 85 - p.y) / 19) * 32;
            avion.setAttribute("transform", `translate(${p.x} ${p.y + desvio})`);
            recorrido.setAttribute("stroke-dasharray", `${l} ${total + 1}`);
            avionEn = l;
        };
        cancelAnimationFrame(cuadro);
        const inicio = avionEn ?? destino;
        const quieto = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        mover(quieto ? destino : inicio);
        if (!quieto && inicio !== destino) {
            let t0;
            const volar = (t) => {
                t0 ??= t;
                const k = Math.min(1, (t - t0) / 600);
                mover(inicio + (destino - inicio) * (1 - (1 - k) ** 3));
                if (k < 1) cuadro = requestAnimationFrame(volar);
            };
            cuadro = requestAnimationFrame(volar);
        }
        return y + 150;
    }

    function checklist(items, y, x, ancho) {
        const prefijo = `${estado.via}-${estado.paso}-`;
        const hechos = items.filter((_, i) => estado.marcas.has(prefijo + i)).length;
        y +=
            texto(svg, `Tu equipaje: ${hechos} de ${items.length} listos (toca para marcar)`, x, y, ancho, {
                size: 12,
                peso: 600,
                clase: "suave",
            }) + 6;
        const columnas = ancho >= 520 ? 2 : 1,
            w = (ancho - (columnas - 1) * 8) / columnas;
        let alturaFila = 0;
        items.forEach((item, i) => {
            const id = prefijo + i,
                ok = estado.marcas.has(id),
                cx = x + (i % columnas) * (w + 8);
            const c = control(
                svg,
                id,
                "checkbox",
                item,
                () => {
                    ok ? estado.marcas.delete(id) : estado.marcas.add(id);
                    guardar();
                },
                { "aria-checked": ok }
            );
            const fondo = rect(c, cx, y, w, 10, ok ? "#dbe2ea" : "#f4f6f8", { class: "caja", stroke: "#d5d9de" });
            el(
                "circle",
                {
                    cx: cx + 18,
                    cy: y + 19,
                    r: 9,
                    fill: ok ? "#34414f" : "#fff",
                    stroke: "slategray",
                    "stroke-width": 1.5,
                },
                c
            );
            if (ok)
                el(
                    "path",
                    { d: `M${cx + 13} ${y + 19}l3.5 3.5l6 -7`, fill: "none", stroke: "#fff", "stroke-width": 2.2 },
                    c
                );
            const h = Math.max(38, texto(c, item, cx + 34, y + 9, w - 42, { size: 13 }) + 18);
            fondo.setAttribute("height", h);
            alturaFila = Math.max(alturaFila, h);
            if (i % columnas === columnas - 1 || i === items.length - 1) {
                y += alturaFila + 6;
                alturaFila = 0;
            }
        });
        return y + 4;
    }

    function puntaje(y, x, ancho) {
        const w = ancho / 15;
        let k = 0;
        FACTORES.forEach((f, i) => {
            const activo = estado.factor === i;
            const c = control(svg, "factor-" + i, "button", `${f.n}: ${f.p} de 15 puntos`, () => (estado.factor = i), {
                "aria-pressed": activo,
            });
            for (let j = 0; j < f.p; j++, k++)
                rect(c, x + k * w + 1, y + (activo ? 0 : 6), w - 2, activo ? 40 : 28, f.c, { rx: 3 });
            rect(c, x + (k - f.p) * w, y - 2, f.p * w, 44, "transparent", { class: "caja" });
        });
        y += 50;
        const f = FACTORES[estado.factor];
        y += texto(svg, `${f.n}: ${f.p} de 15 puntos`, x, y, ancho, { peso: 700 });
        y += texto(svg, f.d, x, y, ancho, { size: 13 }) + 16;

        y += texto(svg, "Ayuda de Viaje (millones CLP · cupos)", x, y, ancho, { size: 13, peso: 700 }) + 6;
        AYUDAS.forEach(([zona, monto, cupos]) => {
            texto(svg, zona, x, y, 100, { size: 12 });
            const wb = ((ancho - 170) * monto) / 3.5;
            rect(svg, x + 100, y + 3, wb, 11, "slategray", { rx: 3 });
            texto(svg, `$${monto.toLocaleString("es-CL")} M · ${cupos}`, x + 106 + wb, y, 70, { size: 12, peso: 600 });
            y += 21;
        });
        return (
            y +
            texto(svg, "Es opcional: suma hasta 4 puntos según FOCES, solo para asignar la ayuda.", x, y + 4, ancho, {
                size: 12,
                clase: "suave",
            }) +
            12
        );
    }

    function pase(via, y) {
        const i = estado.paso,
            p = via.pasos[i],
            n = via.pasos.length,
            x = 16,
            ancho = W - 32,
            arriba = y;
        const mascara = el("mask", { id: "muescas-pase", maskUnits: "userSpaceOnUse", x: 0, y: 0, width: W, height: 3000 });
        el("rect", { x: 0, y: 0, width: W, height: 3000, fill: "#fff" }, mascara);
        const tarjeta = el("g", { mask: "url(#muescas-pase)" });
        const fondo = rect(tarjeta, 0.5, y, W - 1, 10, "#fff", { rx: 12, stroke: "silver" });
        el("path", { d: `M0 ${y + 30}V${y + 12}q0 -12 12 -12H${W - 12}q12 0 12 12v18z`, fill: "slategray" }, tarjeta);
        texto(svg, "PASE DE ABORDAR", x, y + 7, ancho / 2, { size: 12, peso: 700, clase: "blanco" });
        texto(svg, `ESCALA ${i + 1} DE ${n}`, W - x, y + 7, ancho / 2, {
            size: 12,
            peso: 700,
            ancla: "end",
            clase: "blanco",
        });
        y += 42;
        const timbrado = completo(estado.via, i);
        const anchoTitulo = ancho - (timbrado ? 80 : 0);
        y += texto(svg, p.titulo, x, y, anchoTitulo, { size: 19, peso: 700 });
        y += texto(svg, p.resumen, x, y, anchoTitulo, { size: 13, clase: "suave" }) + 10;
        if (timbrado) {
            const t = el("g", { transform: `translate(${W - 48} ${arriba + 66}) rotate(-14)`, "aria-hidden": "true" });
            el("circle", { r: 31, fill: "none", stroke: "#34414f", "stroke-width": 2.5 }, t);
            el("circle", { r: 26, fill: "none", stroke: "#34414f", "stroke-width": 1, "stroke-dasharray": "2 3" }, t);
            texto(t, "LISTO", 0, -11, 60, { size: 14, peso: 700, ancla: "middle", clase: "tinta" });
            texto(t, estado.via.toUpperCase(), 0, 5, 60, { size: 9, peso: 700, ancla: "middle", clase: "tinta" });
            y = Math.max(y, arriba + 104);
        }
        if (p.checklist) y = checklist(p.checklist, y, x, ancho);
        if (p.puntaje) y = puntaje(y, x, ancho);
        (p.notas || []).forEach((nota) => {
            el("path", { d: `M${x} ${y + 5}l7 5l-7 5z`, fill: "slategray" });
            y += texto(svg, nota, x + 16, y, ancho - 16, { size: 14 }) + 8;
        });

        y += 8;
        el("line", { x1: 14, x2: W - 14, y1: y, y2: y, stroke: "silver", "stroke-width": 2, "stroke-dasharray": "5 5" });
        [0, W].forEach((cx) => el("circle", { cx, cy: y, r: 11, fill: "#000" }, mascara));
        el("path", {
            d: `M0.5 ${y - 11}a11 11 0 0 1 0 22M${W - 0.5} ${y - 11}a11 11 0 0 0 0 22`,
            fill: "none",
            stroke: "silver",
        });
        y += 14;
        const boton = (clave, etiqueta, bx, destinoPaso, lleno) => {
            const c = control(svg, clave, "button", etiqueta, () => (estado.paso = destinoPaso));
            rect(c, bx, y, 108, 34, lleno ? "#34414f" : "#fff", {
                class: "caja",
                stroke: "slategray",
                "stroke-width": 1.5,
                rx: 17,
            });
            texto(c, etiqueta, bx + 54, y + 7, 108, {
                size: 13,
                peso: 600,
                ancla: "middle",
                clase: lleno ? "blanco" : "",
            });
        };
        if (i > 0) boton("anterior", "← Anterior", x, i - 1, false);
        if (i < n - 1) boton("siguiente", "Siguiente →", W - x - 108, i + 1, true);
        y += 48;
        fondo.setAttribute("height", y - arriba);
        return y;
    }

    function dibujar() {
        W = Math.floor(svg.getBoundingClientRect().width);
        if (!W) return;
        svg.innerHTML = "";
        const via = VIAS[estado.via];
        let y = selector(2);
        y = tablero(via, y);
        y = ruta(via, y);
        y = pase(via, y);

        const a = el("a", { href: via.enlace[1], target: "_blank", rel: "noopener" });
        y += texto(a, via.enlace[0] + " ↗", 0, y + 10, W, { size: 14, peso: 600 }) + 10;
        y += texto(svg, "Datos consultados en noviembre de 2026.", 0, y + 4, W, { size: 12, clase: "suave" }) + 8;
        svg.setAttribute("height", Math.ceil(y));
    }

    let anterior = 0;
    new ResizeObserver(() => {
        const w = Math.floor(svg.getBoundingClientRect().width);
        if (w !== anterior) {
            anterior = w;
            dibujar();
        }
    }).observe(svg);
    document.fonts?.ready.then(dibujar);
    dibujar();
});