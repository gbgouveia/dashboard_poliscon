import { auth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from './firebase.js';
import { DashboardController } from './dashboard.js';
import './crud.js';

class AppController {
    constructor() {
        this.dashboard = new DashboardController();
        this.initAuth();
        this.initRouting();
        this.initListeners();
    }

    initAuth() {
        const loginForm = document.getElementById('login-form');
        
        if(loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const email = document.getElementById('email').value;
                const pwd = document.getElementById('password').value;
                const errDiv = document.getElementById('login-error');
                
                try {
                    if(auth) {
                        await signInWithEmailAndPassword(auth, email, pwd);
                    } else {
                        if(email === 'admin@poliscon.com') {
                            this.showApp({ email: 'Administrador (Offline Mode)' });
                        } else {
                            throw new Error("Credenciais inválidas no modo offline. Use admin@poliscon.com");
                        }
                    }
                } catch(error) {
                    errDiv.style.display = 'block';
                    errDiv.innerText = error.message;
                }
            });
        }

        document.getElementById('btn-logout').addEventListener('click', () => {
            if(auth) signOut(auth);
            else this.showLogin();
        });

        if(auth) {
            onAuthStateChanged(auth, (user) => {
                if(user) this.showApp(user);
                else this.showLogin();
            });
        }
    }

    showApp(user) {
        document.getElementById('login-section').classList.add('hidden');
        document.getElementById('app-section').classList.remove('hidden');
        document.getElementById('user-name-display').innerText = user.email || 'Usuário';
        this.loadData();
    }

    showLogin() {
        document.getElementById('app-section').classList.add('hidden');
        document.getElementById('login-section').classList.remove('hidden');
    }

    async loadData() {
        try {
            const dados = await window.crudController.getDadosGerais();
            this.dashboard.setData(dados);
            
            window.crudController.loadAreaSelects();
            window.crudController.loadColabSelects();
        } catch(e) {
            console.error("Erro ao carregar dados", e);
        }
    }

    initRouting() {
        const navItems = document.querySelectorAll('.nav-item[data-target]');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                navItems.forEach(n => n.classList.remove('active'));
                item.classList.add('active');

                document.querySelectorAll('.view-content').forEach(v => v.classList.add('hidden'));

                const target = item.getAttribute('data-target');
                document.getElementById('view-' + target).classList.remove('hidden');

                document.getElementById('page-title').innerText = item.innerText.trim();
            });
        });
    }

    initListeners() {
        // Filtros Dashboard
        document.getElementById('btn-filtrar-area').addEventListener('click', () => {
            const area = document.getElementById('filter-area').value;
            const mes = document.getElementById('filter-mes-area').value;
            const ano = document.getElementById('filter-ano-area').value;
            this.dashboard.updateDashboardArea(area, mes, ano);
        });

        document.getElementById('btn-filtrar-colab').addEventListener('click', () => {
            const colab = document.getElementById('filter-colaborador').value;
            const ano = document.getElementById('filter-ano-colab').value;
            this.dashboard.updateDashboardColaborador(colab, ano);
        });

        // Mobile Menu
        const btnMenu = document.getElementById('btn-mobile-menu');
        const sidebar = document.querySelector('.sidebar');
        if (btnMenu && sidebar) {
            btnMenu.addEventListener('click', () => {
                sidebar.classList.toggle('open');
            });
            
            // Fechar sidebar ao clicar em um link no celular
            document.querySelectorAll('.nav-item').forEach(item => {
                item.addEventListener('click', () => {
                    if (window.innerWidth <= 768) {
                        sidebar.classList.remove('open');
                    }
                });
            });
        }
    }
}

window.appController = new AppController();
