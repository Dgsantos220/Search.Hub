export const translations: any = {
    'pt-BR': {
        nav: {
            history: 'HISTÓRICO',
            profile: 'PERFIL',
            config: 'CONFIG',
            logout: 'Sair',
            apiStatus: 'API STATUS: ONLINE',
            admin: 'Painel Admin',
            support: 'Suporte',
        },
        dashboard: {
            hero: {
                system: 'Sistema Operacional v2.0',
                description: 'Plataforma de inteligência avançada para recuperação e análise de dados.'
            },
            recent: {
                title: 'Buscas Recentes',
                empty: 'Nenhum histórico recente'
            },
            menu: {
                title: 'Menu do Sistema'
            },
            footer: {
                secure: 'Ambiente Seguro • Criptografia Ponta a Ponta',
                rights: 'Todos os direitos reservados.'
            }
        },
        settings: {
            title: 'Configurações',
            subtitle: 'Gerencie suas preferências e segurança',
            tabs: { preferences: 'Preferências', notifications: 'Notificações', security: 'Segurança', plan: 'Assinatura' },
            preferences: { title: 'Preferências do Sistema', theme: 'Tema', language: 'Idioma', timezone: 'Fuso Horário', save: 'Salvar Preferências', saving: 'Salvando...' },
            notifications: { title: 'Configurações de Notificações', email: 'Notificações por Email', emailDesc: 'Receba atualizações importantes por email', push: 'Notificações Push', pushDesc: 'Receba notificações no navegador', save: 'Salvar Notificações', saving: 'Salvando...' },
            security: { title: 'Segurança da Conta', '2fa': 'Autenticação de Dois Fatores (2FA)', '2faDesc': 'Adicione uma camada extra de segurança', enable: 'Ativar', disable: 'Desativar', changePw: 'Alterar Senha', currentPw: 'Senha Atual', currentPwPlace: 'Digite sua senha atual', newPw: 'Nova Senha', newPwPlace: 'Digite a nova senha', confirmPw: 'Confirmar Nova Senha', confirmPwPlace: 'Confirme a nova senha', savePw: 'Alterar Senha', saving: 'Salvando...' },
            plan: { title: 'Sua Assinatura', active: 'Plano Ativo', status: 'Status', price: 'Valor', nextBilling: 'Próxima Cobrança', noPlan: 'Você não possui um plano ativo.', upgrade: 'Ver Planos', manage: 'Gerenciar Assinatura' }
        },
        profile: {
            title: 'Meu Perfil',
            subtitle: 'Gerencie suas informações pessoais',
            edit: 'Editar',
            cancel: 'Cancelar',
            save: 'Salvar',
            saving: 'Salvando...',
            memberSince: 'Membro desde',
            name: 'Nome Completo',
            email: 'Email',
            phone: 'Telefone',
            notProvided: 'Não informado',
            toast: { success: 'Perfil atualizado com sucesso' }
        },
        auth: {
            email: 'Email',
            password: 'Senha',
            remember: 'LEMBRAR ACESSO',
            forgotPassword: 'ESQUECEU A SENHA?',
            register: 'SOLICITAR ACESSO',
            login: {
                heroTitle: 'Login',
                heroSubtitle: 'PORTAL DE ACESSO SEGURO v2.0',
                authenticating: 'AUTENTICANDO...',
                action: 'ACESSAR TERMINAL',
                footer: 'ACESSO RESTRITO. TODAS AS AÇÕES SÃO REGISTRADAS.'
            },
            registerPage: {
                title: 'Cadastro',
                heroTitle: 'Solicitar Acesso',
                heroSubtitle: 'JUNTE-SE À REDE DE INTELIGÊNCIA',
                fullName: 'Nome Completo',
                emailLabel: 'Email Corporativo',
                confirmPassword: 'Confirmar',
                processing: 'PROCESSANDO...',
                submit: 'SOLICITAR ACESSO',
                loginLink: 'JÁ TEM UMA CONTA? ENTRAR'
            },
            forgot: {
                title: 'Recuperar Senha',
                heroTitle: 'Recuperar Acesso',
                heroSubtitle: 'PROTOCOLO DE VERIFICAÇÃO DE IDENTIDADE',
                emailLabel: 'Email Cadastrado',
                sending: 'ENVIANDO LINK...',
                submit: 'REDEFINIR CREDENCIAIS',
                successTitle: 'LINK ENVIADO COM SUCESSO',
                successDescBefore: 'Um link seguro foi enviado para',
                successDescAfter: '. Por favor, verifique sua caixa de entrada dentro de 15 minutos.',
                backLink: 'VOLTAR PARA O LOGIN'
            }
        },
        landing: {
            nav: { enter: 'Entrar', start: 'Começar Agora' },
            hero: { badge: 'NOVA GERAÇÃO DE BUSCA DE DADOS', title1: 'Inteligência de Dados', title2: 'Sem Fronteiras.', desc: 'Acesse informações críticas em milissegundos. Nossa plataforma centraliza dados de múltiplas fontes em uma interface única, poderosa e segura.', ctaRequest: 'Criar Conta Gratuita', ctaDemo: 'Acessar Demo' },
            features: { unified: { title: 'Base Unificada', desc: 'Conectamos dezenas de bases públicas e privadas em um único ponto de acesso via API ou Dashboard.' }, smart: { title: 'Busca Inteligente', desc: 'Algoritmos avançados que encontram correlações entre pessoas, empresas e veículos automaticamente.' }, national: { title: 'Cobertura Nacional', desc: 'Dados atualizados de todo o território nacional, com disponibilidade de 99.9% e baixa latência.' } },
            trusted: 'CONFIADO POR EMPRESAS LÍDERES EM COMPLIANCE',
            how: { title: 'Como Funciona?', desc: 'Puxar dados cadastrais nunca foi tão simples. Localize informações completas em segundos.', step1: { title: 'Escolha o Tipo', desc: 'Selecione entre CPF, CNPJ ou busca por nome em nossa base atualizada.' }, step2: { title: 'Puxe os Dados', desc: 'Digite o CPF ou CNPJ. Nosso sistema localiza instantaneamente em tempo real.' }, step3: { title: 'Receba Tudo', desc: 'Obtenha telefones, endereços, antecedentes e dados completos organizados.' } },
            cpf: { title: 'Localizar Pessoa pelo CPF', desc: 'O Search.Hub oferece o sistema mais completo para localizar pessoas pelo CPF. Acesse informações cadastrais atualizadas, endereços, telefones e dados completos em segundos.', check1: { title: 'Dados Completos', desc: 'Nome, data de nascimento, situação cadastral' }, check2: { title: 'Contatos Atualizados', desc: 'Telefones, celulares, e-mail e endereços' }, check3: { title: 'Histórico Completo', desc: 'Endereços anteriores, vínculos familiares e empresariais' }, cta: 'Localizar Pessoa Agora', demo: { title: 'Dados protegidos e criptografados', labelCpf: 'CPF CONSULTADO', labelName: 'Nome', labelStatus: 'Status', labelPhones: 'Telefones', labelAddr: 'Endereços' } },
            modules: { title: 'Módulos Especializados', desc: 'Explore nossos módulos para localizar pessoas, empresas e verificar antecedentes', cards: { cpf: { title: 'Consulta CPF', desc: 'Localizar pessoa pelo CPF com dados completos' }, name: { title: 'Busca por Nome', desc: 'Sistema de busca de pessoas pelo nome completo' }, phone: { title: 'Consulta por Telefone', desc: 'Puxar dados de telefone e localizar proprietário' }, relatives: { title: 'Parentes', desc: 'Encontre parentes pelo CPF com vínculos familiares' }, photos: { title: 'Fotos CPF', desc: 'Encontrar a foto e informações do CPF' }, cnpj: { title: 'Consulta CNPJ', desc: 'Dados empresariais da Receita Federal' } } },
            why: { title: 'Por que Search.Hub?', subtitle: 'O painel mais completo e profissional do mercado', cards: { realtime: { title: 'Tempo Real', desc: 'Painel puxa dados em menos de 3 segundos com acesso às bases atualizadas 2025.' }, location: { title: 'Localização Avançada', desc: 'Geolocalização e rastreamento de endereços atuais e históricos com mapeamento de conexões.' }, security: { title: 'Segurança & LGPD', desc: 'Criptografia de ponta a ponta com conformidade total à LGPD e segurança jurídica.' }, reports: { title: 'Relatórios PDF', desc: 'Gere relatórios profissionais, crie dossiês completos e exporte para análise detalhada.' } } },
            stats: { accuracy: 'Precisão dos Dados', time: 'Tempo de Resposta', modules: 'Módulos de Consulta' },
            footer: { ready: 'Pronto para Começar?', desc: 'Junte-se a milhares de empresas, advogados e profissionais que confiam no Search.Hub para decisões estratégicas e validação de dados.', ctaPanel: 'Acessar Painel Agora', ctaWhatsapp: 'Fale no WhatsApp', terms: 'Termos', privacy: 'Privacidade', contact: 'Contato', rights: 'Search.Hub 2025' }
        }
    },
    'en': {
        nav: {
            history: 'HISTORY',
            profile: 'PROFILE',
            config: 'CONFIG',
            logout: 'Logout',
            apiStatus: 'API STATUS: ONLINE',
            admin: 'Admin Panel',
            support: 'Support',
        },
        dashboard: {
            hero: {
                system: 'Operating System v2.0',
                description: 'Advanced intelligence platform for data recovery and analysis.'
            },
            recent: {
                title: 'Recent Searches',
                empty: 'No recent history'
            },
            menu: {
                title: 'System Menu'
            },
            footer: {
                secure: 'Secure Environment • End-to-End Encryption',
                rights: 'All rights reserved.'
            }
        },
        settings: {
            title: 'Settings',
            subtitle: 'Manage your preferences and security',
            tabs: { preferences: 'Preferences', notifications: 'Notifications', security: 'Security', plan: 'Subscription' },
            preferences: { title: 'System Preferences', theme: 'Theme', language: 'Language', timezone: 'Timezone', save: 'Save Preferences', saving: 'Saving...' },
            notifications: { title: 'Notification Settings', email: 'Email Notifications', emailDesc: 'Receive important updates via email', push: 'Push Notifications', pushDesc: 'Receive notifications in the browser', save: 'Save Notifications', saving: 'Saving...' },
            security: { title: 'Account Security', '2fa': 'Two-Factor Authentication (2FA)', '2faDesc': 'Add an extra layer of security', enable: 'Enable', disable: 'Disable', changePw: 'Change Password', currentPw: 'Current Password', currentPwPlace: 'Enter current password', newPw: 'New Password', newPwPlace: 'Enter new password', confirmPw: 'Confirm New Password', confirmPwPlace: 'Confirm new password', savePw: 'Change Password', saving: 'Saving...' },
            plan: { title: 'Your Subscription', active: 'Active Plan', status: 'Status', price: 'Price', nextBilling: 'Next Billing', noPlan: 'You do not have an active plan.', upgrade: 'View Plans', manage: 'Manage Subscription' }
        },
        profile: {
            title: 'My Profile',
            subtitle: 'Manage your personal information',
            edit: 'Edit',
            cancel: 'Cancel',
            save: 'Save',
            saving: 'Saving...',
            memberSince: 'Member since',
            name: 'Full Name',
            email: 'Email',
            phone: 'Phone',
            notProvided: 'Not provided',
            toast: { success: 'Profile updated successfully' }
        },
        auth: {
            email: 'Email',
            password: 'Password',
            remember: 'REMEMBER ACCESS',
            forgotPassword: 'FORGOT PASSWORD?',
            register: 'REQUEST ACCESS',
            login: {
                heroTitle: 'Login',
                heroSubtitle: 'SECURE ACCESS PORTAL v2.0',
                authenticating: 'AUTHENTICATING...',
                action: 'ACCESS TERMINAL',
                footer: 'RESTRICTED ACCESS. ALL ACTIONS ARE LOGGED.'
            },
            registerPage: {
                title: 'Register',
                heroTitle: 'Request Access',
                heroSubtitle: 'JOIN THE INTELLIGENCE NETWORK',
                fullName: 'Full Name',
                emailLabel: 'Corporate Email',
                confirmPassword: 'Confirm',
                processing: 'PROCESSING...',
                submit: 'REQUEST ACCESS',
                loginLink: 'ALREADY HAVE AN ACCOUNT? LOGIN'
            },
            forgot: {
                title: 'Recover Password',
                heroTitle: 'Recover Access',
                heroSubtitle: 'IDENTITY VERIFICATION PROTOCOL',
                emailLabel: 'Registered Email',
                sending: 'SENDING LINK...',
                submit: 'RESET CREDENTIALS',
                successTitle: 'LINK SENT SUCCESSFULLY',
                successDescBefore: 'A secure link was sent to',
                successDescAfter: '. Please check your inbox within 15 minutes.',
                backLink: 'BACK TO LOGIN'
            }
        },
        landing: {
            nav: { enter: 'Login', start: 'Start Now' },
            hero: { badge: 'NEW DATA SEARCH GENERATION', title1: 'Data Intelligence', title2: 'Without Borders.', desc: 'Access critical information in milliseconds. Our platform centralizes data from multiple sources into a single, powerful, and secure interface.', ctaRequest: 'Create Free Account', ctaDemo: 'Access Demo' },
            features: { unified: { title: 'Unified Base', desc: 'We connect dozens of public and private databases in a single access point via API or Dashboard.' }, smart: { title: 'Smart Search', desc: 'Advanced algorithms that automatically find correlations between people, companies, and vehicles.' }, national: { title: 'National Coverage', desc: 'Updated data from the entire national territory, with 99.9% availability and low latency.' } },
            trusted: 'TRUSTED BY LEADING COMPLIANCE COMPANIES',
            how: { title: 'How It Works?', desc: 'Pulling registration data has never been so simple. Locate complete information in seconds.', step1: { title: 'Choose Type', desc: 'Select between CPF, CNPJ, or name search in our updated database.' }, step2: { title: 'Pull Data', desc: 'Enter the CPF or CNPJ. Our system locates instantly in real-time.' }, step3: { title: 'Receive All', desc: 'Get phones, addresses, records, and complete organized data.' } },
            cpf: { title: 'Locate Person by CPF', desc: 'Search.Hub offers the most complete system to locate people by CPF. Access updated registration information, addresses, phones, and complete data in seconds.', check1: { title: 'Complete Data', desc: 'Name, date of birth, registration status' }, check2: { title: 'Updated Contacts', desc: 'Phones, mobile, email, and addresses' }, check3: { title: 'Complete History', desc: 'Previous addresses, family, and business links' }, cta: 'Locate Person Now', demo: { title: 'Protected and encrypted data', labelCpf: 'CPF QUERY', labelName: 'Name', labelStatus: 'Status', labelPhones: 'Phones', labelAddr: 'Addresses' } },
            modules: { title: 'Specialized Modules', desc: 'Explore our modules to locate people, companies, and verify records', cards: { cpf: { title: 'CPF Query', desc: 'Locate person by CPF with complete data' }, name: { title: 'Name Search', desc: 'Person search system by full name' }, phone: { title: 'Phone Query', desc: 'Pull phone data and locate owner' }, relatives: { title: 'Relatives', desc: 'Find relatives by CPF with family ties' }, photos: { title: 'CPF Photos', desc: 'Find photo and CPF information' }, cnpj: { title: 'CNPJ Query', desc: 'Corporate data from Federal Revenue' } } },
            why: { title: 'Why Search.Hub?', subtitle: 'The most complete and professional panel on the market', cards: { realtime: { title: 'Real Time', desc: 'Panel pulls data in less than 3 seconds with access to updated 2025 databases.' }, location: { title: 'Advanced Location', desc: 'Geolocation and tracking of current and historical addresses with connection mapping.' }, security: { title: 'Security & GDPR', desc: 'End-to-end encryption with full GDPR compliance and legal security.' }, reports: { title: 'PDF Reports', desc: 'Generate professional reports, create complete dossiers, and export for detailed analysis.' } } },
            stats: { accuracy: 'Data Accuracy', time: 'Response Time', modules: 'Query Modules' },
            footer: { ready: 'Ready to Start?', desc: 'Join thousands of companies, lawyers, and professionals who trust Search.Hub for strategic decisions and data validation.', ctaPanel: 'Access Panel Now', ctaWhatsapp: 'Talk on WhatsApp', terms: 'Terms', privacy: 'Privacy', contact: 'Contact', rights: 'Search.Hub 2025' }
        }
    },
    'es': {
        nav: {
            history: 'HISTORIAL',
            profile: 'PERFIL',
            config: 'CONFIG',
            logout: 'Salir',
            apiStatus: 'API ESTADO: ONLINE',
            admin: 'Panel Admin',
            support: 'Soporte',
        },
        dashboard: {
            hero: {
                system: 'Sistema Operativo v2.0',
                description: 'Plataforma de inteligencia avanzada para recuperación y análisis de datos.'
            },
            recent: {
                title: 'Búsquedas Recientes',
                empty: 'Sin historial reciente'
            },
            menu: {
                title: 'Menú del Sistema'
            },
            footer: {
                secure: 'Entorno Seguro • Cifrado de Extremo a Extremo',
                rights: 'Todos los derechos reservados.'
            }
        },
        settings: {
            title: 'Configuraciones',
            subtitle: 'Administra tus preferencias y seguridad',
            tabs: { preferences: 'Preferencias', notifications: 'Notificaciones', security: 'Seguridad', plan: 'Suscripción' },
            preferences: { title: 'Preferencias del Sistema', theme: 'Tema', language: 'Idioma', timezone: 'Zona Horaria', save: 'Guardar Preferencias', saving: 'Guardando...' },
            notifications: { title: 'Configuraciones de Notificaciones', email: 'Notificaciones por Correo', emailDesc: 'Recibe actualizaciones importantes por correo', push: 'Notificaciones Push', pushDesc: 'Recibe notificaciones en el navegador', save: 'Guardar Notificaciones', saving: 'Guardando...' },
            security: { title: 'Seguridad de la Cuenta', '2fa': 'Autenticación de Dos Factores (2FA)', '2faDesc': 'Añade una capa extra de seguridad', enable: 'Activar', disable: 'Desactivar', changePw: 'Cambiar Contraseña', currentPw: 'Contraseña Actual', currentPwPlace: 'Ingresa tu contraseña actual', newPw: 'Nueva Contraseña', newPwPlace: 'Ingresa la nueva contraseña', confirmPw: 'Confirmar Nueva Contraseña', confirmPwPlace: 'Confirma la nueva contraseña', savePw: 'Cambiar Contraseña', saving: 'Guardando...' },
            plan: { title: 'Tu Suscripción', active: 'Plan Activo', status: 'Estado', price: 'Precio', nextBilling: 'Próxima Facturación', noPlan: 'No tienes un plan activo.', upgrade: 'Ver Planes', manage: 'Gestionar Suscripción' }
        },
        profile: {
            title: 'Mi Perfil',
            subtitle: 'Administra tu información personal',
            edit: 'Editar',
            cancel: 'Cancelar',
            save: 'Guardar',
            saving: 'Guardando...',
            memberSince: 'Miembro desde',
            name: 'Nombre Completo',
            email: 'Email',
            phone: 'Teléfono',
            notProvided: 'No informado',
            toast: { success: 'Perfil actualizado con éxito' }
        },
        auth: {
            email: 'Email',
            password: 'Contraseña',
            remember: 'RECORDAR ACCESO',
            forgotPassword: '¿OLVIDASTE LA CONTRASEÑA?',
            register: 'SOLICITAR ACCESO',
            login: {
                heroTitle: 'Iniciar Sesión',
                heroSubtitle: 'PORTAL DE ACCESO SEGURO v2.0',
                authenticating: 'AUTENTICANDO...',
                action: 'ACCEDER TERMINAL',
                footer: 'ACCESO RESTRINGIDO. TODAS LAS ACCIONES SON REGISTRADAS.'
            },
            registerPage: {
                title: 'Registro',
                heroTitle: 'Solicitar Acceso',
                heroSubtitle: 'ÚNETE A LA RED DE INTELIGENCIA',
                fullName: 'Nombre Completo',
                emailLabel: 'Email Corporativo',
                confirmPassword: 'Confirmar',
                processing: 'PROCESANDO...',
                submit: 'SOLICITAR ACCESO',
                loginLink: '¿YA TIENES UNA CUENTA? ENTRAR'
            },
            forgot: {
                title: 'Recuperar Contraseña',
                heroTitle: 'Recuperar Acceso',
                heroSubtitle: 'PROTOCOLO DE VERIFICACIÓN DE IDENTIDAD',
                emailLabel: 'Email Registrado',
                sending: 'ENVIANDO ENLACE...',
                submit: 'REESTABLECER CREDENCIALES',
                successTitle: 'ENLACE ENVIADO CON ÉXITO',
                successDescBefore: 'Se ha enviado un enlace seguro a',
                successDescAfter: '. Por favor, revisa tu bandeja de entrada en 15 minutos.',
                backLink: 'VOLVER AL LOGIN'
            }
        },
        landing: {
            nav: { enter: 'Entrar', start: 'Comenzar Ahora' },
            hero: { badge: 'NUEVA GENERACIÓN DE BÚSQUEDA DE DATOS', title1: 'Inteligencia de Datos', title2: 'Sin Fronteras.', desc: 'Accede a información crítica en milisegundos. Nuestra plataforma centraliza datos de múltiples fuentes en una interfaz única, potente y segura.', ctaRequest: 'Crear Cuenta Gratuita', ctaDemo: 'Acceder Demo' },
            features: { unified: { title: 'Base Unificada', desc: 'Conectamos decenas de bases públicas y privadas en un único punto de acceso vía API o Dashboard.' }, smart: { title: 'Búsqueda Inteligente', desc: 'Algoritmos avanzados que encuentran correlaciones entre personas, empresas y vehículos automáticamente.' }, national: { title: 'Cobertura Nacional', desc: 'Datos actualizados de todo el territorio nacional, con disponibilidad del 99.9% y baja latencia.' } },
            trusted: 'CONFIADO POR EMPRESAS LÍDERES EN CUMPLIMIENTO',
            how: { title: '¿Cómo Funciona?', desc: 'Extraer datos registrales nunca fue tan simple. Localiza información completa en segundos.', step1: { title: 'Elige el Tipo', desc: 'Selecciona entre CPF, CNPJ o búsqueda por nombre en nuestra base actualizada.' }, step2: { title: 'Extrae los Datos', desc: 'Ingresa el CPF o CNPJ. Nuestro sistema localiza instantáneamente en tiempo real.' }, step3: { title: 'Recibe Todo', desc: 'Obtén teléfonos, direcciones, antecedentes y datos completos organizados.' } },
            cpf: { title: 'Localizar Persona por CPF', desc: 'Search.Hub ofrece el sistema más completo para localizar personas por CPF. Accede a información registral actualizada, direcciones, teléfonos y datos completos en segundos.', check1: { title: 'Datos Completos', desc: 'Nombre, fecha de nacimiento, situación registral' }, check2: { title: 'Contactos Actualizados', desc: 'Teléfonos, celulares, e-mail y direcciones' }, check3: { title: 'Historial Completo', desc: 'Direcciones anteriores, vínculos familiares y empresariales' }, cta: 'Localizar Persona Ahora', demo: { title: 'Datos protegidos y cifrados', labelCpf: 'CPF CONSULTADO', labelName: 'Nombre', labelStatus: 'Estado', labelPhones: 'Teléfonos', labelAddr: 'Direcciones' } },
            modules: { title: 'Módulos Especializados', desc: 'Explora nuestros módulos para localizar personas, empresas y verificar antecedentes', cards: { cpf: { title: 'Consulta CPF', desc: 'Localizar persona por CPF con datos completos' }, name: { title: 'Búsqueda por Nombre', desc: 'Sistema de búsqueda de personas por nombre completo' }, phone: { title: 'Consulta por Teléfono', desc: 'Extraer datos de teléfono y localizar propietario' }, relatives: { title: 'Parientes', desc: 'Encuentra parientes por CPF con vínculos familiares' }, photos: { title: 'Fotos CPF', desc: 'Encontrar foto e información del CPF' }, cnpj: { title: 'Consulta CNPJ', desc: 'Datos empresariales de la Agencia Tributaria' } } },
            why: { title: '¿Por qué Search.Hub?', subtitle: 'El panel más completo y profesional del mercado', cards: { realtime: { title: 'Tiempo Real', desc: 'Panel extrae datos en menos de 3 segundos con acceso a bases actualizadas 2025.' }, location: { title: 'Ubicación Avanzada', desc: 'Geolocalización y rastreo de direcciones actuales e históricas con mapeo de conexiones.' }, security: { title: 'Seguridad y LGPD', desc: 'Cifrado de extremo a extremo con cumplimiento total de LGPD y seguridad jurídica.' }, reports: { title: 'Informes PDF', desc: 'Genera informes profesionales, crea dosieres completos y exporta para análisis detallado.' } } },
            stats: { accuracy: 'Precisión de Datos', time: 'Tiempo de Respuesta', modules: 'Módulos de Consulta' },
            footer: { ready: '¿Listo para Comenzar?', desc: 'Únete a miles de empresas, abogados y profesionales que confían en Search.Hub para decisiones estratégicas y validación de datos.', ctaPanel: 'Acceder Panel Ahora', ctaWhatsapp: 'Hable en WhatsApp', terms: 'Términos', privacy: 'Privacidad', contact: 'Contacto', rights: 'Search.Hub 2025' }
        }
    }
};
