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

      calcular_mas_menos_por_partido_equipo(equipo){
        const teamSet = new Set(equipo.map(norm));
        let partidos_eq = 0, mas_menos = 0;
        for(const p of this.partidos){
          const eq = new Set(p.jugadores_equipo.map(norm));
          const rv = new Set(p.jugadores_rivales.map(norm));
          if(equalSets(teamSet, eq)){ partidos_eq++; mas_menos += p.calcular_mas_menos(); }
          else if(equalSets(teamSet, rv)){ partidos_eq++; mas_menos -= p.calcular_mas_menos(); }
        }
        if(partidos_eq > 0) return {mas_menos: +(mas_menos / partidos_eq).toFixed(1), partidos: partidos_eq};
        return {mensaje: 'No han jugado partidos juntos.'};
      }

      calcular_mas_menos_por_partido_estimado(equipo){
        const mm = this.calcular_mas_menos_por_partido_jugadores();
        const mmMap = Object.fromEntries(mm.map(([j, valor]) => [norm(j), valor]));
        const pjMap = {};
        for(const p of this.partidos){
          for(const j of [...p.jugadores_equipo, ...p.jugadores_rivales]) pjMap[norm(j)] = (pjMap[norm(j)] || 0) + 1;
        }
        let suma = 0, total = 0, faltan = [];
        for(const nombre of equipo){
          const clave = norm(nombre);
          if(clave in mmMap){ suma += mmMap[clave] * pjMap[clave]; total += pjMap[clave]; }
          else faltan.push(nombre);
        }
        if(total > 0) return {estimado: +(suma / total).toFixed(1), faltan};
        return {estimado: null, faltan};
      }

      calcular_rachas_jugador(nombreJugador){
        const jugadorNorm = norm(nombreJugador);
        let rachaVictorias = 0, rachaDerrotas = 0, actual = 0, tipoActual = '';
        let victoriasSeguidas = 0, derrotasSeguidas = 0;
        for(const p of this.partidos){
          const enEquipo = p.jugadores_equipo.some(j => norm(j) === jugadorNorm);
          const enRivales = p.jugadores_rivales.some(j => norm(j) === jugadorNorm);
          if(!enEquipo && !enRivales) continue;
          const gano = enEquipo === p.resultado;
          if(gano){
            victoriasSeguidas++;
            derrotasSeguidas = 0;
            rachaVictorias = Math.max(rachaVictorias, victoriasSeguidas);
          }else{
            derrotasSeguidas++;
            victoriasSeguidas = 0;
            rachaDerrotas = Math.max(rachaDerrotas, derrotasSeguidas);
          }
          const tipoPartido = gano ? 'victorias' : 'derrotas';
          actual = tipoActual === tipoPartido ? actual + 1 : 1;
          tipoActual = tipoPartido;
        }
        return {rachaVictorias, rachaDerrotas, actual, tipoActual};
      }

      calcular_perfil_equipo(nombreJugador){
        const jugadorNorm = norm(nombreJugador);
        const relaciones = {aliado: {}, lastre: {}, abuson: {}, nemesis: {}};
        const registrar = (grupo, jugador, gano) => {
          const clave = norm(jugador);
          if(!relaciones[grupo][clave]) relaciones[grupo][clave] = {nombre: jugador, partidos: 0, victorias: 0};
          relaciones[grupo][clave].partidos++;
          if(gano) relaciones[grupo][clave].victorias++;
        };
        for(const p of this.partidos){
          const enEquipo = p.jugadores_equipo.some(j => norm(j) === jugadorNorm);
          const enRivales = p.jugadores_rivales.some(j => norm(j) === jugadorNorm);
          if(!enEquipo && !enRivales) continue;
          const companeros = enEquipo ? p.jugadores_equipo : p.jugadores_rivales;
          const rivales = enEquipo ? p.jugadores_rivales : p.jugadores_equipo;
          const gano = enEquipo === p.resultado;
          companeros.filter(j => norm(j) !== jugadorNorm).forEach(j => registrar('aliado', j, gano));
          rivales.forEach(j => registrar('abuson', j, gano));
        }
        const mejor = (grupo, ascendente) => {
          const candidatos = Object.values(relaciones[grupo]).filter(item => item.partidos >= 5);
          candidatos.forEach(item => item.win_rate = item.victorias / item.partidos * 100);
          candidatos.sort((a, b) => ascendente ? a.win_rate - b.win_rate : b.win_rate - a.win_rate || b.partidos - a.partidos);
          return candidatos[0] || null;
        };
        return {
          aliado: mejor('aliado', false),
          lastre: mejor('aliado', true),
          abuson: mejor('abuson', false),
          nemesis: mejor('abuson', true)
        };
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
        if (this.partidos.length === 0) return {};
        const tipos = {};
        for (const p of this.partidos) {
            const tipo = getPuntuacionCategoria(p);
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

    function obtenerRegistrosDiaz(formato = 'Todos', puntuacion = 'Todos') {
      return estadisticasDiazRaw.map(registro => {
        const partidoRaw = partidosRaw[registro.partido - 1];
        const partido = partidos[registro.partido - 1];
        if (!partidoRaw || !partido) return null;
        if (formato !== 'Todos' && partido.formato !== formato) return null;
        if (puntuacion !== 'Todos' && getPuntuacionCategoria(partido) !== puntuacion) return null;
        const enEquipo = partidoRaw.jugadores_equipo.some(jugador => norm(jugador) === 'diaz');
        const enRivales = partidoRaw.jugadores_rivales.some(jugador => norm(jugador) === 'diaz');
        if (!enEquipo && !enRivales) return null;
        return { partido, registro, enEquipo };
      }).filter(Boolean);
    }

    function calcularEstadisticasDiaz(formato = 'Todos', puntuacion = 'Todos') {
      const registros = obtenerRegistrosDiaz(formato, puntuacion);
      const stats = {
        partidos_jugados: registros.length, victorias: 0, puntos_totales: 0,
        asistencias_totales: 0, rebotes_totales: 0, tapones_totales: 0,
        triples_intentados_totales: 0, triples_anotados_totales: 0, minutos_totales: 0,
        mas_menos_total: 0, valoracion_total: 0, contribucion_total: 0, puntos_equipo_total: 0
      };
      for (const { partido, registro, enEquipo } of registros) {
        const gano = enEquipo === partido.resultado;
        if (gano) stats.victorias++;
        const masMenos = partido.calcular_mas_menos() * (enEquipo ? 1 : -1);
        stats.mas_menos_total += masMenos;
        stats.puntos_equipo_total += enEquipo ? partido.puntos_totales : partido.puntos_rivales;
        stats.puntos_totales += registro.puntos;
        stats.asistencias_totales += registro.asistencias;
        stats.rebotes_totales += registro.rebotes;
        stats.tapones_totales += registro.tapones;
        stats.triples_intentados_totales += registro.triples_intentados;
        stats.triples_anotados_totales += registro.triples_anotados;
        stats.minutos_totales += registro.minutos;
        stats.valoracion_total += registro.puntos + registro.rebotes + registro.asistencias + registro.tapones - 3 * (registro.triples_intentados - registro.triples_anotados) + masMenos;
        stats.contribucion_total += registro.puntos + 2 * registro.asistencias;
      }
      const partidosJugados = Math.max(stats.partidos_jugados, 1);
      stats.win_rate = stats.partidos_jugados ? stats.victorias / stats.partidos_jugados * 100 : 0;
      stats.pct_triples = stats.triples_intentados_totales ? stats.triples_anotados_totales / stats.triples_intentados_totales * 100 : 0;
      stats.puntos_pp = stats.puntos_totales / partidosJugados;
      stats.rebotes_pp = stats.rebotes_totales / partidosJugados;
      stats.asistencias_pp = stats.asistencias_totales / partidosJugados;
      stats.tapones_pp = stats.tapones_totales / partidosJugados;
      stats.mas_menos_pp = stats.mas_menos_total / partidosJugados;
      stats.puntos_por_minuto = stats.minutos_totales ? stats.puntos_totales / stats.minutos_totales : 0;
      return stats;
    }

    function getPuntuacionCategoria(p) {
        const puntos = [p.puntos_totales, p.puntos_rivales];
        if (puntos.some(v => v >= 21 && v <= 23)) return 'A 21 puntos';
      if (puntos.some(v => v >= 11 && v <= 13)) return 'A 11 puntos';
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

    function calcularHighlightsJugador(nombreJugador, formato = 'Todos', puntuacion = 'Todos') {
      const jugadorNorm = norm(nombreJugador);
      const registros = jugadorNorm === 'diaz'
        ? obtenerRegistrosDiaz(formato, puntuacion).map(({ partido, registro, enEquipo }) => ({
            partido,
            numero: registro.partido,
            enEquipo,
            puntos: registro.puntos,
            asistencias: registro.asistencias,
            rebotes: registro.rebotes,
            tapones: registro.tapones,
            triplesIntentados: registro.triples_intentados,
            triplesAnotados: registro.triples_anotados,
            puntosEquipo: enEquipo ? partido.puntos_totales : partido.puntos_rivales
          }))
        : getPartidosFiltrados(formato, puntuacion, nombreJugador).map(partido => ({
            partido,
            numero: partidos.indexOf(partido) + 1,
            enEquipo: partido.jugadores_equipo.some(jugador => norm(jugador) === jugadorNorm),
            puntos: partido.puntos,
            asistencias: partido.asistencias,
            rebotes: partido.rebotes,
            tapones: partido.tapones,
            triplesIntentados: partido.triples_intentados,
            triplesAnotados: partido.triples_anotados,
            puntosEquipo: partido.jugadores_equipo.some(jugador => norm(jugador) === jugadorNorm)
              ? partido.puntos_totales
              : partido.puntos_rivales
          }));

      const destacados = registros.map(registro => {
        const masMenos = registro.partido.calcular_mas_menos() * (registro.enEquipo ? 1 : -1);
        const valoracion = registro.puntos + registro.rebotes + registro.asistencias + registro.tapones
          - 3 * (registro.triplesIntentados - registro.triplesAnotados) + masMenos;
        const contribucion = registro.puntos + 2 * registro.asistencias;
        return {
          ...registro,
          valoracion,
          contribucion,
          contribucionPct: registro.puntosEquipo ? contribucion / registro.puntosEquipo * 100 : 0
        };
      });

      const mejor = (clave) => destacados.reduce((actual, registro) => {
        if (!actual) return registro;
        return registro[clave] > actual[clave] ? registro : actual;
      }, null);

      return [
        { label: 'Más puntos', clave: 'puntos', valor: registro => `${registro.puntos} pts` },
        { label: 'Más asistencias', clave: 'asistencias', valor: registro => `${registro.asistencias} ast` },
        { label: 'Más rebotes', clave: 'rebotes', valor: registro => `${registro.rebotes} reb` },
        { label: 'Más tapones', clave: 'tapones', valor: registro => `${registro.tapones} blk` },
        { label: 'Más triples anotados', clave: 'triplesAnotados', valor: registro => `${registro.triplesAnotados} tripl.` },
        { label: 'Mejor valoración', clave: 'valoracion', valor: registro => `${fmt1(registro.valoracion)}` },
        { label: 'Mejor contribución', clave: 'contribucion', valor: registro => `${fmt1(registro.contribucion)} (${fmt1(registro.contribucionPct)}%)` }
      ].map(destacado => ({ ...destacado, registro: mejor(destacado.clave) }));
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

    let metricaGraficoColectivas = 'masMenosTotal';

    function renderGraficoPerfil(nombreActual, temp, nombresComparacion = [], chartId = 'perfilChart', legendId = 'perfilChartLegend'){
    const chart = el(chartId);
    const legend = el(legendId);
    let puntos_totales = 0, asistencias_totales = 0, rebotes_totales = 0, tapones_totales = 0; 
    let triples_intentados_totales = 0, triples_anotados_totales = 0, minutos_totales = 0;

    const metricas = {
      masMenosTotal: { label: '+/- total', suffix: '', value: data => data.masMenos, decimals: 1 },
      winRate: { label: 'Win rate', suffix: '%', value: data => data.partidos ? data.victorias / data.partidos * 100 : 0, decimals: 1 },
      masMenosPP: { label: '+/- por partido', suffix: '', value: data => data.partidos ? data.masMenos / data.partidos : 0, decimals: 2 }
    };
    const metrica = metricas[metricaGraficoColectivas];
    const nombres = [nombreActual, ...nombresComparacion.filter(nombre => norm(nombre) !== norm(nombreActual))]
      .filter((nombre, index, arr) => arr.findIndex(item => norm(item) === norm(nombre)) === index);

    legend.innerHTML = '';
    chart.innerHTML = '';
    if (nombres.length === 0 || temp.partidos.length === 0) {
      chart.setAttribute('viewBox', '0 0 900 160');
      chart.innerHTML = '<text x="450" y="82" text-anchor="middle" fill="#91a3b0" font-size="13">No hay suficientes datos para dibujar la evolución.</text>';
      return;
    }
    if (chart.tagName !== 'svg') return;

    const colores = ['#4f9cff', '#39d98a', '#ffb454', '#ff6b6b', '#c792ea', '#61d4d4', '#f78cba', '#d7e36f', '#f28f6b', '#9db7ff'];
    const series = nombres.map((nombre, index) => {
      const datos = { masMenos: 0, victorias: 0, partidos: 0 };
      const puntos = temp.partidos.map((partido, partidoIndex) => {
        const enEquipo = partido.jugadores_equipo.some(j => norm(j) === norm(nombre));
        const enRivales = partido.jugadores_rivales.some(j => norm(j) === norm(nombre));
        if (!enEquipo && !enRivales) return null;
        datos.partidos++;
        datos.victorias += enEquipo === partido.resultado ? 1 : 0;
        datos.masMenos += partido.calcular_mas_menos() * (enEquipo ? 1 : -1);
        return { x: partidoIndex + 1, y: metrica.value(datos), partido: partidoIndex + 1 };
      }).filter(Boolean);
      return { nombre, color: colores[index % colores.length], puntos };
    });

    const width = 900, height = 320;
    const margin = { top: 18, right: 22, bottom: 42, left: 52 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    const valores = series.flatMap(serie => serie.puntos.map(punto => punto.y));
    let min = Math.min(...valores), max = Math.max(...valores);
    if (min === max) { min -= 1; max += 1; }
    const padding = (max - min) * 0.1;
    min -= padding; max += padding;
    const x = partido => margin.left + ((partido - 1) / Math.max(temp.partidos.length - 1, 1)) * innerWidth;
    const y = valor => margin.top + (1 - (valor - min) / (max - min)) * innerHeight;
    const formatValue = valor => `${valor.toFixed(metrica.decimals)}${metrica.suffix}`;
    const ticks = 4;
    const grid = Array.from({ length: ticks + 1 }, (_, index) => {
      const valor = min + ((max - min) * index / ticks);
      const yPos = y(valor);
      return `<line x1="${margin.left}" y1="${yPos}" x2="${width - margin.right}" y2="${yPos}" stroke="#1e2d44" />
        <text x="${margin.left - 8}" y="${yPos + 4}" text-anchor="end" fill="#91a3b0" font-size="11">${formatValue(valor)}</text>`;
    }).join('');
    const paths = series.map((serie, index) => {
      const path = serie.puntos.map((punto, index) => `${index ? 'L' : 'M'} ${x(punto.x)} ${y(punto.y)}`).join(' ');
      const puntos = serie.puntos.map(punto => `<circle cx="${x(punto.x)}" cy="${y(punto.y)}" r="3.5" fill="${serie.color}"><title>${serie.nombre} · Partido ${punto.partido}: ${formatValue(punto.y)}</title></circle>`).join('');
      return `<path d="${path}" fill="none" stroke="${serie.color}" stroke-width="${index === 0 ? '3.5' : '2.5'}" stroke-linecap="round" stroke-linejoin="round" />${puntos}`;
    }).join('');
    const xLabels = [1, Math.ceil(temp.partidos.length / 2), temp.partidos.length]
      .filter((partido, index, arr) => arr.indexOf(partido) === index)
      .map(partido => `<text x="${x(partido)}" y="${height - 14}" text-anchor="middle" fill="#91a3b0" font-size="11">P${partido}</text>`).join('');
    chart.setAttribute('viewBox', `0 0 ${width} ${height}`);
    chart.innerHTML = `${grid}<line x1="${margin.left}" y1="${margin.top + innerHeight}" x2="${width - margin.right}" y2="${margin.top + innerHeight}" stroke="#34507c" />${paths}${xLabels}`;
    legend.innerHTML = series.map(serie => `<span class="chart-legend-item"><span class="chart-legend-swatch" style="background:${serie.color}"></span>${serie.nombre}</span>`).join('');
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
    const atributosJugadores = {
      Eric: {
        finalizacion: [['Tiro Cercano', 87], ['Bandeja en Carrera', 75]],
        tiro: [['Tiro de Media Distancia', 77], ['Triple', 76]],
        pase: [['Precisión de Pase', 89], ['Manejo de Balón', 83]],
        defensa: [['Defensa Interior', 80], ['Defensa Exterior', 68], ['Robo', 72], ['Tapón', 85]],
        rebote: [['Rebote Ofensivo', 81], ['Rebote Defensivo', 79]],
        fisico: [['Velocidad', 73], ['Agilidad', 70], ['Fuerza', 82]]
      },
      Diaz: {
        finalizacion: [['Tiro Cercano', 76], ['Bandeja en Carrera', 72]],
        tiro: [['Tiro de Media Distancia', 66], ['Triple', 63]],
        pase: [['Precisión de Pase', 83], ['Manejo de Balón', 71]],
        defensa: [['Defensa Interior', 76], ['Defensa Exterior', 84], ['Robo', 82], ['Tapón', 74]],
        rebote: [['Rebote Ofensivo', 87], ['Rebote Defensivo', 86]],
        fisico: [['Velocidad', 80], ['Agilidad', 78], ['Fuerza', 74]]
      },
      Jamo: {
        finalizacion: [['Tiro Cercano', 68], ['Bandeja en Carrera', 69]],
        tiro: [['Tiro de Media Distancia', 64], ['Triple', 78]],
        pase: [['Precisión de Pase', 76], ['Manejo de Balón', 59]],
        defensa: [['Defensa Interior', 81], ['Defensa Exterior', 71], ['Robo', 72], ['Tapón', 82]],
        rebote: [['Rebote Ofensivo', 67], ['Rebote Defensivo', 75]],
        fisico: [['Velocidad', 67], ['Agilidad', 67], ['Fuerza', 63]]
      },
      Ert: {
        finalizacion: [['Tiro Cercano', 83], ['Bandeja en Carrera', 70]],
        tiro: [['Tiro de Media Distancia', 71], ['Triple', 73]],
        pase: [['Precisión de Pase', 77], ['Manejo de Balón', 78]],
        defensa: [['Defensa Interior', 77], ['Defensa Exterior', 64], ['Robo', 65], ['Tapón', 74]],
        rebote: [['Rebote Ofensivo', 73], ['Rebote Defensivo', 70]],
        fisico: [['Velocidad', 72], ['Agilidad', 70], ['Fuerza', 79]]
      },
      Arnau: {
        finalizacion: [['Tiro Cercano', 78], ['Bandeja en Carrera', 92]],
        tiro: [['Tiro de Media Distancia', 78], ['Triple', 87]],
        pase: [['Precisión de Pase', 81], ['Manejo de Balón', 80]],
        defensa: [['Defensa Interior', 61], ['Defensa Exterior', 82], ['Robo', 75], ['Tapón', 64]],
        rebote: [['Rebote Ofensivo', 63], ['Rebote Defensivo', 73]],
        fisico: [['Velocidad', 79], ['Agilidad', 89], ['Fuerza', 68]]
      },
      Cavi: {
        finalizacion: [['Tiro Cercano', 66], ['Bandeja en Carrera', 59]],
        tiro: [['Tiro de Media Distancia', 63], ['Triple', 61]],
        pase: [['Precisión de Pase', 70], ['Manejo de Balón', 52]],
        defensa: [['Defensa Interior', 82], ['Defensa Exterior', 74], ['Robo', 71], ['Tapón', 70]],
        rebote: [['Rebote Ofensivo', 81], ['Rebote Defensivo', 88]],
        fisico: [['Velocidad', 78], ['Agilidad', 68], ['Fuerza', 84]]
      },
      Aleix: {
        finalizacion: [['Tiro Cercano', 84], ['Bandeja en Carrera', 86]],
        tiro: [['Tiro de Media Distancia', 75], ['Triple', 67]],
        pase: [['Precisión de Pase', 83], ['Manejo de Balón', 81]],
        defensa: [['Defensa Interior', 64], ['Defensa Exterior', 79], ['Robo', 60], ['Tapón', 51]],
        rebote: [['Rebote Ofensivo', 59], ['Rebote Defensivo', 68]],
        fisico: [['Velocidad', 85], ['Agilidad', 84], ['Fuerza', 62]]
      },
      Grinyo: {
        finalizacion: [['Tiro Cercano', 62], ['Bandeja en Carrera', 60]],
        tiro: [['Tiro de Media Distancia', 70], ['Triple', 63]],
        pase: [['Precisión de Pase', 70], ['Manejo de Balón', 49]],
        defensa: [['Defensa Interior', 71], ['Defensa Exterior', 76], ['Robo', 57], ['Tapón', 55]],
        rebote: [['Rebote Ofensivo', 61], ['Rebote Defensivo', 70]],
        fisico: [['Velocidad', 68], ['Agilidad', 80], ['Fuerza', 62]]
      },
      Llongueras: {
        finalizacion: [['Tiro Cercano', 76], ['Bandeja en Carrera', 72]],
        tiro: [['Tiro de Media Distancia', 65], ['Triple', 76]],
        pase: [['Precisión de Pase', 80], ['Manejo de Balón', 64]],
        defensa: [['Defensa Interior', 65], ['Defensa Exterior', 69], ['Robo', 68], ['Tapón', 53]],
        rebote: [['Rebote Ofensivo', 78], ['Rebote Defensivo', 67]],
        fisico: [['Velocidad', 81], ['Agilidad', 73], ['Fuerza', 75]]
      },
      Blasi: {
        finalizacion: [['Tiro Cercano', 77], ['Bandeja en Carrera', 68]],
        tiro: [['Tiro de Media Distancia', 64], ['Triple', 60]],
        pase: [['Precisión de Pase', 73], ['Manejo de Balón', 60]],
        defensa: [['Defensa Interior', 67], ['Defensa Exterior', 67], ['Robo', 73], ['Tapón', 58]],
        rebote: [['Rebote Ofensivo', 63], ['Rebote Defensivo', 71]],
        fisico: [['Velocidad', 75], ['Agilidad', 61], ['Fuerza', 78]]
      },
      Batalla: {
        finalizacion: [['Tiro Cercano', 61], ['Bandeja en Carrera', 68]],
        tiro: [['Tiro de Media Distancia', 60], ['Triple', 58]],
        pase: [['Precisión de Pase', 66], ['Manejo de Balón', 51]],
        defensa: [['Defensa Interior', 63], ['Defensa Exterior', 78], ['Robo', 75], ['Tapón', 67]],
        rebote: [['Rebote Ofensivo', 69], ['Rebote Defensivo', 62]],
        fisico: [['Velocidad', 67], ['Agilidad', 73], ['Fuerza', 49]]
      },
      Raset: {
        finalizacion: [['Tiro Cercano', 68], ['Bandeja en Carrera', 62]],
        tiro: [['Tiro de Media Distancia', 73], ['Triple', 81]],
        pase: [['Precisión de Pase', 72], ['Manejo de Balón', 61]],
        defensa: [['Defensa Interior', 62], ['Defensa Exterior', 80], ['Robo', 81], ['Tapón', 59]],
        rebote: [['Rebote Ofensivo', 57], ['Rebote Defensivo', 63]],
        fisico: [['Velocidad', 75], ['Agilidad', 66], ['Fuerza', 72]]
      }
    };

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
      requestAnimationFrame(() => {
        el('vistaPerfilJugador').scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
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

    function actualizarContextoEstadisticas(jugador) {
      const mensaje = jugador && norm(jugador) === 'eric'
        ? 'Mostrando estadísticas de Eric.'
        : 'Las estadísticas individuales mostradas corresponden a Eric.';
      ['Partidos', 'Temporada'].forEach(tab => {
        const contexto = el(`infoEstadisticas${tab}`);
        if (contexto) contexto.textContent = mensaje;
      });
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
      const busqueda = norm(el('buscarJugador')?.value);
      if (busqueda) {
        jugadores = jugadores.filter(nombre => norm(nombre).includes(busqueda));
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

    function calcularCategoriasDiaz(formato, puntuacion, clave) {
      const categorias = {};
      for (const registro of obtenerRegistrosDiaz(formato, puntuacion)) {
        const tipo = clave === 'formato' ? registro.partido.formato : getPuntuacionCategoria(registro.partido);
        if (!categorias[tipo]) categorias[tipo] = { partidos: 0, victorias: 0, mas_menos_total: 0, puntos: 0, rebotes: 0, asistencias: 0, triples_intentados: 0, triples_anotados: 0 };
        const datos = categorias[tipo];
        const { partido, registro: statsDiaz, enEquipo } = registro;
        datos.partidos++;
        datos.victorias += enEquipo === partido.resultado ? 1 : 0;
        datos.mas_menos_total += partido.calcular_mas_menos() * (enEquipo ? 1 : -1);
        datos.puntos += statsDiaz.puntos;
        datos.rebotes += statsDiaz.rebotes;
        datos.asistencias += statsDiaz.asistencias;
        datos.triples_intentados += statsDiaz.triples_intentados;
        datos.triples_anotados += statsDiaz.triples_anotados;
      }
      for (const datos of Object.values(categorias)) {
        datos.win_rate = datos.victorias / datos.partidos * 100;
        datos.mas_menos_pp = datos.mas_menos_total / datos.partidos;
        datos.puntos_pp = datos.puntos / datos.partidos;
        datos.rebotes_pp = datos.rebotes / datos.partidos;
        datos.asistencias_pp = datos.asistencias / datos.partidos;
      }
      return categorias;
    }

    function renderPerfilDiaz(nombreJugador, formato, puntuacion, texto) {
      const stats = calcularEstadisticasDiaz(formato, puntuacion);
      const perfil = obtenerPerfil(nombreJugador);
      const tempGeneral = new Temporada(getPartidosFiltrados(formato, puntuacion, nombreJugador));
      const tempParaGrafica = new Temporada(getPartidosFiltrados(formato, puntuacion));
      const statsGeneral = tempGeneral.calcular_estadisticas_jugador(nombreJugador);
      const resumen = [
        ['Partidos jugados', statsGeneral.partidos_jugados],
        ['Partidos ganados', statsGeneral.victorias],
        ['Partidos perdidos', statsGeneral.partidos_jugados - statsGeneral.victorias],
        ['Win rate', fmtPct(statsGeneral.win_rate)]
      ];
      const categoryCards = categories => Object.entries(categories).map(([tipo, data]) => `
        <div class="type-card">
          <div class="title">${tipo}</div>
          <div class="detail"><span>${plural(data.partidos, 'Partido', 'Partidos')}</span><span>${data.partidos}</span></div>
          <div class="detail"><span>Win rate</span><span>${fmtPct(data.win_rate)}</span></div>
          <div class="detail"><span>+/- por partido</span><span>${data.mas_menos_pp >= 0 ? '+' : ''}${fmt1(data.mas_menos_pp)}</span></div>
          <div class="detail"><span>Puntos / part.</span><span>${fmt1(data.puntos_pp)}</span></div>
          <div class="detail"><span>Rebotes / part.</span><span>${fmt1(data.rebotes_pp)}</span></div>
          <div class="detail"><span>Asistencias / part.</span><span>${fmt1(data.asistencias_pp)}</span></div>
          <div class="detail"><span>Triples</span><span>${data.triples_anotados}/${data.triples_intentados} (${fmt1(data.triples_intentados ? data.triples_anotados / data.triples_intentados * 100 : 0)}%)</span></div>
        </div>`).join('');
      const categoriasFormato = calcularCategoriasDiaz(formato, puntuacion, 'formato');
      const categoriasPuntuacion = calcularCategoriasDiaz(formato, puntuacion, 'puntuacion');
      const categoryCardsGenerales = categories => Object.entries(categories).map(([tipo, data]) => `
        <div class="type-card">
          <div class="title">${tipo}</div>
          <div class="detail"><span>${plural(data.partidos, 'Partido', 'Partidos')}</span><span>${data.partidos}</span></div>
          <div class="detail"><span>Win rate</span><span>${fmtPct(data.win_rate)}</span></div>
          <div class="detail"><span>+/- total</span><span>${data.mas_menos_total >= 0 ? '+' : ''}${fmt1(data.mas_menos_total)}</span></div>
          <div class="detail"><span>+/- por partido</span><span>${data.mas_menos_pp >= 0 ? '+' : ''}${fmt1(data.mas_menos_pp)}</span></div>
        </div>`).join('');
      const categoriasFormatoGenerales = tempGeneral.calcular_estadisticas_jugador_por_formato(nombreJugador);
      const categoriasPuntuacionGenerales = tempGeneral.calcular_estadisticas_jugador_por_tipo_de_partido(nombreJugador);
      const clutchList = tempGeneral.calcular_win_rate_clutch();
      const clutchPlayer = clutchList.find(([jugador]) => norm(jugador) === norm(nombreJugador));
      const clutchValue = clutchPlayer ? fmtPct(clutchPlayer[1]) : 'Sin datos suficientes';

      texto.innerHTML = `
        <div class="diaz-profile-front player-profile-shell">
          <div class="player-hero-actions"><button type="button" class="secondary-btn" data-diaz-flip aria-pressed="false">Girar carta</button></div>
          <div class="player-summary-strip">
            ${resumen.map(([label, value]) => `<div class="player-summary-item"><div class="player-summary-label">${label}</div><div class="player-summary-value">${value}</div></div>`).join('')}
          </div>
          <div class="bio-grid">
            <div class="bio-item"><div class="bio-label">Altura</div><div class="bio-value">${valorVisible(perfil.alturaCm ? `${perfil.alturaCm} cm` : '-')}</div></div>
            <div class="bio-item"><div class="bio-label">Peso</div><div class="bio-value">${valorVisible(perfil.pesoKg ? `${perfil.pesoKg} kg` : '-')}</div></div>
            <div class="bio-item"><div class="bio-label">Edad</div><div class="bio-value">${valorVisible(calcularEdad(perfil.fechaNacimiento) === null ? '-' : `${calcularEdad(perfil.fechaNacimiento)} años`)}</div></div>
            <div class="bio-item"><div class="bio-label">Fecha de nacimiento</div><div class="bio-value">${valorVisible(perfil.fechaNacimiento || '-')}</div></div>
          </div>
          <div class="player-section">
            <h3>Impacto en el marcador</h3>
            <div class="stats-grid"><div class="stat-box"><div class="label">+/- total</div><div class="value" style="color:${statsGeneral.mas_menos_total >= 0 ? 'var(--ok)' : 'var(--bad)'}">${statsGeneral.mas_menos_total >= 0 ? '+' : ''}${fmt1(statsGeneral.mas_menos_total)}</div></div><div class="stat-box"><div class="label">+/- por partido</div><div class="value" style="color:${statsGeneral.mas_menos_pp >= 0 ? 'var(--ok)' : 'var(--bad)'}">${statsGeneral.mas_menos_pp >= 0 ? '+' : ''}${fmt1(statsGeneral.mas_menos_pp)}</div></div></div>
          </div>
          <div class="player-section">
            <h3>Rendimiento clutch</h3>
            <div class="stats-grid"><div class="stat-box"><div class="label">Win rate clutch</div><div class="value">${clutchValue}</div></div><div class="stat-box"><div class="label">Partidos clutch</div><div class="value">${clutchPlayer ? clutchPlayer[2] : statsGeneral.partidos_jugados < 5 ? 0 : 'Sin datos'}</div></div><div class="stat-box"><div class="label">Criterio</div><div class="value">Min. 5</div></div></div>
          </div>
          <div class="player-section"><h3>Desglose por formato</h3><div class="player-type-cards">${categoryCardsGenerales(categoriasFormatoGenerales) || '<div class="sub">Sin datos para este jugador.</div>'}</div></div>
          <div class="player-section"><h3>Desglose por tipo de partido</h3><div class="player-type-cards">${categoryCardsGenerales(categoriasPuntuacionGenerales) || '<div class="sub">Sin datos para este jugador.</div>'}</div></div>
          <div class="player-section collective-chart">
            <div class="collective-chart-header">
              <div>
                <h3>Evolución por partido</h3>
                <div class="sub">La línea destacada es ${perfil.nombreMostrado}. Puedes añadir jugadores para comparar.</div>
              </div>
              <div class="chart-switcher" role="group" aria-label="Métrica del gráfico">
                <button type="button" class="active" data-diaz-chart-metric="masMenosTotal">+/- total</button>
                <button type="button" data-diaz-chart-metric="masMenosPP">+/- por partido</button>
                <button type="button" data-diaz-chart-metric="winRate">Win rate</button>
              </div>
            </div>
            <div class="chart-player-picker">
              <label for="diazChartBuscarJugador">Comparar con otros jugadores</label>
              <input id="diazChartBuscarJugador" type="search" placeholder="Escribe un nombre para añadirlo" autocomplete="off">
              <div id="diazChartResultados" class="chart-player-results" hidden></div>
              <div id="diazChartSeleccionados" class="chart-player-selected-list"></div>
            </div>
            <div class="chart-scroll">
              <svg id="diazChart" role="img" aria-label="Evolución de estadísticas del perfil"></svg>
            </div>
            <div id="diazChartLegend" class="chart-legend"></div>
          </div>
        </div>
        <div class="diaz-profile-back player-profile-shell" hidden>
          <div class="player-hero-actions"><button type="button" class="secondary-btn" data-diaz-flip aria-pressed="true">Volver al perfil</button></div>
          <div class="stats-scope">Estadísticas individuales contabilizadas a partir del partido 146 del total (${partidosRaw.length}).</div>
          <div class="player-section"><h3>Estadísticas avanzadas</h3><div class="stats-grid">
            <div class="stat-box"><div class="label">Minutos</div><div class="value">${stats.minutos_totales}</div></div>
            <div class="stat-box"><div class="label">Valoración</div><div class="value">${fmt1(stats.valoracion_total)}</div></div>
            <div class="stat-box"><div class="label">Valoración por partido</div><div class="value">${fmt1(stats.valoracion_total / Math.max(stats.partidos_jugados, 1))}</div></div>
            <div class="stat-box"><div class="label">Puntos totales</div><div class="value">${stats.puntos_totales}</div></div>
            <div class="stat-box"><div class="label">Puntos por partido</div><div class="value">${fmt1(stats.puntos_pp)}</div></div>
            <div class="stat-box"><div class="label">Rebotes por partido</div><div class="value">${fmt1(stats.rebotes_pp)}</div></div>
            <div class="stat-box"><div class="label">Asistencias por partido</div><div class="value">${fmt1(stats.asistencias_pp)}</div></div>
            <div class="stat-box"><div class="label">Triples</div><div class="value">${stats.triples_anotados_totales}/${stats.triples_intentados_totales} (${fmt1(stats.pct_triples)}%)</div></div>
            <div class="stat-box"><div class="label">Tapones</div><div class="value">${stats.tapones_totales}</div></div>
          </div></div>
          <div class="player-section"><h3>Desglose por formato</h3><div class="player-type-cards">${categoryCards(categoriasFormato) || '<div class="sub">Sin datos para este jugador.</div>'}</div></div>
          <div class="player-section"><h3>Desglose por tipo de partido</h3><div class="player-type-cards">${categoryCards(categoriasPuntuacion) || '<div class="sub">Sin datos para este jugador.</div>'}</div></div>
        </div>`;
      const buttons = texto.querySelectorAll('[data-diaz-flip]');
      const front = texto.querySelector('.diaz-profile-front');
      const back = texto.querySelector('.diaz-profile-back');
      buttons.forEach(button => button.addEventListener('click', () => {
        const mostrandoStats = back.hidden;
        front.hidden = mostrandoStats;
        back.hidden = !mostrandoStats;
        buttons.forEach(item => {
          item.textContent = mostrandoStats ? 'Volver al perfil' : 'Girar carta';
          item.setAttribute('aria-pressed', String(mostrandoStats));
        });
      }));
      const chartSearch = el('diazChartBuscarJugador');
      const chartResults = el('diazChartResultados');
      const chartSelected = el('diazChartSeleccionados');
      const jugadoresDisponibles = tempParaGrafica.obtener_todos_jugadores()
        .filter(jugador => norm(jugador) !== norm(nombreJugador));
      const seleccionados = [];
      const renderPerfilChart = () => renderGraficoPerfil(nombreJugador, tempParaGrafica, seleccionados, 'diazChart', 'diazChartLegend');
      const renderComparador = () => {
        const query = norm(chartSearch.value);
        const resultados = jugadoresDisponibles.filter(jugador => query && norm(jugador).includes(query) && !seleccionados.some(item => norm(item) === norm(jugador)));
        chartResults.innerHTML = resultados.length
          ? resultados.map(jugador => `<button type="button" class="chart-player-option" data-diaz-add-player="${jugador}">${jugador}<span>+</span></button>`).join('')
          : '';
        chartResults.hidden = resultados.length === 0;
        chartSelected.innerHTML = seleccionados.map(jugador => `<span class="chart-player-selected">${jugador}<button type="button" aria-label="Quitar ${jugador}" data-diaz-remove-player="${jugador}">×</button></span>`).join('');
      };
      chartSearch.addEventListener('input', renderComparador);
      chartResults.addEventListener('click', event => {
        const option = event.target.closest('[data-diaz-add-player]');
        if (!option) return;
        seleccionados.push(option.dataset.diazAddPlayer);
        chartSearch.value = '';
        renderComparador();
        renderPerfilChart();
      });
      chartSelected.addEventListener('click', event => {
        const remove = event.target.closest('[data-diaz-remove-player]');
        if (!remove) return;
        const index = seleccionados.findIndex(jugador => jugador === remove.dataset.diazRemovePlayer);
        if (index !== -1) seleccionados.splice(index, 1);
        renderComparador();
        renderPerfilChart();
      });
      document.querySelectorAll('[data-diaz-chart-metric]').forEach(chartButton => {
        chartButton.addEventListener('click', () => {
          metricaGraficoColectivas = chartButton.dataset.diazChartMetric;
          document.querySelectorAll('[data-diaz-chart-metric]').forEach(item => item.classList.toggle('active', item === chartButton));
          renderPerfilChart();
        });
      });
      renderPerfilChart();
    }

    function renderPerfilDetallado(nombreJugador, formato = 'Todos', puntuacion = 'Todos') {
      metricaGraficoColectivas = 'masMenosTotal';
      const perfil = obtenerPerfil(nombreJugador);
      const partidosFiltrados = getPartidosFiltrados(formato, puntuacion, nombreJugador);
      const partidosParaGrafica = getPartidosFiltrados(formato, puntuacion);
      const temp = new Temporada(partidosFiltrados);
      const tempParaGrafica = new Temporada(partidosParaGrafica);
      const esDiaz = norm(nombreJugador) === 'diaz';
      const statsGenerales = temp.calcular_estadisticas_jugador(nombreJugador);
      const stats = esDiaz ? calcularEstadisticasDiaz(formato, puntuacion) : statsGenerales;
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
            { label: plural(statsGenerales.partidos_jugados, 'Partido jugado', 'Partidos jugados'), value: statsGenerales.partidos_jugados },
            { label: plural(statsGenerales.victorias, 'Partido ganado', 'Partidos ganados'), value: statsGenerales.victorias },
            { label: plural(statsGenerales.partidos_jugados - statsGenerales.victorias, 'Partido perdido', 'Partidos perdidos'), value: statsGenerales.partidos_jugados - statsGenerales.victorias },
            { label: 'Win rate', value: fmtPct(statsGenerales.win_rate) },
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
        ${perfil.esJugadorPrincipal || esDiaz ? '<button type="button" class="profile-highlights-button" data-profile-highlights>Highlights</button>' : ''}
      `;

      const clutchList = temp.calcular_win_rate_clutch();
      const clutchPlayer = clutchList.find(([jugador]) => norm(jugador) === norm(nombreJugador));
      const clutchValue = clutchPlayer ? fmtPct(clutchPlayer[1]) : 'Sin datos suficientes';
      const rachas = temp.calcular_rachas_jugador(nombreJugador);
      const perfilEquipo = temp.calcular_perfil_equipo(nombreJugador);
      const registrosDiaz = esDiaz ? obtenerRegistrosDiaz(formato, puntuacion) : [];
      const partidosDiaz = registrosDiaz.map(({ registro }) => registro.partido);
      const diazAlcanceTexto = partidosDiaz.length === 0
        ? 'ningún partido con este filtro'
        : partidosDiaz.length === 1
          ? `el partido ${partidosDiaz[0]} del total (${partidosRaw.length})`
          : `los partidos ${partidosDiaz[0]} a ${partidosDiaz[partidosDiaz.length - 1]} del total (${partidosRaw.length})`;

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
            <div class="stat-box"><div class="label">${plural(statsGenerales.partidos_jugados, 'Partido jugado', 'Partidos jugados')}</div><div class="value">${statsGenerales.partidos_jugados}</div></div>
            <div class="stat-box"><div class="label">${plural(statsGenerales.victorias, 'Partido ganado', 'Partidos ganados')}</div><div class="value">${statsGenerales.victorias}</div></div>
            <div class="stat-box"><div class="label">Win rate</div><div class="value" style="color:${statsGenerales.win_rate >= 50 ? 'var(--ok)' : 'var(--bad)'}">${fmtPct(statsGenerales.win_rate)}</div></div>
          </div>
        </div>` : ''}
        <div class="player-section">
          <h3>Impacto en el marcador</h3>
          <div class="stats-grid">
            <div class="stat-box"><div class="label">+/- total</div><div class="value" style="color:${statsGenerales.mas_menos_total >= 0 ? 'var(--ok)' : 'var(--bad)'}">${statsGenerales.mas_menos_total >= 0 ? '+' : ''}${fmt1(statsGenerales.mas_menos_total)}</div></div>
            <div class="stat-box"><div class="label">+/- por partido</div><div class="value" style="color:${statsGenerales.mas_menos_pp >= 0 ? 'var(--ok)' : 'var(--bad)'}">${statsGenerales.mas_menos_pp >= 0 ? '+' : ''}${fmt1(statsGenerales.mas_menos_pp)}</div></div>
          </div>
        </div>
        <div class="player-section">
          <h3>Rendimiento clutch</h3>
          <div class="stats-grid">
            <div class="stat-box"><div class="label">Win rate clutch</div><div class="value">${clutchValue}</div></div>
            <div class="stat-box"><div class="label">Partidos clutch</div><div class="value">${clutchPlayer ? clutchPlayer[2] : statsGenerales.partidos_jugados < 5 ? 0 : 'Sin datos'}</div></div>
            <div class="stat-box"><div class="label">Criterio</div><div class="value">Min. 5</div></div>
          </div>
        </div>
        <div class="player-section">
          <h3>Rachas</h3>
          <div class="streak-grid">
            <div class="streak-box wins"><div class="label">Racha de victorias</div><div class="value">${rachas.rachaVictorias} partidos</div></div>
            <div class="streak-box losses"><div class="label">Racha de derrotas</div><div class="value">${rachas.rachaDerrotas} partidos</div></div>
            <div class="streak-box current"><div class="label">Racha vigente</div><div class="value">${rachas.actual ? `${rachas.actual} ${rachas.tipoActual === 'victorias' ? plural(rachas.actual, 'victoria', 'victorias') : plural(rachas.actual, 'derrota', 'derrotas')}` : 'Sin partidos'}</div></div>
          </div>
        </div>
      `;

      if (perfil.esJugadorPrincipal || esDiaz) {
        generalHtml += `
          <div class="player-section">
            <h3>Estadísticas avanzadas${esDiaz ? ` <span style="font-size:12px;color:var(--muted);font-weight:400;letter-spacing:0;">(Diaz: ${stats.partidos_jugados} partidos contabilizados, ${diazAlcanceTexto})</span>` : ''}</h3>
            <div class="stats-grid">
              <div class="stat-box"><div class="label">Minutos</div><div class="value">${stats.minutos_totales}</div></div>
              <div class="stat-box"><div class="label">Valoración</div><div class="value">${fmt1(stats.valoracion_total)}</div></div>
              <div class="stat-box"><div class="label">Valoración por partido</div><div class="value">${fmt1(stats.valoracion_total / Math.max(stats.partidos_jugados, 1))}</div></div>
              <div class="stat-box"><div class="label">Contribución</div><div class="value">${fmt1(stats.contribucion_total)} (${fmt1(stats.puntos_equipo_total ? stats.contribucion_total / stats.puntos_equipo_total * 100 : 0)}%)</div></div>
              ${esDiaz ? `
                <div class="stat-box"><div class="label">Puntos por partido</div><div class="value">${fmt1(stats.puntos_pp)}</div></div>
                <div class="stat-box"><div class="label">Rebotes por partido</div><div class="value">${fmt1(stats.rebotes_pp)}</div></div>
                <div class="stat-box"><div class="label">Asistencias por partido</div><div class="value">${fmt1(stats.asistencias_pp)}</div></div>
                <div class="stat-box"><div class="label">Porcentaje de triples</div><div class="value">${fmt1(stats.pct_triples)}%</div></div>
              ` : ''}
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
      const teamProfileCards = [
        ['ally', 'Aliado', perfilEquipo.aliado],
        ['burden', 'Lastre', perfilEquipo.lastre],
        ['bully', 'Víctima', perfilEquipo.abuson],
        ['nemesis', 'Némesis', perfilEquipo.nemesis]
      ].map(([clase, titulo, dato]) => `
        <div class="team-profile-card ${clase}">
          <div class="title">${titulo}</div>
          ${dato ? `<div class="player">${dato.nombre}</div><div class="detail">${fmtPct(dato.win_rate)} en ${dato.partidos} ${plural(dato.partidos, 'partido', 'partidos')}</div>` : '<div class="detail">Sin datos suficientes</div>'}
        </div>`).join('');
      const atributos = atributosJugadores[nombreJugador];
      const attributeGroups = atributos ? [
        ['finalizacion', 'Finalización', atributos.finalizacion],
        ['tiro', 'Tiro', atributos.tiro],
        ['pase', 'Creación de juego', atributos.pase],
        ['defensa', 'Defensa', atributos.defensa],
        ['rebote', 'Rebote', atributos.rebote],
        ['fisico', 'Físico', atributos.fisico]
      ].map(([clase, titulo, items]) => `
        <div class="type-card attribute-group attribute-group-${clase}">
          <div class="title">${titulo}</div>
          ${items.map(([label, value]) => `
            <div class="attribute-row">
              <div class="attribute-label"><span>${label}</span><strong>${value}</strong></div>
              <div class="attribute-bar" role="progressbar" aria-label="${label}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${value}"><span style="width:${value}%"></span></div>
            </div>`).join('')}
        </div>`).join('') : '<div class="sub">Sin atributos individuales disponibles.</div>';
      generalHtml += `
        <div class="player-section">
          <h3>Desglose por formato</h3>
          <div class="player-type-cards">${formatoCards || '<div class="sub">Sin datos para este jugador.</div>'}</div>
        </div>
        <div class="player-section">
          <h3>Desglose por tipo de partido</h3>
          <div class="player-type-cards">${tipoCards || '<div class="sub">Sin datos para este jugador.</div>'}</div>
        </div>
        <div class="player-section collective-chart">
          <div class="collective-chart-header">
            <div>
              <h3>Evolución por partido</h3>
              <div class="sub">La línea destacada es ${perfil.nombreMostrado}. Puedes añadir jugadores para comparar.</div>
            </div>
            <div class="chart-switcher" role="group" aria-label="Métrica del gráfico">
              <button type="button" class="active" data-profile-chart-metric="masMenosTotal">+/- total</button>
              <button type="button" data-profile-chart-metric="masMenosPP">+/- por partido</button>
              <button type="button" data-profile-chart-metric="winRate">Win rate</button>
            </div>
          </div>
          <div class="chart-player-picker">
            <label for="perfilChartBuscarJugador">Comparar con otros jugadores</label>
            <input id="perfilChartBuscarJugador" type="search" placeholder="Escribe un nombre para añadirlo" autocomplete="off">
            <div id="perfilChartResultados" class="chart-player-results" hidden></div>
            <div id="perfilChartSeleccionados" class="chart-player-selected-list"></div>
          </div>
          <div class="chart-scroll">
            <svg id="perfilChart" role="img" aria-label="Evolución de estadísticas del perfil"></svg>
          </div>
          <div id="perfilChartLegend" class="chart-legend"></div>
        </div>
        <div class="player-section">
          <h3>Perfil de equipo</h3>
          <div class="sub" style="margin-bottom:12px">Compañeros y rivales con mejor o peor porcentaje de victorias en los partidos filtrados (mínimo de 5 partidos).</div>
          <div class="team-profile-grid">${teamProfileCards}</div>
        </div>
        <div class="player-section">
          <h3>Atributos individuales</h3>
          <div class="player-type-cards">${attributeGroups}</div>
        </div>`;

      if (perfil.esJugadorPrincipal || esDiaz) {
        const highlights = calcularHighlightsJugador(nombreJugador, formato, puntuacion);
        const highlightsCards = highlights.map(highlight => {
          const registro = highlight.registro;
          return `<div class="highlight-card">
            <div class="highlight-label">${highlight.label}</div>
            ${registro ? `<div class="highlight-value">${highlight.valor(registro)}</div><div class="highlight-match">Partido ${registro.numero} · ${registro.partido.formato} · ${registro.partido.puntos_totales}-${registro.partido.puntos_rivales}</div>` : '<div class="highlight-empty">Sin datos con estos filtros</div>'}
          </div>`;
        }).join('');
        generalHtml = `<div class="profile-details-view" data-profile-details>${generalHtml}</div>
          <div class="profile-highlights-view" data-profile-highlights-view hidden>
            <div class="highlights-header"><div><h3>Highlights de ${perfil.nombreMostrado}</h3><div class="sub">Mejor registro en ${filtroPerfilTexto.toLowerCase()}.</div></div></div>
            <div class="highlights-grid">${highlightsCards}</div>
          </div>`;
      }

      texto.innerHTML = generalHtml;
      const highlightsButton = hero.querySelector('[data-profile-highlights]');
      const detailsView = texto.querySelector('[data-profile-details]');
      const highlightsView = texto.querySelector('[data-profile-highlights-view]');
      const toggleHighlights = mostrar => {
        if (!detailsView || !highlightsView) return;
        detailsView.hidden = mostrar;
        highlightsView.hidden = !mostrar;
        highlightsButton?.classList.toggle('active', mostrar);
        highlightsButton?.setAttribute('aria-pressed', String(mostrar));
      };
      highlightsButton?.addEventListener('click', () => toggleHighlights(highlightsView.hidden));
      const chartSearch = el('perfilChartBuscarJugador');
      const chartResults = el('perfilChartResultados');
      const chartSelected = el('perfilChartSeleccionados');
      const jugadoresDisponibles = tempParaGrafica.obtener_todos_jugadores()
        .filter(jugador => norm(jugador) !== norm(nombreJugador));
      const seleccionados = [];
      const renderPerfilChart = () => renderGraficoPerfil(nombreJugador, tempParaGrafica, seleccionados);
      const renderComparador = () => {
        const query = norm(chartSearch.value);
        const resultados = jugadoresDisponibles.filter(jugador => query && norm(jugador).includes(query) && !seleccionados.some(item => norm(item) === norm(jugador)));
        chartResults.innerHTML = resultados.length
          ? resultados.map(jugador => `<button type="button" class="chart-player-option" data-add-player="${jugador}">${jugador}<span>+</span></button>`).join('')
          : '';
        chartResults.hidden = resultados.length === 0;
        chartSelected.innerHTML = seleccionados.map(jugador => `<span class="chart-player-selected">${jugador}<button type="button" aria-label="Quitar ${jugador}" data-remove-player="${jugador}">×</button></span>`).join('');
      };
      chartSearch.addEventListener('input', renderComparador);
      chartResults.addEventListener('click', event => {
        const button = event.target.closest('[data-add-player]');
        if (!button) return;
        seleccionados.push(button.dataset.addPlayer);
        chartSearch.value = '';
        renderComparador();
        renderPerfilChart();
      });
      chartSelected.addEventListener('click', event => {
        const button = event.target.closest('[data-remove-player]');
        if (!button) return;
        const index = seleccionados.findIndex(jugador => jugador === button.dataset.removePlayer);
        if (index !== -1) seleccionados.splice(index, 1);
        renderComparador();
        renderPerfilChart();
      });
      document.querySelectorAll('[data-profile-chart-metric]').forEach(button => {
        button.addEventListener('click', () => {
          metricaGraficoColectivas = button.dataset.profileChartMetric;
          document.querySelectorAll('[data-profile-chart-metric]').forEach(item => item.classList.toggle('active', item === button));
          renderPerfilChart();
        });
      });
      renderPerfilChart();
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
      actualizarContextoEstadisticas(jugador);
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
        document.querySelectorAll('.nav-link').forEach(item => item.classList.toggle('active', item.dataset.navTarget === id));
        if (id === 'tab-jugadores') {
          jugadorSeleccionadoActual = null;
          document.getElementById('vistaIndiceJugadores').hidden = false;
          document.getElementById('vistaPerfilJugador').hidden = true;
        }
        if (id === 'tab-simulacion') {
          renderSimulationScreen();
          return;
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
    el('buscarJugador').addEventListener('input', actualizarUmbralJugadores);

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

    el('btnEstimadoMasMenos').addEventListener('click', ()=>{
      const equipo = el('txtEquipoMasMenos').value.split(',').map(s=>s.trim()).filter(Boolean);
      if(equipo.length === 0){ el('outEstimadoMasMenos').textContent = 'Introduce al menos un nombre.'; return; }
      const {estimado, faltan} = temporada.calcular_mas_menos_por_partido_estimado(equipo);
      if(estimado !== null){
        el('outEstimadoMasMenos').innerHTML = `+/- por partido estimado: <b>${estimado >= 0 ? '+' : ''}${fmt1(estimado)}</b>${faltan.length ? ` · Sin datos (≥ 5 pj): ${faltan.join(', ')}` : ''}`;
      }else{
        el('outEstimadoMasMenos').textContent = `No hay suficientes datos para estimar. ${faltan.length ? 'Faltan: ' + faltan.join(', ') : ''}`;
      }
    });

    el('btnEquipoMasMenos').addEventListener('click', ()=>{
      const equipo = el('txtEquipoMasMenos').value.split(',').map(s=>s.trim()).filter(Boolean);
      if(equipo.length === 0){ el('outEquipoMasMenos').textContent = 'Introduce al menos un jugador.'; return; }
      const resultado = temporada.calcular_mas_menos_por_partido_equipo(equipo);
      if(resultado.mensaje){
        el('outEquipoMasMenos').textContent = resultado.mensaje;
      }else{
        el('outEquipoMasMenos').textContent = `+/- por partido de equipo: ${resultado.mas_menos >= 0 ? '+' : ''}${fmt1(resultado.mas_menos)} (${resultado.partidos} partidos juntos)`;
      }
    });

    const SIMULATION_POOL = ["Aleix", "Arnau", "Cavi", "Diaz", "Eric", "Ert", "Grinyo", "Jamo", "Llongueras", "Blasi", "Batalla", "Raset"];
    const SUPABASE_URL = "https://fawwabuyxulydwdnzqmx.supabase.co" || '';
    const SUPABASE_ANON_KEY = "sb_publishable_pn-ioI0Sgw00hWINTUvWFg_Zk2HTZXz" || '';
    const supabaseClient = SUPABASE_URL && SUPABASE_ANON_KEY && window.supabase
      ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
      : null;
    const ULTIMATE_ADMIN_EMAIL = 'eric.matasp12@gmail.com';
    const ULTIMATE_PRICE_PER_OVERALL = 100;
    const ULTIMATE_CARD_CATALOG = SIMULATION_POOL.map(name => ({
      id: name.toLowerCase(), name, overall: { Aleix: 74, Arnau: 78, Cavi: 70, Diaz: 76, Eric: 79, Ert: 74, Grinyo: 64, Jamo: 70, Llongueras: 71, Blasi: 67, Batalla: 63, Raset: 68 }[name],
      image_path: `cards/${name}_Card.png`
    })).map(card => ({ ...card, price: card.overall * ULTIMATE_PRICE_PER_OVERALL }));
    const SIMULATION_WIN_SCORE = 11;
    const SIMULATION_ACCESS_PASSWORD = 'basketcadafinde';
    const SIMULATION_FORMAT_OPTIONS = [
      { value: '2vs2', label: '2 vs 2', playersPerTeam: 2 },
      { value: '3vs3', label: '3 vs 3', playersPerTeam: 3 },
      { value: '4vs4', label: '4 vs 4', playersPerTeam: 4 }
    ];
    const SIMULATION_WIN_OPTIONS = [
      { value: '11', label: 'A 11 puntos', score: 11 },
      { value: '21', label: 'A 21 puntos', score: 21 }
    ];
    const SIMULATION_MESSAGE_DELAY_MS = 5000;
    const SIMULATION_CPU_DELAY_MS = 6000;
    const SIMULATION_FOLLOWUP_DELAY_MS = 1200;
    const SIMULATION_RESULT_DELAY_MS = 5000;
    const SIMULATION_FEED_LIMIT = 4;
    const SIMULATION_ATTRIBUTE_NAMES = [
      "tiro_cercano","bandeja_en_carrera","tiro_media_distancia","triple","precision_pase","manejo_balon",
      "defensa_interior","defensa_exterior","robo","tapon","rebote_ofensivo","rebote_defensivo",
      "velocidad","agilidad","fuerza"
    ];
    const SIMULATION_PLAYER_ATTRS = {
      Aleix: { tiro_cercano: 84, bandeja_en_carrera: 86, tiro_media_distancia: 75, triple: 67, precision_pase: 83, manejo_balon: 81, defensa_interior: 64, defensa_exterior: 79, robo: 60, tapon: 51, rebote_ofensivo: 59, rebote_defensivo: 68, velocidad: 85, agilidad: 84, fuerza: 62 },
      Arnau: { tiro_cercano: 78, bandeja_en_carrera: 92, tiro_media_distancia: 78, triple: 87, precision_pase: 81, manejo_balon: 80, defensa_interior: 61, defensa_exterior: 82, robo: 75, tapon: 64, rebote_ofensivo: 63, rebote_defensivo: 73, velocidad: 79, agilidad: 89, fuerza: 68 },
      Cavi: { tiro_cercano: 66, bandeja_en_carrera: 59, tiro_media_distancia: 63, triple: 61, precision_pase: 70, manejo_balon: 52, defensa_interior: 82, defensa_exterior: 74, robo: 71, tapon: 70, rebote_ofensivo: 81, rebote_defensivo: 88, velocidad: 78, agilidad: 68, fuerza: 84 },
      Diaz: { tiro_cercano: 76, bandeja_en_carrera: 72, tiro_media_distancia: 66, triple: 63, precision_pase: 83, manejo_balon: 71, defensa_interior: 76, defensa_exterior: 84, robo: 82, tapon: 74, rebote_ofensivo: 87, rebote_defensivo: 86, velocidad: 80, agilidad: 78, fuerza: 74 },
      Eric: { tiro_cercano: 87, bandeja_en_carrera: 75, tiro_media_distancia: 77, triple: 76, precision_pase: 89, manejo_balon: 83, defensa_interior: 80, defensa_exterior: 68, robo: 72, tapon: 85, rebote_ofensivo: 81, rebote_defensivo: 79, velocidad: 73, agilidad: 70, fuerza: 82 },
      Ert: { tiro_cercano: 83, bandeja_en_carrera: 70, tiro_media_distancia: 71, triple: 73, precision_pase: 77, manejo_balon: 78, defensa_interior: 77, defensa_exterior: 64, robo: 65, tapon: 74, rebote_ofensivo: 73, rebote_defensivo: 70, velocidad: 72, agilidad: 70, fuerza: 79 },
      Grinyo: { tiro_cercano: 62, bandeja_en_carrera: 60, tiro_media_distancia: 70, triple: 63, precision_pase: 70, manejo_balon: 49, defensa_interior: 71, defensa_exterior: 76, robo: 57, tapon: 55, rebote_ofensivo: 61, rebote_defensivo: 70, velocidad: 68, agilidad: 80, fuerza: 62 },
      Jamo: { tiro_cercano: 68, bandeja_en_carrera: 69, tiro_media_distancia: 64, triple: 78, precision_pase: 76, manejo_balon: 59, defensa_interior: 81, defensa_exterior: 71, robo: 72, tapon: 82, rebote_ofensivo: 67, rebote_defensivo: 75, velocidad: 67, agilidad: 67, fuerza: 63 },
      Llongueras: { tiro_cercano: 76, bandeja_en_carrera: 72, tiro_media_distancia: 65, triple: 76, precision_pase: 80, manejo_balon: 64, defensa_interior: 65, defensa_exterior: 69, robo: 68, tapon: 53, rebote_ofensivo: 78, rebote_defensivo: 67, velocidad: 81, agilidad: 73, fuerza: 75 },
      Blasi: { tiro_cercano: 77, bandeja_en_carrera: 68, tiro_media_distancia: 64, triple: 60, precision_pase: 73, manejo_balon: 60, defensa_interior: 67, defensa_exterior: 67, robo: 73, tapon: 58, rebote_ofensivo: 63, rebote_defensivo: 71, velocidad: 75, agilidad: 61, fuerza: 78 },
      Batalla: { tiro_cercano: 61, bandeja_en_carrera: 68, tiro_media_distancia: 60, triple: 58, precision_pase: 66, manejo_balon: 51, defensa_interior: 63, defensa_exterior: 78, robo: 75, tapon: 67, rebote_ofensivo: 69, rebote_defensivo: 62, velocidad: 67, agilidad: 73, fuerza: 49 },
      Raset: { tiro_cercano: 68, bandeja_en_carrera: 62, tiro_media_distancia: 73, triple: 81, precision_pase: 72, manejo_balon: 61, defensa_interior: 62, defensa_exterior: 80, robo: 81, tapon: 59, rebote_ofensivo: 57, rebote_defensivo: 63, velocidad: 75, agilidad: 66, fuerza: 72 }
    };

    const SIMULATION_CSS = `
      .sim-shell { display:flex; flex-direction:column; gap:14px; color:#f4f7fb; }
      .sim-lobby, .sim-roster, .sim-game, .sim-finish { display:flex; flex-direction:column; gap:14px; }
      .sim-hero { display:flex; justify-content:center; padding:14px 12px; }
      .sim-main-button { min-width:180px; font-size:16px; font-weight:700; }
      .sim-setup { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
      .sim-team { background:#102021; border:1px solid #315c59; border-radius:12px; padding:14px; }
      .sim-team h3 { margin:0 0 12px; }
      .sim-players { display:grid; grid-template-columns:repeat(auto-fit,minmax(140px,1fr)); gap:10px; }
      .sim-player-card { border:1px solid #315c59; border-radius:8px; background:#132628; padding:10px; display:flex; align-items:center; gap:10px; position:relative; overflow:visible; cursor:pointer; }
      .sim-player-card img { width:42px; height:42px; border-radius:50%; object-fit:cover; border:2px solid #22314b; }
      .sim-player-card .name { font-weight:700; text-transform:none; }
      .sim-player-card .role { font-size:11px; color:#91a3b0; text-transform:none; }
      .sim-player-card:hover, .sim-player-card.active { border-color:#d9ff8d; }
      .sim-tooltip { position:fixed; left:50%; top:50%; transform:translate(-50%, -50%); width:min(560px, calc(100vw - 24px)); max-height:calc(100vh - 32px); overflow-y:auto; background:#0d1520; border:1px solid #34507c; border-radius:12px; padding:9px; z-index:100; font-size:10px; color:#dfeaff; box-shadow:0 18px 50px rgba(0,0,0,.5); text-transform:none; display:none; }
      .sim-hover-summary { display:none; position:absolute; left:0; right:0; top:calc(100% + 8px); background:#0d1520; border:1px solid #34507c; border-radius:12px; padding:10px; z-index:19; box-shadow:0 10px 20px rgba(0,0,0,.25); }
      .sim-player-card:hover .sim-hover-summary { display:block; }
      .sim-player-card.active .sim-hover-summary { display:none; }
      .sim-player-card:hover.active .sim-tooltip { display:block; }
      .sim-detail-panel { display:none; }
      .sim-player-card.active .sim-detail-panel { display:block; }
      .sim-tooltip-title { display:flex; justify-content:space-between; align-items:center; gap:8px; margin-bottom:8px; font-size:13px; }
      .sim-player-meta { display:flex; flex-wrap:wrap; gap:6px; margin-bottom:10px; color:#a7bedf; }
      .sim-player-meta span { padding:4px 7px; border-radius:6px; background:#142036; border:1px solid #2a3b57; }
      .sim-stat-group { display:grid; gap:6px; }
      .sim-tooltip .sim-stat-group { grid-template-columns:repeat(2, minmax(0, 1fr)); column-gap:16px; }
      .sim-hover-summary { padding:10px; font-size:11px; }
      .sim-hover-summary .sim-tooltip-title { margin-bottom:6px; font-size:12px; }
      .sim-hover-summary .sim-player-meta { gap:4px; margin-bottom:7px; font-size:10px; }
      .sim-hover-summary .sim-player-meta span { padding:3px 5px; }
      .sim-hover-summary .sim-stat-group { gap:4px; }
      .sim-hover-summary .sim-stat-row { gap:6px; }
      .sim-hover-summary .sim-stat-value { font-size:11px; }
      .sim-hover-summary .sim-stat-bar { height:4px; }
      .sim-profile-attributes { display:grid; grid-template-columns:repeat(3, minmax(110px, 1fr)); gap:6px; }
      .sim-profile-attributes .type-card { min-width:0; padding:8px; }
      .sim-profile-attributes .type-card .title { font-size:11px; margin-bottom:5px; }
      .sim-profile-attributes .attribute-row { padding:4px 0; }
      .sim-profile-attributes .attribute-label { font-size:10px; }
      .sim-profile-attributes .attribute-label strong { font-size:11px; }
      .sim-profile-attributes .attribute-bar { height:5px; margin-top:4px; }
      .sim-available { background:#101725; border:1px solid #22314b; border-radius:16px; padding:14px; }
      .sim-available h3 { margin:0 0 12px; }
      .sim-available-grid { display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:10px; }
      .sim-lock-screen { min-height:520px; display:flex; align-items:center; justify-content:center; padding:24px; border:1px solid #17202d; border-radius:16px; background:radial-gradient(circle at center, #111925 0%, #05070a 72%); color:#e7eef6; }
      .sim-lock-card { width:min(420px, 100%); padding:28px; border:1px solid #27354a; border-radius:16px; background:rgba(5,8,12,.88); box-shadow:0 20px 60px rgba(0,0,0,.55); text-align:center; }
      .sim-lock-icon { width:54px; height:54px; display:grid; place-items:center; margin:0 auto 14px; border:1px solid #34445d; border-radius:50%; color:#91a3b0; font-size:24px; }
      .sim-lock-card h2 { margin:0 0 8px; font-size:22px; }
      .sim-lock-card p { margin:0 0 18px; color:#91a3b0; font-size:13px; }
      .sim-lock-form { display:flex; gap:8px; }
      .sim-lock-form input { flex:1; min-width:0; }
      .sim-lock-error { min-height:18px; margin-top:10px; color:#ff8b7b; font-size:12px; }
      .sim-stat-row { display:grid; grid-template-columns:minmax(0,1fr) auto; gap:8px; align-items:center; }
      .sim-stat-label { color:#cfe1ff; text-transform:capitalize; }
      .sim-stat-value { color:#fff; font-weight:700; }
      .sim-stat-bar { grid-column:1 / -1; height:5px; border-radius:99px; background:#1a2941; overflow:hidden; }
      .sim-stat-bar span { display:block; height:100%; border-radius:inherit; }
      .sim-stat-bar.best span { background:#46d39a; }
      .sim-stat-bar.worst span { background:#ff8b7b; }
      .sim-stat-bar.neutral span { background:#4f9cff; }
      .sim-config { display:grid; grid-template-columns:1fr 1fr; gap:12px; width:min(520px,100%); margin:0 auto; }
      .sim-config label { display:grid; gap:6px; color:#a7bedf; font-size:12px; text-align:left; }
      .sim-config select { width:100%; background:#0f1521; border:1px solid #2a3b57; color:#eaf2ff; border-radius:10px; padding:9px 10px; }
      .sim-actions { display:flex; flex-wrap:wrap; gap:8px; justify-content:center; }
      .sim-action-button { background:#0f1521; border:1px solid #2a3b57; color:#eaf2ff; border-radius:10px; padding:8px 10px; }
      .sim-action-button.primary { background:#d9ff8d; border-color:#d9ff8d; color:#102021; }
      .sim-scorebar { display:flex; align-items:center; justify-content:space-between; gap:20px; padding:12px 16px; border-radius:12px; background:#102021; border:1px solid #315c59; }
      .sim-scoreline { display:grid; grid-template-columns:minmax(0,1fr) auto minmax(0,1fr); align-items:center; gap:14px; flex:1; min-width:0; }
      .sim-scoreline .sim-pill:last-child { justify-self:end; }
      .sim-score { font-size:26px; font-weight:800; }
      .sim-score small { font-size:12px; color:#91a3b0; }
      .sim-status { display:flex; gap:12px; align-items:center; flex-wrap:wrap; justify-content:center; }
      .sim-feed { background:#102021; border:1px solid #315c59; border-radius:12px; padding:14px; min-height:140px; display:flex; flex-direction:column; gap:8px; }
      .sim-feed-item { border-left:2px solid #d9ff8d; padding:8px 10px; background:#132628; border-radius:8px; }
      .sim-feed-item.warning { border-left-color:#ffb454; }
      .sim-feed-item small { display:block; margin-top:4px; color:#a7bedf; font-size:11px; }
      .sim-live-grid { display:grid; grid-template-columns:1.5fr .9fr; gap:14px; }
      .sim-decision-panel { background:#102021; border:1px solid #315c59; border-radius:12px; padding:14px; }
      .sim-decision-panel h4 { margin:0 0 12px; }
      .sim-right-panel { display:flex; flex-direction:column; gap:12px; }
      .sim-pill { display:inline-flex; align-items:center; padding:4px 8px; border-radius:999px; background:#142036; color:#cfe1ff; font-size:12px; border:1px solid #2a3b57; }
      .sim-result-card { background:#102021; border:1px solid #315c59; border-radius:12px; padding:18px; }
      .sim-finish-grid { display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-top:8px; }
      .sim-boxscore { margin-top:16px; }
      .sim-boxscore-team { padding:12px; border:1px solid #2a3b57; border-radius:12px; background:#0f1521; }
      .sim-boxscore-team + .sim-boxscore-team { margin-top:14px; border-top:3px solid #4f9cff; }
      .sim-boxscore-team.winner { border-color:#46d39a; background:linear-gradient(135deg,rgba(70,211,154,.16),#0f1521 55%); box-shadow:inset 0 0 0 1px rgba(70,211,154,.22); }
      .sim-boxscore-team.loser { border-color:#ff7468; background:linear-gradient(135deg,rgba(255,116,104,.14),#0f1521 55%); box-shadow:inset 0 0 0 1px rgba(255,116,104,.2); }
      .sim-boxscore-team h4 { margin:0 0 8px; color:#dfeaff; }
      .sim-boxscore table { width:100%; border-collapse:collapse; }
      .sim-boxscore th, .sim-boxscore td { padding:8px 6px; text-align:left; border-bottom:1px solid #263753; font-size:12px; }
      .sim-boxscore th { color:#8fa6c2; }
      .sim-result-team { display:flex; flex-wrap:wrap; gap:8px; }
      .sim-result-player { display:inline-flex; align-items:center; gap:6px; padding:6px 8px; border-radius:999px; background:#0f1521; border:1px solid #22314b; }
      .sim-result-player.winner { border-color:#4f9cff; background:#142036; }
      .sim-mvp { margin-top:12px; font-weight:700; color:#dfeaff; }
      .sim-mvp-badge { display:inline-flex; align-items:center; margin-left:6px; padding:2px 5px; border-radius:5px; background:#f4c542; color:#221b00; font-size:10px; font-weight:800; vertical-align:middle; }
      .sim-boxscore tr.mvp-row td { background:rgba(244,197,66,.12); border-bottom-color:rgba(244,197,66,.45); }
      .ut-shell { min-height:620px; padding:18px; color:#f4f7fb; background:linear-gradient(135deg,#08131a,#102b2c 52%,#191b23); border:1px solid #244b4b; border-radius:18px; }
      .ut-header { display:flex; align-items:center; justify-content:space-between; gap:16px; flex-wrap:wrap; padding-bottom:18px; border-bottom:1px solid #285050; }
      .ut-brand { font-size:22px; font-weight:900; letter-spacing:.08em; text-transform:uppercase; color:#d9ff8d; }
      .ut-status { display:flex; align-items:center; gap:8px; flex-wrap:wrap; font-size:12px; color:#c0d4d0; }
      .ut-status span { padding:7px 9px; border:1px solid #315c59; border-radius:8px; background:#102021; }
      .ut-nav { display:grid; grid-template-columns:repeat(3,1fr); gap:8px; margin:18px 0 22px; }
      .ut-nav button { border-radius:8px; padding:12px; background:#122526; border-color:#315c59; text-transform:uppercase; font-size:11px; font-weight:800; letter-spacing:.08em; }
      .ut-nav button.active { background:#d9ff8d; border-color:#d9ff8d; color:#102021; }
      .ut-title-row { display:flex; align-items:end; justify-content:space-between; gap:12px; margin-bottom:16px; }
      .ut-title-row h2 { margin:0; font-size:26px; letter-spacing:-.03em; }
      .ut-title-row p { margin:4px 0 0; color:#9cbab3; font-size:13px; }
      .ut-card-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(160px,1fr)); gap:14px; }
      .ut-market-carousel { display:grid; grid-template-columns:38px minmax(0,1fr) 38px; align-items:center; gap:10px; width:100%; }
      .ut-market-window { min-width:0; overflow:hidden; }
      .ut-market-track { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:14px; }
      .ut-market-arrow { display:grid; place-items:center; width:38px; height:38px; padding:0; border-radius:50%; background:#132628; color:#d9ff8d; border-color:#37605c; font-size:22px; }
      .ut-market-arrow:hover { border-color:#d9ff8d; }
      .ut-card { background:#132628; border:1px solid #37605c; border-radius:10px; padding:9px; cursor:pointer; transition:transform .15s ease,border-color .15s ease; }
      .ut-card:hover { transform:translateY(-3px); border-color:#d9ff8d; }
      .ut-card img { display:block; width:100%; aspect-ratio:2 / 3; object-fit:cover; border-radius:6px; background:#0a1215; }
      .ut-card-info { display:flex; justify-content:space-between; gap:8px; align-items:center; padding-top:9px; font-size:12px; }
      .ut-card-info strong { color:#fff; }
      .ut-card-info small { color:#d9ff8d; font-weight:800; }
      .ut-card button { width:100%; margin-top:9px; padding:8px; border-radius:7px; font-size:11px; font-weight:800; }
      .ut-card button:disabled { cursor:not-allowed; opacity:.55; }
      .ut-empty { padding:28px; border:1px dashed #37605c; text-align:center; color:#9cbab3; }
      .ut-auth { width:min(430px,100%); margin:40px auto; padding:28px; background:#102021; border:1px solid #37605c; border-radius:12px; }
      .ut-auth h2, .ut-auth p, .ut-auth label { color:#f4f7fb; }
      .ut-auth h2 { margin:0 0 8px; color:#d9ff8d; }
      .ut-auth p { color:#9cbab3; font-size:13px; }
      .ut-auth form { display:grid; gap:9px; margin-top:18px; }
      .ut-auth input { background:#0a1517; border-color:#315c59; border-radius:7px; }
      .ut-auth input { color:#fff; }
      .ut-auth input::placeholder { color:#8faeaa; }
      .ut-auth-actions { display:flex; gap:8px; flex-wrap:wrap; }
      .ut-auth-actions button { flex:1; min-width:140px; border-radius:7px; }
      .ut-primary { background:#d9ff8d !important; border-color:#d9ff8d !important; color:#102021 !important; font-weight:900; }
      .ut-error { min-height:18px; color:#ff9e91; font-size:12px; }
      .ut-modal-backdrop { position:fixed; inset:0; z-index:200; display:grid; place-items:center; padding:16px; background:rgba(2,8,10,.82); }
      .ut-modal { position:relative; display:grid; grid-template-columns:minmax(180px,250px) 1fr; gap:22px; width:min(720px,100%); max-height:90vh; overflow:auto; padding:20px; background:#102021; border:1px solid #d9ff8d; border-radius:12px; box-shadow:0 24px 80px rgba(0,0,0,.6); }
      .ut-card-column { min-width:0; }
      .ut-card-column > img { display:block; width:100%; border-radius:7px; }
      .ut-modal h2 { margin:0; font-size:28px; color:#d9ff8d; }
      .ut-modal p { color:#9cbab3; }
      .ut-close { position:absolute; right:10px; top:10px; border:0; background:transparent; color:#fff; font-size:24px; padding:2px 8px; box-shadow:none; }
      .ut-attributes { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:6px; }
      .ut-attribute { display:flex; justify-content:space-between; gap:8px; padding:7px; background:#152b2c; border-radius:6px; color:#b5cfca; font-size:11px; }
      .ut-attribute strong { color:#fff; }
      .ut-profile-attributes { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:8px; margin-top:14px; }
      .ut-profile-attributes .type-card { min-width:0; padding:9px; }
      .ut-profile-attributes .attribute-row { padding:6px 0; }
      .ut-stat-heading { margin-top:18px; padding-top:12px; border-top:1px solid #315c59; color:#d9ff8d; font-size:12px; font-weight:800; text-transform:uppercase; letter-spacing:.08em; }
      .ut-game-stats { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:6px; margin-top:8px; }
      .ut-game-stat { display:flex; justify-content:space-between; gap:8px; padding:7px; border:1px solid #315c59; border-radius:6px; background:#132628; color:#a9c2bd; font-size:11px; }
      .ut-game-stat strong { color:#fff; }
      .ut-pack { display:flex; justify-content:center; gap:12px; min-height:260px; margin:24px 0; perspective:900px; }
      .ut-pack-card { width:170px; transform:rotateY(180deg); opacity:.35; transition:transform .7s ease,opacity .35s ease; }
      .ut-pack-card img { display:block; width:100%; border-radius:8px; box-shadow:0 12px 30px rgba(0,0,0,.35); }
      .ut-pack.is-open .ut-pack-card { transform:rotateY(0); opacity:1; }
      .ut-pack.is-open .ut-pack-card:nth-child(2) { transition-delay:.18s; }
      .ut-welcome { max-width:620px; margin:20px auto; padding:30px 18px; text-align:center; }
      .ut-welcome h2 { font-size:30px; margin:14px 0 6px; }
      .ut-welcome p { color:#9cbab3; }
      .ut-play-card { width:min(150px,22vw); cursor:pointer; transition:transform .15s ease,filter .15s ease; }
      .ut-play-card:hover { transform:translateY(-5px) scale(1.03); filter:drop-shadow(0 10px 16px rgba(217,255,141,.22)); }
      .ut-play-card.selected { transform:translateY(-5px); filter:drop-shadow(0 10px 16px rgba(217,255,141,.32)); }
      .ut-play-card img { display:block; width:100%; border:1px solid #37605c; border-radius:8px; }
      .ut-play-meta { padding-top:6px; color:#d9ff8d; font-size:11px; font-weight:800; text-align:center; }
      .ut-side-label { margin-bottom:8px; text-align:center; color:#9cbab3; font-size:11px; font-weight:800; letter-spacing:.1em; }
      .ut-dice { margin-left:5px; padding:1px 5px; border:1px solid #37605c; border-radius:5px; color:#d9ff8d; background:#132628; box-shadow:none; }
      .ut-match-preview { display:grid; grid-template-columns:1fr auto 1fr; align-items:center; gap:12px; margin-bottom:16px; }
      .ut-match-team { display:flex; justify-content:center; gap:8px; flex-wrap:wrap; }
      .ut-match-team { align-items:flex-start; display:grid; grid-template-columns:repeat(2,minmax(100px,150px)); }
      .ut-match-team img { width:100%; max-width:150px; border:1px solid #37605c; border-radius:5px; }
      .ut-swap-backdrop { position:fixed; inset:0; z-index:210; display:grid; place-items:center; padding:16px; background:rgba(2,8,10,.78); }
      .ut-swap-window { width:min(680px,100%); max-height:82vh; overflow:auto; padding:20px; background:#102021; border:1px solid #d9ff8d; border-radius:12px; box-shadow:0 24px 80px rgba(0,0,0,.6); }
      .ut-swap-window h3 { margin:0; color:#d9ff8d; }
      .ut-swap-window p { color:#9cbab3; font-size:13px; }
      .ut-swap-options { display:grid; grid-template-columns:repeat(auto-fill,minmax(130px,150px)); justify-content:start; gap:12px; }
      .ut-swap-option { padding:8px; text-align:left; background:#132628; border:1px solid #37605c; border-radius:8px; }
      .ut-swap-option:hover { border-color:#d9ff8d; }
      .ut-swap-option img { display:block; width:100%; aspect-ratio:2 / 3; object-fit:cover; border-radius:6px; }
      .ut-swap-option span { display:block; padding-top:6px; color:#d9ff8d; font-size:11px; font-weight:800; }
      .ut-vs { font-weight:900; color:#d9ff8d; }
      @media (max-width:600px) { .ut-shell { padding:12px; } .ut-nav { grid-template-columns:1fr; } .ut-modal { grid-template-columns:1fr; } .ut-match-preview { grid-template-columns:1fr; } }
      @media (max-width: 900px) { .sim-live-grid, .sim-setup, .sim-finish-grid { grid-template-columns:1fr; } .sim-config { grid-template-columns:1fr; } .sim-profile-attributes { grid-template-columns:repeat(2, minmax(145px, 1fr)); } }
      @media (max-width: 520px) { .sim-profile-attributes { grid-template-columns:1fr; } }
    `;

    if (!document.getElementById('sim-style-root')) {
      const simStyle = document.createElement('style');
      simStyle.id = 'sim-style-root';
      simStyle.textContent = SIMULATION_CSS;
      document.head.appendChild(simStyle);
    }

    const simulationState = {
      phase: 'lobby',
      teams: { A: [], B: [] },
      score: { A: 0, B: 0 },
      possession: 'A',
      activePlayer: null,
      messageQueue: [],
      messageTimeout: null,
      userTurn: false,
      winner: null,
      matchups: { A: {}, B: {} },
      mismatchActive: false,
      boxScore: {},
      currentEvent: '',
      matchOver: false,
      pendingCpuTimeout: null,
      pendingFinishTimeout: null,
      pendingFollowupTimeout: null,
      accessGranted: false,
      accessError: '',
      settings: { format: '3vs3', winScore: SIMULATION_WIN_SCORE },
      clubView: 'club',
      leaveRequested: false
      ,rewardApplied: false,
      previewTeamB: [],
      selectedTeamA: [],
      statsRecorded: false,
      selectionFormat: null,
      marketIndex: 0
    };

    const clubState = {
      session: null,
      profile: null,
      catalog: ULTIMATE_CARD_CATALOG,
      ownedIds: new Set(),
      playerStats: {},
      loading: false,
      initialized: false,
      error: '',
      welcomeCards: [],
      welcomePending: false
    };

    function escapeHtml(value) {
      return String(value ?? '').replace(/[&<>'"]/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]));
    }

    function cardById(cardId) {
      return clubState.catalog.find(card => card.id === cardId) || ULTIMATE_CARD_CATALOG.find(card => card.id === cardId);
    }

    function cardImage(card) {
      return card?.image_path || `cards/${card?.name || 'Eric'}_Card.png`;
    }

    function getLocalUsers() {
      return JSON.parse(localStorage.getItem('basket-club-users') || '{}');
    }

    function setLocalUsers(users) {
      localStorage.setItem('basket-club-users', JSON.stringify(users));
    }

    function localClubProfile(email = '') {
      const users = getLocalUsers();
      return users[email.toLowerCase()]?.profile || null;
    }

    function saveLocalClub() {
      if (!clubState.profile?.email) return;
      const email = clubState.profile.email.toLowerCase();
      const users = getLocalUsers();
      users[email] = { password: users[email]?.password || '', profile: clubState.profile };
      setLocalUsers(users);
      localStorage.setItem(`basket-club-cards-${email}`, JSON.stringify([...clubState.ownedIds]));
    }

    function hydrateLocalClub(email) {
      clubState.profile = localClubProfile(email);
      clubState.ownedIds = new Set(JSON.parse(localStorage.getItem(`basket-club-cards-${email.toLowerCase()}`) || '[]'));
      clubState.playerStats = JSON.parse(localStorage.getItem(`basket-club-player-stats-${email.toLowerCase()}`) || '{}');
    }

    async function loadClubData() {
      clubState.loading = true;
      clubState.error = '';
      if (!supabaseClient) {
        clubState.profile = null;
        clubState.ownedIds = new Set();
        clubState.loading = false;
        clubState.initialized = true;
        return;
      }
      const { data: sessionData } = await supabaseClient.auth.getSession();
      clubState.session = sessionData.session;
      if (!clubState.session) {
        clubState.loading = false;
        clubState.initialized = true;
        return;
      }
      const user = clubState.session.user;
      clubState.playerStats = JSON.parse(localStorage.getItem(`basket-club-player-stats-${user.id}`) || '{}');
      const { data: profile, error: profileError } = await supabaseClient.from('profiles').select('*').eq('id', user.id).maybeSingle();
      if (profileError) clubState.error = profileError.message;
      clubState.profile = profile || { id: user.id, email: user.email, username: user.user_metadata?.username || '', coins: 500, wins: 0, losses: 0 };
      const { data: catalog } = await supabaseClient.from('cards').select('*').order('name');
      const { data: owned } = await supabaseClient.from('user_cards').select('card_id').eq('user_id', user.id);
      clubState.catalog = catalog?.length ? catalog : ULTIMATE_CARD_CATALOG;
      clubState.ownedIds = new Set((owned || []).map(item => item.card_id));
      const starterSeenKey = `basket-starter-seen-${user.id}`;
      if (clubState.ownedIds.size === 2 && !localStorage.getItem(starterSeenKey)) {
        clubState.welcomeCards = [...clubState.ownedIds];
        clubState.welcomePending = true;
      }
      clubState.loading = false;
      clubState.initialized = true;
    }

    async function signInClub(email, password, register = false) {
      if (!supabaseClient) {
        const cleanEmail = email.trim().toLowerCase();
        if (!cleanEmail || password.length < 6) {
          clubState.error = 'Introduce un email y una contraseña de al menos 6 caracteres.';
          renderSimulationScreen();
          return;
        }
        const users = getLocalUsers();
        if (register) {
          if (users[cleanEmail]) { clubState.error = 'Ya existe una cuenta con ese email.'; renderSimulationScreen(); return; }
          const starterCards = shuffleArray(SIMULATION_POOL).slice(0, 2).map(name => name.toLowerCase());
          users[cleanEmail] = { password, profile: { username: '', email: cleanEmail, coins: 500, wins: 0, losses: 0 } };
          setLocalUsers(users);
          localStorage.setItem(`basket-club-cards-${cleanEmail}`, JSON.stringify(starterCards));
          clubState.welcomeCards = starterCards;
          clubState.welcomePending = true;
        } else if (!users[cleanEmail]) {
          clubState.error = 'No existe una cuenta con ese email. Crea una cuenta para entrar.';
          renderSimulationScreen();
          return;
        } else if (users[cleanEmail].password !== password) {
          clubState.error = 'La contraseña no es correcta.';
          renderSimulationScreen();
          return;
        }
        sessionStorage.setItem('basket-club-session', cleanEmail);
        hydrateLocalClub(cleanEmail);
        clubState.error = '';
        renderSimulationScreen();
        return;
      }
      const result = register
        ? await supabaseClient.auth.signUp({ email, password })
        : await supabaseClient.auth.signInWithPassword({ email, password });
      if (result.error) {
        clubState.error = register
          ? result.error.message
          : 'Email o contraseña incorrectos. Si no tienes cuenta, crea una cuenta.';
        renderSimulationScreen();
        return;
      }
      await loadClubData();
      renderSimulationScreen();
    }

    async function signOutClub() {
      if (supabaseClient) await supabaseClient.auth.signOut();
      sessionStorage.removeItem('basket-club-session');
      clubState.session = null;
      clubState.profile = null;
      clubState.welcomePending = false;
      renderSimulationScreen();
    }

    async function saveClubUsername(username) {
      const clean = username.trim();
      if (!clean || !clubState.profile) return;
      const isAdmin = (clubState.profile.email || clubState.session?.user?.email || '').toLowerCase() === ULTIMATE_ADMIN_EMAIL;
      const profile = { ...clubState.profile, username: isAdmin ? 'byEriK12' : clean, coins: isAdmin ? 999999 : clubState.profile.coins };
      if (supabaseClient && clubState.session) {
        const { error } = await supabaseClient.from('profiles').upsert(profile);
        if (error) { clubState.error = error.message; renderSimulationScreen(); return; }
      }
      clubState.profile = profile;
      saveLocalClub();
      renderSimulationScreen();
    }

    async function purchaseClubCard(cardId) {
      const card = cardById(cardId);
      if (!card || clubState.ownedIds.has(cardId) || Number(clubState.profile?.coins || 0) < card.price) return;
      if (!window.confirm(`¿Estás seguro de que quieres fichar a ${card.name} por ${card.price.toLocaleString('es-ES')} monedas?`)) return;
      if (supabaseClient && clubState.session) {
        const { error } = await supabaseClient.rpc('purchase_card', { requested_card_id: cardId });
        if (error) { clubState.error = error.message; renderSimulationScreen(); return; }
        await loadClubData();
      } else {
        clubState.profile.coins -= card.price;
        clubState.ownedIds.add(cardId);
        saveLocalClub();
      }
      simulationState.selectionFormat = null;
      renderSimulationScreen();
    }

    function showClubCard(cardId) {
      const card = cardById(cardId);
      const stats = getSimulationStats(card?.name);
      const groups = [
        ['finalizacion', 'Finalización', ['tiro_cercano', 'bandeja_en_carrera']],
        ['tiro', 'Tiro', ['tiro_media_distancia', 'triple']],
        ['pase', 'Creación de juego', ['precision_pase', 'manejo_balon']],
        ['defensa', 'Defensa', ['defensa_interior', 'defensa_exterior', 'robo', 'tapon']],
        ['rebote', 'Rebote', ['rebote_ofensivo', 'rebote_defensivo']],
        ['fisico', 'Físico', ['velocidad', 'agilidad', 'fuerza']]
      ];
      const attributes = groups.map(([key, title, names]) => `<div class="type-card attribute-group attribute-group-${key}"><div class="title">${title}</div>${names.map(attribute => `<div class="attribute-row"><div class="attribute-label"><span>${getAttributeLabel(attribute)}</span><strong>${stats[attribute]}</strong></div><div class="attribute-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${stats[attribute]}"><span style="width:${stats[attribute]}%"></span></div></div>`).join('')}</div>`).join('');
      const modal = document.createElement('div');
      modal.className = 'ut-modal-backdrop';
      const playerStats = clubState.playerStats[card?.id] || {};
      const statRows = [
        ['PTS', playerStats.pointsPerGame], ['AST', playerStats.assistsPerGame], ['REB', playerStats.reboundsPerGame],
        ['TAP', playerStats.blocksPerGame], ['ROB', playerStats.stealsPerGame], ['PER', playerStats.turnoversPerGame],
        ['TC%', playerStats.fieldGoalPercentage], ['3P%', playerStats.threePointPercentage], ['VAL', playerStats.ratingPerGame], ['MVP', playerStats.mvps]
      ].map(([label, value]) => `<div class="ut-game-stat"><span>${label}</span><strong>${value ?? '-'}</strong></div>`).join('');
      modal.innerHTML = `<div class="ut-modal"><button class="ut-close" type="button" aria-label="Cerrar">×</button><div class="ut-card-column"><img src="${cardImage(card)}" alt="${escapeHtml(card.name)}"><div class="ut-stat-heading">Estadísticas por partido</div><div class="ut-game-stats">${statRows}</div></div><div class="ut-profile-attributes">${attributes}</div></div>`;
      modal.addEventListener('click', event => { if (event.target === modal || event.target.closest('.ut-close')) modal.remove(); });
      document.body.appendChild(modal);
    }

    function shuffleArray(list) {
      const clone = [...list];
      for (let i = clone.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [clone[i], clone[j]] = [clone[j], clone[i]];
      }
      return clone;
    }

    function clamp(value, min, max) {
      return Math.min(Math.max(value, min), max);
    }

    function getSimulationStats(name) {
      const safeName = String(name || '').trim();
      const data = SIMULATION_PLAYER_ATTRS[safeName] || {};
      return {
        tiro_cercano: data.tiro_cercano || 60,
        bandeja_en_carrera: data.bandeja_en_carrera || 60,
        tiro_media_distancia: data.tiro_media_distancia || 60,
        triple: data.triple || 60,
        precision_pase: data.precision_pase || 60,
        manejo_balon: data.manejo_balon || 60,
        defensa_interior: data.defensa_interior || 60,
        defensa_exterior: data.defensa_exterior || 60,
        robo: data.robo || 60,
        tapon: data.tapon || 60,
        rebote_ofensivo: data.rebote_ofensivo || 60,
        rebote_defensivo: data.rebote_defensivo || 60,
        velocidad: data.velocidad || 60,
        agilidad: data.agilidad || 60,
        fuerza: data.fuerza || 60
      };
    }

    function getBoxScoreKey(team, playerName) {
      return `${team}:${playerName}`;
    }

    function getBoxScoreEntry(team, playerName) {
      return simulationState.boxScore[getBoxScoreKey(team, playerName)];
    }

    function buildSimulationRoster() {
      const format = SIMULATION_FORMAT_OPTIONS.find(option => option.value === simulationState.settings.format);
      const playersPerTeam = format?.playersPerTeam || 3;
      const ownedNames = [...clubState.ownedIds].map(cardId => cardById(cardId)?.name).filter(Boolean);
      const selectedNames = simulationState.selectedTeamA.map(cardId => cardById(cardId)?.name).filter(Boolean);
      const teamA = (selectedNames.length === playersPerTeam ? selectedNames : shuffleArray(ownedNames).slice(0, playersPerTeam));
      const previewTeamB = simulationState.previewTeamB
        .map(name => cardById(norm(name))?.name || name)
        .filter(Boolean);
      const teamB = previewTeamB.length === playersPerTeam
        ? previewTeamB
        : shuffleArray(SIMULATION_POOL).slice(0, playersPerTeam);
      return { teamA, teamB };
    }

    function getTeammates(team) {
      return simulationState.teams[team] || [];
    }

    function getOpponents(team) {
      return team === 'A' ? simulationState.teams.B : simulationState.teams.A;
    }

    function getPlayerPhoto(name) {
      const playerName = String(name || '').trim() || 'Jugador';
      const profile = obtenerPerfil(playerName);
      const fallback = `https://ui-avatars.com/api/?name=${encodeURIComponent((profile.nombreMostrado || playerName).split(/[\s_]+/).slice(0, 2).join(' '))}&background=111826&color=ffffff&size=160`;
      return profile.fotoUrl || fallback;
    }

    function humanizeShotType(shotType) {
      const map = {
        tiro_cercano: 'tiro cercano',
        bandeja_en_carrera: 'bandeja',
        tiro_media_distancia: 'tiro de media distancia',
        triple: 'triple',
        pase: 'pase',
        pick_and_roll: 'pick and roll',
        robo: 'robo',
        tap: 'tapón',
        rebote: 'rebote'
      };
      return map[shotType] || String(shotType || 'acción').replace(/_/g, ' ');
    }

    function getShotPhrase(shotType) {
      const map = {
        tiro_cercano: 'el tiro cercano',
        bandeja_en_carrera: 'la bandeja',
        tiro_media_distancia: 'el tiro de media distancia',
        triple: 'el triple'
      };
      return map[shotType] || `la acción de ${humanizeShotType(shotType)}`;
    }

    function getAttributeLabel(attribute) {
      const labels = {
        tiro_cercano: 'Tiro cercano',
        bandeja_en_carrera: 'Bandeja',
        tiro_media_distancia: 'Tiro de media distancia',
        triple: 'Triple',
        precision_pase: 'Precisión de pase',
        manejo_balon: 'Manejo de balón',
        defensa_interior: 'Defensa interior',
        defensa_exterior: 'Defensa exterior',
        robo: 'Robo',
        tapon: 'Tapón',
        rebote_ofensivo: 'Rebote ofensivo',
        rebote_defensivo: 'Rebote defensivo',
        velocidad: 'Velocidad',
        agilidad: 'Agilidad',
        fuerza: 'Fuerza'
      };
      return labels[attribute] || attribute.replace(/_/g, ' ');
    }

    function toPercent(value) {
      return `${Math.max(0, Math.min(100, Number(value || 0))).toFixed(0)}%`;
    }

    function buildOutcomeText({ successChance = 0, failChance = 0, actionText = '', outcomeText = '' }) {
      const safeSuccess = clamp(Number(successChance) || 0, 0, 100);
      const safeFail = clamp(Number(failChance) || 0, 0, 100);
      return `${actionText}${outcomeText ? ` ${outcomeText}` : ''} <small>(${toPercent(safeSuccess)} acierto · ${toPercent(safeFail)} fallo)</small>`;
    }

    function describeMarcaje(team, playerName) {
      const defender = getDefenderForAttacker(team, playerName);
      if (!defender) return 'Marcaje: sin rival';
      return `${defender} marca a ${playerName}`;
    }

    function getPlayerTooltip(name, includeSummary = true) {
      const stats = getSimulationStats(name);
      const profile = obtenerPerfil(name);
      const rankedAttributes = Object.entries(stats).sort(([, first], [, second]) => second - first);
      const bestAttributes = rankedAttributes.slice(0, 3);
      const worstAttributes = rankedAttributes.slice(-3).reverse();
      const attributeGroups = [
        ['finalizacion', 'Finalización', [['tiro_cercano', 'Tiro cercano'], ['bandeja_en_carrera', 'Bandeja']]],
        ['tiro', 'Tiro', [['tiro_media_distancia', 'Tiro de media distancia'], ['triple', 'Triple']]],
        ['pase', 'Creación de juego', [['precision_pase', 'Precisión de pase'], ['manejo_balon', 'Manejo de balón']]],
        ['defensa', 'Defensa', [['defensa_interior', 'Defensa interior'], ['defensa_exterior', 'Defensa exterior'], ['robo', 'Robo'], ['tapon', 'Tapón']]],
        ['rebote', 'Rebote', [['rebote_ofensivo', 'Rebote ofensivo'], ['rebote_defensivo', 'Rebote defensivo']]],
        ['fisico', 'Físico', [['velocidad', 'Velocidad'], ['agilidad', 'Agilidad'], ['fuerza', 'Fuerza']]]
      ];
      const profileMeta = `
        <div class="sim-player-meta" aria-label="Altura, posición y peso">
          <span>${profile.alturaCm ? `${profile.alturaCm} cm` : '-'} · ${profile.posicion || '-'} · ${profile.pesoKg ? `${profile.pesoKg} kg` : '-'}</span>
        </div>
      `;
      const renderStatRows = (attributes, tone) => attributes.map(([attribute, value]) => `
        <div class="sim-stat-row">
          <span class="sim-stat-label">${getAttributeLabel(attribute)}</span>
          <span class="sim-stat-value">${value}</span>
          <div class="sim-stat-bar ${tone}"><span style="width:${value}%"></span></div>
        </div>
      `).join('');
      const renderAttributeGroups = () => attributeGroups.map(([groupKey, title, attributes]) => `
        <div class="type-card attribute-group attribute-group-${groupKey}">
          <div class="title">${title}</div>
          ${attributes.map(([attribute, label]) => `
            <div class="attribute-row">
              <div class="attribute-label"><span>${label}</span><strong>${stats[attribute]}</strong></div>
              <div class="attribute-bar" role="progressbar" aria-label="${label}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${stats[attribute]}"><span style="width:${stats[attribute]}%"></span></div>
            </div>
          `).join('')}
        </div>
      `).join('');
      return `
        ${includeSummary ? `<div class="sim-hover-summary">
          <div class="sim-tooltip-title"><strong>${name}</strong><span>Resumen</span></div>
          ${profileMeta}
          <div class="sim-stat-group">
            ${renderStatRows(bestAttributes, 'best')}
            ${renderStatRows(worstAttributes, 'worst')}
          </div>
        </div>` : ''}
        <div class="sim-tooltip">
          <div class="sim-detail-panel">
            <div class="sim-tooltip-title"><strong>${name}</strong><span>Todos los atributos</span></div>
            ${profileMeta}
            <div class="sim-profile-attributes">${renderAttributeGroups()}</div>
          </div>
        </div>
      `;
    }

    function getAvailablePlayerMeta(name) {
      const profile = obtenerPerfil(name);
      return `${profile.posicion || '-'} · ${profile.alturaCm ? `${profile.alturaCm} cm` : '-'}`;
    }

    function bindSimulationPlayerCards() {
      const root = document.getElementById('sim-content');
      document.querySelectorAll('.sim-player-card').forEach(card => {
        card.addEventListener('click', () => {
          const wasActive = card.classList.contains('active');
          document.querySelectorAll('.sim-player-card.active').forEach(activeCard => activeCard.classList.remove('active'));
          if (!wasActive) card.classList.add('active');
        });
      });
      root?.addEventListener('click', event => {
        if (!event.target.closest('.sim-player-card')) {
          document.querySelectorAll('.sim-player-card.active').forEach(activeCard => activeCard.classList.remove('active'));
        }
      });
    }

    function startSimulationRoster() {
      if (!window.confirm('¿Seguro que quieres empezar el partido?')) return;
      clearSimulationMessageTimer();
      if (simulationState.pendingCpuTimeout) {
        clearTimeout(simulationState.pendingCpuTimeout);
        simulationState.pendingCpuTimeout = null;
      }
      if (simulationState.pendingFinishTimeout) {
        clearTimeout(simulationState.pendingFinishTimeout);
        simulationState.pendingFinishTimeout = null;
      }
      if (simulationState.pendingFollowupTimeout) {
        clearTimeout(simulationState.pendingFollowupTimeout);
        simulationState.pendingFollowupTimeout = null;
      }
      const { teamA, teamB } = buildSimulationRoster();
      simulationState.teams = { A: teamA, B: teamB };
      simulationState.score = { A: 0, B: 0 };
      simulationState.possession = 'A';
      simulationState.activePlayer = teamA[0];
      simulationState.userTurn = true;
      simulationState.winner = null;
      simulationState.rewardApplied = false;
      simulationState.statsRecorded = false;
      simulationState.matchOver = false;
      simulationState.mismatchActive = false;
      simulationState.lastPass = null;
      simulationState.boxScore = {};
      for (const [team, players] of [['A', teamA], ['B', teamB]]) {
        for (const player of players) {
          simulationState.boxScore[getBoxScoreKey(team, player)] = {
          pts: 0, reb: 0, ast: 0, stl: 0, blk: 0, tov: 0, oreb: 0, dreb: 0,
          fgm: 0, fga: 0, tpm: 0, tpa: 0, fgp: 0, tpp: 0
          };
        }
      }
      simulationState.matchups = { A: {}, B: {} };
      teamA.forEach((player, index) => { simulationState.matchups.A[player] = teamB[index] || teamB[0]; });
      teamB.forEach((player, index) => { simulationState.matchups.B[player] = teamA[index] || teamA[0]; });
      beginMatch();
    }

    function pushSimulationMessage(text, type = 'info') {
      if (simulationState.messageQueue.length >= SIMULATION_FEED_LIMIT) {
        simulationState.messageQueue = [];
      }
      simulationState.messageQueue.push({ text, type });
      renderSimulationScreen();
    }

    function clearSimulationMessageTimer() {
      if (simulationState.messageTimeout) {
        clearTimeout(simulationState.messageTimeout);
        simulationState.messageTimeout = null;
      }
    }

    function triggerCpuTurn() {
      if (simulationState.matchOver || simulationState.phase !== 'live') return;
      if (simulationState.possession !== 'B') return;
      simulationState.userTurn = false;
      renderSimulationScreen();
      if (simulationState.pendingCpuTimeout) {
        clearTimeout(simulationState.pendingCpuTimeout);
      }
      simulationState.pendingCpuTimeout = setTimeout(() => {
        if (simulationState.matchOver || simulationState.phase !== 'live') return;
        const action = chooseCpuAction();
        if (action.type === 'pass') {
          resolvePass('B', action.from, action.to);
        } else if (action.type === 'pick') {
          resolvePickAndRoll('B', action.handler, action.blocker);
        } else {
          resolveShot('B', action.from, action.shotType);
        }
      }, SIMULATION_CPU_DELAY_MS);
    }

    function chooseCpuAction() {
      const team = 'B';
      const teammates = getTeammates(team);
      const shooter = simulationState.activePlayer;
      const randomRoll = Math.random();
      if (randomRoll < 0.3) {
        const recipients = teammates.filter(player => player !== shooter);
        return { type: 'pass', from: shooter, to: recipients[Math.floor(Math.random() * recipients.length)] };
      }
      if (randomRoll < 0.6) {
        const blocker = teammates.filter(player => player !== shooter)[Math.floor(Math.random() * (teammates.length - 1))];
        return { type: 'pick', handler: shooter, blocker };
      }
      const shotTypes = ['tiro_cercano', 'bandeja_en_carrera', 'tiro_media_distancia', 'triple'];
      return { type: 'shot', from: shooter, shotType: shotTypes[Math.floor(Math.random() * shotTypes.length)] };
    }

    function handleUserAction(actionType, payload) {
      if (simulationState.matchOver || simulationState.userTurn === false || simulationState.phase !== 'live' || simulationState.pendingFollowupTimeout) return;
      if (actionType === 'pass') {
        resolvePass('A', payload.from, payload.to);
      } else if (actionType === 'pick') {
        resolvePickAndRoll('A', payload.handler, payload.blocker);
      } else if (actionType === 'shot') {
        resolveShot('A', payload.from, payload.shotType);
      }
    }

    function beginMatch() {
      simulationState.phase = 'live';
      simulationState.possession = 'A';
      simulationState.activePlayer = simulationState.teams.A[0];
      simulationState.userTurn = true;
      simulationState.winner = null;
      clearSimulationMessageTimer();
      simulationState.messageQueue = [];
      pushSimulationMessage('¡Comienza el partido! El equipo A toma la primera posesión.', 'info');
      renderSimulationScreen();
    }

    function resetSimulationStateForNewMatch() {
      simulationState.score = { A: 0, B: 0 };
      simulationState.possession = 'A';
      simulationState.activePlayer = null;
      simulationState.userTurn = true;
      simulationState.winner = null;
      simulationState.rewardApplied = false;
      simulationState.matchOver = false;
      simulationState.mismatchActive = false;
      simulationState.lastPass = null;
      simulationState.boxScore = {};
      simulationState.messageQueue = [];
      simulationState.matchups = { A: {}, B: {} };
      clearSimulationMessageTimer();
      if (simulationState.pendingCpuTimeout) {
        clearTimeout(simulationState.pendingCpuTimeout);
        simulationState.pendingCpuTimeout = null;
      }
      if (simulationState.pendingFinishTimeout) {
        clearTimeout(simulationState.pendingFinishTimeout);
        simulationState.pendingFinishTimeout = null;
      }
      if (simulationState.pendingFollowupTimeout) {
        clearTimeout(simulationState.pendingFollowupTimeout);
        simulationState.pendingFollowupTimeout = null;
      }
    }

    function scheduleSimulationFollowup(callback) {
      if (simulationState.pendingFollowupTimeout) {
        clearTimeout(simulationState.pendingFollowupTimeout);
      }
      simulationState.pendingFollowupTimeout = setTimeout(() => {
        simulationState.pendingFollowupTimeout = null;
        if (simulationState.phase === 'live' && !simulationState.matchOver) {
          callback();
        }
      }, SIMULATION_FOLLOWUP_DELAY_MS);
    }

    function updateBoxScore(team, playerName, statKey, value = 1) {
      const key = getBoxScoreKey(team, playerName);
      if (!simulationState.boxScore[key]) {
        simulationState.boxScore[key] = {
          pts: 0, reb: 0, ast: 0, stl: 0, blk: 0, tov: 0, oreb: 0, dreb: 0,
          fgm: 0, fga: 0, tpm: 0, tpa: 0, fgp: 0, tpp: 0
        };
      }
      simulationState.boxScore[key][statKey] += value;
    }

    function registerAttempt(team, playerName, shotType) {
      const entry = getBoxScoreEntry(team, playerName);
      if (!entry) return;
      entry.fga += 1;
      if (shotType === 'triple') {
        entry.tpa += 1;
      }
    }

    function registerMadeShot(team, playerName, shotType, points) {
      const entry = getBoxScoreEntry(team, playerName);
      if (!entry) return;
      entry.fgm += 1;
      entry.pts += points;
      if (shotType === 'triple') {
        entry.tpm += 1;
      }
    }

    function assignAssist(team, passFrom, scorer) {
      if (!passFrom || !scorer || passFrom === scorer) return;
      updateBoxScore(team, passFrom, 'ast', 1);
    }

    function completeTurnAfterAction(team, reasonText) {
      if (simulationState.matchOver) return;
      if (simulationState.possession === team) {
        simulationState.userTurn = team === 'A';
      } else {
        const nextTeam = team === 'A' ? 'B' : 'A';
        simulationState.possession = nextTeam;
        simulationState.userTurn = nextTeam === 'A';
      }
      if (reasonText) {
        pushSimulationMessage(reasonText, 'warning');
      }
      renderSimulationScreen();
      if (simulationState.userTurn === false && !simulationState.matchOver) {
        triggerCpuTurn();
      }
    }

    function checkForMatchWin() {
      if (simulationState.score.A >= simulationState.settings.winScore || simulationState.score.B >= simulationState.settings.winScore) {
        simulationState.matchOver = true;
        simulationState.winner = simulationState.score.A >= simulationState.settings.winScore ? 'A' : 'B';
        simulationState.messageQueue.push({
          text: `¡Equipo ${simulationState.winner === 'A' ? 'A' : 'B'} ha ganado el partido!`,
          type: 'info'
        });
        renderSimulationScreen();
        simulationState.pendingFinishTimeout = setTimeout(() => {
          simulationState.pendingFinishTimeout = null;
          simulationState.phase = 'finished';
          renderSimulationScreen();
        }, SIMULATION_RESULT_DELAY_MS);
      }
    }

    async function applyMatchReward() {
      if (simulationState.rewardApplied || !clubState.profile || !simulationState.winner) return;
      simulationState.rewardApplied = true;
      const won = simulationState.winner === 'A';
      const reward = won ? 500 : 100;
      if (supabaseClient && clubState.session) {
        const { error } = await supabaseClient.rpc('record_match_result', { did_win: won, reward_coins: reward });
        if (error) clubState.error = error.message;
        await loadClubData();
      } else {
        clubState.profile.coins = Number(clubState.profile.coins || 0) + reward;
        const recordKey = won ? 'wins' : 'losses';
        clubState.profile[recordKey] = Number(clubState.profile[recordKey] || 0) + 1;
        saveLocalClub();
      }
    }

    function recordSimulationPlayerStats() {
      if (simulationState.statsRecorded || !clubState.profile) return;
      const players = [...simulationState.teams.A.map(player => ['A', player]), ...simulationState.teams.B.map(player => ['B', player])];
      const mvp = players.reduce((best, [team, player]) => {
        const stats = getBoxScoreEntry(team, player) || {};
        const rating = (stats.pts || 0) + (stats.reb || 0) + (stats.ast || 0) + (stats.stl || 0) + (stats.blk || 0) - (stats.tov || 0);
        return !best || rating > best.rating ? { team, player, rating } : best;
      }, null);
      for (const [team, player] of players) {
        const card = cardById(norm(player));
        if (!card) continue;
        const game = getBoxScoreEntry(team, player) || {};
        const entry = clubState.playerStats[card.id] || { games: 0, points: 0, assists: 0, rebounds: 0, blocks: 0, steals: 0, turnovers: 0, fgm: 0, fga: 0, tpm: 0, tpa: 0, rating: 0, mvps: 0 };
        entry.games += 1;
        entry.points += game.pts || 0;
        entry.assists += game.ast || 0;
        entry.rebounds += game.reb || 0;
        entry.blocks += game.blk || 0;
        entry.steals += game.stl || 0;
        entry.turnovers += game.tov || 0;
        entry.fgm += game.fgm || 0;
        entry.fga += game.fga || 0;
        entry.tpm += game.tpm || 0;
        entry.tpa += game.tpa || 0;
        entry.rating += (game.pts || 0) + (game.reb || 0) + (game.ast || 0) + (game.stl || 0) + (game.blk || 0) - (game.tov || 0);
        entry.mvps += mvp?.player === player && mvp.team === team ? 1 : 0;
        const games = entry.games;
        entry.pointsPerGame = (entry.points / games).toFixed(1);
        entry.assistsPerGame = (entry.assists / games).toFixed(1);
        entry.reboundsPerGame = (entry.rebounds / games).toFixed(1);
        entry.blocksPerGame = (entry.blocks / games).toFixed(1);
        entry.stealsPerGame = (entry.steals / games).toFixed(1);
        entry.turnoversPerGame = (entry.turnovers / games).toFixed(1);
        entry.fieldGoalPercentage = entry.fga ? `${((entry.fgm / entry.fga) * 100).toFixed(1)}%` : '0.0%';
        entry.threePointPercentage = entry.tpa ? `${((entry.tpm / entry.tpa) * 100).toFixed(1)}%` : '0.0%';
        entry.ratingPerGame = (entry.rating / games).toFixed(1);
        clubState.playerStats[card.id] = entry;
      }
      const identity = clubState.session?.user?.id || clubState.profile.email;
      localStorage.setItem(`basket-club-player-stats-${identity}`, JSON.stringify(clubState.playerStats));
      simulationState.statsRecorded = true;
    }

    function getDefenderForAttacker(team, attacker) {
      const assigned = team === 'A' ? simulationState.matchups.A[attacker] : simulationState.matchups.B[attacker];
      return assigned || (team === 'A' ? simulationState.teams.B[0] : simulationState.teams.A[0]);
    }

    function computeTurnoverProbability(attackerName, defenderName) {
      const atk = getSimulationStats(attackerName);
      const def = getSimulationStats(defenderName);
      const P_atq = (0.50 * atk.manejo_balon) + (0.30 * atk.agilidad) + (0.20 * atk.velocidad);
      const P_def = (0.45 * def.robo) + (0.35 * def.agilidad) + (0.20 * def.velocidad);
      const delta = P_def - P_atq;
      const prob = 0.05 + (delta * 0.0010);
      return clamp(prob, 0.015, 0.10);
    }

    function computePassTurnoverProbability(attackerName, defenderName) {
      const atk = getSimulationStats(attackerName);
      const def = getSimulationStats(defenderName);
      const ballControl = (0.55 * atk.manejo_balon) + (0.25 * atk.agilidad) + (0.20 * atk.precision_pase);
      const defensivePressure = (0.45 * def.robo) + (0.35 * def.agilidad) + (0.20 * def.velocidad);
      const delta = defensivePressure - ballControl;
      return clamp(0.025 + (delta * 0.0006), 0.008, 0.05);
    }

    function resolveTurnover(team, attackerName, defenderName, lossChance) {
      const scoreEntry = getBoxScoreEntry(team, attackerName);
      if (scoreEntry) scoreEntry.tov += 1;
      const defEntry = getBoxScoreEntry(team === 'A' ? 'B' : 'A', defenderName);
      if (defEntry) defEntry.stl += 1;
      const nextTeam = team === 'A' ? 'B' : 'A';
      simulationState.possession = nextTeam;
      simulationState.activePlayer = defenderName;
      simulationState.userTurn = nextTeam === 'A';
      pushSimulationMessage(buildOutcomeText({
        successChance: (1 - lossChance) * 100,
        failChance: lossChance * 100,
        actionText: `${attackerName} pierde el balón. ${defenderName} recupera y saca.`,
        outcomeText: `${describeMarcaje(nextTeam, defenderName)}.`
      }), 'warning');
      renderSimulationScreen();
      if (!simulationState.matchOver && simulationState.userTurn === false) {
        triggerCpuTurn();
      }
    }

    function tryBeforeAction(team, attackerName, probabilityCalculator = computeTurnoverProbability) {
      if (team === 'A' && simulationState.userTurn === false) {
        return false;
      }
      const defenderName = getDefenderForAttacker(team, attackerName);
      const lossChance = probabilityCalculator(attackerName, defenderName);
      if (Math.random() < lossChance) {
        resolveTurnover(team, attackerName, defenderName, lossChance);
        return true;
      }
      return false;
    }

    function resolvePass(team, fromName, toName) {
      if (team !== simulationState.possession) return;
      const pressureDefenderName = getDefenderForAttacker(team, fromName);
      const lossChance = computePassTurnoverProbability(fromName, pressureDefenderName);
      if (tryBeforeAction(team, fromName, computePassTurnoverProbability)) {
        return;
      }
      const passer = getSimulationStats(fromName);
      const defenderName = getDefenderForAttacker(team, toName);
      const defender = getSimulationStats(defenderName);
      const delta = passer.precision_pase - ((0.60 * defender.robo) + (0.40 * defender.agilidad));
      const successChance = clamp(0.94 + (delta * 0.0018), 0.88, 0.99);
      const overallSuccessChance = (1 - lossChance) * successChance;
      const overallFailChance = 1 - overallSuccessChance;
      if (Math.random() < successChance) {
        simulationState.activePlayer = toName;
        simulationState.possession = team;
        simulationState.userTurn = team === 'A';
        simulationState.lastPass = { team, player: fromName };
        pushSimulationMessage(buildOutcomeText({
          successChance: overallSuccessChance * 100,
          failChance: overallFailChance * 100,
          actionText: `${fromName} pasa a ${toName}.`
        }), 'info');
        renderSimulationScreen();
      } else {
        const defEntry = getBoxScoreEntry(team === 'A' ? 'B' : 'A', defenderName);
        if (defEntry) defEntry.stl += 1;
        const passEntry = getBoxScoreEntry(team, fromName);
        if (passEntry) passEntry.tov += 1;
        simulationState.possession = team === 'A' ? 'B' : 'A';
        simulationState.activePlayer = defenderName;
        simulationState.userTurn = simulationState.possession === 'A';
        pushSimulationMessage(buildOutcomeText({
          successChance: overallSuccessChance * 100,
          failChance: overallFailChance * 100,
          actionText: `${fromName} pierde el pase. ${defenderName} intercepta y recupera.`
        }), 'warning');
      }
      if (simulationState.userTurn === false && !simulationState.matchOver) {
        triggerCpuTurn();
      }
    }

    function resolvePickAndRoll(team, handlerName, blockerName) {
      if (team !== simulationState.possession) return;
      if (tryBeforeAction(team, handlerName)) {
        return;
      }
      const handler = getSimulationStats(handlerName);
      const blocker = getSimulationStats(blockerName);
      const defensor = getSimulationStats(getDefenderForAttacker(team, handlerName));
      const manejo = (0.40 * handler.manejo_balon) + (0.30 * handler.velocidad) + (0.30 * handler.agilidad);
      const atq = (0.75 * manejo) + (0.25 * blocker.fuerza);
      const def = (0.35 * defensor.defensa_exterior) + (0.25 * defensor.agilidad) + (0.20 * defensor.velocidad) + (0.20 * defensor.fuerza);
      const delta = atq - def;
      const switchChance = clamp(0.60 + (delta * 0.003), 0.30, 0.85);
      const failChance = clamp(1 - switchChance, 0.15, 0.70);
      const handlerDefender = getDefenderForAttacker(team, handlerName);
      const blockerDefender = getDefenderForAttacker(team, blockerName);
      simulationState.mismatchActive = Math.random() < switchChance;
      simulationState.activePlayer = handlerName;
      if (simulationState.mismatchActive) {
        simulationState.matchups[team][handlerName] = blockerDefender;
        simulationState.matchups[team][blockerName] = handlerDefender;
        pushSimulationMessage(buildOutcomeText({
          successChance: switchChance * 100,
          failChance: failChance * 100,
          actionText: `Pick and roll: ${handlerName} gana ventaja y cambian las marcas.`,
          outcomeText: `${blockerDefender} pasa a marcar a ${handlerName} y ${handlerDefender} pasa a marcar a ${blockerName}.`
        }), 'info');
      } else {
        pushSimulationMessage(buildOutcomeText({
          successChance: switchChance * 100,
          failChance: failChance * 100,
          actionText: `Pick and roll: los defensores ${handlerDefender} y ${blockerDefender} impiden cambiar las marcas.`,
          outcomeText: `${handlerDefender} sigue marcando a ${handlerName} y ${blockerDefender} sigue marcando a ${blockerName}.`
        }), 'info');
      }
      simulationState.userTurn = team === 'A';
      renderSimulationScreen();
      if (simulationState.userTurn === false && !simulationState.matchOver) {
        triggerCpuTurn();
      }
    }

    function resolveShot(team, shooterName, shotType) {
      if (team !== simulationState.possession) return;
      if (tryBeforeAction(team, shooterName)) {
        return;
      }
      const shooter = getSimulationStats(shooterName);
      const defenderName = getDefenderForAttacker(team, shooterName);
      const defender = getSimulationStats(defenderName);
      const shotAttrMap = {
        tiro_cercano: 'tiro_cercano',
        bandeja_en_carrera: 'bandeja_en_carrera',
        tiro_media_distancia: 'tiro_media_distancia',
        triple: 'triple'
      };
      const shotAttr = shotAttrMap[shotType] || 'tiro_cercano';
      const defenseKey = (shotType === 'tiro_cercano' || shotType === 'bandeja_en_carrera') ? 'defensa_interior' : 'defensa_exterior';
      const blockProb = clamp(0.04 + ((defender.tapon - shooter[shotAttr]) * 0.0015), 0.005, 0.12);
      const baseMap = {
        tiro_cercano: 0.60,
        bandeja_en_carrera: 0.55,
        tiro_media_distancia: 0.45,
        triple: 0.38
      };
      const clampMap = {
        tiro_cercano: [0.35, 0.85],
        bandeja_en_carrera: [0.30, 0.80],
        tiro_media_distancia: [0.22, 0.70],
        triple: [0.18, 0.60]
      };
      const base = baseMap[shotType] || 0.60;
      const delta = shooter[shotAttr] - defender[defenseKey];
      const shotChance = clamp(base + (delta * 0.004), clampMap[shotType][0], clampMap[shotType][1]);
      const missChance = clamp(1 - shotChance, 0.15, 0.70);
      registerAttempt(team, shooterName, shotType);
      if (Math.random() < blockProb) {
        const blockEntry = getBoxScoreEntry(team === 'A' ? 'B' : 'A', defenderName);
        if (blockEntry) blockEntry.blk += 1;
        pushSimulationMessage(buildOutcomeText({
          successChance: shotChance * 100,
          failChance: missChance * 100,
          actionText: `${shooterName} intenta ${getShotPhrase(shotType)}.`
        }), 'warning');
        scheduleSimulationFollowup(() => {
          pushSimulationMessage(buildOutcomeText({
            successChance: blockProb * 100,
            failChance: (1 - blockProb) * 100,
            actionText: `${defenderName} tapona ${getShotPhrase(shotType)} de ${shooterName}.`
          }), 'warning');
          resolveLooseBallAfterBlock(team, shooterName, defenderName, shotType);
        });
        return;
      }
      const made = Math.random() < shotChance;
      const points = shotType === 'triple' ? 3 : 2;
      if (made) {
        simulationState.score[team] += points;
        registerMadeShot(team, shooterName, shotType, points);
        if (simulationState.possession === 'A' && simulationState.activePlayer !== shooterName) {
          simulationState.activePlayer = shooterName;
        }
        const lastPass = simulationState.lastPass && simulationState.lastPass.team === team ? simulationState.lastPass.player : null;
        if (lastPass && lastPass !== shooterName) {
          assignAssist(team, lastPass, shooterName);
        }
        pushSimulationMessage(buildOutcomeText({
          successChance: shotChance * 100,
          failChance: missChance * 100,
          actionText: `¡${points} puntos anotados por ${shooterName}!`,
          outcomeText: `Intento de ${humanizeShotType(shotType)} contra ${defenderName}.`
        }), 'info');
        checkForMatchWin();
        if (!simulationState.matchOver) {
          // Make it, take it: same team keeps possession after scoring.
          simulationState.possession = team;
          simulationState.activePlayer = shooterName;
          simulationState.userTurn = team === 'A';
          renderSimulationScreen();
          if (simulationState.userTurn === false) {
            triggerCpuTurn();
          }
        }
      } else {
        pushSimulationMessage(buildOutcomeText({
          successChance: shotChance * 100,
          failChance: missChance * 100,
          actionText: `${shooterName} falla ${getShotPhrase(shotType)}.`,
          outcomeText: `${defenderName} le defiende y controla la zona.`
        }), 'warning');
        scheduleSimulationFollowup(() => resolveRebound(team, shooterName, defenderName, shotType));
      }
    }

    function resolveLooseBallAfterBlock(team, shooterName, defenderName, shotType) {
      const defender = getSimulationStats(defenderName);
      const attacker = getSimulationStats(shooterName);
      const defScore = (0.40 * defender.velocidad) + (0.35 * defender.agilidad) + (0.25 * defender.rebote_defensivo);
      const atkScore = (0.40 * attacker.velocidad) + (0.35 * attacker.agilidad) + (0.25 * attacker.rebote_ofensivo);
      const delta = defScore - atkScore;
      const recoveryChance = clamp(0.65 + (delta * 0.003), 0.45, 0.85);
      const defenseWins = Math.random() < recoveryChance;
      if (defenseWins) {
        simulationState.possession = team === 'A' ? 'B' : 'A';
        simulationState.activePlayer = defenderName;
        updateBoxScore(team === 'A' ? 'B' : 'A', defenderName, 'stl', 1);
        pushSimulationMessage(buildOutcomeText({
          successChance: recoveryChance * 100,
          failChance: (1 - recoveryChance) * 100,
          actionText: `${defenderName} gana el balón suelto tras taponar ${getShotPhrase(shotType)} de ${shooterName}.`,
          outcomeText: `${describeMarcaje(team === 'A' ? 'B' : 'A', defenderName)}.`
        }), 'warning');
      } else {
        simulationState.possession = team;
        simulationState.activePlayer = shooterName;
        pushSimulationMessage(buildOutcomeText({
          successChance: recoveryChance * 100,
          failChance: (1 - recoveryChance) * 100,
          actionText: `${shooterName} retiene el balón suelto tras intentar ${getShotPhrase(shotType)} y sigue atacando.`,
          outcomeText: `${describeMarcaje(team, shooterName)}.`
        }), 'info');
      }
      simulationState.userTurn = simulationState.possession === 'A';
      renderSimulationScreen();
      if (simulationState.userTurn === false && !simulationState.matchOver) {
        triggerCpuTurn();
      }
    }

    function resolveRebound(team, shooterName, defenderName, shotType) {
      const defTeam = team === 'A' ? 'B' : 'A';
      const attacker = getSimulationStats(shooterName);
      const defender = getSimulationStats(defenderName);
      const reboundDef = (0.50 * defender.rebote_defensivo) + (0.30 * defender.fuerza) + (0.20 * defender.agilidad);
      const reboundAtq = (0.50 * attacker.rebote_ofensivo) + (0.30 * attacker.fuerza) + (0.20 * attacker.agilidad);
      const delta = reboundDef - reboundAtq;
      const defChance = clamp(0.75 + (delta * 0.003), 0.55, 0.90);
      const offChance = clamp(1 - defChance, 0.10, 0.45);
      if (Math.random() < 0.04) {
        simulationState.possession = defTeam;
        simulationState.activePlayer = simulationState.teams[defTeam][0];
        pushSimulationMessage(buildOutcomeText({
          successChance: 4,
          failChance: 96,
          actionText: `Balón fuera después de que ${shooterName} fallara ${getShotPhrase(shotType)}.`,
          outcomeText: `${describeMarcaje(defTeam, simulationState.activePlayer)}.`
        }), 'warning');
        simulationState.userTurn = simulationState.possession === 'A';
        renderSimulationScreen();
        if (simulationState.userTurn === false && !simulationState.matchOver) {
          triggerCpuTurn();
        }
        return;
      }
      const defenseWins = Math.random() < defChance;
      if (defenseWins) {
        const reboundPlayer = getWeightedPlayer(team === 'A' ? simulationState.teams.B : simulationState.teams.A, 'def');
        updateBoxScore(defTeam, reboundPlayer, 'dreb', 1);
        updateBoxScore(defTeam, reboundPlayer, 'reb', 1);
        simulationState.possession = defTeam;
        simulationState.activePlayer = reboundPlayer;
        simulationState.userTurn = defTeam === 'A';
        pushSimulationMessage(buildOutcomeText({
          successChance: defChance * 100,
          failChance: offChance * 100,
          actionText: `${reboundPlayer} captura el rebote defensivo después de que ${shooterName} fallara ${getShotPhrase(shotType)}.`,
          outcomeText: `${describeMarcaje(defTeam, reboundPlayer)}.`
        }), 'info');
      } else {
        const reboundPlayer = getWeightedPlayer(team === 'A' ? simulationState.teams.A : simulationState.teams.B, 'off');
        updateBoxScore(team, reboundPlayer, 'oreb', 1);
        updateBoxScore(team, reboundPlayer, 'reb', 1);
        simulationState.possession = team;
        simulationState.activePlayer = reboundPlayer;
        simulationState.userTurn = team === 'A';
        pushSimulationMessage(buildOutcomeText({
          successChance: (1 - defChance) * 100,
          failChance: defChance * 100,
          actionText: `${reboundPlayer} consigue el rebote ofensivo después de que ${shooterName} fallara ${getShotPhrase(shotType)}.`,
          outcomeText: `${describeMarcaje(team, reboundPlayer)}.`
        }), 'info');
      }
      renderSimulationScreen();
      if (simulationState.userTurn === false && !simulationState.matchOver) {
        triggerCpuTurn();
      }
    }

    function getWeightedPlayer(teamPlayers, mode) {
      const weights = teamPlayers.map(name => {
        const stats = getSimulationStats(name);
        const weight = mode === 'def'
          ? (0.50 * stats.rebote_defensivo) + (0.30 * stats.fuerza) + (0.20 * stats.agilidad)
          : (0.50 * stats.rebote_ofensivo) + (0.30 * stats.fuerza) + (0.20 * stats.agilidad);
        return { name, weight };
      });
      const total = weights.reduce((sum, item) => sum + item.weight, 0);
      let cursor = Math.random() * total;
      for (const item of weights) {
        cursor -= item.weight;
        if (cursor <= 0) {
          return item.name;
        }
      }
      return weights[weights.length - 1].name;
    }

    function renderSimulationAccessGate(root) {
      root.innerHTML = `
        <div class="sim-lock-screen">
          <div class="sim-lock-card">
            <div class="sim-lock-icon" aria-hidden="true">&#128274;</div>
            <h2>Simulación bloqueada</h2>
            <p>Necesitas una contraseña para acceder a esta funcionalidad.</p>
            <form class="sim-lock-form" id="sim-access-form">
              <input id="sim-access-password" type="password" autocomplete="off" placeholder="Contraseña" aria-label="Contraseña" required />
              <button type="submit" class="sim-action-button primary">Entrar</button>
            </form>
            <div class="sim-lock-error" role="alert" aria-live="assertive">${escapeHtml(simulationState.accessError)}</div>
          </div>
        </div>
      `;
      document.getElementById('sim-access-form')?.addEventListener('submit', event => {
        event.preventDefault();
        const input = document.getElementById('sim-access-password');
        if (input?.value === SIMULATION_ACCESS_PASSWORD) {
          simulationState.accessGranted = true;
          simulationState.accessError = '';
          renderSimulationScreen();
          return;
        }
        simulationState.accessError = 'Contraseña incorrecta. Inténtalo de nuevo.';
        if (input) {
          input.value = '';
          input.focus();
        }
        renderSimulationAccessGate(root);
      });
      document.getElementById('sim-access-password')?.focus();
    }

    function renderUltimateAuth(root) {
      const hasSupabase = Boolean(supabaseClient);
      root.innerHTML = `<div class="ut-shell"><div class="ut-auth">
        <div class="ut-brand">Ultimate Club</div><h2>Acceso al club</h2>
        <p>${hasSupabase ? 'Inicia sesión para guardar tu plantilla, monedas y récord.' : 'Supabase aún no está configurado. Este acceso usa un perfil local de desarrollo.'}</p>
        <form id="ut-auth-form"><input id="ut-email" type="email" placeholder="Email" autocomplete="email" required><input id="ut-password" type="password" placeholder="Contraseña" autocomplete="current-password" minlength="6" required><div class="ut-auth-actions"><button class="ut-primary" type="submit">Iniciar sesión</button><button type="button" id="ut-register">Crear cuenta</button></div></form>
        ${hasSupabase ? '<button type="button" id="ut-google" style="width:100%;margin-top:8px">Continuar con Google</button>' : ''}
        <div class="ut-error" role="alert">${escapeHtml(clubState.error)}</div>
      </div></div>`;
      root.querySelector('#ut-auth-form')?.addEventListener('submit', event => { event.preventDefault(); signInClub(root.querySelector('#ut-email').value, root.querySelector('#ut-password').value); });
      root.querySelector('#ut-register')?.addEventListener('click', () => signInClub(root.querySelector('#ut-email').value, root.querySelector('#ut-password').value, true));
      root.querySelector('#ut-google')?.addEventListener('click', () => supabaseClient.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.href } }));
    }

    function renderUltimateWelcome(root) {
      const cards = clubState.welcomeCards.map(cardId => {
        const card = cardById(cardId);
        return `<div class="ut-pack-card"><img src="${cardImage(card)}" alt="Carta de ${escapeHtml(card?.name || 'jugador')}"></div>`;
      }).join('');
      root.innerHTML = `<div class="ut-shell"><div class="ut-welcome"><div class="ut-brand">Ultimate Club</div><h2>Tu sobre inicial</h2><p>Has recibido dos cartas. Pulsa para descubrir tu plantilla.</p><div class="ut-pack" id="ut-pack">${cards}</div><button type="button" class="ut-primary" id="ut-open-pack">Abrir sobre</button></div></div>`;
      root.querySelector('#ut-open-pack')?.addEventListener('click', () => {
        root.querySelector('#ut-pack')?.classList.add('is-open');
        root.querySelector('#ut-open-pack').disabled = true;
        setTimeout(() => {
          clubState.welcomePending = false;
          const identity = clubState.session?.user?.id || clubState.profile?.email;
          if (identity) localStorage.setItem(`basket-starter-seen-${identity}`, '1');
          renderSimulationScreen();
        }, 850);
      });
    }

    function renderUltimateHeader() {
      const profile = clubState.profile || {};
      const coins = Number(profile.coins || 0).toLocaleString('es-ES');
      return `<div class="ut-header"><div class="ut-brand">Ultimate Club</div><div class="ut-status"><span>${escapeHtml(profile.username || profile.email || 'Usuario')}</span><span>${profile.wins || 0} - ${profile.losses || 0}</span><span>🪙 ${coins}</span></div></div>`;
    }

    function renderUltimateNav() {
      return `<nav class="ut-nav"><button type="button" class="${simulationState.clubView === 'market' ? 'active' : ''}" data-ut-view="market">Mercado</button><button type="button" class="${simulationState.clubView === 'club' ? 'active' : ''}" data-ut-view="club">Mi club</button><button type="button" class="${simulationState.clubView === 'play' ? 'active' : ''}" data-ut-view="play">Jugar</button></nav>`;
    }

    function renderUltimateCard(card, owned) {
      const canBuy = !owned && Number(clubState.profile?.coins || 0) >= card.price;
      const price = `${card.price.toLocaleString('es-ES')} 🪙`;
      return `<article class="ut-card" data-ut-card="${card.id}"><img src="${cardImage(card)}" alt="${escapeHtml(card.name)}">${owned ? '<button type="button" disabled>En tu club</button>' : `<button type="button" data-ut-buy="${card.id}" title="${canBuy ? `Fichar por ${price}` : `Monedas insuficientes. Precio: ${price}`}" ${canBuy ? '' : 'disabled'}>${canBuy ? `Fichar por ${price}` : `Insuficiente · ${price}`}</button>`}</article>`;
    }

    function bindUltimateCommon(root) {
      root.querySelectorAll('[data-ut-view]').forEach(button => button.addEventListener('click', () => { simulationState.clubView = button.dataset.utView; renderSimulationScreen(); }));
      root.querySelector('#ut-signout')?.addEventListener('click', signOutClub);
      root.querySelectorAll('[data-ut-card]').forEach(card => card.addEventListener('click', event => { if (!event.target.closest('[data-ut-buy]')) showClubCard(card.dataset.utCard); }));
      root.querySelectorAll('[data-ut-buy]').forEach(button => button.addEventListener('click', () => purchaseClubCard(button.dataset.utBuy)));
    }

    function openLineupSwap(slotIndex) {
      const owned = clubState.catalog.filter(card => clubState.ownedIds.has(card.id));
      const currentId = simulationState.selectedTeamA[slotIndex];
      const options = owned.filter(card => card.id === currentId || !simulationState.selectedTeamA.includes(card.id));
      const modal = document.createElement('div');
      modal.className = 'ut-swap-backdrop';
      modal.innerHTML = `<div class="ut-swap-window"><button class="ut-close" type="button" aria-label="Cerrar">×</button><h3>Cambiar jugador</h3><p>Elige una carta de tu club para ocupar este puesto.</p><div class="ut-swap-options">${options.map(card => `<button type="button" class="ut-swap-option" data-ut-swap-card="${card.id}"><img src="${cardImage(card)}" alt="${escapeHtml(card.name)}"><span>${escapeHtml(card.name)} · ${escapeHtml(obtenerPerfil(card.name).posicion)}</span></button>`).join('')}</div></div>`;
      modal.addEventListener('click', event => {
        if (event.target === modal || event.target.closest('.ut-close')) { modal.remove(); return; }
        const option = event.target.closest('[data-ut-swap-card]');
        if (!option) return;
        simulationState.selectedTeamA[slotIndex] = option.dataset.utSwapCard;
        modal.remove();
        renderSimulationScreen();
      });
      document.body.appendChild(modal);
    }

    function renderUltimateClub(root) {
      const owned = clubState.catalog.filter(card => clubState.ownedIds.has(card.id));
      const cards = owned.length ? owned.map(card => renderUltimateCard(card, true)).join('') : '<div class="ut-empty">Tu álbum está vacío.</div>';
      const marketCards = clubState.catalog.length > 3
        ? Array.from({ length: 3 }, (_, offset) => clubState.catalog[(simulationState.marketIndex + offset) % clubState.catalog.length])
        : clubState.catalog;
      const market = marketCards.map(card => renderUltimateCard(card, clubState.ownedIds.has(card.id))).join('');
      const content = simulationState.clubView === 'market'
        ? `<div class="ut-title-row"><div><h2>Mercado</h2><p>Explora tres cartas con las flechas.</p></div></div><div class="ut-market-carousel"><button type="button" class="ut-market-arrow" id="ut-market-prev" aria-label="Cartas anteriores">‹</button><div class="ut-market-window"><div class="ut-market-track">${market}</div></div><button type="button" class="ut-market-arrow" id="ut-market-next" aria-label="Cartas siguientes">›</button></div>`
        : `<div class="ut-title-row"><div><h2>Mi club</h2><p>Cartas desbloqueadas: ${owned.length} / ${clubState.catalog.length}</p></div></div><div class="ut-card-grid">${cards}</div>`;
      root.innerHTML = `<div class="ut-shell">${renderUltimateHeader()}${renderUltimateNav()}${content}<div class="ut-error">${escapeHtml(clubState.error)}</div></div>`;
      bindUltimateCommon(root);
      root.querySelector('#ut-market-prev')?.addEventListener('click', () => {
        simulationState.marketIndex = (simulationState.marketIndex - 1 + clubState.catalog.length) % clubState.catalog.length;
        renderSimulationScreen();
      });
      root.querySelector('#ut-market-next')?.addEventListener('click', () => {
        simulationState.marketIndex = (simulationState.marketIndex + 1) % clubState.catalog.length;
        renderSimulationScreen();
      });
    }

    function refreshOpponentPreview() {
      const format = SIMULATION_FORMAT_OPTIONS.find(option => option.value === simulationState.settings.format);
      simulationState.previewTeamB = shuffleArray(SIMULATION_POOL).slice(0, format?.playersPerTeam || 3);
    }

    function renderUltimatePlayLobby(root) {
      const format = SIMULATION_FORMAT_OPTIONS.find(option => option.value === simulationState.settings.format);
      const playersPerTeam = format?.playersPerTeam || 3;
      const owned = clubState.catalog.filter(card => clubState.ownedIds.has(card.id));
      const validSelected = simulationState.selectedTeamA.filter(cardId => owned.some(card => card.id === cardId));
      const selectedIds = [...validSelected];
      const formatChanged = simulationState.selectionFormat !== simulationState.settings.format;
      if (simulationState.selectedTeamA.length === 0 || formatChanged) {
        for (const card of owned) {
          if (selectedIds.length >= playersPerTeam) break;
          if (!selectedIds.includes(card.id)) selectedIds.push(card.id);
        }
      }
      simulationState.selectedTeamA = selectedIds.slice(0, playersPerTeam);
      simulationState.selectionFormat = simulationState.settings.format;
      const enoughCards = owned.length >= playersPerTeam && selectedIds.length === playersPerTeam;
      if (!simulationState.previewTeamB.length) refreshOpponentPreview();
      const previewTeamB = simulationState.previewTeamB.map(name => cardById(norm(name)) || { name }).map(card => `<article class="ut-play-card"><img src="${cardImage(card)}" alt="CPU ${escapeHtml(card.name)}"><div class="ut-play-meta">${escapeHtml(obtenerPerfil(card.name).posicion)}</div></article>`).join('');
      const previewTeamA = simulationState.selectedTeamA.map((cardId, slotIndex) => { const card = cardById(cardId); return card ? `<article class="ut-play-card selected" data-ut-swap-slot="${slotIndex}"><img src="${cardImage(card)}" alt="${escapeHtml(card.name)}"><div class="ut-play-meta">Cambiar por · ${escapeHtml(card.name)} · ${escapeHtml(obtenerPerfil(card.name).posicion)}</div></article>` : ''; }).join('');
      root.innerHTML = `<div class="ut-shell">${renderUltimateHeader()}${renderUltimateNav()}<div class="ut-title-row"><div><h2>Jugar</h2><p>Selecciona ${playersPerTeam} titulares. Pulsa una carta para cambiarla por otra de tu club.</p></div></div><div class="sim-config"><label for="sim-format-select">Formato<select id="sim-format-select">${SIMULATION_FORMAT_OPTIONS.map(option => `<option value="${option.value}" ${simulationState.settings.format === option.value ? 'selected' : ''}>${option.label}</option>`).join('')}</select></label><label for="sim-win-select">Victoria<select id="sim-win-select">${SIMULATION_WIN_OPTIONS.map(option => `<option value="${option.value}" ${simulationState.settings.winScore === option.score ? 'selected' : ''}>${option.label}</option>`).join('')}</select></label></div><div class="ut-match-preview"><div><div class="ut-side-label">TU EQUIPO · ${simulationState.selectedTeamA.length}/${playersPerTeam}</div><div class="ut-match-team">${previewTeamA || '<div class="ut-empty">Sin cartas</div>'}</div></div><span class="ut-vs">VS</span><div><div class="ut-side-label">RIVAL <button type="button" class="ut-dice" id="ut-reroll" aria-label="Cambiar rival" title="Cambiar rival">⚄</button></div><div class="ut-match-team">${previewTeamB}</div></div></div><div class="ut-actions sim-actions"><button type="button" class="ut-primary sim-action-button" id="sim-start-btn" ${enoughCards ? '' : 'disabled'}>Iniciar partido</button><button type="button" class="sim-action-button" data-ut-view="market">Ir al mercado</button></div>${enoughCards ? '' : `<div class="ut-error">Selecciona suficientes cartas para el formato ${format?.label || ''}, o consigue más en el Mercado.</div>`}</div>`;
      bindUltimateCommon(root);
      root.querySelectorAll('[data-ut-swap-slot]').forEach(card => card.addEventListener('click', () => openLineupSwap(Number(card.dataset.utSwapSlot))));
      root.querySelector('#sim-start-btn')?.addEventListener('click', startSimulationRoster);
      root.querySelector('#ut-reroll')?.addEventListener('click', () => { refreshOpponentPreview(); renderSimulationScreen(); });
      root.querySelector('#sim-format-select')?.addEventListener('change', event => { simulationState.settings.format = event.target.value; simulationState.previewTeamB = []; renderSimulationScreen(); });
      root.querySelector('#sim-win-select')?.addEventListener('change', event => { simulationState.settings.winScore = Number(event.target.value); renderSimulationScreen(); });
    }

    function renderSimulationScreen() {
      const root = document.getElementById('sim-content');
      if (!root) return;
      if (!simulationState.accessGranted) {
        renderSimulationAccessGate(root);
        return;
      }

      if (!clubState.profile && !clubState.loading && !clubState.initialized) {
        loadClubData().then(() => renderSimulationScreen());
        renderUltimateAuth(root);
        return;
      }
      if (clubState.loading) { root.innerHTML = '<div class="ut-shell"><div class="ut-empty">Cargando tu club...</div></div>'; return; }
      if (clubState.welcomePending) { renderUltimateWelcome(root); return; }
      if (!clubState.profile) { renderUltimateAuth(root); return; }
      if (!clubState.profile.username) {
        root.innerHTML = `<div class="ut-shell"><div class="ut-auth"><div class="ut-brand">Ultimate Club</div><h2>Elige tu nombre de usuario</h2><p>Necesitas un nombre para entrar al club.</p><form id="ut-username-form"><input id="ut-username" required minlength="3" maxlength="24" placeholder="Nombre de usuario"><button class="ut-primary" type="submit">Entrar al club</button></form><div class="ut-error">${escapeHtml(clubState.error)}</div></div></div>`;
        root.querySelector('#ut-username-form')?.addEventListener('submit', event => { event.preventDefault(); saveClubUsername(root.querySelector('#ut-username').value); });
        return;
      }
      if (simulationState.phase === 'lobby' && simulationState.clubView !== 'play') { renderUltimateClub(root); return; }
      if (simulationState.phase === 'lobby' && simulationState.clubView === 'play') { renderUltimatePlayLobby(root); return; }

      if (simulationState.phase === 'lobby') {
        root.innerHTML = `
          <div class="sim-shell">
            <div class="sim-lobby">
              <div class="sim-hero">
                <button type="button" class="sim-main-button btn-accent" id="sim-start-btn">Jugar</button>
              </div>
              <div class="sim-config">
                <label for="sim-format-select">Formato
                  <select id="sim-format-select">
                    ${SIMULATION_FORMAT_OPTIONS.map(option => `<option value="${option.value}" ${simulationState.settings.format === option.value ? 'selected' : ''}>${option.label}</option>`).join('')}
                  </select>
                </label>
                <label for="sim-win-select">Victoria
                  <select id="sim-win-select">
                    ${SIMULATION_WIN_OPTIONS.map(option => `<option value="${option.value}" ${simulationState.settings.winScore === option.score ? 'selected' : ''}>${option.label}</option>`).join('')}
                  </select>
                </label>
              </div>
              <div class="sim-available">
                <h3>Jugadores disponibles</h3>
                <div class="sim-available-grid">
                  ${SIMULATION_POOL.map(player => `
                    <div class="sim-player-card" tabindex="0">
                      <img src="${getPlayerPhoto(player)}" alt="${player}" />
                      <div>
                        <div class="name">${player}</div>
                        <div class="role">${getAvailablePlayerMeta(player)}</div>
                      </div>
                      ${getPlayerTooltip(player, false)}
                    </div>
                  `).join('')}
                </div>
              </div>
            </div>
          </div>
        `;
        const startBtn = document.getElementById('sim-start-btn');
        if (startBtn) startBtn.addEventListener('click', startSimulationRoster);
        document.getElementById('sim-format-select')?.addEventListener('change', event => {
          simulationState.settings.format = event.target.value;
        });
        document.getElementById('sim-win-select')?.addEventListener('change', event => {
          const option = SIMULATION_WIN_OPTIONS.find(item => item.value === event.target.value);
          if (option) simulationState.settings.winScore = option.score;
        });
        bindSimulationPlayerCards();
        return;
      }

      if (simulationState.phase === 'roster') {
        const teamA = simulationState.teams.A || [];
        const teamB = simulationState.teams.B || [];
        root.innerHTML = `
          <div class="sim-shell">
            <div class="sim-roster">
              <div class="sim-setup">
                <div class="sim-team">
                  <h3>Equipo A</h3>
                  <div class="sim-players">
                    ${teamA.map(player => `
                      <div class="sim-player-card" tabindex="0">
                        <img src="${cardImage(cardById(norm(player)) || { name: player })}" alt="${player}" />
                        <div>
                          <div class="name">${player}</div>
                          <div class="role">Jugador</div>
                        </div>
                        ${getPlayerTooltip(player)}
                      </div>
                    `).join('')}
                  </div>
                </div>
                <div class="sim-team">
                  <h3>Equipo B</h3>
                  <div class="sim-players">
                    ${teamB.map(player => `
                      <div class="sim-player-card" tabindex="0">
                        <img src="${cardImage(cardById(norm(player)) || { name: player })}" alt="${player}" />
                        <div>
                          <div class="name">${player}</div>
                          <div class="role">CPU</div>
                        </div>
                        ${getPlayerTooltip(player)}
                      </div>
                    `).join('')}
                  </div>
                </div>
              </div>
              <div class="sim-actions">
                <button type="button" class="sim-action-button primary" id="sim-begin-match">Iniciar Partido</button>
                <button type="button" class="sim-action-button" id="sim-reroll">Volver a generar equipos</button>
                <button type="button" class="sim-action-button" id="sim-back-lobby">Volver atrás</button>
              </div>
            </div>
          </div>
        `;
        document.getElementById('sim-begin-match')?.addEventListener('click', beginMatch);
        document.getElementById('sim-reroll')?.addEventListener('click', startSimulationRoster);
        document.getElementById('sim-back-lobby')?.addEventListener('click', () => { simulationState.phase = 'lobby'; renderSimulationScreen(); });
        bindSimulationPlayerCards();
        return;
      }

      if (simulationState.phase === 'live') {
        const teamA = simulationState.teams.A || [];
        const teamB = simulationState.teams.B || [];
        const shotChoices = [
          ['tiro_cercano', 'Tiro Cercano'],
          ['bandeja_en_carrera', 'Bandeja'],
          ['tiro_media_distancia', 'Media Distancia'],
          ['triple', 'Triple']
        ];
        const userPassOptions = teamA.filter(player => player !== simulationState.activePlayer);
        const userPickOptions = teamA.filter(player => player !== simulationState.activePlayer);
        const renderDecisionPanel = () => {
          if (simulationState.pendingFollowupTimeout) {
            return `
              <div class="sim-decision-panel">
                <h4>Se está resolviendo la jugada</h4>
                <p class="sub">Espera al rebote o a la acción defensiva.</p>
              </div>
            `;
          }
          if (simulationState.possession !== 'A' || simulationState.matchOver) {
            return `
              <div class="sim-decision-panel">
                <h4>${simulationState.possession === 'B' ? 'Turno de la CPU' : 'Espera'}</h4>
                <p class="sub">${simulationState.possession === 'B' ? 'La CPU está atacando y tú defiendes.' : 'Pasa a la siguiente acción.'}</p>
              </div>
            `;
          }
          return `
            <div class="sim-decision-panel">
              <h4>Tu decisión</h4>
              <div style="margin-bottom:12px">
                <div class="sim-pill">Posee: ${simulationState.activePlayer || 'Sin balón'}</div>
              </div>
              <div style="display:flex; flex-direction:column; gap:8px;">
                <div>
                  <div style="font-weight:700; margin-bottom:6px;">Pasar</div>
                  <div class="sim-actions">
                    ${userPassOptions.map(player => `<button type="button" class="sim-action-button" data-sim-pass="${player}">Pase a ${player}</button>`).join('')}
                  </div>
                </div>
                <div>
                  <div style="font-weight:700; margin-bottom:6px;">Tirar</div>
                  <div class="sim-actions">
                    ${shotChoices.map(([type, label]) => `<button type="button" class="sim-action-button" data-sim-shot="${type}">${label}</button>`).join('')}
                  </div>
                </div>
                <div>
                  <div style="font-weight:700; margin-bottom:6px;">Pick and Roll</div>
                  <div class="sim-actions">
                    ${userPickOptions.map(player => `<button type="button" class="sim-action-button" data-sim-pick="${player}">Bloquea con ${player}</button>`).join('')}
                  </div>
                </div>
              </div>
            </div>
          `;
        };

        root.innerHTML = `
          <div class="sim-shell">
            <div class="sim-game">
              <div class="sim-scorebar">
                <div class="sim-scoreline">
                  <span class="sim-pill">Equipo A</span>
                  <span class="sim-score">${simulationState.score.A}<small> - </small>${simulationState.score.B}</span>
                  <span class="sim-pill">Equipo B</span>
                </div>
                <div class="sim-status">
                  <span class="sim-pill">Posee: ${simulationState.possession === 'A' ? 'A' : 'B'}</span>
                  <span class="sim-pill">Jugador: ${simulationState.activePlayer || '-'}</span>
                  <span class="sim-pill">Marcaje: ${simulationState.activePlayer ? describeMarcaje(simulationState.possession, simulationState.activePlayer) : 'Sin marca'}</span>
                  <button type="button" class="sim-action-button" id="sim-exit-live">Salir del partido</button>
                </div>
              </div>
              <div class="sim-live-grid">
                <div class="sim-feed">
                  <div style="display:flex; justify-content:space-between; align-items:center; gap:12px;">
                    <strong>Play-by-play</strong>
                  </div>
                  ${(simulationState.messageQueue.length ? simulationState.messageQueue : [{ text: 'Esperando siguiente acción...', type: 'info'}]).map(item => `<div class="sim-feed-item ${item.type === 'warning' ? 'warning' : ''}">${item.text}</div>`).join('')}
                </div>
                <div class="sim-right-panel">
                  ${renderDecisionPanel()}
                </div>
              </div>
            </div>
          </div>
        `;

        document.getElementById('sim-exit-live')?.addEventListener('click', () => {
          const shouldExit = window.confirm('¿Seguro que quieres abandonar? No recibirás monedas ni se registrará la partida.');
          if (!shouldExit) return;
          resetSimulationStateForNewMatch();
          simulationState.phase = 'lobby';
          simulationState.clubView = 'play';
          renderSimulationScreen();
        });
        document.querySelectorAll('[data-sim-pass]').forEach(button => {
          button.addEventListener('click', () => {
            const toPlayer = button.getAttribute('data-sim-pass');
            handleUserAction('pass', { from: simulationState.activePlayer, to: toPlayer });
          });
        });
        document.querySelectorAll('[data-sim-shot]').forEach(button => {
          button.addEventListener('click', () => {
            const shotType = button.getAttribute('data-sim-shot');
            handleUserAction('shot', { from: simulationState.activePlayer, shotType });
          });
        });
        document.querySelectorAll('[data-sim-pick]').forEach(button => {
          button.addEventListener('click', () => {
            const blocker = button.getAttribute('data-sim-pick');
            handleUserAction('pick', { handler: simulationState.activePlayer, blocker });
          });
        });
        return;
      }

      if (simulationState.phase === 'finished') {
        recordSimulationPlayerStats();
        if (!simulationState.rewardApplied) {
          applyMatchReward().then(() => renderSimulationScreen());
        }
        const winner = simulationState.winner === 'A' ? 'Equipo A' : 'Equipo B';
        const reward = simulationState.winner === 'A' ? 500 : 100;
        const winnerPlayers = simulationState.teams[simulationState.winner] || [];
        const loserPlayers = simulationState.winner === 'A' ? simulationState.teams.B : simulationState.teams.A;
        const mvp = [...simulationState.teams.A.map(player => ['A', player]), ...simulationState.teams.B.map(player => ['B', player])].reduce((best, [team, player]) => {
          const stats = getBoxScoreEntry(team, player) || { pts:0, reb:0, ast:0, stl:0, blk:0, tov:0 };
          const rating = (stats.pts || 0) + (stats.reb || 0) + (stats.ast || 0) + (stats.stl || 0) + (stats.blk || 0) - (stats.tov || 0);
          const points = stats.pts || 0;
          if (!best || rating > best.rating || (rating === best.rating && points > best.points)) {
            return { team, player, rating, points };
          }
          return best;
        }, null);
        const buildRows = (team) => {
          const players = simulationState.teams[team] || [];
          return players.map(player => {
            const stats = getBoxScoreEntry(team, player) || { pts:0, reb:0, ast:0, stl:0, blk:0, tov:0, fgm:0, fga:0, tpm:0, tpa:0 };
            const reb = stats.reb || (stats.oreb || 0) + (stats.dreb || 0);
            const fgp = stats.fga ? ((stats.fgm / stats.fga) * 100) : 0;
            const tpp = stats.tpa ? ((stats.tpm / stats.tpa) * 100) : 0;
            const rating = stats.pts + (stats.reb || 0) + stats.ast + stats.stl + stats.blk - stats.tov;
            return `
              <tr class="${mvp && mvp.team === team && mvp.player === player ? 'mvp-row' : ''}">
                <td>${player}${mvp && mvp.team === team && mvp.player === player ? '<span class="sim-mvp-badge">MVP</span>' : ''}</td>
                <td>${stats.pts}</td>
                <td>${reb}</td>
                <td>${stats.ast}</td>
                <td>${stats.stl}</td>
                <td>${stats.blk}</td>
                <td>${stats.tov}</td>
                <td>${stats.fgm}/${stats.fga} (${fgp.toFixed(1)}%)</td>
                <td>${stats.tpm}/${stats.tpa} (${tpp.toFixed(1)}%)</td>
                <td>${rating}</td>
              </tr>
            `;
          }).join('');
        };
        root.innerHTML = `
          <div class="sim-shell">
            <div class="sim-finish">
              <div class="sim-result-card">
                <h2>¡${winner} ha ganado el partido!</h2>
                <div class="sim-score" style="font-size:22px; margin-top:10px;">Equipo A ${simulationState.score.A} - ${simulationState.score.B} Equipo B</div>
                <div class="sim-mvp">${simulationState.winner === 'A' ? '¡Victoria! +500 monedas añadidas a tu club.' : 'Derrota: +100 monedas.'}</div>
                <div class="sim-mvp">MVP: ${mvp ? `${mvp.player} (${mvp.rating} VAL)` : 'Sin datos'}</div>
              </div>
              <div class="sim-finish-grid">
                <div class="sim-result-card">
                  <h3>Jugadores del equipo ganador</h3>
                  <div class="sim-result-team">
                    ${winnerPlayers.map(player => `<span class="sim-result-player winner"><img src="${getPlayerPhoto(player)}" alt="${player}" style="width:28px;height:28px;border-radius:50%;"/> ${player}</span>`).join('')}
                  </div>
                </div>
                <div class="sim-result-card">
                  <h3>Jugadores del equipo perdedor</h3>
                  <div class="sim-result-team">
                    ${loserPlayers.map(player => `<span class="sim-result-player"><img src="${getPlayerPhoto(player)}" alt="${player}" style="width:28px;height:28px;border-radius:50%;"/> ${player}</span>`).join('')}
                  </div>
                </div>
              </div>
              <div class="sim-result-card sim-boxscore">
                <h3>Box Score</h3>
                <div class="sim-boxscore-team ${simulationState.winner === 'A' ? 'winner' : 'loser'}">
                  <h4>Equipo A · ${simulationState.score.A} puntos</h4>
                  <table>
                    <thead>
                      <tr>
                        <th>Jugador</th>
                        <th>PTS</th>
                        <th>REB</th>
                        <th>AST</th>
                        <th>ROB</th>
                        <th>TAP</th>
                        <th>PER</th>
                        <th>TC</th>
                        <th>3P</th>
                        <th>VAL</th>
                      </tr>
                    </thead>
                    <tbody>${buildRows('A')}</tbody>
                  </table>
                </div>
                <div class="sim-boxscore-team ${simulationState.winner === 'B' ? 'winner' : 'loser'}">
                  <h4>Equipo B · ${simulationState.score.B} puntos</h4>
                  <table>
                    <thead>
                      <tr>
                        <th>Jugador</th>
                        <th>PTS</th>
                        <th>REB</th>
                        <th>AST</th>
                        <th>ROB</th>
                        <th>TAP</th>
                        <th>PER</th>
                        <th>TC</th>
                        <th>3P</th>
                        <th>VAL</th>
                      </tr>
                    </thead>
                    <tbody>${buildRows('B')}</tbody>
                  </table>
                </div>
              </div>
              <div class="sim-actions">
                <button type="button" class="sim-action-button primary" id="sim-replay">Volver a jugar</button>
                <button type="button" class="sim-action-button" id="sim-finish-lobby">Volver al lobby</button>
              </div>
            </div>
          </div>
        `;
        document.getElementById('sim-replay')?.addEventListener('click', () => { startSimulationRoster(); });
        document.getElementById('sim-finish-lobby')?.addEventListener('click', () => { simulationState.phase = 'lobby'; renderSimulationScreen(); });
        return;
      }
    }

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
      simulationState.phase = 'lobby';
      renderSimulationScreen();
    }, 100);

