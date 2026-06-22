import { db, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, serverTimestamp, secondaryAuth, createUserWithEmailAndPassword, query, where } from './firebase.js';

// Mocks for Local Storage if Firebase is not configured (offline mode demo)
let useMocks = !db;

// Mock Data structure
const mockDB = {
    areas: JSON.parse(localStorage.getItem('polis_areas')) || [],
    colaboradores: JSON.parse(localStorage.getItem('polis_colaboradores')) || [],
    metas: JSON.parse(localStorage.getItem('polis_metas')) || [],
    lancamentos: JSON.parse(localStorage.getItem('polis_lancamentos')) || []
};

// Seed mock data if completely empty
if (mockDB.areas.length === 0 && mockDB.colaboradores.length === 0 && mockDB.metas.length === 0 && mockDB.lancamentos.length === 0) {
    mockDB.areas = [
        { id: "area-fin", nome: "Financeiro", descricao: "Setor de Finanças e Contabilidade", criadoEm: new Date().toISOString() },
        { id: "area-com", nome: "Comercial", descricao: "Vendas e Novos Clientes", criadoEm: new Date().toISOString() },
        { id: "area-tec", nome: "Tecnologia", descricao: "TI, Infraestrutura e Sistemas", criadoEm: new Date().toISOString() }
    ];
    mockDB.colaboradores = [
        { id: "colab-gab", nome: "Gabriel Gouveia", areaId: "area-tec", cargo: "Gerente de TI", email: "gabriel@poliscon.com", perfil: "ADMIN", criadoEm: new Date().toISOString() },
        { id: "colab-joao", nome: "João Silva", areaId: "area-fin", cargo: "Analista Financeiro", email: "joao@poliscon.com", perfil: "LANCADOR", criadoEm: new Date().toISOString() },
        { id: "colab-maria", nome: "Maria Santos", areaId: "area-com", cargo: "Analista Comercial", email: "maria@poliscon.com", perfil: "LANCADOR", criadoEm: new Date().toISOString() }
    ];
    mockDB.metas = [
        { id: "meta-bal", titulo: "Elaborar Balancetes", tipo: "AREA", areaId: "area-fin", colaboradorId: null, criadoEm: new Date().toISOString() },
        { id: "meta-faturamento", titulo: "Faturamento Mensal (k R$)", tipo: "AREA", areaId: "area-fin", colaboradorId: null, criadoEm: new Date().toISOString() },
        { id: "meta-vendas", titulo: "Novos Contratos", tipo: "AREA", areaId: "area-com", colaboradorId: null, criadoEm: new Date().toISOString() },
        { id: "meta-uptime", titulo: "Uptime dos Servidores (%)", tipo: "AREA", areaId: "area-tec", colaboradorId: null, criadoEm: new Date().toISOString() },
        { id: "meta-chamados", titulo: "Resolução de Chamados", tipo: "COLABORADOR", areaId: null, colaboradorId: "colab-gab", criadoEm: new Date().toISOString() },
        { id: "meta-prosp", titulo: "Reuniões de Prospecção", tipo: "COLABORADOR", areaId: null, colaboradorId: "colab-maria", criadoEm: new Date().toISOString() }
    ];
    
    mockDB.lancamentos = [
        // Jan
        { id: "l-1", metaId: "meta-bal", mes: 1, ano: 2026, previsto: 10, realizado: 10, observacoes: "Ok", criadoEm: new Date().toISOString() },
        { id: "l-2", metaId: "meta-faturamento", mes: 1, ano: 2026, previsto: 100, realizado: 95, observacoes: "Quase lá", criadoEm: new Date().toISOString() },
        { id: "l-3", metaId: "meta-vendas", mes: 1, ano: 2026, previsto: 5, realizado: 4, observacoes: "Férias", criadoEm: new Date().toISOString() },
        { id: "l-4", metaId: "meta-uptime", mes: 1, ano: 2026, previsto: 99, realizado: 99.5, observacoes: "Ok", criadoEm: new Date().toISOString() },
        { id: "l-5", metaId: "meta-chamados", mes: 1, ano: 2026, previsto: 50, realizado: 48, observacoes: "", criadoEm: new Date().toISOString() },
        { id: "l-6", metaId: "meta-prosp", mes: 1, ano: 2026, previsto: 20, realizado: 18, observacoes: "", criadoEm: new Date().toISOString() },
        // Feb
        { id: "l-7", metaId: "meta-bal", mes: 2, ano: 2026, previsto: 10, realizado: 9, observacoes: "", criadoEm: new Date().toISOString() },
        { id: "l-8", metaId: "meta-faturamento", mes: 2, ano: 2026, previsto: 100, realizado: 102, observacoes: "Meta batida", criadoEm: new Date().toISOString() },
        { id: "l-9", metaId: "meta-vendas", mes: 2, ano: 2026, previsto: 5, realizado: 5, observacoes: "Ok", criadoEm: new Date().toISOString() },
        { id: "l-10", metaId: "meta-uptime", mes: 2, ano: 2026, previsto: 99, realizado: 99.8, observacoes: "Excelente", criadoEm: new Date().toISOString() },
        { id: "l-11", metaId: "meta-chamados", mes: 2, ano: 2026, previsto: 50, realizado: 52, observacoes: "", criadoEm: new Date().toISOString() },
        { id: "l-12", metaId: "meta-prosp", mes: 2, ano: 2026, previsto: 20, realizado: 22, observacoes: "", criadoEm: new Date().toISOString() },
        // Mar
        { id: "l-13", metaId: "meta-bal", mes: 3, ano: 2026, previsto: 10, realizado: 11, observacoes: "", criadoEm: new Date().toISOString() },
        { id: "l-14", metaId: "meta-faturamento", mes: 3, ano: 2026, previsto: 110, realizado: 115, observacoes: "Bom mês", criadoEm: new Date().toISOString() },
        { id: "l-15", metaId: "meta-vendas", mes: 3, ano: 2026, previsto: 6, realizado: 6, observacoes: "", criadoEm: new Date().toISOString() },
        { id: "l-16", metaId: "meta-uptime", mes: 3, ano: 2026, previsto: 99, realizado: 98.9, observacoes: "Queda rápida de energia", criadoEm: new Date().toISOString() },
        { id: "l-17", metaId: "meta-chamados", mes: 3, ano: 2026, previsto: 50, realizado: 50, observacoes: "", criadoEm: new Date().toISOString() },
        { id: "l-18", metaId: "meta-prosp", mes: 3, ano: 2026, previsto: 20, realizado: 20, observacoes: "", criadoEm: new Date().toISOString() },
        // Apr
        { id: "l-19", metaId: "meta-bal", mes: 4, ano: 2026, previsto: 10, realizado: 10, observacoes: "", criadoEm: new Date().toISOString() },
        { id: "l-20", metaId: "meta-faturamento", mes: 4, ano: 2026, previsto: 110, realizado: 105, observacoes: "", criadoEm: new Date().toISOString() },
        { id: "l-21", metaId: "meta-vendas", mes: 4, ano: 2026, previsto: 6, realizado: 5, observacoes: "", criadoEm: new Date().toISOString() },
        { id: "l-22", metaId: "meta-uptime", mes: 4, ano: 2026, previsto: 99, realizado: 99.9, observacoes: "Quase 100%", criadoEm: new Date().toISOString() },
        { id: "l-23", metaId: "meta-chamados", mes: 4, ano: 2026, previsto: 50, realizado: 45, observacoes: "", criadoEm: new Date().toISOString() },
        { id: "l-24", metaId: "meta-prosp", mes: 4, ano: 2026, previsto: 25, realizado: 24, observacoes: "", criadoEm: new Date().toISOString() },
        // May
        { id: "l-25", metaId: "meta-bal", mes: 5, ano: 2026, previsto: 12, realizado: 12, observacoes: "", criadoEm: new Date().toISOString() },
        { id: "l-26", metaId: "meta-faturamento", mes: 5, ano: 2026, previsto: 120, realizado: 125, observacoes: "", criadoEm: new Date().toISOString() },
        { id: "l-27", metaId: "meta-vendas", mes: 5, ano: 2026, previsto: 7, realizado: 8, observacoes: "", criadoEm: new Date().toISOString() },
        { id: "l-28", metaId: "meta-uptime", mes: 5, ano: 2026, previsto: 99, realizado: 100.0, observacoes: "100% Uptime", criadoEm: new Date().toISOString() },
        { id: "l-29", metaId: "meta-chamados", mes: 5, ano: 2026, previsto: 55, realizado: 58, observacoes: "", criadoEm: new Date().toISOString() },
        { id: "l-30", metaId: "meta-prosp", mes: 5, ano: 2026, previsto: 25, realizado: 28, observacoes: "", criadoEm: new Date().toISOString() },
        // Jun
        { id: "l-31", metaId: "meta-vendas", mes: 6, ano: 2026, previsto: 7, realizado: 7, observacoes: "", criadoEm: new Date().toISOString() },
        { id: "l-32", metaId: "meta-prosp", mes: 6, ano: 2026, previsto: 25, realizado: 26, observacoes: "", criadoEm: new Date().toISOString() }
    ];
    
    saveMocks();
}

