import axios from 'axios';

function getCsrfToken(): string | null {
  const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
  if (match) {
    return decodeURIComponent(match[1]);
  }
  return null;
}

export const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const csrfToken = getCsrfToken();
    if (csrfToken) {
      config.headers['X-XSRF-TOKEN'] = csrfToken;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface SearchFilters {
  cpf?: string;
  name?: string;
  phone?: string;
  email?: string;

  rg?: string;
  nome_mae?: string;
  exato?: boolean;
}

function normalizeApiResponse(data: any): PersonData | null {
  if (!data) return null;

  if (Array.isArray(data)) {
    data = data[0];
    if (!data) return null;
  }

  const dadosPessoais = data.dados_pessoais || data || {};

  const birthDateRaw = dadosPessoais.data_nascimento?.split(' ')[0];
  let age: number | undefined;
  let birthDateFormatted: string | undefined;

  if (birthDateRaw) {
    // Formata para DD/MM/YYYY
    const parts = birthDateRaw.split('-');
    if (parts.length === 3) {
      birthDateFormatted = `${parts[2]}/${parts[1]}/${parts[0]}`;
    } else {
      birthDateFormatted = birthDateRaw;
    }

    const birth = new Date(birthDateRaw);
    const today = new Date();
    age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
  }

  return {
    id: dadosPessoais.contatos_id?.toString(),
    basic: {
      name: dadosPessoais.nome || '',
      cpf: dadosPessoais.cpf || '',
      birthDate: birthDateFormatted,
      age: age,
      motherName: dadosPessoais.nome_mae,
      gender: dadosPessoais.sexo === 'M' ? 'Masculino' : dadosPessoais.sexo === 'F' ? 'Feminino' : dadosPessoais.sexo,
      status: dadosPessoais.situacao_cpf || 'Regular',
      score: data.score?.csb8 || data.poder_aquisitivo?.codigo,
    },
    addresses: (data.enderecos || []).map((end: any) => ({
      type: end.logradouro_tipo || 'Residencial',
      street: [end.logradouro_tipo, end.logradouro, end.numero, end.complemento].filter(Boolean).join(' '),
      district: end.bairro || '',
      city: end.cidade || '',
      state: end.uf || '',
      zip: end.cep || '',
    })),
    phones: (data.telefones || []).map((tel: any) => ({
      type: tel.tipo || 'Celular',
      number: tel.ddd ? `(${tel.ddd}) ${tel.telefone}` : tel.telefone,
      carrier: tel.classificacao,
      active: true,
    })),
    emails: (data.emails || []).map((email: any) => ({
      address: typeof email === 'string' ? email : email.email,
      type: 'Principal',
    })),
    relations: (data.parentes || []).map((rel: any) => ({
      type: rel.vinculo || 'Parente',
      name: rel.nome,
      cpf: rel.cpf,
    })),
    jobs: [],
    score: data.score ? {
      csb8: data.score.csb8,
      csb8_faixa: data.score.csb8_faixa,
      csba: data.score.csba,
      csba_faixa: data.score.csba_faixa,
    } : undefined,
    poder_aquisitivo: data.poder_aquisitivo ? {
      codigo: data.poder_aquisitivo.codigo,
      descricao: data.poder_aquisitivo.descricao,
      renda: data.poder_aquisitivo.renda,
      faixa: data.poder_aquisitivo.faixa,
    } : undefined,
    tse: data.tse ? {
      titulo_eleitor: data.tse.titulo_eleitor,
      zona: data.tse.zona,
      secao: data.tse.secao,
    } : undefined,
    pis: data.pis ? {
      numero: data.pis.numero,
      cadastro_id: data.pis.cadastro_id,
      data_inclusao: data.pis.data_inclusao,
    } : undefined,
  };
}

export interface PersonData {
  id?: string;
  basic: {
    name: string;
    cpf: string;
    birthDate?: string;
    age?: number;
    motherName?: string;
    gender?: string;
    status?: string;
    score?: number;
  };
  addresses?: Array<{
    type: string;
    street: string;
    district: string;
    city: string;
    state: string;
    zip: string;
  }>;
  phones?: Array<{
    type: string;
    number: string;
    carrier?: string;
    active?: boolean;
  }>;
  emails?: Array<{
    address: string;
    type: string;
  }>;
  relations?: Array<{
    name: string;
    type: string;
    cpf: string;
  }>;
  jobs?: Array<{
    company: string;
    role: string;
    admission: string;
    exit?: string;
    active?: boolean;
  }>;
  score?: {
    csb8?: number;
    csb8_faixa?: string;
    csba?: number;
    csba_faixa?: string;
  };
  poder_aquisitivo?: {
    codigo?: string;
    descricao?: string;
    renda?: number;
    faixa?: string;
  };
  tse?: {
    titulo_eleitor?: string;
    zona?: string;
    secao?: string;
  };
  pis?: {
    numero?: string;
    cadastro_id?: string;
    data_inclusao?: string;
  };
}

export const consultaService = {
  buscarPorCpf: async (cpf: string, token?: string) => {
    const config = token ? { headers: { 'X-Turnstile-Token': token } } : {};
    const response = await api.get(`/consulta/cpf/${cpf}`, config);
    return response.data;
  },

  buscarPorTelefone: async (telefone: string, token?: string) => {
    const config = token ? { headers: { 'X-Turnstile-Token': token } } : {};
    const response = await api.get(`/consulta/telefone/${telefone}`, config);
    return response.data;
  },

  buscarPorEmail: async (email: string, token?: string) => {
    const config = token ? { headers: { 'X-Turnstile-Token': token } } : {};
    const response = await api.get(`/consulta/email/${encodeURIComponent(email)}`, config);
    return response.data;
  },

  buscarPorNome: async (nome: string, page: number = 1, perPage: number = 10, filtros: { nome_mae?: string, exato?: boolean } = {}, token?: string) => {
    const response = await api.get(`/consulta/nome`, {
      params: {
        nome,
        page,
        per_page: perPage,
        nome_mae: filtros.nome_mae,
        exato: filtros.exato
      },
      headers: token ? { 'X-Turnstile-Token': token } : {}
    });
    return response.data;
  },

  buscarParentes: async (cpf: string) => {
    const response = await api.get(`/consulta/parentes/${cpf}`);
    return response.data;
  },

  buscarPorRg: async (rg: string, token?: string) => {
    const config = token ? { headers: { 'X-Turnstile-Token': token } } : {};
    const response = await api.get(`/consulta/rg/${rg}`, config);
    return response.data;
  },

  buscar: async (query: string, tipo: string = 'cpf', page: number = 1, filtros: { nome_mae?: string, exato?: boolean } = {}, token?: string) => {
    let apiResponse;
    switch (tipo) {
      case 'cpf':
        apiResponse = await consultaService.buscarPorCpf(query, token);
        break;
      case 'telefone':
        apiResponse = await consultaService.buscarPorTelefone(query, token);
        break;
      case 'email':
        apiResponse = await consultaService.buscarPorEmail(query, token);
        break;
      case 'nome':
        apiResponse = await consultaService.buscarPorNome(query, page, 10, filtros, token);
        break;
      case 'rg':
        apiResponse = await consultaService.buscarPorRg(query, token);
        break;
      default:
        apiResponse = await consultaService.buscarPorCpf(query, token);
    }

    const rawData = apiResponse?.data ?? apiResponse;
    const pagination = apiResponse?.pagination;

    // Se for uma lista (busca por nome), normaliza cada item
    if (Array.isArray(rawData)) {
      return {
        success: apiResponse?.success ?? true,
        isList: true,
        data: rawData.map(item => normalizeApiResponse(item)),
        pagination
      };
    }

    // Se for objeto único
    const normalizedData = normalizeApiResponse(rawData);

    return {
      success: apiResponse?.success ?? true,
      isList: false,
      data: normalizedData,
    };
  },
};

export const searchService = {
  searchPerson: async (query: string) => {
    const result = await consultaService.buscar(query.replace(/\D/g, ''), 'cpf');
    return result;
  },
};
