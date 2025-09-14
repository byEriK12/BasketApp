// ==========================
    // Utilidades
    // ==========================
    const norm = (s)=> (s||"").toString().trim().toLowerCase();
    const fmtPct = (x)=> isFinite(x) ? `${(Math.round(x*10)/10).toFixed(1)}%` : '-';
    const fmt1 = (x)=> isFinite(x) ? (Math.round(x*10)/10).toFixed(1) : '-';

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
          valoracion, contribucion,
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
    function getPartidosFiltrados(formato) {
        if (formato === "Todos") return partidos;
        return partidos.filter(p => p.formato === formato);
        }

    const temporada = new Temporada(partidos);

    // ==========================
    // Render UI
    // ==========================
    const el = (id)=> document.getElementById(id);

    function renderPartidos(formato){
        const f = getPartidosFiltrados(formato);
        el('infoFormato').textContent = `Hay un total de ${f.length} partidos de ${formato}.`;
        const grid = el('gridPartidos'); grid.innerHTML = '';
        if(f.length===0){ grid.innerHTML = '<div class="sub">No hay partidos de este formato.</div>'; return; }
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
            <div class="sub" style="margin-top:8px">Equipo: ${p.jugadores_equipo.join(', ')} · Rivales: ${p.jugadores_rivales.join(', ')}</div>
            `;
            grid.appendChild(d);
        });
}
    // -------------------------
    // Render de estadísticas filtradas por formato
    // -------------------------
    function renderTemporadaPorFormato(formato){
    const partidosFiltrados = getPartidosFiltrados(formato);
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
    }

    function renderColectivasPorFormato(formato){
    const temp = new Temporada(getPartidosFiltrados(formato));
    const mmt = temp.calcular_mas_menos_total_jugadores();
    const mmpp = temp.calcular_mas_menos_por_partido_jugadores();
    const wr = temp.calcular_win_rate_total_de_jugadores();

    const list = (id, arr, fmtVal)=>{
        const c=el(id); c.innerHTML='';
        if(arr.length===0){ c.innerHTML='<div class="sub">(Sin datos suficientes)</div>'; return; }
        for(const item of arr){
        const r=document.createElement('div'); r.className='row';
        if(id==='listWR'){
            const [j, w, pj] = item; r.innerHTML = `<div>${j}</div><div style="text-align:right">${fmtPct(w)}</div><div style="text-align:right"><small>${pj} pj</small></div>`;
        }else{
            const [j, v] = item; r.innerHTML = `<div>${j}</div><div style="text-align:right">${v>=0?'+':''}${fmt1(v)}</div><div></div>`;
        }
        c.appendChild(r);
        }
    }
    list('listMasMenosTotal', mmt);
    list('listMasMenosPP', mmpp);
    list('listWR', wr);
    }

    function renderClutchPorFormato(formato){
    const temp = new Temporada(getPartidosFiltrados(formato));
    const wr = temp.calcular_win_rate_clutch();
    const c=el('listWRClutch'); c.innerHTML='';
    if(wr.length===0){ c.innerHTML='<div class="sub">No hay partidos muy reñidos.</div>'; return; }
    for(const [j,w,pj] of wr){
        const r=document.createElement('div'); r.className='row';
        r.innerHTML = `<div>${j}</div><div style="text-align:right">${fmtPct(w)}</div><div style="text-align:right"><small>${pj} pj</small></div>`;
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

    function renderPlayerStats(nombreJugador, formato = 'Todos'){
      const partidosFiltrados = getPartidosFiltrados(formato);
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
            <span>Partidos jugados:</span><span>${stats.partidos_jugados}</span>
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
            <span>Puntos totales:</span><span>${stats.puntos_totales}</span>
          </div>
          <div class="stat" style="font-size:12px; padding:4px 0;">
            <span>Puntos por partido:</span><span>${fmt1(stats.puntos_pp)}</span>
          </div>
          <div class="stat" style="font-size:12px; padding:4px 0;">
            <span>Rebotes totales:</span><span>${stats.rebotes_totales}</span>
          </div>
          <div class="stat" style="font-size:12px; padding:4px 0;">
            <span>Asistencias totales:</span><span>${stats.asistencias_totales}</span>
          </div>
          <div class="stat" style="font-size:12px; padding:4px 0;">
            <span>Triples:</span><span>${stats.triples_anotados_totales}/${stats.triples_intentados_totales} (${fmt1(stats.pct_triples)}%)</span>
          </div>`;
      }

      html += '</div>';
      statsDiv.innerHTML = html;
    }

    // ==========================
    // Eventos UI
    // ==========================
    document.querySelectorAll('.tab').forEach(btn=>{
    btn.addEventListener('click',()=>{
        document.querySelectorAll('.tab').forEach(b=>b.classList.remove('active'));
        btn.classList.add('active');
        const id=btn.dataset.tab;
        document.querySelectorAll('[id^="tab-"]').forEach(v=> v.hidden = (v.id!==id));
        const formato = el('selFormato').value;
        if(id==='tab-temporada') renderTemporadaPorFormato(formato);
        if(id==='tab-colectivas') renderColectivasPorFormato(formato);
        if(id==='tab-clutch') renderClutchPorFormato(formato);
    })
    });

    el('btnVer').addEventListener('click', ()=>{
    const f = el('selFormato').value; renderPartidos(f);
    renderTemporadaPorFormato(f);
    renderColectivasPorFormato(f);
    renderClutchPorFormato(f);
    });

    el('selFormato').addEventListener('change', ()=>{
    const f = el('selFormato').value;
    renderPartidos(f);
    renderTemporadaPorFormato(f);
    renderColectivasPorFormato(f);
    renderClutchPorFormato(f);
    
    // Update player stats if a player is selected
    const selectedPlayer = el('perfilJugador').value;
    if(selectedPlayer){
      renderPlayerStats(selectedPlayer, f);
    }
    });

    el('perfilJugador').addEventListener('change', ()=>{
      const selectedPlayer = el('perfilJugador').value;
      const formato = el('selFormato').value;
      
      if(selectedPlayer){
        renderPlayerStats(selectedPlayer, formato);
      } else {
        el('perfilJugadorStats').innerHTML = '';
      }
    });

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
      
      const formatoInicial = el('selFormato').value;
      renderPartidos(formatoInicial);
      renderTemporadaPorFormato(formatoInicial);
      renderColectivasPorFormato(formatoInicial);
      renderClutchPorFormato(formatoInicial);
      
      // Initialize player dropdown
      populatePlayerDropdown();
    }, 100);

