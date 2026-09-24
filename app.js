// ==========================
    // Utilidades
    // ==========================
    const norm = (s)=> (s||"").toString().trim().toLowerCase();
    const fmtPct = (x)=> isFinite(x) ? `${(Math.round(x*10)/10).toFixed(1)}%` : '-';
    const fmt1 = (x)=> isFinite(x) ? (Math.round(x*10)/10).toFixed(1) : '-';
    const plural = (value, singular, pluralForm) => value === 1 ? singular : pluralForm;

    // ==========================
    // Clases (migración de Python a JS)
    // ==========================
    class Partido{
      constructor({formato, resultado, puntos_totales, puntos_rivales, minutos, puntos, asistencias, rebotes, tapones, triples_intentados, triples_anotados, jugadores_equipo, jugadores_rivales}){
        this.formato = formato; this.resultado = !!resultado;
        this.puntos_totales = puntos_totales; this.puntos_rivales = puntos_rivales;
        this.minutos = minutos; this.puntos = puntos; this.asistencias = asistencias; this.rebotes = rebotes; this.tapones = tapones;
        this.triples_intentados = triples_intentados; this.triples_anotados = triples_anotados;
        this.jugadores_equipo = jugadores_equipo; this.jugadores_rivales = jugadores_rivales;
      }
      calcular_porcentaje_triples(){ return this.triples_intentados === 0 ? 0 : (this.triples_anotados / this.triples_intentados * 100); }
      calcular_mas_menos(){ return this.puntos_totales - this.puntos_rivales; }
      calcular_mas_menos_jugadores_equipo(){ const r={}; for(const j of this.jugadores_equipo) r[j]=(r[j]||0)+this.calcular_mas_menos(); return r; }
      calcular_mas_menos_jugadores_rivales(){ const r={}; for(const j of this.jugadores_rivales) r[j]=(r[j]||0)-this.calcular_mas_menos(); return r; }
      calcular_valoracion(){ return this.puntos + this.rebotes + this.asistencias + this.tapones - (3*(this.triples_intentados - this.triples_anotados)) + this.calcular_mas_menos(); }
      calcular_contribucion(){ return this.puntos + 2*this.asistencias; }
      calcular_puntos_por_minuto(){ return this.minutos ? this.puntos/this.minutos : 0; }
      calcular_rebotes_por_minuto(){ return this.minutos ? this.rebotes/this.minutos : 0; }
      calcular_asistencias_por_minuto(){ return this.minutos ? this.asistencias/this.minutos : 0; }
      calcular_tapones_por_minuto(){ return this.minutos ? this.tapones/this.minutos : 0; }
    }

    class Temporada{
      constructor(partidos){ this.partidos = partidos; }

      calcular_estadisticas_totales(){
        let ptsT=0, ptsR=0, min=0, pts=0, ast=0, reb=0, blk=0, t3i=0, t3a=0;
        for(const p of this.partidos){
          ptsT+=p.puntos_totales; ptsR+=p.puntos_rivales; min+=p.minutos; pts+=p.puntos; ast+=p.asistencias; reb+=p.rebotes; blk+=p.tapones; t3i+=p.triples_intentados; t3a+=p.triples_anotados;
        }
        return {
          partidos:this.partidos.length,
          puntos_totales:ptsT, puntos_rivales:ptsR, minutos:min,
          puntos:pts, asistencias:ast, rebotes:reb, tapones:blk,
          triples_intentados:t3i, triples_anotados:t3a
        };
      }

      estadisticas_por_partido(){
        const t=this.calcular_estadisticas_totales(); const n=Math.max(t.partidos,1);
        return {
          puntos_equipo_pp: +(t.puntos_totales/n).toFixed(1),
          puntos_rivales_pp: +(t.puntos_rivales/n).toFixed(1),
          minutos_pp: +(t.minutos/n).toFixed(1),
          puntos_pp: +(t.puntos/n).toFixed(1), rebotes_pp: +(t.rebotes/n).toFixed(1), asistencias_pp: +(t.asistencias/n).toFixed(1), tapones_pp: +(t.tapones/n).toFixed(1),
          triples_i_pp: +(t.triples_intentados/n).toFixed(1), triples_a_pp: +(t.triples_anotados/n).toFixed(1),
          pct_triples: t.triples_intentados? +((t.triples_anotados/t.triples_intentados*100).toFixed(2)) : 0
        }
      }

      jugadores_disponibles(minPartidos=5){
        const pj={};
        for(const p of this.partidos){
          for(const j of [...p.jugadores_equipo, ...p.jugadores_rivales]) pj[j]=(pj[j]||0)+1;
        }
        const arr=Object.entries(pj).filter(([,n])=>n>=minPartidos).sort((a,b)=> a[0].localeCompare(b[0]));
        return arr; // [ [jugador, partidos], ... ]
      }

      calcular_mas_menos_total_jugadores(){
        const mm={};
        for(const p of this.partidos){
          for(const [j,v] of Object.entries(p.calcular_mas_menos_jugadores_equipo())) mm[j]=(mm[j]||0)+v;
          for(const [j,v] of Object.entries(p.calcular_mas_menos_jugadores_rivales())) mm[j]=(mm[j]||0)+v;
        }
        return Object.entries(mm).sort((a,b)=> b[1]-a[1]);
      }

      calcular_mas_menos_por_partido_jugadores(){
        const mm={}, pj={};
        for(const p of this.partidos){
          for(const [j,v] of Object.entries(p.calcular_mas_menos_jugadores_equipo())){ mm[j]=(mm[j]||0)+v; pj[j]=(pj[j]||0)+1; }
          for(const [j,v] of Object.entries(p.calcular_mas_menos_jugadores_rivales())){ mm[j]=(mm[j]||0)+v; pj[j]=(pj[j]||0)+1; }
        }
        const prom={};
        for(const j of Object.keys(mm)) if(pj[j]>=5) prom[j]=mm[j]/pj[j];
        return Object.entries(prom).sort((a,b)=> b[1]-a[1]);
      }

      calcular_win_rate_total_de_jugadores(){
        const wr={}, pj={};
        for(const p of this.partidos){
          for(const j of p.jugadores_equipo){ wr[j]=(wr[j]||0)+(p.resultado?1:0); pj[j]=(pj[j]||0)+1; }
          for(const j of p.jugadores_rivales){ wr[j]=(wr[j]||0)+(!p.resultado?1:0); pj[j]=(pj[j]||0)+1; }
        }
        const out=[];
        for(const j of Object.keys(wr)) if(pj[j]>=5) out.push([j, +(wr[j]/pj[j]*100).toFixed(1), pj[j]]);
        return out.sort((a,b)=> b[1]-a[1]);
      }

      calcular_win_rate_equipo(equipo){
        const teamSet = new Set(equipo.map(x=>norm(x)));
        let partidos_eq=0, wins=0;
        for(const p of this.partidos){
          const eq = new Set(p.jugadores_equipo.map(norm));
          const rv = new Set(p.jugadores_rivales.map(norm));
          if(equalSets(teamSet, eq)){ partidos_eq++; if(p.resultado) wins++; }
          else if(equalSets(teamSet, rv)){ partidos_eq++; if(!p.resultado) wins++; }
        }
        if(partidos_eq>0) return {"win rate": +(wins/partidos_eq*100).toFixed(1), partidos: partidos_eq};
        return { mensaje: "No han jugado partidos juntos." };
      }

      calcular_win_rate_estimado(equipo){
        const wr = this.calcular_win_rate_total_de_jugadores();
        const wrMap = Object.fromEntries(wr.map(([j,w,])=>[norm(j), w]));
        const pjMap = Object.fromEntries(wr.map(([j,,pj])=>[norm(j), pj]));
        let sum=0, total=0; let faltan=[];
        for(let j of equipo){
          const k=norm(j);
          if(k in wrMap){ sum += wrMap[k]*pjMap[k]; total += pjMap[k]; }
          else faltan.push(j);
        }
        if(total>0) return {estimado: +(sum/total).toFixed(1), faltan};
        return {estimado: null, faltan};
      }

      filtrar_partidos_clutch(){
        const clutch=[];
        for(const p of this.partidos){
          const ganador = Math.max(p.puntos_totales, p.puntos_rivales);
          const perdedor = Math.min(p.puntos_totales, p.puntos_rivales);
          const pct = perdedor/ganador*100;
          if(pct>75) clutch.push(p);
        }
        return clutch;
      }

      calcular_win_rate_clutch(){
        const backup = this.partidos;
        const clutch = this.filtrar_partidos_clutch();
        if(clutch.length===0) return [];
        this.partidos = clutch;
        const wr = this.calcular_win_rate_total_de_jugadores();
        this.partidos = backup;
        return wr;
      }

      calcular_estadisticas_avanzadas(){
        const t=this.calcular_estadisticas_totales();
        // compañeros rivales más frecuentes
        const comp={}, riv={};
        for(const p of this.partidos){
          for(const j of p.jugadores_equipo) comp[j]=(comp[j]||0)+1;
          for(const j of p.jugadores_rivales) riv[j]=(riv[j]||0)+1;
        }
        const ordenComp = Object.keys(comp).sort((a,b)=> comp[b]-comp[a]);
        const ordenRiv = Object.keys(riv).sort((a,b)=> riv[b]-riv[a]);
        const jugadores_equipo = ordenComp.slice(1,4); // saltar al más frecuente (suele ser el propio usuario)
        const jugadores_rivales = ordenRiv.slice(0,3);

        let valoracion=0, contribucion=0, win=0, mas_menos=0, ppm=0, rpm=0, apm=0, bpm=0;
        for(const p of this.partidos){
          valoracion += p.calcular_valoracion();
          contribucion += p.calcular_contribucion();
          if(p.resultado) win += 1;
          mas_menos += p.calcular_mas_menos();
          ppm += p.calcular_puntos_por_minuto();
          rpm += p.calcular_rebotes_por_minuto();
          apm += p.calcular_asistencias_por_minuto();
          bpm += p.calcular_tapones_por_minuto();
        }
        const n=this.partidos.length||1;
        return {
          jugadores_equipo, jugadores_rivales,
          valoracion, valoracion_por_partido: valoracion/n, contribucion,
          win_rate: win/n*100,
          mas_menos,
          puntos_por_minuto: ppm/n,
          rebotes_por_minuto: rpm/n,
          asistencias_por_minuto: apm/n,
          tapones_por_minuto: bpm/n,
          puntos_totales_equipo: t.puntos_totales
        };
      }

      // Nuevo método para calcular estadísticas de un jugador específico
      calcular_estadisticas_jugador(nombreJugador){
        const jugadorNorm = norm(nombreJugador);
        let partidos_jugados = 0, victorias = 0;
        let puntos_totales = 0, asistencias_totales = 0, rebotes_totales = 0, tapones_totales = 0;
        let triples_intentados_totales = 0, triples_anotados_totales = 0, minutos_totales = 0;
        let mas_menos_total = 0, valoracion_total = 0, contribucion_total = 0;
        let puntos_equipo_total = 0;

        for(const p of this.partidos){
          const enEquipo = p.jugadores_equipo.some(j => norm(j) === jugadorNorm);
          const enRivales = p.jugadores_rivales.some(j => norm(j) === jugadorNorm);
          
          if(enEquipo || enRivales){
            partidos_jugados++;
            
            if(enEquipo){
              if(p.resultado) victorias++;
              mas_menos_total += p.calcular_mas_menos();
              puntos_equipo_total += p.puntos_totales;
            } else {
              if(!p.resultado) victorias++;
              mas_menos_total -= p.calcular_mas_menos();
              puntos_equipo_total += p.puntos_rivales;
            }
            
            // Solo sumamos las estadísticas individuales si es "Eric" (el jugador principal)
            if(jugadorNorm === 'eric'){
              puntos_totales += p.puntos;
              asistencias_totales += p.asistencias;
              rebotes_totales += p.rebotes;
              tapones_totales += p.tapones;
              triples_intentados_totales += p.triples_intentados;
              triples_anotados_totales += p.triples_anotados;
              minutos_totales += p.minutos;
              valoracion_total += p.calcular_valoracion();
              contribucion_total += p.calcular_contribucion();
            }
          }
        }

        const win_rate = partidos_jugados > 0 ? (victorias / partidos_jugados * 100) : 0;
        const pct_triples = triples_intentados_totales > 0 ? (triples_anotados_totales / triples_intentados_totales * 100) : 0;

        return {
          nombre: nombreJugador,
          partidos_jugados,
          victorias,
          win_rate,
          puntos_totales,
          asistencias_totales,
          rebotes_totales,
          tapones_totales,
          triples_intentados_totales,
          triples_anotados_totales,
          pct_triples,
          minutos_totales,
          mas_menos_total,
          valoracion_total,
          contribucion_total,
          puntos_equipo_total,
          // Promedios por partido
          puntos_pp: partidos_jugados > 0 ? puntos_totales / partidos_jugados : 0,
          asistencias_pp: partidos_jugados > 0 ? asistencias_totales / partidos_jugados : 0,
          rebotes_pp: partidos_jugados > 0 ? rebotes_totales / partidos_jugados : 0,
          tapones_pp: partidos_jugados > 0 ? tapones_totales / partidos_jugados : 0,
          minutos_pp: partidos_jugados > 0 ? minutos_totales / partidos_jugados : 0,
          mas_menos_pp: partidos_jugados > 0 ? mas_menos_total / partidos_jugados : 0,
          // Estadísticas por minuto
          puntos_por_minuto: minutos_totales > 0 ? puntos_totales / minutos_totales : 0,
          asistencias_por_minuto: minutos_totales > 0 ? asistencias_totales / minutos_totales : 0,
          rebotes_por_minuto: minutos_totales > 0 ? rebotes_totales / minutos_totales : 0,
          tapones_por_minuto: minutos_totales > 0 ? tapones_totales / minutos_totales : 0
        };
      }

      // Nuevo método para calcular estadísticas según el tipo de partido
        calcular_estadisticas_por_tipo_de_partido() {
        // Si uno de los dos equipos acaba con 11, 12 o 13 puntos hay que guardar todas las stats sumadas y crear el tipo de partido a 11 puntos.
        if (this.partidos.length === 0) return {};
        const tipos = {};
        for (const p of this.partidos) {
          let tipo;
          if (p.puntos_totales === 11 || p.puntos_rivales === 11 || p.puntos_totales === 12 || p.puntos_rivales === 12 || p.puntos_totales === 13 || p.puntos_rivales === 13) {
            tipo = 'A 11 puntos';
          }
          // Si uno de los dos equipos acaba con 21, 22 o 23 puntos hay que guardar todas las stats sumadas y crear el tipo de partido a 21 puntos.
          else if (p.puntos_totales === 21 || p.puntos_rivales === 21 || p.puntos_totales === 22 || p.puntos_rivales === 22 || p.puntos_totales === 23 || p.puntos_rivales === 23) {
            tipo = 'A 21 puntos';
          }
          // Si uno de los equipos acaba con un número diferente a los comentados hay que guardar las stats sumadas y crear el tipo de partido otros.
          else {
            tipo = 'Otros';
          }
          if (!(tipo in tipos)) {
            tipos[tipo] = {
              partidos: 0,
              puntos_totales: 0,
              puntos_rivales: 0,
              minutos: 0,
              puntos: 0,
              asistencias: 0,
              rebotes: 0,
              tapones: 0,
              triples_intentados: 0,
              triples_anotados: 0
            };
          }
          tipos[tipo].partidos += 1;
          tipos[tipo].puntos_totales += p.puntos_totales;
          tipos[tipo].puntos_rivales += p.puntos_rivales;
          tipos[tipo].minutos += p.minutos;
          tipos[tipo].puntos += p.puntos;
          tipos[tipo].asistencias += p.asistencias;
          tipos[tipo].rebotes += p.rebotes;
          tipos[tipo].tapones += p.tapones;
          tipos[tipo].triples_intentados += p.triples_intentados;
          tipos[tipo].triples_anotados += p.triples_anotados;
        }
        return tipos;
      }

      calcular_estadisticas_jugador_por_categoria(nombreJugador, categoria = 'puntuacion') {
        const jugadorNorm = norm(nombreJugador);
        const tipos = {};
        for (const p of this.partidos) {
          const enEquipo = p.jugadores_equipo.some(j => norm(j) === jugadorNorm);
          const enRivales = p.jugadores_rivales.some(j => norm(j) === jugadorNorm);
          if (!enEquipo && !enRivales) continue;
          const tipo = categoria === 'formato' ? p.formato : getPuntuacionCategoria(p);
          if (!(tipo in tipos)) tipos[tipo] = {
            partidos: 0, victorias: 0, mas_menos_total: 0,
            puntos: 0, rebotes: 0, asistencias: 0,
            triples_intentados: 0, triples_anotados: 0
          };
          const datos = tipos[tipo];
          datos.partidos += 1;
          datos.victorias += enEquipo === p.resultado ? 1 : 0;
          datos.mas_menos_total += p.calcular_mas_menos() * (enEquipo ? 1 : -1);
          if (enEquipo && jugadorNorm === 'eric') {
            datos.puntos += p.puntos;
            datos.rebotes += p.rebotes;
            datos.asistencias += p.asistencias;
            datos.triples_intentados += p.triples_intentados;
            datos.triples_anotados += p.triples_anotados;
          }
        }
        for (const datos of Object.values(tipos)) {
          datos.win_rate = datos.victorias / datos.partidos * 100;
          datos.mas_menos_pp = datos.mas_menos_total / datos.partidos;
          datos.puntos_pp = datos.puntos / datos.partidos;
          datos.rebotes_pp = datos.rebotes / datos.partidos;
          datos.asistencias_pp = datos.asistencias / datos.partidos;
        }
        return tipos;
      }

      calcular_estadisticas_jugador_por_tipo_de_partido(nombreJugador) {
        return this.calcular_estadisticas_jugador_por_categoria(nombreJugador, 'puntuacion');
      }

      calcular_estadisticas_jugador_por_formato(nombreJugador) {
        return this.calcular_estadisticas_jugador_por_categoria(nombreJugador, 'formato');
      }
      
      // Obtener todos los jugadores únicos
      obtener_todos_jugadores(){
        const jugadores = new Set();
        for(const p of this.partidos){
          for(const j of p.jugadores_equipo) jugadores.add(j);
          for(const j of p.jugadores_rivales) jugadores.add(j);
        }
        return Array.from(jugadores).sort();
      }
    }

    function equalSets(a,b){ if(a.size!==b.size) return false; for(const v of a) if(!b.has(v)) return false; return true; }
    const partidos = partidosRaw.map(p=> new Partido(p));

    function getPuntuacionCategoria(p) {
        const puntos = [p.puntos_totales, p.puntos_rivales];
        if (puntos.some(v => v >= 11 && v <= 13)) return 'A 11 puntos';
        if (puntos.some(v => v >= 21 && v <= 23)) return 'A 21 puntos';
        return 'Otros';
    }

    function getPartidosFiltrados(formato = 'Todos', puntuacion = 'Todos', jugador = '') {
        let filtrados = partidos;
        if (formato !== 'Todos') filtrados = filtrados.filter(p => p.formato === formato);
        if (puntuacion !== 'Todos') filtrados = filtrados.filter(p => getPuntuacionCategoria(p) === puntuacion);
        if (jugador) {
          const jugadorNorm = norm(jugador);
          filtrados = filtrados.filter(p => [...p.jugadores_equipo, ...p.jugadores_rivales].some(j => norm(j) === jugadorNorm));
        }
        return filtrados;
    }

    const temporada = new Temporada(partidos);

    // Los perfiles individuales pueden sobrescribir este valor con su propiedad "equipo".
    const EQUIPO_POR_DEFECTO = 'Safa Sabadell';
    const ESCUDO_POR_DEFECTO = 'images/safa.png';
    const perfilesJugadores = {
      eric: {
        // Edita estos valores a mano cuando tengas los datos reales del jugador.
        nombreMostrado: 'Eric',
        equipo: 'Salesians Sabadell',
        escudoUrl: 'images/salesians.png',
        dorsal: '#12',
        posicion: 'AP',
        alturaCm: 187,
        pesoKg: 79,
        fechaNacimiento: '2004-10-31',
        fotoUrl: 'images/Eric.jpg',
        esJugadorPrincipal: true // activa el bloque de stats avanzadas de Eric
      },
      raset: { nombreMostrado: 'Raset', dorsal: '#0', posicion: 'ES', alturaCm: 181, pesoKg: 89, fechaNacimiento: '2004-09-23' },
      diaz: { nombreMostrado: 'Diaz', dorsal: '#25', posicion: 'AL', alturaCm: 183, pesoKg: 74, fechaNacimiento: '2004-11-16' },
      pep: { nombreMostrado: 'Pep', dorsal: '#13', posicion: 'ES', alturaCm: 176, pesoKg: 72, fechaNacimiento: '2004-02-11' },
      cavi: { nombreMostrado: 'Cavi', dorsal: '#5', posicion: 'AP', alturaCm: 190, pesoKg: 90, fechaNacimiento: '2004-07-21' },
      grinyo: { nombreMostrado: 'Grinyo', dorsal: '#3', posicion: 'P', alturaCm: 191, pesoKg: 73, fechaNacimiento: '2004-07-20' },
      moya: { nombreMostrado: 'Moya', dorsal: '#21', posicion: 'BA', alturaCm: 170, pesoKg: 68, fechaNacimiento: '2004-02-02' },
      batalla: { nombreMostrado: 'Batalla', dorsal: '#34', posicion: 'AL', alturaCm: 179, pesoKg: 59, fechaNacimiento: '2004-10-21' },
      jamo: { nombreMostrado: 'Jamo', dorsal: '#19', posicion: 'P', alturaCm: 198, pesoKg: 70, fechaNacimiento: '2004-08-02' },
      llongueras: { nombreMostrado: 'Llongueras', dorsal: '#15', posicion: 'BA', alturaCm: 173, pesoKg: 70, fechaNacimiento: '2004-11-02' },
      blasi: { nombreMostrado: 'Blasi', dorsal: '#28', posicion: 'ES', alturaCm: 175, pesoKg: 83, fechaNacimiento: '2004-04-02' },
      ot: { nombreMostrado: 'Ot', dorsal: '#69', posicion: 'AL', alturaCm: 188, pesoKg: 80, fechaNacimiento: '2006-10-02' },
      andreu: { nombreMostrado: 'Andreu', dorsal: '#30', posicion: 'ES', alturaCm: 175, pesoKg: 69, fechaNacimiento: '2005-04-20' },
      arnau: { nombreMostrado: 'Arnau', equipo: 'UB MiR', escudoUrl: 'images/ubmir.png', dorsal: '#10', posicion: 'ES', alturaCm: 176, pesoKg: 73, fechaNacimiento: '2004-01-20' },
      aleix: { nombreMostrado: 'Aleix', dorsal: '#4', posicion: 'BA', alturaCm: 178, pesoKg: 65, fechaNacimiento: '2005-04-30' },
      gomez: { nombreMostrado: 'Gomez', dorsal: '#24', posicion: 'AL', alturaCm: 185, pesoKg: 78, fechaNacimiento: '2004-10-31' },
      ert: { nombreMostrado: 'Ert', dorsal: '#68', posicion: 'AP', alturaCm: 188, pesoKg: 78, fechaNacimiento: '2004-06-28' }
    };

    function obtenerPerfil(nombre) {
      const key = norm(nombre);
      const base = perfilesJugadores[key] || {};
      const nombreMostrado = base.nombreMostrado || nombre || 'Jugador';
      const fotoGenerica = `https://ui-avatars.com/api/?name=${encodeURIComponent((nombreMostrado || 'Jugador').split(/\s+/).slice(0, 2).join(' '))}&background=111&color=fff&size=400`;
      const fotoLocal = `images/${encodeURIComponent(nombreMostrado)}.jpg`;

      return {
        nombreMostrado,
        equipo: base.equipo || EQUIPO_POR_DEFECTO,
        escudoUrl: base.escudoUrl || ESCUDO_POR_DEFECTO,
        dorsal: base.dorsal || '#--',
        posicion: base.posicion || 'Jugador',
        alturaCm: base.alturaCm ?? null,
        pesoKg: base.pesoKg ?? null,
        fechaNacimiento: base.fechaNacimiento || null,
        fotoUrl: base.fotoUrl || fotoLocal,
        esJugadorPrincipal: !!base.esJugadorPrincipal
      };
    }

    function calcularEdad(fechaNacimientoISO) {
      if (!fechaNacimientoISO) return null;
      const fecha = new Date(fechaNacimientoISO);
      if (Number.isNaN(fecha.getTime())) return null;

      const hoy = new Date();
      let edad = hoy.getFullYear() - fecha.getFullYear();
      const mes = hoy.getMonth() - fecha.getMonth();
      if (mes < 0 || (mes === 0 && hoy.getDate() < fecha.getDate())) {
        edad--;
      }
      return edad;
    }

    let jugadorSeleccionadoActual = null;

    function valorVisible(valor) {
      return valor === null || valor === undefined || valor === '' || Number.isNaN(valor) ? '-' : valor;
    }

    // ==========================
    // Render UI
    // ==========================
    const el = (id)=> document.getElementById(id);

    function getFiltrosActivos(){
        return {
            formato: el('selFormato').value,
        puntuacion: el('selPuntuacion').value,
        jugador: el('perfilJugador').value
        };
    }

    function renderPartidos(formato = 'Todos', puntuacion = 'Todos', jugador = ''){
      const f = getPartidosFiltrados(formato, puntuacion, jugador);
      const descripcion = [formato === 'Todos' ? 'todos los formatos' : formato, puntuacion === 'Todos' ? 'todas las puntuaciones' : puntuacion];
        el('infoFormato').textContent = `Hay un total de ${f.length} partidos para ${descripcion[0]} y ${descripcion[1]}.`;
        const grid = el('gridPartidos'); grid.innerHTML = '';
        if(f.length===0){ grid.innerHTML = '<div class="sub">No hay partidos con estos filtros.</div>'; return; }
        f.forEach((p,i)=>{
            const d=document.createElement('div'); d.className='card';
            const mm = p.calcular_mas_menos();
            d.innerHTML = `
            <h3>Partido ${i+1} · ${p.formato}</h3>
            <div class="stat"><span>Resultado</span><span>${p.puntos_totales} - ${p.puntos_rivales} ${p.resultado? '· <span class="chip">Victoria ✅</span>':'· <span class="chip">Derrota ❌</span>'}</span></div>
            <div class="stat"><span>Minutos</span><span>${p.minutos}</span></div>
            <div class="stat"><span>Estadísticas</span><span>${p.puntos} pts · ${p.asistencias} ast · ${p.rebotes} reb · ${p.tapones} blk</span></div>
            <div class="stat"><span>Triples</span><span>${p.triples_anotados}/${p.triples_intentados} (${fmt1(p.calcular_porcentaje_triples())}%)</span></div>
            <div class="stat"><span>+/-</span><span style="color:${mm>=0?'var(--ok)':'var(--bad)'}">${mm>=0?'+':''}${mm}</span></div>
            <div class="sub" style="margin-top:8px">Equipo: ${p.jugadores_equipo.map(j => playerLink(j)).join(', ')} · Rivales: ${p.jugadores_rivales.map(j => playerLink(j)).join(', ')}</div>
            `;
            grid.appendChild(d);
        });
}
    // -------------------------
    // Render de estadísticas filtradas por formato
    // -------------------------
    function renderTemporadaPorFormato(formato = 'Todos', puntuacion = 'Todos', jugador = ''){
    const partidosFiltrados = getPartidosFiltrados(formato, puntuacion, jugador);
    const temp = new Temporada(partidosFiltrados);
    const t = temp.calcular_estadisticas_totales();
    const pp = temp.estadisticas_por_partido();
    const av = temp.calcular_estadisticas_avanzadas();

    el('kpiPartidos').textContent = t.partidos;
    el('kpiPtosEquipo').textContent = t.puntos_totales;
    el('kpiPtosRiv').textContent = t.puntos_rivales;
    el('kpiWR').textContent = fmtPct(av.win_rate);

    const tot = el('totales'); tot.innerHTML = '';
    const addRow=(parent,label,val)=>{
        const r=document.createElement('div'); r.className='row'; r.innerHTML = `<div>${label}</div><div style="text-align:right" colspan="2">${val}</div>`; parent.appendChild(r);
    }
    addRow(tot,'Minutos', t.minutos);
    addRow(tot,'Puntos', t.puntos);
    addRow(tot,'Rebotes', t.rebotes);
    addRow(tot,'Asistencias', t.asistencias);
    addRow(tot,'Tapones', t.tapones);
    addRow(tot,'Triples', `${t.triples_anotados}/${t.triples_intentados}`);

    const ppDiv = el('porPartido'); ppDiv.innerHTML='';
    addRow(ppDiv,'Puntos equipo', pp.puntos_equipo_pp);
    addRow(ppDiv,'Puntos rivales', pp.puntos_rivales_pp);
    addRow(ppDiv,'Minutos', pp.minutos_pp);
    addRow(ppDiv,'Puntos', pp.puntos_pp);
    addRow(ppDiv,'Rebotes', pp.rebotes_pp);
    addRow(ppDiv,'Asistencias', pp.asistencias_pp);
    addRow(ppDiv,'Tapones', pp.tapones_pp);
    addRow(ppDiv,'Triples (i/a)', `${pp.triples_a_pp}/${pp.triples_i_pp} (${pp.pct_triples}%)`);

    const avDiv = el('avanzadas'); avDiv.innerHTML='';
    addRow(avDiv,'Valoración total', av.valoracion);
    addRow(avDiv,'Valoración por partido', fmt1(av.valoracion_por_partido));
    const contribPct = av.puntos_totales_equipo? ((av.contribucion/av.puntos_totales_equipo)*100):0;
    addRow(avDiv,'Contribución total', `${av.contribucion} (${fmt1(contribPct)}%)`);
    addRow(avDiv,'+/- total', av.mas_menos);
    addRow(avDiv,'Win rate', fmtPct(av.win_rate));
    addRow(avDiv,'Puntos por minuto', fmt1(av.puntos_por_minuto));
    addRow(avDiv,'Rebotes por minuto', fmt1(av.rebotes_por_minuto));
    addRow(avDiv,'Asistencias por minuto', fmt1(av.asistencias_por_minuto));
    addRow(avDiv,'Tapones por minuto', fmt1(av.tapones_por_minuto));
    const comp = document.createElement('div'); comp.className='sub';
    comp.textContent = `Compañeros más frecuentes: ${av.jugadores_equipo.join(', ')} · Rivales más frecuentes: ${av.jugadores_rivales.join(', ')}`;
    avDiv.appendChild(comp);

    const tipos = temp.calcular_estadisticas_por_tipo_de_partido();
    const tiposDiv = el('porTipoPartido');
    if (tiposDiv) {
      tiposDiv.innerHTML = '';
      const categorias = Object.keys(tipos);

      if (categorias.length === 0) {
        tiposDiv.innerHTML = '<div class="sub">Sin datos para este formato.</div>';
      } else {
        categorias.forEach(cat => {
          const data = tipos[cat];
          const ptsPP = (data.puntos / data.partidos).toFixed(1);
          const triplesPct = data.triples_intentados > 0 
            ? Math.round((data.triples_anotados / data.triples_intentados) * 100) 
            : 0;

          const block = document.createElement('div');
          block.style.cssText = 'padding: 8px 10px; border: 1px dashed #22314b; border-radius: 10px; margin-bottom: 8px; background: #0f1521;';
          block.innerHTML = `
            <div style="font-weight:600; color:var(--accent); margin-bottom:4px;">${cat} (${data.partidos} pj)</div>
            <div class="stat" style="font-size:12px;"><span>Puntos (tot / pp):</span><span>${data.puntos} (${ptsPP} pp)</span></div>
            <div class="stat" style="font-size:12px;"><span>Marcador global:</span><span>${data.puntos_totales} - ${data.puntos_rivales}</span></div>
            <div class="stat" style="font-size:12px;"><span>Reb / Ast / Tap:</span><span>${data.rebotes} / ${data.asistencias} / ${data.tapones}</span></div>
            <div class="stat" style="font-size:12px;"><span>Triples:</span><span>${data.triples_anotados}/${data.triples_intentados} (${triplesPct}%)</span></div>
          `;
          tiposDiv.appendChild(block);
        });
      }
    }
    }

    function renderColectivasPorFormato(formato = 'Todos', puntuacion = 'Todos', jugador = ''){
    const temp = new Temporada(getPartidosFiltrados(formato, puntuacion, jugador));
    const mmt = temp.calcular_mas_menos_total_jugadores();
    const mmpp = temp.calcular_mas_menos_por_partido_jugadores();
    const wr = temp.calcular_win_rate_total_de_jugadores();

    const list = (id, arr, fmtVal)=>{
        const c=el(id); c.innerHTML='';
        if(arr.length===0){ c.innerHTML='<div class="sub">(Sin datos suficientes)</div>'; return; }
        for(const item of arr){
        const r=document.createElement('div'); r.className='row';
        if(id==='listWR'){
            const [j, w, pj] = item; r.innerHTML = `<div>${playerLink(j)}</div><div style="text-align:right">${fmtPct(w)}</div><div style="text-align:right"><small>${pj} pj</small></div>`;
        }else{
            const [j, v] = item; r.innerHTML = `<div>${playerLink(j)}</div><div style="text-align:right">${v>=0?'+':''}${fmt1(v)}</div><div></div>`;
        }
        c.appendChild(r);
        }
    }
    list('listMasMenosTotal', mmt);
    list('listMasMenosPP', mmpp);
    list('listWR', wr);
    }

    function renderClutchPorFormato(formato = 'Todos', puntuacion = 'Todos', jugador = ''){
    const temp = new Temporada(getPartidosFiltrados(formato, puntuacion, jugador));
    const wr = temp.calcular_win_rate_clutch();
    const c=el('listWRClutch'); c.innerHTML='';
    if(wr.length===0){ c.innerHTML='<div class="sub">No hay partidos muy reñidos.</div>'; return; }
    for(const [j,w,pj] of wr){
        const r=document.createElement('div'); r.className='row';
        r.innerHTML = `<div>${playerLink(j)}</div><div style="text-align:right">${fmtPct(w)}</div><div style="text-align:right"><small>${pj} pj</small></div>`;
        c.appendChild(r);
    }
    }

    // ==========================
    // Estadísticas por jugador
    // ==========================
    function populatePlayerDropdown(){
      const jugadores = temporada.obtener_todos_jugadores();
      const select = el('perfilJugador');
      select.innerHTML = '<option value="">Selecciona un jugador</option>';
      
      for(const jugador of jugadores){
        const option = document.createElement('option');
        option.value = jugador;
        option.textContent = jugador;
        select.appendChild(option);
      }
    }

    // Llamar a la función para poblar el dropdown al cargar la página
    window.populatePlayerDropdown = populatePlayerDropdown;

    function playerLink(nombre) {
      return `<button type="button" class="player-link" data-player="${nombre}">${nombre}</button>`;
    }

    function abrirPerfilJugador(nombre) {
      jugadorSeleccionadoActual = nombre;
      document.querySelector('[data-tab="tab-jugadores"]').click();
      el('vistaIndiceJugadores').hidden = true;
      el('vistaPerfilJugador').hidden = false;
      const { formato, puntuacion, jugador } = getFiltrosActivos();
      renderPerfilDetallado(nombre, formato, puntuacion);
      el('vistaPerfilJugador').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function renderPlayerStats(nombreJugador, formato = 'Todos', puntuacion = 'Todos'){
      const partidosFiltrados = getPartidosFiltrados(formato, puntuacion, nombreJugador);
      const temp = new Temporada(partidosFiltrados);
      const stats = temp.calcular_estadisticas_jugador(nombreJugador);
      
      const statsDiv = el('perfilJugadorStats');
      
      if(stats.partidos_jugados === 0){
        statsDiv.innerHTML = '<div class="sub">Este jugador no tiene partidos registrados en este formato.</div>';
        return;
      }

      const isEric = norm(nombreJugador) === 'eric';
      
      let html = `
        <div style="margin-top:8px; padding:12px; background:#0f1521; border:1px solid #22314b; border-radius:10px;">
          <div style="font-weight:bold; margin-bottom:8px;">${nombreJugador}</div>
          <div class="stat" style="font-size:12px; padding:4px 0;">
            <span>${plural(stats.partidos_jugados, 'Partido jugado', 'Partidos jugados')}:</span><span>${stats.partidos_jugados}</span>
          </div>
          <div class="stat" style="font-size:12px; padding:4px 0;">
            <span>Win rate:</span><span style="color:${stats.win_rate >= 50 ? 'var(--ok)' : 'var(--bad)'}">${fmtPct(stats.win_rate)}</span>
          </div>
          <div class="stat" style="font-size:12px; padding:4px 0;">
            <span>+/- total:</span><span style="color:${stats.mas_menos_total >= 0 ? 'var(--ok)' : 'var(--bad)'}">${stats.mas_menos_total >= 0 ? '+' : ''}${fmt1(stats.mas_menos_total)}</span>
          </div>
          <div class="stat" style="font-size:12px; padding:4px 0;">
            <span>+/- por partido:</span><span style="color:${stats.mas_menos_pp >= 0 ? 'var(--ok)' : 'var(--bad)'}">${stats.mas_menos_pp >= 0 ? '+' : ''}${fmt1(stats.mas_menos_pp)}</span>
          </div>`;

      if(isEric){
        html += `
          <div class="stat" style="font-size:12px; padding:4px 0;">
            <span>Puntos por partido:</span><span>${fmt1(stats.puntos_pp)}</span>
          </div>
          <div class="stat" style="font-size:12px; padding:4px 0;">
            <span>Rebotes por partido:</span><span>${fmt1(stats.rebotes_pp)}</span>
          </div>
          <div class="stat" style="font-size:12px; padding:4px 0;">
            <span>Asistencias por partido:</span><span>${fmt1(stats.asistencias_pp)}</span>
          </div>
          <div class="stat" style="font-size:12px; padding:4px 0;">
            <span>Triples:</span><span>${stats.triples_anotados_totales}/${stats.triples_intentados_totales} (${fmt1(stats.pct_triples)}%)</span>
          </div>`;
      }

      html += '</div>';
      statsDiv.innerHTML = html;
    }

    function renderIndiceJugadores(formato = 'Todos', puntuacion = 'Todos') {
      const partidosFiltrados = getPartidosFiltrados(formato, puntuacion);
      const temp = new Temporada(partidosFiltrados);
      let jugadores = temp.obtener_todos_jugadores();
      const grid = el('gridJugadores');
      const info = el('infoJugadores');

      if (!grid || !info) return;

      grid.innerHTML = '';
      info.textContent = `Mostrando ${jugadores.length} jugadores en ${formato === 'Todos' ? 'todos los formatos' : formato} y ${puntuacion === 'Todos' ? 'todas las puntuaciones' : puntuacion}.`;

      if (jugadores.length === 0) {
        grid.innerHTML = '<div class="sub">No hay jugadores registrados con estos filtros.</div>';
        return;
      }

      const statsPorJugador = new Map(jugadores.map(nombre => [nombre, temp.calcular_estadisticas_jugador(nombre)]));
      const orden = el('selOrdenJugadores')?.value || 'alfabetico';
      const umbralPartidos = Number(el('umbralPartidosJugadores')?.value);
      const umbralWinRate = Number(el('umbralWinRateJugadores')?.value);
      if (Number.isFinite(umbralPartidos) && umbralPartidos >= 0) {
        jugadores = jugadores.filter(nombre => statsPorJugador.get(nombre).partidos_jugados >= umbralPartidos);
      }
      if (Number.isFinite(umbralWinRate) && umbralWinRate >= 0) {
        jugadores = jugadores.filter(nombre => statsPorJugador.get(nombre).win_rate >= umbralWinRate);
      }
      info.textContent = `Mostrando ${jugadores.length} jugadores en ${formato === 'Todos' ? 'todos los formatos' : formato} y ${puntuacion === 'Todos' ? 'todas las puntuaciones' : puntuacion}.`;
      if (jugadores.length === 0) {
        grid.innerHTML = '<div class="sub">No hay jugadores que cumplan este mínimo.</div>';
        return;
      }

      jugadores.sort((a, b) => {
        if (orden === 'partidosAsc' || orden === 'partidosDesc') {
          const diferencia = statsPorJugador.get(a).partidos_jugados - statsPorJugador.get(b).partidos_jugados;
          return orden === 'partidosAsc' ? diferencia : -diferencia;
        }
        if (orden === 'winRateAsc' || orden === 'winRateDesc') {
          const diferencia = statsPorJugador.get(a).win_rate - statsPorJugador.get(b).win_rate;
          return orden === 'winRateAsc' ? diferencia : -diferencia;
        }
        return a.localeCompare(b);
      });

      for (const nombre of jugadores) {
        const perfil = obtenerPerfil(nombre);
        const stats = statsPorJugador.get(nombre);
        const card = document.createElement('div');
        card.className = 'player-card';
        card.dataset.player = nombre;
        card.innerHTML = `
          <div class="player-card-header">
            <img class="player-avatar" src="${perfil.fotoUrl}" alt="${perfil.nombreMostrado}" onerror="this.onerror=null;this.src='https://ui-avatars.com/api/?name=${encodeURIComponent((perfil.nombreMostrado || nombre).substring(0, 2))}&background=111&color=fff&size=80';">
            <div>
              <h3 class="player-card-name">${perfil.nombreMostrado}</h3>
              <div class="player-card-meta">${valorVisible(perfil.dorsal)} · ${valorVisible(perfil.posicion)}</div>
            </div>
          </div>
          <div class="player-card-stats">
            <div class="player-card-stat">
              <span class="label">PJ</span>
              <span class="value">${stats.partidos_jugados}</span>
            </div>
            <div class="player-card-stat">
              <span class="label">Win %</span>
              <span class="value">${fmtPct(stats.win_rate)}</span>
            </div>
          </div>
        `;
        card.addEventListener('click', () => abrirPerfilJugador(nombre));
        grid.appendChild(card);
      }
    }

    function renderPerfilDetallado(nombreJugador, formato = 'Todos', puntuacion = 'Todos') {
      const perfil = obtenerPerfil(nombreJugador);
      const partidosFiltrados = getPartidosFiltrados(formato, puntuacion, nombreJugador);
      const temp = new Temporada(partidosFiltrados);
      const stats = temp.calcular_estadisticas_jugador(nombreJugador);
      const hero = el('perfilHero');
      const texto = el('perfilTexto');

      if (!hero || !texto) return;

      const edad = calcularEdad(perfil.fechaNacimiento);
      const franquicia = valorVisible(perfil.equipo);
      const dorsal = valorVisible(perfil.dorsal);
      const posicion = valorVisible(perfil.posicion);
      const edadTexto = edad === null ? '-' : `${edad} años`;
      const filtrosPerfil = [
        formato !== 'Todos' ? formato : '',
        puntuacion !== 'Todos' ? puntuacion : ''
      ].filter(Boolean);
      const filtroPerfilTexto = filtrosPerfil.length ? filtrosPerfil.join(' · ') : 'Todos los partidos';

      const metrics = perfil.esJugadorPrincipal
        ? [
            { label: 'Puntos / part.', value: fmt1(stats.puntos_pp) },
            { label: 'Rebotes / part.', value: fmt1(stats.rebotes_pp) },
            { label: 'Asistencias / part.', value: fmt1(stats.asistencias_pp) },
            { label: '% triples', value: `${fmt1(stats.pct_triples)}%` }
          ]
        : [
            { label: plural(stats.partidos_jugados, 'Partido jugado', 'Partidos jugados'), value: stats.partidos_jugados },
            { label: plural(stats.victorias, 'Partido ganado', 'Partidos ganados'), value: stats.victorias },
            { label: plural(stats.partidos_jugados - stats.victorias, 'Partido perdido', 'Partidos perdidos'), value: stats.partidos_jugados - stats.victorias },
            { label: 'Win rate', value: fmtPct(stats.win_rate) },
          ];

      hero.innerHTML = `
        <div class="player-filter-badge" title="${filtroPerfilTexto}">${filtroPerfilTexto}</div>
        <img class="player-main-photo" src="${perfil.fotoUrl}" alt="${perfil.nombreMostrado}" onerror="this.onerror=null;this.src='https://ui-avatars.com/api/?name=${encodeURIComponent((perfil.nombreMostrado || nombreJugador).split(/\s+/).slice(0,2).join(' '))}&background=111&color=fff&size=400';">
        <div class="player-logo">
          ${perfil.escudoUrl ? `<img src="${perfil.escudoUrl}" alt="${franquicia}" onerror="this.onerror=null;this.src='https://via.placeholder.com/80x80?text=🏀';">` : '🏀'}
        </div>
        <div class="player-hero-copy">
          <div class="player-hero-meta">${franquicia} | ${dorsal} | ${posicion}</div>
          <h2 class="player-hero-name">${perfil.nombreMostrado}</h2>
        </div>
      `;

      const clutchList = temp.calcular_win_rate_clutch();
      const clutchPlayer = clutchList.find(([jugador]) => norm(jugador) === norm(nombreJugador));
      const clutchValue = clutchPlayer ? fmtPct(clutchPlayer[1]) : 'Sin datos suficientes';

      const bioGrid = [
        ['Altura', perfil.alturaCm ? `${perfil.alturaCm} cm` : '-'],
        ['Peso', perfil.pesoKg ? `${perfil.pesoKg} kg` : '-'],
        ['Edad', edadTexto],
        ['Fecha de nacimiento', perfil.fechaNacimiento ? perfil.fechaNacimiento : '-']
      ];

      let generalHtml = `
        <div class="player-summary-strip">
          ${metrics.map(item => `<div class="player-summary-item"><div class="player-summary-label">${item.label}</div><div class="player-summary-value">${item.value}</div></div>`).join('')}
        </div>
        <div class="bio-grid">
          ${bioGrid.map(([label, value]) => `<div class="bio-item"><div class="bio-label">${label}</div><div class="bio-value">${valorVisible(value)}</div></div>`).join('')}
        </div>
        ${perfil.esJugadorPrincipal ? `<div class="player-section">
          <h3>General</h3>
          <div class="stats-grid">
            <div class="stat-box"><div class="label">${plural(stats.partidos_jugados, 'Partido jugado', 'Partidos jugados')}</div><div class="value">${stats.partidos_jugados}</div></div>
            <div class="stat-box"><div class="label">${plural(stats.victorias, 'Partido ganado', 'Partidos ganados')}</div><div class="value">${stats.victorias}</div></div>
            <div class="stat-box"><div class="label">Win rate</div><div class="value" style="color:${stats.win_rate >= 50 ? 'var(--ok)' : 'var(--bad)'}">${fmtPct(stats.win_rate)}</div></div>
          </div>
        </div>` : ''}
        <div class="player-section">
          <h3>Impacto en el marcador</h3>
          <div class="stats-grid">
            <div class="stat-box"><div class="label">+/- total</div><div class="value" style="color:${stats.mas_menos_total >= 0 ? 'var(--ok)' : 'var(--bad)'}">${stats.mas_menos_total >= 0 ? '+' : ''}${fmt1(stats.mas_menos_total)}</div></div>
            <div class="stat-box"><div class="label">+/- por partido</div><div class="value" style="color:${stats.mas_menos_pp >= 0 ? 'var(--ok)' : 'var(--bad)'}">${stats.mas_menos_pp >= 0 ? '+' : ''}${fmt1(stats.mas_menos_pp)}</div></div>
          </div>
        </div>
        <div class="player-section">
          <h3>Rendimiento clutch</h3>
          <div class="stats-grid">
            <div class="stat-box"><div class="label">Win rate clutch</div><div class="value">${clutchValue}</div></div>
            <div class="stat-box"><div class="label">Partidos clutch</div><div class="value">${clutchPlayer ? clutchPlayer[2] : stats.partidos_jugados < 5 ? 0 : 'Sin datos'}</div></div>
            <div class="stat-box"><div class="label">Criterio</div><div class="value">Min. 5</div></div>
          </div>
        </div>
      `;

      if (perfil.esJugadorPrincipal) {
        generalHtml += `
          <div class="player-section">
            <h3>Estadísticas avanzadas</h3>
            <div class="stats-grid">
              <div class="stat-box"><div class="label">Minutos</div><div class="value">${stats.minutos_totales}</div></div>
              <div class="stat-box"><div class="label">Valoración</div><div class="value">${fmt1(stats.valoracion_total)}</div></div>
              <div class="stat-box"><div class="label">Valoración por partido</div><div class="value">${fmt1(stats.valoracion_total / Math.max(stats.partidos_jugados, 1))}</div></div>
              <div class="stat-box"><div class="label">Contribución</div><div class="value">${fmt1(stats.contribucion_total)} (${fmt1(stats.puntos_equipo_total ? stats.contribucion_total / stats.puntos_equipo_total * 100 : 0)}%)</div></div>
              <div class="stat-box"><div class="label">Puntos totales</div><div class="value">${stats.puntos_totales}</div></div>
              <div class="stat-box"><div class="label">Rebotes</div><div class="value">${stats.rebotes_totales}</div></div>
              <div class="stat-box"><div class="label">Asistencias</div><div class="value">${stats.asistencias_totales}</div></div>
              <div class="stat-box"><div class="label">Triples anotados</div><div class="value">${stats.triples_anotados_totales}</div></div>
              <div class="stat-box"><div class="label">Triples intentados</div><div class="value">${stats.triples_intentados_totales}</div></div>
              <div class="stat-box"><div class="label">Tapones</div><div class="value">${stats.tapones_totales}</div></div>
              <div class="stat-box"><div class="label">Tapones por partido</div><div class="value">${fmt1(stats.tapones_pp)}</div></div>
              <div class="stat-box"><div class="label">Puntos por minuto</div><div class="value">${fmt1(stats.puntos_por_minuto)}</div></div>
            </div>
          </div>
        `;
      }

      const renderCategoryCards = (categoryStats, includeIndividualStats) => Object.entries(categoryStats).map(([tipo, data]) => `
        <div class="type-card">
          <div class="title">${tipo}</div>
          <div class="detail"><span>${plural(data.partidos, 'Partido', 'Partidos')}</span><span>${data.partidos}</span></div>
          <div class="detail"><span>Win rate</span><span>${fmtPct(data.win_rate)}</span></div>
          <div class="detail"><span>+/- total</span><span>${data.mas_menos_total >= 0 ? '+' : ''}${fmt1(data.mas_menos_total)}</span></div>
          <div class="detail"><span>+/- por partido</span><span>${data.mas_menos_pp >= 0 ? '+' : ''}${fmt1(data.mas_menos_pp)}</span></div>
          ${includeIndividualStats ? `
            <div class="detail"><span>Puntos / part.</span><span>${fmt1(data.puntos_pp)}</span></div>
            <div class="detail"><span>Rebotes / part.</span><span>${fmt1(data.rebotes_pp)}</span></div>
            <div class="detail"><span>Asistencias / part.</span><span>${fmt1(data.asistencias_pp)}</span></div>
            <div class="detail"><span>Triples</span><span>${data.triples_anotados}/${data.triples_intentados} (${fmt1(data.triples_intentados ? data.triples_anotados / data.triples_intentados * 100 : 0)}%)</span></div>` : ''}
        </div>`).join('');
      const tipoStats = temp.calcular_estadisticas_jugador_por_tipo_de_partido(nombreJugador);
      const orderedTipoStats = Object.fromEntries(['A 11 puntos', 'A 21 puntos', 'Otros'].filter(tipo => tipo in tipoStats).map(tipo => [tipo, tipoStats[tipo]]));
      const tipoCards = renderCategoryCards(orderedTipoStats, perfil.esJugadorPrincipal);
      const formatoStats = temp.calcular_estadisticas_jugador_por_formato(nombreJugador);
      const formatoOrdenado = Object.fromEntries(['2vs2', '3vs3', '4vs4', '5vs5'].filter(tipo => tipo in formatoStats).map(tipo => [tipo, formatoStats[tipo]]));
      const formatoCards = renderCategoryCards(formatoOrdenado, perfil.esJugadorPrincipal);
      generalHtml += `
        <div class="player-section">
          <h3>Desglose por formato</h3>
          <div class="player-type-cards">${formatoCards || '<div class="sub">Sin datos para este jugador.</div>'}</div>
        </div>
        <div class="player-section">
          <h3>Desglose por tipo de partido</h3>
          <div class="player-type-cards">${tipoCards || '<div class="sub">Sin datos para este jugador.</div>'}</div>
        </div>`;

      texto.innerHTML = generalHtml;
    }

    function mostrarIndiceJugadores() {
      const vistaIndice = el('vistaIndiceJugadores');
      const vistaPerfil = el('vistaPerfilJugador');
      if (vistaIndice) vistaIndice.hidden = false;
      if (vistaPerfil) vistaPerfil.hidden = true;
      if (jugadorSeleccionadoActual) {
        jugadorSeleccionadoActual = null;
      }
    }

    // ==========================
    // Eventos UI
    // ==========================
    function aplicarFiltros(){
      const { formato, puntuacion, jugador } = getFiltrosActivos();
      renderPartidos(formato, puntuacion, jugador);
      renderTemporadaPorFormato(formato, puntuacion, jugador);
      renderColectivasPorFormato(formato, puntuacion, jugador);
      renderClutchPorFormato(formato, puntuacion, jugador);

      const selectedPlayer = el('perfilJugador').value;
      if(selectedPlayer){
        renderPlayerStats(selectedPlayer, formato, puntuacion);
      }

      const activeTab = document.querySelector('.tab.active')?.dataset.tab;
      if (activeTab === 'tab-jugadores') {
        const vistaPerfil = el('vistaPerfilJugador');
        if (vistaPerfil && !vistaPerfil.hidden && jugadorSeleccionadoActual) {
          renderPerfilDetallado(jugadorSeleccionadoActual, formato, puntuacion);
        } else {
          renderIndiceJugadores(formato, puntuacion);
        }
      }
    }

    document.querySelectorAll('.tab').forEach(btn=>{
    btn.addEventListener('click',()=>{
        document.querySelectorAll('.tab').forEach(b=>b.classList.remove('active'));
        btn.classList.add('active');
        const id=btn.dataset.tab;
        document.querySelectorAll('[id^="tab-"]').forEach(v=> v.hidden = (v.id!==id));
        if (id === 'tab-jugadores') {
          jugadorSeleccionadoActual = null;
          document.getElementById('vistaIndiceJugadores').hidden = false;
          document.getElementById('vistaPerfilJugador').hidden = true;
        }
        aplicarFiltros();
    })
    });

    document.addEventListener('click', (event) => {
      const link = event.target.closest('.player-link');
      if (link) abrirPerfilJugador(link.dataset.player);
    });

    el('selFormato').addEventListener('change', ()=>{
      aplicarFiltros();
    });

    el('selPuntuacion').addEventListener('change', ()=>{
      aplicarFiltros();
    });

    el('perfilJugador').addEventListener('change', ()=>{
      const selectedPlayer = el('perfilJugador').value;
      aplicarFiltros();
      if (!selectedPlayer) el('perfilJugadorStats').innerHTML = '';
    });

    el('selOrdenJugadores').addEventListener('change', ()=>{
      const orden = el('selOrdenJugadores').value;
      const umbralPartidos = el('umbralPartidosJugadores');
      const umbralWinRate = el('umbralWinRateJugadores');
      const admiteUmbral = orden !== 'alfabetico';
      umbralPartidos.disabled = !admiteUmbral;
      umbralWinRate.disabled = !admiteUmbral;
      umbralPartidos.value = '';
      umbralWinRate.value = '';
      const { formato, puntuacion } = getFiltrosActivos();
      renderIndiceJugadores(formato, puntuacion);
    });

    const actualizarUmbralJugadores = ()=>{
      const { formato, puntuacion } = getFiltrosActivos();
      renderIndiceJugadores(formato, puntuacion);
    };
    el('umbralPartidosJugadores').addEventListener('input', actualizarUmbralJugadores);
    el('umbralWinRateJugadores').addEventListener('input', actualizarUmbralJugadores);

    el('umbralPartidosJugadores').value = '';
    el('umbralWinRateJugadores').value = '';

    el('btnEstimado').addEventListener('click', ()=>{
    const equipo = el('txtEquipo').value.split(',').map(s=>s.trim()).filter(Boolean);
    if(equipo.length===0){ el('outEstimado').textContent='Introduce al menos un nombre.'; return; }
    const {estimado, faltan} = temporada.calcular_win_rate_estimado(equipo);
    if(estimado!==null){
        el('outEstimado').innerHTML = `Win rate estimado: <b>${fmtPct(estimado)}</b>${faltan.length? ` · Sin datos (\u2265 5 pj): ${faltan.join(', ')}`:''}`;
    }else{
        el('outEstimado').textContent = `No hay suficientes datos para estimar. ${faltan.length? 'Faltan: '+faltan.join(', '):''}`;
    }
    });

    el('btnEquipo').addEventListener('click', ()=>{
    const equipo = el('txtEquipo').value.split(',').map(s=>s.trim()).filter(Boolean);
    if(equipo.length === 0){
        el('outEquipo').textContent = 'Introduce al menos un jugador.';
        return;
    }

    const resultado = temporada.calcular_win_rate_equipo(equipo);

    if(resultado.mensaje){
        el('outEquipo').textContent = resultado.mensaje;
    } else {
        el('outEquipo').textContent = `Win rate de equipo: ${fmtPct(resultado["win rate"])} (${resultado.partidos} partidos juntos)`;
    }
});

    // ==========================
    // Inicial
    // ==========================
    // Use setTimeout to ensure all scripts are loaded
    setTimeout(() => {
      const { formato, puntuacion } = getFiltrosActivos();
      renderPartidos(formato, puntuacion);
      renderTemporadaPorFormato(formato, puntuacion);
      renderColectivasPorFormato(formato, puntuacion);
      renderClutchPorFormato(formato, puntuacion);
      populatePlayerDropdown();
      renderIndiceJugadores(formato, puntuacion);
    }, 100);

