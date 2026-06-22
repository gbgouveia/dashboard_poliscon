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
        const createItemHTML = (texto, colecao, id) => `
            <div style="padding: 0.5rem; border-bottom: 1px solid var(--surface-border); display: flex; justify-content: space-between; align-items: center;">
                <span>${texto}</span>
                <div style="display: flex; gap: 0.5rem;">
                    <button class="btn btn-secondary" style="padding: 0.25rem 0.5rem; min-width: auto; height: 32px;" onclick="window.crudController.editarItem('${colecao}', '${id}')" title="Editar"><i class="ph ph-pencil" style="font-size: 1.1rem; margin: 0;"></i></button>
                    <button class="btn btn-danger" style="padding: 0.25rem 0.5rem; min-width: auto; height: 32px;" onclick="window.crudController.excluirItem('${colecao}', '${id}')" title="Excluir"><i class="ph ph-trash" style="font-size: 1.1rem; margin: 0;"></i></button>
                </div>
            </div>
        `;

        let htmlAreas = this.dados.areas.map(a => createItemHTML(`<i class="ph ph-buildings"></i> ${a.nome}`, 'areas', a.id)).join('');
        document.getElementById('lista-areas').innerHTML = htmlAreas || 'Nenhuma área cadastrada.';

        let htmlColabs = this.dados.colaboradores.map(c => {
            const area = this.dados.areas.find(a => a.id === c.areaId);
            return createItemHTML(`<i class="ph ph-user"></i> ${c.nome} <span class="text-muted" style="font-size:0.8rem">- ${area ? area.nome : ''}</span>`, 'colaboradores', c.id);
        }).join('');
        document.getElementById('lista-colaboradores').innerHTML = htmlColabs || 'Nenhum colaborador cadastrado.';
        
        let htmlMetas = this.dados.metas.map(m => {
            const area = this.dados.areas.find(a => a.id === m.areaId);
            const colab = this.dados.colaboradores.find(c => c.id === m.colaboradorId);
            const alvo = m.tipo === 'AREA' ? (area ? area.nome : '') : (colab ? colab.nome : '');
            return createItemHTML(`<i class="ph ph-target"></i> ${m.titulo} <span class="text-muted" style="font-size:0.8rem">- ${alvo}</span>`, 'metas', m.id);
        }).join('');
        if(document.getElementById('lista-metas')) document.getElementById('lista-metas').innerHTML = htmlMetas || 'Nenhum indicador cadastrado.';

        let htmlLancamentos = this.dados.lancamentos.map(l => {
            const meta = this.dados.metas.find(m => m.id === l.metaId);
            return createItemHTML(`<i class="ph ph-chart-line-up"></i> ${l.mes}/${l.ano} - Prev: ${l.previsto} | Real: ${l.realizado} <span class="text-muted" style="font-size:0.8rem">- ${meta ? meta.titulo : ''}</span>`, 'lancamentos', l.id);
        }).join('');
        if(document.getElementById('lista-lancamentos')) document.getElementById('lista-lancamentos').innerHTML = htmlLancamentos || 'Nenhum lançamento registrado.';
    }

    updateStatusImputacao(mes, ano) {
        const tbody = document.getElementById('tabela-status-imputacao');
        if (!tbody) return;

        let html = '';

        this.dados.areas.forEach(area => {
            // Encontra os colaboradores desta área
            const colabIdsDaArea = this.dados.colaboradores
                .filter(c => c.areaId === area.id)
                .map(c => c.id);

            // Filtra indicadores mapeados para esta área
            const indicadoresDaArea = this.dados.metas.filter(m => {
                if (m.tipo === 'AREA') {
                    return m.areaId === area.id;
                } else if (m.tipo === 'COLABORADOR') {
                    return colabIdsDaArea.includes(m.colaboradorId);
                }
                return false;
            });

            const totalIndicadores = indicadoresDaArea.length;
            
            // Encontra lançamentos realizados para esses indicadores no mês/ano
            const indicadorIds = indicadoresDaArea.map(m => m.id);
            const lancamentosMesAno = this.dados.lancamentos.filter(l => 
                l.mes == mes && 
                l.ano == ano && 
                indicadorIds.includes(l.metaId)
            );
            
            // Conjunto de IDs de indicadores que já tiveram lançamentos
            const metaIdsLancados = new Set(lancamentosMesAno.map(l => l.metaId));
            const imputados = metaIdsLancados.size;

            let statusHTML = '';
            let progressPercent = 0;

            if (totalIndicadores === 0) {
                progressPercent = 100;
                statusHTML = `<span class="badge badge-success">Sem Indicadores</span>`;
            } else {
                progressPercent = Math.round((imputados / totalIndicadores) * 100);
                if (imputados === totalIndicadores) {
                    statusHTML = `<span class="badge badge-success">Imputado</span>`;
                } else if (imputados > 0) {
                    statusHTML = `<span class="badge badge-warning">Pendente</span>`;
                } else {
                    statusHTML = `<span class="badge badge-danger">Pendente</span>`;
                }
            }

            html += `
                <tr style="border-bottom: 1px solid var(--surface-border);">
                    <td style="padding: 1rem 0.75rem; font-weight: 500;">
                        <i class="ph ph-buildings" style="color: var(--gold-main); margin-right: 0.5rem;"></i>${area.nome}
                    </td>
                    <td style="padding: 1rem 0.75rem; text-align: center;">${totalIndicadores}</td>
                    <td style="padding: 1rem 0.75rem; text-align: center;">${imputados}</td>
                    <td style="padding: 1rem 0.75rem; vertical-align: middle;">
                        <div style="display: flex; align-items: center; gap: 0.75rem;">
                            <div class="progress-bar-container" style="flex: 1;">
                                <div class="progress-bar" style="width: ${progressPercent}%;"></div>
                            </div>
                            <span style="font-size: 0.85rem; font-weight: 600; min-width: 32px; text-align: right;">${progressPercent}%</span>
                        </div>
                    </td>
                    <td style="padding: 1rem 0.75rem; text-align: center;">
                        ${statusHTML}
                    </td>
                </tr>
            `;
        });

        if (this.dados.areas.length === 0) {
            html = `<tr><td colspan="5" style="text-align: center; padding: 2rem; color: var(--text-secondary);">Nenhuma área cadastrada no sistema.</td></tr>`;
        }

        tbody.innerHTML = html;
    }
}
