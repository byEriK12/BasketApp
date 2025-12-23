// ==========================
    // Datos de partidos
    // ==========================
    const partidosRaw = [
  {
    formato:"3vs3", resultado:true, puntos_totales:21, puntos_rivales:12, minutos:25,
    puntos:8, asistencias:2, rebotes:10, tapones:2, triples_intentados:4, triples_anotados:0,
    jugadores_equipo:["Eric","Llongueras","Gomez"], jugadores_rivales:["Jamo","Blasi","Ert"]
  },
  {
    formato:"3vs3", resultado:true, puntos_totales:29, puntos_rivales:20, minutos:30,
    puntos:12, asistencias:4, rebotes:9, tapones:1, triples_intentados:5, triples_anotados:2,
    jugadores_equipo:["Eric","Llongueras","Blasi"], jugadores_rivales:["Jamo","Gomez","Ert"]
  },
  {
    formato:"3vs3", resultado:false, puntos_totales:30, puntos_rivales:35, minutos:42,
    puntos:11, asistencias:4, rebotes:12, tapones:1, triples_intentados:3, triples_anotados:1,
    jugadores_equipo:["Eric","Ert","Blasi"], jugadores_rivales:["Jamo","Gomez","Llongueras"]
  },
  {
    formato:"3vs3", resultado:true, puntos_totales:22, puntos_rivales:20, minutos:25,
    puntos:10, asistencias:2, rebotes:10, tapones:1, triples_intentados:4, triples_anotados:0,
    jugadores_equipo:["Eric","Llongueras","Ert"], jugadores_rivales:["Jamo","Gomez","Blasi"]
  },
  {
    formato:"4vs4", resultado:true, puntos_totales:22, puntos_rivales:8, minutos:22,
    puntos:12, asistencias:2, rebotes:11, tapones:0, triples_intentados:5, triples_anotados:2,
    jugadores_equipo:["Eric","Llongueras","Ert","Cavi"], jugadores_rivales:["Jamo","Gomez","Blasi","Diaz"]
  },
  {
    formato:"4vs4", resultado:true, puntos_totales:21, puntos_rivales:7, minutos:22,
    puntos:11, asistencias:1, rebotes:13, tapones:2, triples_intentados:2, triples_anotados:1,
    jugadores_equipo:["Eric","Raset","Ert","Jamo"], jugadores_rivales:["Pep","Aleix","Llongueras","Diaz"]
  },
  {
    formato:"3vs3", resultado:true, puntos_totales:21, puntos_rivales:19, minutos:25,
    puntos:9, asistencias:4, rebotes:11, tapones:0, triples_intentados:3, triples_anotados:1,
    jugadores_equipo:["Eric","Ert","Jamo"], jugadores_rivales:["Aleix","Llongueras","Diaz"]
  },
  {
    formato:"5vs5", resultado:true, puntos_totales:25, puntos_rivales:18, minutos:30,
    puntos:12, asistencias:1, rebotes:10, tapones:0, triples_intentados:1, triples_anotados:0,
    jugadores_equipo:["Eric","Raset","Jamo","Flix","Diaz"], jugadores_rivales:["Aleix","Jordi","Matx","Miquel","Ert"]
  },
  {
    formato:"5vs5", resultado:false, puntos_totales:5, puntos_rivales:21, minutos:20,
    puntos:2, asistencias:0, rebotes:4, tapones:0, triples_intentados:1, triples_anotados:0,
    jugadores_equipo:["Eric","Raset","Jamo","Flix","Diaz"], jugadores_rivales:["Aleix","Jordi","Matx","Miquel","Ert"]
  },
  {
    formato:"4vs4", resultado:true, puntos_totales:21, puntos_rivales:18, minutos:25,
    puntos:6, asistencias:2, rebotes:5, tapones:2, triples_intentados:1, triples_anotados:0,
    jugadores_equipo:["Eric","Ert","Jamo","Diaz"], jugadores_rivales:["Llongueras","Grinyo","Blasi","Gomez"]
  },
  {
    formato:"4vs4", resultado:false, puntos_totales:17, puntos_rivales:22, minutos:25,
    puntos:6, asistencias:0, rebotes:9, tapones:1, triples_intentados:2, triples_anotados:0,
    jugadores_equipo:["Eric","Grinyo","Llongueras","Blasi"], jugadores_rivales:["Jamo","Ert","Diaz","Gomez"]
  },
  {
    formato:"4vs4", resultado:true, puntos_totales:22, puntos_rivales:3, minutos:20,
    puntos:9, asistencias:3, rebotes:8, tapones:0, triples_intentados:3, triples_anotados:1,
    jugadores_equipo:["Eric","Ert","Gomez","Jamo"], jugadores_rivales:["Grinyo","Llongueras","Diaz","Blasi"]
  },
  {
    formato:"4vs4", resultado:true, puntos_totales:21, puntos_rivales:19, minutos:25,
    puntos:10, asistencias:2, rebotes:11, tapones:0, triples_intentados:0, triples_anotados:0,
    jugadores_equipo:["Eric","Grinyo","Llongueras","Jamo"], jugadores_rivales:["Gomez","Ert","Diaz","Blasi"]
  },
  {
    formato:"3vs3", resultado:true, puntos_totales:14, puntos_rivales:8, minutos:20,
    puntos:10, asistencias:0, rebotes:4, tapones:1, triples_intentados:0, triples_anotados:0,
    jugadores_equipo:["Eric","Diaz","Ert"], jugadores_rivales:["Aleix","Jamo","Llongueras"]
  },
  {
    formato:"4vs4", resultado:true, puntos_totales:22, puntos_rivales:3, minutos:25,
    puntos:4, asistencias:1, rebotes:5, tapones:0, triples_intentados:0, triples_anotados:0,
    jugadores_equipo:["Eric","Diaz","Torre","Negre"], jugadores_rivales:["Llongueras","Ert","Jamo","Aleix"]
  },
  {
    formato:"4vs4", resultado:true, puntos_totales:21, puntos_rivales:14, minutos:25,
    puntos:10, asistencias:2, rebotes:6, tapones:1, triples_intentados:2, triples_anotados:2,
    jugadores_equipo:["Eric","Diaz","Ert","Negre"], jugadores_rivales:["Llongueras","Torre","Jamo","Aleix"]
  },
  {
    formato:"3vs3", resultado:true, puntos_totales:21, puntos_rivales:6, minutos:20,
    puntos:6, asistencias:3, rebotes:8, tapones:0, triples_intentados:2, triples_anotados:0,
    jugadores_equipo:["Eric","Aleix","Ert"], jugadores_rivales:["Llongueras","Diaz","Jamo"]
  },
  {
    formato:"3vs3", resultado:true, puntos_totales:21, puntos_rivales:14, minutos:25,
    puntos:7, asistencias:2, rebotes:3, tapones:2, triples_intentados:3, triples_anotados:2,
    jugadores_equipo:["Eric","Jamo","Ert"], jugadores_rivales:["Aleix","Gomez","Blasi"]
  },
  {
    formato:"3vs3", resultado:true, puntos_totales:21, puntos_rivales:7, minutos:22,
    puntos:4, asistencias:5, rebotes:3, tapones:1, triples_intentados:3, triples_anotados:0,
    jugadores_equipo:["Eric","Jamo","Gomez"], jugadores_rivales:["Aleix","Ert","Blasi"]
  },
  {
    formato:"3vs3", resultado:true, puntos_totales:12, puntos_rivales:9, minutos:15,
    puntos:0, asistencias:1, rebotes:4, tapones:0, triples_intentados:0, triples_anotados:0,
    jugadores_equipo:["Eric","Blasi","Gomez"], jugadores_rivales:["Aleix","Ert","Diaz"]
  },
  {
    formato:"3vs3", resultado:true, puntos_totales:12, puntos_rivales:10, minutos:15,
    puntos:2, asistencias:2, rebotes:7, tapones:0, triples_intentados:1, triples_anotados:0,
    jugadores_equipo:["Eric","Gomez","Blasi"], jugadores_rivales:["Aleix","Jamo","Diaz"]
  },
  {
    formato:"3vs3", resultado:true, puntos_totales:12, puntos_rivales:10, minutos:15,
    puntos:4, asistencias:2, rebotes:5, tapones:0, triples_intentados:0, triples_anotados:0,
    jugadores_equipo:["Eric","Gomez","Ert"], jugadores_rivales:["Aleix","Jamo","Diaz"]
  },
  {
    formato:"3vs3", resultado:true, puntos_totales:12, puntos_rivales:4, minutos:12,
    puntos:6, asistencias:2, rebotes:4, tapones:0, triples_intentados:0, triples_anotados:0,
    jugadores_equipo:["Eric","Blasi","Aleix"], jugadores_rivales:["Ert","Jamo","Gomez"]
  },
  {
    formato:"3vs3", resultado:true, puntos_totales:12, puntos_rivales:8, minutos:15,
    puntos:6, asistencias:2, rebotes:4, tapones:1, triples_intentados:1, triples_anotados:0,
    jugadores_equipo:["Eric","Blasi","Aleix"], jugadores_rivales:["Ert","Jamo","Diaz"]
  },
  {
    formato:"2vs2", resultado:true, puntos_totales:22, puntos_rivales:10, minutos:25,
    puntos:14, asistencias:0, rebotes:9, tapones:1, triples_intentados:3, triples_anotados:1,
    jugadores_equipo:["Eric","Jamo"], jugadores_rivales:["Ert","Llongueras"]
  },
  {
    formato:"2vs2", resultado:true, puntos_totales:12, puntos_rivales:2, minutos:15,
    puntos:8, asistencias:2, rebotes:4, tapones:0, triples_intentados:0, triples_anotados:0,
    jugadores_equipo:["Eric","Diaz"], jugadores_rivales:["Ert","Jamo"]
  },
  {
    formato:"2vs2", resultado:true, puntos_totales:11, puntos_rivales:9, minutos:15,
    puntos:6, asistencias:2, rebotes:4, tapones:1, triples_intentados:1, triples_anotados:0,
    jugadores_equipo:["Eric","Llongueras"], jugadores_rivales:["Ert","Diaz"]
  },
  {
    formato:"2vs2", resultado:true, puntos_totales:11, puntos_rivales:2, minutos:15,
    puntos:6, asistencias:2, rebotes:2, tapones:1, triples_intentados:0, triples_anotados:0,
    jugadores_equipo:["Eric","Diaz"], jugadores_rivales:["Jamo","Llongueras"]
  },
  {
    formato:"3vs3", resultado:false, puntos_totales:17, puntos_rivales:21, minutos:25,
    puntos:9, asistencias:1, rebotes:6, tapones:0, triples_intentados:1, triples_anotados:1,
    jugadores_equipo:["Eric","Diaz","Ert"], jugadores_rivales:["Arnau","Aleix","Blasi"]
  },
  {
    formato:"3vs3", resultado:true, puntos_totales:22, puntos_rivales:16, minutos:25,
    puntos:10, asistencias:3, rebotes:7, tapones:0, triples_intentados:2, triples_anotados:0,
    jugadores_equipo:["Eric","Arnau","Blasi"], jugadores_rivales:["Ert","Aleix","Diaz"]
  },
  {
    formato:"3vs3", resultado:true, puntos_totales:12, puntos_rivales:10, minutos:15,
    puntos:4, asistencias:2, rebotes:3, tapones:1, triples_intentados:0, triples_anotados:0,
    jugadores_equipo:["Eric","Ert","Arnau"], jugadores_rivales:["Jamo","Aleix","Blasi"]
  },
  {
    formato:"3vs3", resultado:false, puntos_totales:2, puntos_rivales:12, minutos:15,
    puntos:2, asistencias:0, rebotes:1, tapones:0, triples_intentados:0, triples_anotados:0,
    jugadores_equipo:["Eric","Ert","Aleix"], jugadores_rivales:["Jamo","Arnau","Diaz"]
  },
  {
    formato:"3vs3", resultado:false, puntos_totales:7, puntos_rivales:12, minutos:15,
    puntos:5, asistencias:1, rebotes:9, tapones:0, triples_intentados:2, triples_anotados:1,
    jugadores_equipo:["Eric","Jamo","Blasi"], jugadores_rivales:["Ert","Arnau","Diaz"]
  },
  {
    formato:"3vs3", resultado:true, puntos_totales:12, puntos_rivales:2, minutos:15,
    puntos:4, asistencias:2, rebotes:3, tapones:0, triples_intentados:0, triples_anotados:0,
    jugadores_equipo:["Eric","Diaz","Aleix"], jugadores_rivales:["Jamo","Ert","Blasi"]
  },
  {
    formato:"3vs3", resultado:true, puntos_totales:12, puntos_rivales:9, minutos:15,
    puntos:7, asistencias:1, rebotes:6, tapones:0, triples_intentados:1, triples_anotados:1,
    jugadores_equipo:["Eric","Blasi","Arnau"], jugadores_rivales:["Jamo","Diaz","Aleix"]
  },
  {
    formato:"3vs3", resultado:false, puntos_totales:19, puntos_rivales:21, minutos:25,
    puntos:5, asistencias:4, rebotes:13, tapones:1, triples_intentados:1, triples_anotados:1,
    jugadores_equipo:["Eric","Jamo","Arnau"], jugadores_rivales:["Ert","Diaz","Aleix"]
  },
  {
    formato:"3vs3", resultado:true, puntos_totales:21, puntos_rivales:6, minutos:25,
    puntos:12, asistencias:2, rebotes:4, tapones:1, triples_intentados:1, triples_anotados:0,
    jugadores_equipo:["Eric","Diaz","Arnau"], jugadores_rivales:["Jamo","Ert","Aleix"]
  },
  {
    formato:"2vs2", resultado:true, puntos_totales:11, puntos_rivales:0, minutos:10,
    puntos:2, asistencias:4, rebotes:2, tapones:1, triples_intentados:0, triples_anotados:0,
    jugadores_equipo:["Eric","Ert"], jugadores_rivales:["Blasi","Jamo"]
  },
  {
    formato:"2vs2", resultado:false, puntos_totales:10, puntos_rivales:13, minutos:15,
    puntos:4, asistencias:3, rebotes:4, tapones:0, triples_intentados:0, triples_anotados:0,
    jugadores_equipo:["Eric","Ert"], jugadores_rivales:["Jamo","Diaz"]
  },
  {
    formato:"2vs2", resultado:false, puntos_totales:2, puntos_rivales:10, minutos:10,
    puntos:2, asistencias:0, rebotes:3, tapones:1, triples_intentados:0, triples_anotados:0,
    jugadores_equipo:["Eric","Blasi"], jugadores_rivales:["Ert","Diaz"]
  },
  {
    formato:"3vs3", resultado:true, puntos_totales:23, puntos_rivales:17, minutos:25,
    puntos:15, asistencias:2, rebotes:8, tapones:1, triples_intentados:4, triples_anotados:1,
    jugadores_equipo:["Eric","Ert","Aleix"], jugadores_rivales:["Arnau","Jamo","Diaz"]
  },
  {
    formato:"3vs3", resultado:true, puntos_totales:22, puntos_rivales:7, minutos:25,
    puntos:10, asistencias:2, rebotes:11, tapones:1, triples_intentados:2, triples_anotados:0,
    jugadores_equipo:["Eric","Ert","Arnau"], jugadores_rivales:["Aleix","Jamo","Diaz"]
  },
  {
    formato:"3vs3", resultado:true, puntos_totales:21, puntos_rivales:17, minutos:25,
    puntos:6, asistencias:2, rebotes:7, tapones:2, triples_intentados:3, triples_anotados:0,
    jugadores_equipo:["Eric","Aleix","Arnau"], jugadores_rivales:["Diaz","Jamo","Ert"]
  },
  {
    formato:"3vs3", resultado:true, puntos_totales:23, puntos_rivales:15, minutos:25,
    puntos:7, asistencias:1, rebotes:7, tapones:0, triples_intentados:2, triples_anotados:1,
    jugadores_equipo:["Eric","Jamo","Diaz"], jugadores_rivales:["Aleix","Ert","Arnau"]
  },
  {
    formato:"3vs3", resultado:false, puntos_totales:14, puntos_rivales:23, minutos:25,
    puntos:10, asistencias:1, rebotes:6, tapones:0, triples_intentados:1, triples_anotados:0,
    jugadores_equipo:["Eric","Jamo","Diaz"], jugadores_rivales:["Raset","Ert","Arnau"]
  },
  {
    formato:"3vs3", resultado:true, puntos_totales:21, puntos_rivales:13, minutos:25,
    puntos:7, asistencias:2, rebotes:10, tapones:0, triples_intentados:3, triples_anotados:1,
    jugadores_equipo:["Eric","Jamo","Ert"], jugadores_rivales:["Raset","Diaz","Arnau"]
  },
  {
    formato:"3vs3", resultado:false, puntos_totales:17, puntos_rivales:21, minutos:25,
    puntos:7, asistencias:1, rebotes:4, tapones:1, triples_intentados:2, triples_anotados:1,
    jugadores_equipo:["Eric","Arnau","Ert"], jugadores_rivales:["Raset","Diaz","Jamo"]
  },
  {
    formato:"3vs3", resultado:false, puntos_totales:13, puntos_rivales:21, minutos:25,
    puntos:6, asistencias:2, rebotes:4, tapones:0, triples_intentados:1, triples_anotados:0,
    jugadores_equipo:["Eric","Raset","Arnau"], jugadores_rivales:["Jamo","Ert","Diaz"]
  },
  {
    formato:"3vs3", resultado:true, puntos_totales:19, puntos_rivales:23, minutos:30,
    puntos:6, asistencias:2, rebotes:4, tapones:0, triples_intentados:1, triples_anotados:0,
    jugadores_equipo:["Eric","Arnau","Ert"], jugadores_rivales:["Raset","Diaz","Jamo"]
  },
  {
    formato:"2vs2", resultado:true, puntos_totales:12, puntos_rivales:0, minutos:15,
    puntos:10, asistencias:1, rebotes:5, tapones:1, triples_intentados:0, triples_anotados:0,
    jugadores_equipo:["Eric","Ert"], jugadores_rivales:["Raset","Diaz"]
  },
  {
    formato:"2vs2", resultado:true, puntos_totales:13, puntos_rivales:3, minutos:15,
    puntos:9, asistencias:2, rebotes:3, tapones:1, triples_intentados:2, triples_anotados:1,
    jugadores_equipo:["Eric","Ert"], jugadores_rivales:["Raset","Diaz"]
  },
  {
    formato:"4vs4", resultado:true, puntos_totales:22, puntos_rivales:7, minutos:25,
    puntos:6, asistencias:4, rebotes:5, tapones:1, triples_intentados:2, triples_anotados:0,
    jugadores_equipo:["Eric","Ert","Alvaro","Adri"], jugadores_rivales:["Blasi","Diaz","Jamo","Aleix"]
  },
  {
    formato:"4vs4", resultado:true, puntos_totales:21, puntos_rivales:14, minutos:25,
    puntos:7, asistencias:1, rebotes:3, tapones:0, triples_intentados:2, triples_anotados:1,
    jugadores_equipo:["Eric","Diaz","Jamo","Adri"], jugadores_rivales:["Blasi","Ert","Alvaro","Aleix"]
  },
  {
    formato:"4vs4", resultado:true, puntos_totales:22, puntos_rivales:15, minutos:25,
    puntos:9, asistencias:2, rebotes:4, tapones:0, triples_intentados:2, triples_anotados:1,
    jugadores_equipo:["Eric","Ert","Jamo","Blasi"], jugadores_rivales:["Adri","Diaz","Alvaro","Aleix"]
  },
  {
    formato:"4vs4", resultado:true, puntos_totales:22, puntos_rivales:3, minutos:25,
    puntos:11, asistencias:4, rebotes:6, tapones:2, triples_intentados:1, triples_anotados:1,
    jugadores_equipo:["Eric","Blasi","Alvaro","Aleix"], jugadores_rivales:["Jamo","Ert","Diaz","Adri"]
  },
  {
    formato:"4vs4", resultado:true, puntos_totales:21, puntos_rivales:17, minutos:25,
    puntos:7, asistencias:2, rebotes:8, tapones:1, triples_intentados:2, triples_anotados:1,
    jugadores_equipo:["Eric","Diaz","Jamo","Aleix"], jugadores_rivales:["Blasi","Ert","Alvaro","Adri"]
  },
  {
    formato:"4vs4", resultado:true, puntos_totales:13, puntos_rivales:7, minutos:15,
    puntos:4, asistencias:2, rebotes:6, tapones:0, triples_intentados:0, triples_anotados:0,
    jugadores_equipo:["Eric","Ert","Aleix","Alvaro"], jugadores_rivales:["Adri","Diaz","Blasi","Jamo"]
  },
  {
    formato:"3vs3", resultado:false, puntos_totales:8, puntos_rivales:22, minutos:25,
    puntos:4, asistencias:0, rebotes:4, tapones:0, triples_intentados:1, triples_anotados:0,
    jugadores_equipo:["Eric","Ert","Jamo"], jugadores_rivales:["Arnau","Diaz","Aleix"]
  },
  {
    formato:"3vs3", resultado:true, puntos_totales:21, puntos_rivales:15, minutos:25,
    puntos:17, asistencias:1, rebotes:15, tapones:0, triples_intentados:6, triples_anotados:3,
    jugadores_equipo:["Eric","Jamo","Ert"], jugadores_rivales:["Arnau","Diaz","Aleix"]
  },
  {
    formato:"3vs3", resultado:true, puntos_totales:21, puntos_rivales:15, minutos:25,
    puntos:6, asistencias:2, rebotes:13, tapones:1, triples_intentados:1, triples_anotados:0,
    jugadores_equipo:["Eric","Ert","Diaz"], jugadores_rivales:["Arnau","Jamo","Aleix"]
  },
  {
    formato:"3vs3", resultado:false, puntos_totales:0, puntos_rivales:12, minutos:15,
    puntos:0, asistencias:0, rebotes:3, tapones:0, triples_intentados:0, triples_anotados:0,
    jugadores_equipo:["Eric","Jamo","Aleix"], jugadores_rivales:["Arnau","Ert","Diaz"]
  },
  {
    formato:"2vs2", resultado:true, puntos_totales:12, puntos_rivales:0, minutos:15,
    puntos:8, asistencias:1, rebotes:5, tapones:0, triples_intentados:0, triples_anotados:0,
    jugadores_equipo:["Eric","Aleix"], jugadores_rivales:["Arnau","Diaz"]
  },
  {
    formato:"3vs3", resultado:false, puntos_totales:7, puntos_rivales:13, minutos:15,
    puntos:2, asistencias:0, rebotes:4, tapones:0, triples_intentados:0, triples_anotados:0,
    jugadores_equipo:["Eric","Ert","Jamo"], jugadores_rivales:["Arnau","Diaz","Batalla"]
  },
  {
    formato:"3vs3", resultado:false, puntos_totales:6, puntos_rivales:13, minutos:15,
    puntos:6, asistencias:0, rebotes:6, tapones:0, triples_intentados:2, triples_anotados:0,
    jugadores_equipo:["Eric","Roger","Jamo"], jugadores_rivales:["Arnau","Diaz","Ert"]
  },
  {
    formato:"3vs3", resultado:false, puntos_totales:6, puntos_rivales:13, minutos:15,
    puntos:2, asistencias:1, rebotes:2, tapones:0, triples_intentados:0, triples_anotados:0,
    jugadores_equipo:["Eric","Diaz","Ert"], jugadores_rivales:["Arnau","Batalla","Roger"]
  },
  {
    formato:"3vs3", resultado:true, puntos_totales:12, puntos_rivales:4, minutos:15,
    puntos:6, asistencias:2, rebotes:5, tapones:1, triples_intentados:0, triples_anotados:0,
    jugadores_equipo:["Eric","Diaz","Ert"], jugadores_rivales:["Arnau","Batalla","Roger"]
  },
  {
    formato:"3vs3", resultado:false, puntos_totales:6, puntos_rivales:11, minutos:15,
    puntos:4, asistencias:1, rebotes:8, tapones:0, triples_intentados:0, triples_anotados:0,
    jugadores_equipo:["Eric","Ert","Jamo"], jugadores_rivales:["Arnau","Diaz","Roger"]
  },
  {
    formato:"3vs3", resultado:false, puntos_totales:10, puntos_rivales:13, minutos:15,
    puntos:5, asistencias:1, rebotes:12, tapones:0, triples_intentados:2, triples_anotados:1,
    jugadores_equipo:["Eric","Arnau","Batalla"], jugadores_rivales:["Jamo","Roger","Diaz"]
  },
  {
    formato:"3vs3", resultado:true, puntos_totales:11, puntos_rivales:2, minutos:10,
    puntos:6, asistencias:2, rebotes:4, tapones:0, triples_intentados:0, triples_anotados:0,
    jugadores_equipo:["Eric","Ert","Roger"], jugadores_rivales:["Jamo","Arnau","Batalla"]
  },
  {
    formato:"3vs3", resultado:true, puntos_totales:11, puntos_rivales:0, minutos:10,
    puntos:7, asistencias:2, rebotes:2, tapones:0, triples_intentados:1, triples_anotados:1,
    jugadores_equipo:["Eric","Ert","Diaz"], jugadores_rivales:["Jamo","Arnau","Batalla"]
  },
  {
    formato:"3vs3", resultado:true, puntos_totales:21, puntos_rivales:16, minutos:25,
    puntos:11, asistencias:2, rebotes:8, tapones:1, triples_intentados:2, triples_anotados:1,
    jugadores_equipo:["Eric","Arnau","Jamo"], jugadores_rivales:["Roger","Ert","Diaz"]
  },
  {
    formato:"4vs4", resultado:true, puntos_totales:23, puntos_rivales:20, minutos:30,
    puntos:6, asistencias:5, rebotes:8, tapones:1, triples_intentados:2, triples_anotados:0,
    jugadores_equipo:["Eric","Aleix","Ot","Jamo"], jugadores_rivales:["Ert","Diaz","Moya","Andreu"]
  },
  {
    formato:"3vs3", resultado:false, puntos_totales:19, puntos_rivales:22, minutos:30,
    puntos:9, asistencias:1, rebotes:3, tapones:0, triples_intentados:2, triples_anotados:1,
    jugadores_equipo:["Eric","Diaz","Ot"], jugadores_rivales:["Aleix","Jamo","Ert"]
  },
  {
    formato:"3vs3", resultado:true, puntos_totales:22, puntos_rivales:9, minutos:25,
    puntos:12, asistencias:2, rebotes:11, tapones:0, triples_intentados:0, triples_anotados:0,
    jugadores_equipo:["Eric","Diaz","Ot"], jugadores_rivales:["Aleix","Jamo","Ert"]
  },
  {
    formato:"2vs2", resultado:true, puntos_totales:12, puntos_rivales:4, minutos:15,
    puntos:10, asistencias:1, rebotes:7, tapones:0, triples_intentados:0, triples_anotados:0,
    jugadores_equipo:["Eric","Diaz"], jugadores_rivales:["Aleix","Ert"]
  },
  {
    formato:"5vs5", resultado:true, puntos_totales:49, puntos_rivales:41, minutos:40,
    puntos:13, asistencias:5, rebotes:17, tapones:2, triples_intentados:2, triples_anotados:1,
    jugadores_equipo:["Eric","Ert","Ot","Roger","Jamo"], jugadores_rivales:["Batalla","Pep","Cavi","Aleix","Llongueras"]
  },
  {
    formato:"5vs5", resultado:true, puntos_totales:7, puntos_rivales:0, minutos:10,
    puntos:2, asistencias:0, rebotes:2, tapones:0, triples_intentados:0, triples_anotados:0,
    jugadores_equipo:["Eric","Llongueras","Ot","Aleix","Jamo"], jugadores_rivales:["Batalla","Arnau","Diaz","Grinyo","Roger"]
  },
  {
    formato:"4vs4", resultado:false, puntos_totales:2, puntos_rivales:11, minutos:15,
    puntos:0, asistencias:1, rebotes:2, tapones:0, triples_intentados:0, triples_anotados:0,
    jugadores_equipo:["Eric","Batalla","Ot","Aleix"], jugadores_rivales:["Llongueras","Arnau","Diaz","Cavi"]
  },
  {
    formato:"4vs4", resultado:false, puntos_totales:8, puntos_rivales:12, minutos:15,
    puntos:8, asistencias:0, rebotes:5, tapones:1, triples_intentados:1, triples_anotados:0,
    jugadores_equipo:["Eric","Batalla","Ot","Aleix"], jugadores_rivales:["Jamo","Ert","Roger","Grinyo"]
  },
  {
    formato:"4vs4", resultado:true, puntos_totales:12, puntos_rivales:3, minutos:15,
    puntos:4, asistencias:1, rebotes:7, tapones:0, triples_intentados:1, triples_anotados:0,
    jugadores_equipo:["Eric","Batalla","Ot","Aleix"], jugadores_rivales:["Llongueras","Arnau","Diaz","Cavi"]
  },
  {
    formato:"4vs4", resultado:true, puntos_totales:11, puntos_rivales:9, minutos:15,
    puntos:5, asistencias:1, rebotes:8, tapones:2, triples_intentados:1, triples_anotados:1,
    jugadores_equipo:["Eric","Batalla","Ot","Aleix"], jugadores_rivales:["Jamo","Ert","Roger","Grinyo"]
  },
  {
    formato:"4vs4", resultado:false, puntos_totales:6, puntos_rivales:11, minutos:15,
    puntos:2, asistencias:2, rebotes:7, tapones:0, triples_intentados:2, triples_anotados:0,
    jugadores_equipo:["Eric","Batalla","Ot","Aleix"], jugadores_rivales:["Llongueras","Arnau","Diaz","Cavi"]
  },
  {
    formato:"4vs4", resultado:true, puntos_totales:12, puntos_rivales:8, minutos:15,
    puntos:8, asistencias:1, rebotes:5, tapones:1, triples_intentados:0, triples_anotados:0,
    jugadores_equipo:["Eric","Batalla","Ot","Aleix"], jugadores_rivales:["Jamo","Ert","Roger","Grinyo"]
  },
  {
    formato:"4vs4", resultado:false, puntos_totales:5, puntos_rivales:11, minutos:15,
    puntos:2, asistencias:0, rebotes:3, tapones:0, triples_intentados:0, triples_anotados:0,
    jugadores_equipo:["Eric","Batalla","Ot","Aleix"], jugadores_rivales:["Llongueras","Arnau","Diaz","Cavi"]
  },
  {
    formato:"3vs3", resultado:false, puntos_totales:12, puntos_rivales:22, minutos:25,
    puntos:6, asistencias:2, rebotes:6, tapones:0, triples_intentados:2, triples_anotados:0,
    jugadores_equipo:["Eric","Aleix","Grinyo"], jugadores_rivales:["Jamo","Ert","Nuria"]
  },
  {
    formato:"3vs3", resultado:true, puntos_totales:21, puntos_rivales:16, minutos:25,
    puntos:12, asistencias:1, rebotes:7, tapones:0, triples_intentados:1, triples_anotados:0,
    jugadores_equipo:["Eric","Ert","Jamo"], jugadores_rivales:["Aleix","Grinyo","Nuria"]
  },
  {
    formato:"3vs3", resultado:false, puntos_totales:20, puntos_rivales:23, minutos:30,
    puntos:14, asistencias:2, rebotes:7, tapones:1, triples_intentados:3, triples_anotados:0,
    jugadores_equipo:["Eric","Aleix","Grinyo"], jugadores_rivales:["Jamo","Ert","Nuria"]
  },
  {
    formato:"3vs3", resultado:true, puntos_totales:22, puntos_rivales:4, minutos:25,
    puntos:9, asistencias:5, rebotes:10, tapones:0, triples_intentados:1, triples_anotados:1,
    jugadores_equipo:["Eric","Jamo","Ert"], jugadores_rivales:["Aleix","Grinyo","Nuria"]
  },
  {
    formato:"3vs3", resultado:true, puntos_totales:23, puntos_rivales:13, minutos:25,
    puntos:8, asistencias:4, rebotes:8, tapones:0, triples_intentados:1, triples_anotados:0,
    jugadores_equipo:["Eric","Jamo","Grinyo"], jugadores_rivales:["Aleix","Ert","Nuria"]
  },
  {
    formato:"3vs3", resultado:false, puntos_totales:7, puntos_rivales:11, minutos:15,
    puntos:2, asistencias:1, rebotes:4, tapones:0, triples_intentados:0, triples_anotados:0,
    jugadores_equipo:["Eric","Llongueras","Grinyo"], jugadores_rivales:["Aleix","Ert","Jamo"]
  },
  {
    formato:"3vs3", resultado:true, puntos_totales:12, puntos_rivales:0, minutos:10,
    puntos:8, asistencias:1, rebotes:3, tapones:0, triples_intentados:0, triples_anotados:0,
    jugadores_equipo:["Eric","Moya","Jamo"], jugadores_rivales:["Aleix","Ert","Grinyo"]
  },
  {
    formato:"3vs3", resultado:true, puntos_totales:13, puntos_rivales:2, minutos:15,
    puntos:4, asistencias:1, rebotes:7, tapones:0, triples_intentados:1, triples_anotados:0,
    jugadores_equipo:["Eric","Moya","Jamo"], jugadores_rivales:["Llongueras","Ert","Aleix"]
  },
  {
    formato:"3vs3", resultado:true, puntos_totales:12, puntos_rivales:4, minutos:15,
    puntos:6, asistencias:1, rebotes:6, tapones:0, triples_intentados:0, triples_anotados:0,
    jugadores_equipo:["Eric","Moya","Ert"], jugadores_rivales:["Llongueras","Aleix","Grinyo"]
  },
  {
    formato:"3vs3", resultado:true, puntos_totales:22, puntos_rivales:7, minutos:25,
    puntos:6, asistencias:5, rebotes:9, tapones:1, triples_intentados:1, triples_anotados:0,
    jugadores_equipo:["Eric","Ert","Jamo"], jugadores_rivales:["Moya","Aleix","Grinyo"]
  },
  {
    formato:"3vs3", resultado:true, puntos_totales:21, puntos_rivales:7, minutos:25,
    puntos:9, asistencias:4, rebotes:7, tapones:0, triples_intentados:5, triples_anotados:1,
    jugadores_equipo:["Eric","Jamo","Aleix"], jugadores_rivales:["Moya","Ert","Grinyo"]
  },
  {
    formato:"3vs3", resultado:true, puntos_totales:22, puntos_rivales:4, minutos:25,
    puntos:11, asistencias:3, rebotes:5, tapones:2, triples_intentados:2, triples_anotados:1,
    jugadores_equipo:["Eric","Ert","Aleix"], jugadores_rivales:["Jamo","Cavi","Grinyo"]
  },
  {
    formato:"3vs3", resultado:true, puntos_totales:22, puntos_rivales:18, minutos:30,
    puntos:6, asistencias:2, rebotes:10, tapones:1, triples_intentados:2, triples_anotados:0,
    jugadores_equipo:["Eric","Ert","Cavi"], jugadores_rivales:["Jamo","Aleix","Grinyo"]
  },
  {
    formato:"3vs3", resultado:true, puntos_totales:23, puntos_rivales:11, minutos:25,
    puntos:11, asistencias:1, rebotes:6, tapones:2, triples_intentados:2, triples_anotados:1,
    jugadores_equipo:["Eric","Jamo","Aleix"], jugadores_rivales:["Cavi","Ert","Grinyo"]
  },
  {
    formato:"3vs3", resultado:true, puntos_totales:22, puntos_rivales:10, minutos:25,
    puntos:8, asistencias:2, rebotes:11, tapones:1, triples_intentados:1, triples_anotados:0,
    jugadores_equipo:["Eric","Cavi","Aleix"], jugadores_rivales:["Jamo","Ert","Grinyo"]
  },
  {
    formato:"3vs3", resultado:false, puntos_totales:13, puntos_rivales:22, minutos:25,
    puntos:6, asistencias:2, rebotes:8, tapones:0, triples_intentados:1, triples_anotados:0,
    jugadores_equipo:["Eric","Pere","Arnau"], jugadores_rivales:["Jamo","Grinyó","Dani"]
  },
  {
    formato:"3vs3", resultado:false, puntos_totales:20, puntos_rivales:23, minutos:30,
    puntos:8, asistencias:2, rebotes:5, tapones:2, triples_intentados:1, triples_anotados:0,
    jugadores_equipo:["Eric","Jamo","Arnau"], jugadores_rivales:["Pere","Grinyó","Dani"]
  },
  {
    formato:"3vs3", resultado:true, puntos_totales:22, puntos_rivales:7, minutos:25,
    puntos:9, asistencias:3, rebotes:4, tapones:0, triples_intentados:3, triples_anotados:1,
    jugadores_equipo:["Eric","Arnau","Dani"], jugadores_rivales:["Pere","Grinyó","Jamo"]
  },
  {
    formato:"3vs3", resultado:true, puntos_totales:21, puntos_rivales:3, minutos:20,
    puntos:6, asistencias:3, rebotes:10, tapones:0, triples_intentados:1, triples_anotados:0,
    jugadores_equipo:["Eric","Arnau","Dani"], jugadores_rivales:["Pere","Grinyó","Jamo"]
  },
  {
    formato:"3vs3", resultado:false, puntos_totales:19, puntos_rivales:23, minutos:25,
    puntos:6, asistencias:2, rebotes:12, tapones:1, triples_intentados:2, triples_anotados:0,
    jugadores_equipo:["Eric","Ert","Raset"], jugadores_rivales:["Aleix","Diaz","Cavi"]
  },
  {
    formato:"3vs3", resultado:false, puntos_totales:13, puntos_rivales:21, minutos:20,
    puntos:8, asistencias:2, rebotes:8, tapones:0, triples_intentados:1, triples_anotados:0,
    jugadores_equipo:["Eric","Ert","Raset"], jugadores_rivales:["Aleix","Diaz","Cavi"]
  },
  {
    formato:"3vs3", resultado:true, puntos_totales:21, puntos_rivales:5, minutos:20,
    puntos:12, asistencias:1, rebotes:5, tapones:0, triples_intentados:1, triples_anotados:0,
    jugadores_equipo:["Eric","Ert","Cavi"], jugadores_rivales:["Aleix","Diaz","Raset"]
  }
];
