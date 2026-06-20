import { renderLineChart, renderBarChart, renderDoughnutChart, renderGaugeChart } from './charts.js';

export class DashboardController {
    constructor() {
        this.dados = { areas: [], colaboradores: [], metas: [], lancamentos: [] };
    }

    setData(dados) {
        this.dados = dados;
        this.updateVisaoGeral();
        this.updateCadastrosList();
    }

    updateVisaoGeral() {
        // KPIs Principais
        document.getElementById('kpi-total-metas').innerText = this.dados.metas.length;
        document.getElementById('kpi-total-areas').innerText = this.dados.areas.length;
        document.getElementById('kpi-total-colab').innerText = this.dados.colaboradores.length;

        let totalPrevisto = 0;
        let totalRealizado = 0;
        
        this.dados.lancamentos.forEach(l => {
            totalPrevisto += Number(l.previsto) || 0;
            totalRealizado += Number(l.realizado) || 0;
        });

        let media = totalPrevisto > 0 ? ((totalRealizado / totalPrevisto) * 100).toFixed(1) : 0;
        document.getElementById('kpi-desempenho-geral').innerText = `${media}%`;

        let indObj = document.getElementById('kpi-desempenho-indicador');
        if(media >= 90) { indObj.className = "kpi-indicator positive"; indObj.innerHTML = "<i class='ph ph-check-circle'></i> Excelente"; }
        else if(media >= 70) { indObj.className = "kpi-indicator text-warning"; indObj.innerHTML = "<i class='ph ph-warning-circle'></i> Atenção"; }
        else { indObj.className = "kpi-indicator negative"; indObj.innerHTML = "<i class='ph ph-x-circle'></i> Crítico"; }

        // Gráfico de Evolução Geral
        const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        let evolucaoData = new Array(12).fill(0);
        
        for(let m = 1; m <= 12; m++) {
            let pMes = 0, rMes = 0;
            this.dados.lancamentos.filter(l => Number(l.mes) === m).forEach(l => {
                pMes += Number(l.previsto); rMes += Number(l.realizado);
            });
            evolucaoData[m-1] = pMes > 0 ? (rMes/pMes)*100 : 0;
        }
        renderLineChart('chartEvolucaoGeral', meses, evolucaoData, 'Conformidade Geral (%)');

        // Gráfico de Distribuição por Área
        const areasLabels = this.dados.areas.map(a => a.nome);
        const areasData = this.dados.areas.map(a => {
            const metasArea = this.dados.metas.filter(m => m.areaId === a.id).map(m => m.id);
            let rTotal = 0;
            this.dados.lancamentos.filter(l => metasArea.includes(l.metaId)).forEach(l => rTotal += Number(l.realizado));
            return rTotal;
        });
        
        if(areasLabels.length === 0) {
            renderDoughnutChart('chartDistribuicaoDesempenho', ['Sem Dados'], [100]);
        } else {
            renderDoughnutChart('chartDistribuicaoDesempenho', areasLabels, areasData);
        }
    }

    updateDashboardArea(areaId, mes, ano) {
        if(!areaId) return;
        
        const metasArea = this.dados.metas.filter(m => m.areaId === areaId).map(m => m.id);
        const lancArea = this.dados.lancamentos.filter(l => metasArea.includes(l.metaId) && l.mes == mes && l.ano == ano);
        
        let tPrev = 0, tReal = 0;
        lancArea.forEach(l => { tPrev += Number(l.previsto); tReal += Number(l.realizado); });
        
        let conf = tPrev > 0 ? ((tReal / tPrev) * 100).toFixed(1) : 0;
        document.getElementById('kpi-area-conformidade').innerText = `${conf}%`;
        
        let statusObj = document.getElementById('kpi-area-status');
        if(conf >= 90) { statusObj.className = "kpi-indicator positive"; statusObj.innerText = "Meta Atingida"; }
        else if(conf >= 70) { statusObj.className = "kpi-indicator text-warning"; statusObj.innerText = "Atenção"; }
        else { statusObj.className = "kpi-indicator negative"; statusObj.innerText = "Meta Não Atingida"; }

        // Gráfico de Barras
        const labels = this.dados.metas.filter(m => m.areaId === areaId).map(m => m.titulo.length > 20 ? m.titulo.substring(0, 20) + '...' : m.titulo);
        const dPrev = [], dReal = [];
        
        this.dados.metas.filter(m => m.areaId === areaId).forEach(m => {
            let p = 0, r = 0;
            lancArea.filter(la => la.metaId === m.id).forEach(la => { p += Number(la.previsto); r += Number(la.realizado); });
            dPrev.push(p);
            dReal.push(r);
        });

        if(labels.length > 0) {
            renderBarChart('chartAreaDesempenho', labels, dPrev, dReal);
        } else {
            renderBarChart('chartAreaDesempenho', ['Nenhuma Meta'], [0], [0]);
        }
    }

    updateDashboardColaborador(colabId, ano) {
        if(!colabId) return;

        const metasColab = this.dados.metas.filter(m => m.colaboradorId === colabId).map(m => m.id);
        
        const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        let evolucaoData = new Array(12).fill(0);
        let totalMediaGauge = 0, mesesComDados = 0;
        
        for(let m = 1; m <= 12; m++) {
            let pMes = 0, rMes = 0;
            this.dados.lancamentos.filter(l => metasColab.includes(l.metaId) && l.mes == m && l.ano == ano).forEach(l => {
                pMes += Number(l.previsto); rMes += Number(l.realizado);
            });
            let p = pMes > 0 ? (rMes/pMes)*100 : 0;
            evolucaoData[m-1] = p;
            if(pMes > 0) {
                totalMediaGauge += p;
                mesesComDados++;
            }
        }
        
        renderLineChart('chartColaboradorEvolucao', meses, evolucaoData, 'Desempenho (%)');

        let mediaGauge = mesesComDados > 0 ? (totalMediaGauge / mesesComDados).toFixed(0) : 0;
        document.getElementById('gauge-text').innerText = `${mediaGauge}%`;
        renderGaugeChart('chartColaboradorGauge', Number(mediaGauge));
    }

    updateCadastrosList() {
        let htmlAreas = this.dados.areas.map(a => `<div style="padding: 0.5rem; border-bottom: 1px solid var(--surface-border);"><i class="ph ph-buildings"></i> ${a.nome}</div>`).join('');
        document.getElementById('lista-areas').innerHTML = htmlAreas || 'Nenhuma área cadastrada.';

        let htmlColabs = this.dados.colaboradores.map(c => {
            const area = this.dados.areas.find(a => a.id === c.areaId);
            return `<div style="padding: 0.5rem; border-bottom: 1px solid var(--surface-border);"><i class="ph ph-user"></i> ${c.nome} <span class="text-muted" style="font-size:0.8rem">- ${area ? area.nome : ''}</span></div>`;
        }).join('');
        document.getElementById('lista-colaboradores').innerHTML = htmlColabs || 'Nenhum colaborador cadastrado.';
    }
}