function saveMocks() {
    localStorage.setItem('polis_areas', JSON.stringify(mockDB.areas));
    localStorage.setItem('polis_colaboradores', JSON.stringify(mockDB.colaboradores));
    localStorage.setItem('polis_metas', JSON.stringify(mockDB.metas));
    localStorage.setItem('polis_lancamentos', JSON.stringify(mockDB.lancamentos));
}

function generateId() {
    return Math.random().toString(36).substring(2, 15);
}

// Controller globally available for HTML inline onclick
window.crudController = {
    activeEditId: null,
    activeEditCollection: null,

    openModal: (id) => {
        document.getElementById(id).classList.add('active');
        // Refresh selects if needed
        if(id === 'modal-colaborador') {
            window.crudController.loadAreaSelects();
            // Reset required field password for creation
            if (!window.crudController.activeEditId) {
                const senhaInput = document.getElementById('colab-senha');
                if (senhaInput) {
                    senhaInput.required = true;
                    senhaInput.placeholder = '';
                }
            }
        }
        if(id === 'modal-meta' || id === 'modal-indicador') {
            window.crudController.loadAreaSelects();
            window.crudController.loadColabSelects();
        }
        if(id === 'modal-lancamento') window.crudController.loadMetaSelects();
    },

    closeModal: (id) => {
        document.getElementById(id).classList.remove('active');
        // Clear forms
        const form = document.querySelector(`#${id} form`);
        if(form) form.reset();

        // Reset modal title and edit state
        const titles = {
            'modal-area': 'Cadastrar Área',
            'modal-colaborador': 'Cadastrar Colaborador',
            'modal-meta': 'Cadastrar Indicador',
            'modal-indicador': 'Cadastrar Indicador',
            'modal-lancamento': 'Lançar Desempenho'
        };
        const titleEl = document.querySelector(`#${id} .modal-title`);
        if (titleEl && titles[id]) {
            titleEl.innerText = titles[id];
        }
        window.crudController.activeEditId = null;
        window.crudController.activeEditCollection = null;
        
        // Reset password field properties
        const colabSenha = document.getElementById('colab-senha');
        if (colabSenha) {
            colabSenha.placeholder = '';
            colabSenha.required = true;
        }
    },

    toggleMetaTipo: () => {
        const tipo = document.getElementById('meta-tipo').value;
        if(tipo === 'AREA') {
            document.getElementById('group-meta-area').classList.remove('hidden');
            document.getElementById('group-meta-colab').classList.add('hidden');
        } else {
            document.getElementById('group-meta-area').classList.add('hidden');
            document.getElementById('group-meta-colab').classList.remove('hidden');
            window.crudController.loadColabSelects();
        }
    },

    salvarArea: async () => {
        const nome = document.getElementById('area-nome').value;
        const desc = document.getElementById('area-descricao').value;
        if(!nome) return alert('Nome da área é obrigatório.');

        const isEditing = window.crudController.activeEditId && window.crudController.activeEditCollection === 'areas';

        if (isEditing) {
            const id = window.crudController.activeEditId;
            if(useMocks) {
                const idx = mockDB.areas.findIndex(a => a.id === id);
                if (idx !== -1) {
                    mockDB.areas[idx] = { ...mockDB.areas[idx], nome, descricao: desc };
                    saveMocks();
                }
            } else {
                await updateDoc(doc(db, "areas", id), { nome, descricao: desc });
            }
            alert('Área atualizada com sucesso!');
        } else {
            const data = { nome, descricao: desc, criadoEm: new Date().toISOString() };
            if(useMocks) {
                data.id = generateId();
                mockDB.areas.push(data);
                saveMocks();
            } else {
                data.criadoEm = serverTimestamp();
                await addDoc(collection(db, "areas"), data);
            }
            alert('Área salva com sucesso!');
        }

        window.crudController.closeModal('modal-area');
        if(window.appController) window.appController.loadData();
    },

    salvarColaborador: async () => {
        const nome = document.getElementById('colab-nome').value;
        const areaId = document.getElementById('colab-area').value;
        const cargo = document.getElementById('colab-cargo').value;
        const email = document.getElementById('colab-email').value;
        const senha = document.getElementById('colab-senha').value;
        const perfil = document.getElementById('colab-perfil').value;
        
        const isEditing = window.crudController.activeEditId && window.crudController.activeEditCollection === 'colaboradores';

        if(!nome || !areaId || !cargo || !email || !perfil) return alert('Preencha todos os campos.');
        if(!isEditing && !senha) return alert('Senha de acesso é obrigatória para cadastro.');

        try {
            if (isEditing) {
                const id = window.crudController.activeEditId;
                if(useMocks) {
                    const idx = mockDB.colaboradores.findIndex(c => c.id === id);
                    if (idx !== -1) {
                        mockDB.colaboradores[idx] = { ...mockDB.colaboradores[idx], nome, areaId, cargo, email, perfil };
                        if (senha) mockDB.colaboradores[idx].senha = senha;
                        saveMocks();
                    }
                } else {
                    const updateData = { nome, areaId, cargo, email, perfil };
                    await updateDoc(doc(db, "colaboradores", id), updateData);
                    // Em ambiente Firebase de producao, senha so pode ser alterada via Auth, o que geralmente requer re-autenticacao.
                }
                alert('Colaborador atualizado com sucesso!');
            } else {
                const data = { nome, areaId, cargo, email, perfil, criadoEm: new Date().toISOString() };
                if(useMocks) {
                    data.id = generateId();
                    data.senha = senha;
                    mockDB.colaboradores.push(data);
                    saveMocks();
                } else {
                    if (secondaryAuth) {
                        const userCred = await createUserWithEmailAndPassword(secondaryAuth, email, senha);
                        data.uid = userCred.user.uid;
                    }
                    data.criadoEm = serverTimestamp();
                    await addDoc(collection(db, "colaboradores"), data);
                }
                alert('Colaborador salvo com sucesso!');
            }

            window.crudController.closeModal('modal-colaborador');
            if(window.appController) window.appController.loadData();
        } catch(error) {
            console.error("Erro ao salvar colaborador:", error);
            alert("Erro ao salvar: " + error.message);
        }
    },

    salvarMeta: async () => {
        const titulo = document.getElementById('meta-titulo').value;
        const tipo = document.getElementById('meta-tipo').value;
        const areaId = document.getElementById('meta-area').value;
        const colabId = document.getElementById('meta-colab').value;

        if(!titulo) return alert('Título é obrigatório.');

        const isEditing = window.crudController.activeEditId && window.crudController.activeEditCollection === 'metas';

        if (isEditing) {
            const id = window.crudController.activeEditId;
            if(useMocks) {
                const idx = mockDB.metas.findIndex(m => m.id === id);
                if (idx !== -1) {
                    mockDB.metas[idx] = { 
                        ...mockDB.metas[idx], 
                        titulo, 
                        tipo, 
                        areaId: tipo === 'AREA' ? areaId : null, 
                        colaboradorId: tipo === 'COLABORADOR' ? colabId : null 
                    };
                    saveMocks();
                }
            } else {
                const updateData = { 
                    titulo, 
                    tipo, 
                    areaId: tipo === 'AREA' ? areaId : null, 
                    colaboradorId: tipo === 'COLABORADOR' ? colabId : null 
                };
                await updateDoc(doc(db, "metas", id), updateData);
            }
            alert('Indicador atualizado!');
        } else {
            const data = { titulo, tipo, areaId: tipo === 'AREA' ? areaId : null, colaboradorId: tipo === 'COLABORADOR' ? colabId : null, criadoEm: new Date().toISOString() };
            if(useMocks) {
                data.id = generateId();
                mockDB.metas.push(data);
                saveMocks();
            } else {
                data.criadoEm = serverTimestamp();
                await addDoc(collection(db, "metas"), data);
            }
            alert('Indicador salvo!');
        }

        window.crudController.closeModal('modal-meta');
        if(window.appController) window.appController.loadData();
    },

    salvarLancamento: async () => {
        const metaId = document.getElementById('lanc-meta').value;
        const mes = parseInt(document.getElementById('lanc-mes').value);
        const ano = parseInt(document.getElementById('lanc-ano').value);
        const previsto = parseFloat(document.getElementById('lanc-previsto').value);
        const realizado = parseFloat(document.getElementById('lanc-realizado').value);
        const observacoes = document.getElementById('lanc-obs').value;

        if(!metaId || isNaN(previsto) || isNaN(realizado)) return alert('Preencha os campos corretamente.');

        const isEditing = window.crudController.activeEditId && window.crudController.activeEditCollection === 'lancamentos';

        if (isEditing) {
            const id = window.crudController.activeEditId;
            if(useMocks) {
                const idx = mockDB.lancamentos.findIndex(l => l.id === id);
                if (idx !== -1) {
                    mockDB.lancamentos[idx] = { ...mockDB.lancamentos[idx], metaId, mes, ano, previsto, realizado, observacoes };
                    saveMocks();
                }
            } else {
                const updateData = { metaId, mes, ano, previsto, realizado, observacoes };
                await updateDoc(doc(db, "lancamentos_metas", id), updateData);
            }
            alert('Lançamento atualizado!');
        } else {
            const data = { metaId, mes, ano, previsto, realizado, observacoes, criadoEm: new Date().toISOString() };
            if(useMocks) {
                data.id = generateId();
                mockDB.lancamentos.push(data);
                saveMocks();
            } else {
                data.criadoEm = serverTimestamp();
                await addDoc(collection(db, "lancamentos_metas"), data);
            }
            alert('Lançamento salvo!');
        }

        window.crudController.closeModal('modal-lancamento');
        if(window.appController) window.appController.loadData();
    },

    excluirItem: async (colecao, id) => {
        if(!confirm("Tem certeza que deseja excluir este item permanentemente?")) return;
        
        try {
            if(useMocks) {
                mockDB[colecao] = mockDB[colecao].filter(item => item.id !== id);
                saveMocks();
            } else {
                const fireCollection = (colecao === 'lancamentos') ? 'lancamentos_metas' : colecao;
                await deleteDoc(doc(db, fireCollection, id));
            }
            alert('Item excluído com sucesso!');
            if(window.appController) window.appController.loadData();
        } catch(e) {
            console.error("Erro ao excluir", e);
            alert("Erro ao excluir item: " + e.message);
        }
    },

    editarItem: async (colecao, id) => {
        window.crudController.activeEditId = id;
        window.crudController.activeEditCollection = colecao;
        
        let item = null;
        if (useMocks) {
            item = mockDB[colecao].find(x => x.id === id);
        } else {
            if (window.appController && window.appController.dashboard && window.appController.dashboard.dados) {
                item = window.appController.dashboard.dados[colecao].find(x => x.id === id);
            }
        }
        
        if (!item) {
            alert("Item não encontrado para edição.");
            return;
        }
        
        if (colecao === 'areas') {
            document.getElementById('area-nome').value = item.nome;
            document.getElementById('area-descricao').value = item.descricao || '';
            
            const titleEl = document.querySelector('#modal-area .modal-title');
            if(titleEl) titleEl.innerText = "Editar Área";
            window.crudController.openModal('modal-area');
        } 
        else if (colecao === 'colaboradores') {
            document.getElementById('colab-nome').value = item.nome;
            await window.crudController.loadAreaSelects();
            document.getElementById('colab-area').value = item.areaId;
            document.getElementById('colab-cargo').value = item.cargo;
            document.getElementById('colab-email').value = item.email;
            
            // Password not strictly required on edit
            const senhaInput = document.getElementById('colab-senha');
            if (senhaInput) {
                senhaInput.value = '';
                senhaInput.placeholder = 'Deixe em branco para não alterar';
                senhaInput.required = false;
            }
            
            document.getElementById('colab-perfil').value = item.perfil;
            
            const titleEl = document.querySelector('#modal-colaborador .modal-title');
            if(titleEl) titleEl.innerText = "Editar Colaborador";
            window.crudController.openModal('modal-colaborador');
        } 
        else if (colecao === 'metas') {
            document.getElementById('meta-titulo').value = item.titulo;
            document.getElementById('meta-tipo').value = item.tipo;
            window.crudController.toggleMetaTipo();
            
            if (item.tipo === 'AREA') {
                await window.crudController.loadAreaSelects();
                document.getElementById('meta-area').value = item.areaId;
            } else {
                await window.crudController.loadColabSelects();
                document.getElementById('meta-colab').value = item.colaboradorId;
            }
            
            const titleEl = document.querySelector('#modal-meta .modal-title');
            if(titleEl) titleEl.innerText = "Editar Indicador";
            window.crudController.openModal('modal-meta');
        } 
        else if (colecao === 'lancamentos') {
            await window.crudController.loadMetaSelects();
            document.getElementById('lanc-meta').value = item.metaId;
            document.getElementById('lanc-mes').value = item.mes;
            document.getElementById('lanc-ano').value = item.ano;
            document.getElementById('lanc-previsto').value = item.previsto;
            document.getElementById('lanc-realizado').value = item.realizado;
            document.getElementById('lanc-obs').value = item.observacoes || '';
            
            const titleEl = document.querySelector('#modal-lancamento .modal-title');
            if(titleEl) titleEl.innerText = "Editar Lançamento";
            window.crudController.openModal('modal-lancamento');
        }
    },

    loadAreaSelects: async () => {
        let areas = [];
        if(useMocks) areas = mockDB.areas;
        else {
            const querySnapshot = await getDocs(collection(db, "areas"));
            querySnapshot.forEach((doc) => { areas.push({id: doc.id, ...doc.data()}); });
        }
        
        let html = '<option value="">Selecione...</option>';
        areas.forEach(a => html += `<option value="${a.id}">${a.nome}</option>`);
        
        if(document.getElementById('colab-area')) document.getElementById('colab-area').innerHTML = html;
        if(document.getElementById('meta-area')) document.getElementById('meta-area').innerHTML = html;
        if(document.getElementById('filter-area')) document.getElementById('filter-area').innerHTML = html;
    },

    loadColabSelects: async () => {
        let colabs = [];
        if(useMocks) colabs = mockDB.colaboradores;
        else {
            const querySnapshot = await getDocs(collection(db, "colaboradores"));
            querySnapshot.forEach((doc) => { colabs.push({id: doc.id, ...doc.data()}); });
        }

        let html = '<option value="">Selecione...</option>';
        colabs.forEach(c => html += `<option value="${c.id}">${c.nome}</option>`);
        
        if(document.getElementById('meta-colab')) document.getElementById('meta-colab').innerHTML = html;
        if(document.getElementById('filter-colaborador')) document.getElementById('filter-colaborador').innerHTML = html;
    },

    loadMetaSelects: async () => {
        let metas = [];
        if(useMocks) metas = mockDB.metas;
        else {
            const querySnapshot = await getDocs(collection(db, "metas"));
            querySnapshot.forEach((doc) => { metas.push({id: doc.id, ...doc.data()}); });
        }

        let html = '<option value="">Selecione...</option>';
        metas.forEach(m => html += `<option value="${m.id}">${m.titulo}</option>`);
        
        if(document.getElementById('lanc-meta')) document.getElementById('lanc-meta').innerHTML = html;
    },
    
    getDadosGerais: async () => {
        if(useMocks) {
            return {
                areas: mockDB.areas,
                colaboradores: mockDB.colaboradores,
                metas: mockDB.metas,
                lancamentos: mockDB.lancamentos
            }
        } else {
            const [snapA, snapC, snapM, snapL] = await Promise.all([
                getDocs(collection(db, "areas")),
                getDocs(collection(db, "colaboradores")),
                getDocs(collection(db, "metas")),
                getDocs(collection(db, "lancamentos_metas"))
            ]);
            
            return {
                areas: snapA.docs.map(d => ({id: d.id, ...d.data()})),
                colaboradores: snapC.docs.map(d => ({id: d.id, ...d.data()})),
                metas: snapM.docs.map(d => ({id: d.id, ...d.data()})),
                lancamentos: snapL.docs.map(d => ({id: d.id, ...d.data()}))
            }
        }
    },

    getUserProfile: async (email) => {
        if (!email) return 'LANCADOR';
        if (email === 'admin@poliscon.com' || email.includes('Administrador')) return 'ADMIN'; // Fallback offline admin
        
        try {
            if (useMocks) {
                const colab = mockDB.colaboradores.find(c => c.email === email);
                return colab ? colab.perfil : 'LANCADOR';
            } else {
                const q = query(collection(db, "colaboradores"), where("email", "==", email));
                const snap = await getDocs(q);
                if (!snap.empty) {
                    // Se achou na lista mas não tem perfil salvo (cadastro antigo), assume como ADMIN
                    return snap.docs[0].data().perfil || 'ADMIN';
                } else {
                    // Se o usuário está no Auth (conseguiu logar) mas não existe na coleção de colaboradores, 
                    // significa que é o dono original do sistema (criado no console do Firebase).
                    return 'ADMIN'; 
                }
            }
        } catch(e) {
            console.error("Erro ao buscar perfil", e);
        }
        return 'ADMIN'; // Garante o acesso total ao dono original caso haja falha
    }
};

export { useMocks, mockDB };
