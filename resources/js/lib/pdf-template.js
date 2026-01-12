import jsPDF from 'jspdf';

export function generateProfessionalPDF(data, query, module) {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Configurações Globais
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - (margin * 2);
  let yPos = margin;

  // Paleta de Cores (Estilo Dark/Professional)
  const colors = {
    primary: [15, 23, 42], // Slate 900
    secondary: [30, 41, 59], // Slate 800
    accent: [59, 130, 246], // Blue 500
    text: {
      dark: [15, 23, 42],
      medium: [51, 65, 85],
      light: [100, 116, 139],
      white: [255, 255, 255]
    },
    bg: {
      header: [15, 23, 42],
      section: [241, 245, 249], // Slate 100
      card: [255, 255, 255]
    },
    border: [226, 232, 240]
  };

  // Funções Auxiliares
  const checkPageBreak = (heightNeeded) => {
    if (yPos + heightNeeded > pageHeight - margin - 10) {
      addFooter(pdf.getNumberOfPages());
      pdf.addPage();
      yPos = margin + 10;
      return true;
    }
    return false;
  };

  const addHeader = () => {
    pdf.setFillColor(...colors.bg.header);
    pdf.rect(0, 0, pageWidth, 40, 'F');

    // Logo / Título
    pdf.setTextColor(...colors.text.white);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(22);
    pdf.text('LOS DADOS', margin, 18);

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(200, 200, 200);
    pdf.text('RELATÓRIO DE DADOS', margin, 24);

    // Info do Relatório
    const today = new Date().toLocaleDateString('pt-BR');
    const time = new Date().toLocaleTimeString('pt-BR');

    pdf.setFontSize(9);
    pdf.text(`Gerado em: ${today} às ${time}`, pageWidth - margin, 18, { align: 'right' });
    pdf.text(`Ref: ${module.toUpperCase()} / ${query}`, pageWidth - margin, 24, { align: 'right' });
  };

  const addSectionTitle = (title, icon = '') => {
    checkPageBreak(15);
    yPos += 5;

    // Indicador visual
    pdf.setFillColor(...colors.accent);
    pdf.rect(margin, yPos, 4, 8, 'F');

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(14);
    pdf.setTextColor(...colors.text.dark);
    pdf.text(title.toUpperCase(), margin + 8, yPos + 6);

    // Linha
    pdf.setDrawColor(...colors.border);
    pdf.setLineWidth(0.5);
    pdf.line(margin, yPos + 10, pageWidth - margin, yPos + 10);

    yPos += 16;
  };

  const addField = (label, value, x, y, width, isFullWidth = false) => {
    // Label
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8);
    pdf.setTextColor(...colors.text.light);
    pdf.text(label.toUpperCase(), x, y);

    // Value
    pdf.setFont('helvetica', 'bold'); // Valor em negrito para destaque
    pdf.setFontSize(10);
    pdf.setTextColor(...colors.text.dark);

    const maxValWidth = width - 2;
    const lines = pdf.splitTextToSize(String(value || '-'), maxValWidth);

    pdf.text(lines, x, y + 5);

    return lines.length * 5; // Retorna altura usada
  };

  const addFooter = (pageNum) => {
    const totalPages = pdf.getNumberOfPages();
    // O jspdf não sabe total pages até o final se fizermos loop. 
    // Vamos adicionar footer no final de tudo loopando as paginas.
  };

  // --- GERAÇÃO DO CONTEÚDO ---

  // 1. Cabeçalho Inicial
  addHeader();
  yPos = 50;

  // 2. Dados Cadastrais (Basic)
  const basic = data.basic || {};
  addSectionTitle('DADOS CADASTRAIS');

  // Box Background
  pdf.setFillColor(...colors.bg.section);
  pdf.roundedRect(margin, yPos, contentWidth, 45, 2, 2, 'F');

  // Linha 1: Nome (Destaque)
  const nomeHeight = addField('NOME COMPLETO', basic.name, margin + 5, yPos + 6, contentWidth - 10);

  // Linha 2: CPF, Nascimento, Idade, Sexo
  let row2Y = yPos + 18;
  const colWidth = (contentWidth - 10) / 4;

  addField('CPF', basic.cpf, margin + 5, row2Y, colWidth);
  addField('DATA DE NASCIMENTO', basic.birthDate, margin + 5 + colWidth, row2Y, colWidth);
  addField('IDADE', `${basic.age || '-'} ANOS`, margin + 5 + (colWidth * 2), row2Y, colWidth);
  addField('SEXO', basic.gender, margin + 5 + (colWidth * 3), row2Y, colWidth);

  // Linha 3: Mãe
  let row3Y = row2Y + 12;
  addField('NOME DA MÃE', basic.motherName, margin + 5, row3Y, contentWidth - 10);

  yPos += 50; // Altura do box + margem

  // 3. Documentos e Info Adicional
  if (data.score || basic.status) {
    checkPageBreak(30);
    // Box menor
    pdf.setFillColor(255, 255, 255);
    pdf.setDrawColor(...colors.border);
    pdf.roundedRect(margin, yPos, contentWidth, 25, 2, 2, 'S');

    addField('SITUAÇÃO DO CPF', basic.status, margin + 5, yPos + 6, colWidth);

    if (data.score) {
      // Assume score object structured
      const scoreVal = typeof data.score === 'object' ? (data.score.csb8 || data.score.score) : data.score;
      addField('SCORE DE CRÉDITO', scoreVal, margin + 5 + colWidth, yPos + 6, colWidth);
    }

    yPos += 30;
  }

  // 4. Relacionamentos (Parentes)
  if (data.relations && data.relations.length > 0) {
    addSectionTitle('RELACIONAMENTOS / PARENTES');

    data.relations.forEach((rel, i) => {
      checkPageBreak(15);

      // Zebra striping
      if (i % 2 === 0) {
        pdf.setFillColor(...colors.bg.section);
        pdf.rect(margin, yPos - 2, contentWidth, 14, 'F');
      }

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(9);
      pdf.setTextColor(...colors.text.dark);
      pdf.text(rel.name || 'Desconhecido', margin + 2, yPos + 4);

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(...colors.text.medium);

      const tipo = rel.type || '-';
      const doc = rel.cpf || '-';

      pdf.text(`${tipo.toUpperCase()} • CPF: ${doc}`, margin + 2, yPos + 8);

      yPos += 14;
    });
    yPos += 5;
  }

  // 5. Endereços
  if (data.addresses && data.addresses.length > 0) {
    addSectionTitle('LOCALIZAÇÃO / ENDEREÇOS');

    data.addresses.forEach((addr, i) => {
      const heightNeeded = 20;
      checkPageBreak(heightNeeded);

      // Card style
      pdf.setDrawColor(...colors.border);
      pdf.setFillColor(255, 255, 255);
      pdf.roundedRect(margin, yPos, contentWidth, 18, 1, 1, 'FD');

      // Icon marker (simulado com circulo)
      pdf.setFillColor(...colors.accent);
      pdf.circle(margin + 6, yPos + 9, 2, 'F');

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(9);
      pdf.setTextColor(...colors.text.dark);
      const fullAddr = `${addr.street}, ${addr.district}`;
      pdf.text(fullAddr, margin + 12, yPos + 6);

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(...colors.text.medium);
      const cityState = `${addr.city}/${addr.state} - CEP: ${addr.zip}`;
      pdf.text(cityState, margin + 12, yPos + 11);

      // Tipo badge
      if (addr.type) {
        pdf.setFontSize(7);
        pdf.setTextColor(...colors.accent);
        pdf.text(addr.type.toUpperCase(), pageWidth - margin - 5, yPos + 6, { align: 'right' });
      }

      yPos += 22;
    });
  }

  // 6. Contatos (Telefones e Emails)
  if ((data.phones && data.phones.length > 0) || (data.emails && data.emails.length > 0)) {
    addSectionTitle('CONTATOS');

    // Grid de 2 colunas
    const col1X = margin;
    const col2X = pageWidth / 2 + 2;
    const columnW = (contentWidth / 2) - 4;

    let currentY = yPos;
    let leftY = currentY;
    let rightY = currentY;

    // Telefones na Esquerda
    if (data.phones) {
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(9);
      pdf.setTextColor(...colors.text.dark);
      pdf.text('TELEFONES', col1X, leftY);
      leftY += 6;

      data.phones.forEach(phone => {
        checkPageBreak(10);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(10);
        pdf.setTextColor(...colors.text.dark);
        pdf.text(phone.number, col1X, leftY);

        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8);
        pdf.setTextColor(...colors.text.light);
        const meta = [phone.carrier, phone.type].filter(Boolean).join(' • ');
        pdf.text(meta || '-', col1X + 35, leftY); // Adicionado deslocamento para alinhar melhor

        leftY += 8;
      });
    }

    // Emails na Direita
    if (data.emails) {
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(9);
      pdf.setTextColor(...colors.text.dark);
      pdf.text('EMAILS', col2X, rightY);
      rightY += 6;

      data.emails.forEach(email => {
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(9);
        pdf.setTextColor(...colors.text.dark);
        pdf.text(email.address, col2X, rightY);
        rightY += 8;
      });
    }

    yPos = Math.max(leftY, rightY) + 10;
  }

  // Final: Rodapés em todas as páginas
  const pageCount = pdf.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);

    // Marca d'água discreta
    pdf.setTextColor(240, 240, 240);
    pdf.setFontSize(60);
    pdf.setFont('helvetica', 'bold');
    pdf.text('CONFIDENCIAL', pageWidth / 2, pageHeight / 2, { align: 'center', angle: 45 });

    // Footer
    pdf.setFillColor(248, 250, 252);
    pdf.rect(0, pageHeight - 15, pageWidth, 15, 'F');

    pdf.setFontSize(8);
    pdf.setTextColor(...colors.text.light);
    pdf.text(`Los Dados - Página ${i} de ${pageCount}`, margin, pageHeight - 6);
    pdf.text('Documento Confidencial - Uso Exclusivo', pageWidth - margin, pageHeight - 6, { align: 'right' });
  }

  return pdf;
}
