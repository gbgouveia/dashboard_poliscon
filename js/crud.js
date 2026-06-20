import { db, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, serverTimestamp } from './firebase.js';

// Mocks for Local Storage if Firebase is not configured (offline mode demo)
let useMocks = !db;

// Mock Data structure
const mockDB = {
    areas: JSON.parse(localStorage.getItem('polis_areas')) || [],
    colaboradores: JSON.parse(localStorage.getItem('polis_colaboradores')) || [],
    metas: JSON.parse(localStorage.getItem('polis_metas')) || [],
    lancamentos: JSON.parse(localStorage.getItem('polis_lancamentos')) || []
};

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
    openModal: (id) => {
        document.getElementById(id).classList.add('active');
        // Refresh selects if needed
        if(id === 'modal-colaborador') window.crudController.loadAreaSelects();
        if(id === 'modal-meta') {
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
        window.crudController.closeModal('modal-area');
        if(window.appController) window.appController.loadData();
    },

    salvarColaborador: async () => {
        const nome = document.getElementById('colab-nome').value;
        const areaId = document.getElementById('colab-area').value;
        const cargo = document.getElementById('colab-cargo').value;
        
        if(!nome || !areaId || !cargo) return alert('Preencha todos os campos.');

        const data = { nome, areaId, cargo, criadoEm: new Date().toISOString() };

        if(useMocks) {
            data.id = generateId();
            mockDB.colaboradores.push(data);
            saveMocks();
        } else {
            data.criadoEm = serverTimestamp();
            await addDoc(collection(db, "colaboradores"), data);
        }

        alert('Colaborador salvo!');
        window.crudController.closeModal('modal-colaborador');
        if(window.appController) window.appController.loadData();
    },

    salvarMeta: async () => {
        const titulo = document.getElementById('meta-titulo').value;
        const tipo = document.getElementById('meta-tipo').value;
        const areaId = document.getElementById('meta-area').value;
        const colabId = document.getElementById('meta-colab').value;

        if(!titulo) return alert('Título é obrigatório.');

        const data = { titulo, tipo, areaId: tipo === 'AREA' ? areaId : null, colaboradorId: tipo === 'COLABORADOR' ? colabId : null, criadoEm: new Date().toISOString() };

        if(useMocks) {
            data.id = generateId();
            mockDB.metas.push(data);
            saveMocks();
        } else {
            data.criadoEm = serverTimestamp();
            await addDoc(collection(db, "metas"), data);
        }

        alert('Meta salva!');
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
        window.crudController.closeModal('modal-lancamento');
        if(window.appController) window.appController.loadData();
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
    }
};

export { useMocks, mockDB };
