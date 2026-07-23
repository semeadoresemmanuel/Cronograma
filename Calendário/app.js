// 2026 Mondays Database with Holidays and Pontos Facultativos filled with real PDF data
const MONDAYS_DATA = Object.freeze([
  { date: '2026-02-02', type: 'normal', tematica: 'De Volta para o Futuro: Análise do Passado, Ajustes no Presente e Projeções para o Futuro - Parte I', modalidade: 'Abertura' },
  { date: '2026-02-09', type: 'normal', tematica: 'De Volta para o Futuro: Análise do Passado, Ajustes no Presente e Projeções para o Futuro - Parte II', modalidade: 'Abertura' },
  { date: '2026-02-16', type: 'facultativo', tematica: 'SEGUNDA-FEIRA DE CARNAVAL', modalidade: 'Ponto Facultativo' },
  { date: '2026-02-23', type: 'normal', tematica: 'Parte II, Capítulo IV (Da Pluralidade das Existências) - Parecenças Físicas e Morais', modalidade: 'O Livro dos Espíritos' },
  { date: '2026-03-02', type: 'normal', tematica: 'Servos para o Trabalho na Edificação do Material e do Intelecto-Moral', modalidade: 'Reforma Íntima' },
  { date: '2026-03-09', type: 'normal', tematica: 'As Guerras Atuais e a Transição Planetária', modalidade: 'Especial' },
  { date: '2026-03-16', type: 'normal', tematica: 'Atividades no Centro', modalidade: 'Prática' },
  { date: '2026-03-23', type: 'normal', tematica: 'Parte II, Capítulo IV (Da Pluralidade das Existências) - Ideias Inatas', modalidade: 'O Livro dos Espíritos' },
  { date: '2026-03-30', type: 'normal', tematica: 'Atividades no Centro', modalidade: 'Prática' },
  { date: '2026-04-06', type: 'normal', tematica: 'Parte II, Capítulo V (Considerações sobre a Pluralidade das Existências)', modalidade: 'O Livro dos Espíritos' },
  { date: '2026-04-13', type: 'normal', tematica: 'Atividades no Centro', modalidade: 'Prática' },
  { date: '2026-04-20', type: 'normal', tematica: 'Atividades no Centro', modalidade: 'Prática' },
  { date: '2026-04-27', type: 'normal', tematica: 'Planejamento Reencarnatório e Familiar', modalidade: 'Especial' },
  { date: '2026-05-04', type: 'normal', tematica: 'A Jornada de Dentro: Conhecer, Transformar e Crescer', modalidade: 'Reforma Íntima' },
  { date: '2026-05-11', type: 'normal', tematica: 'Atividades no Centro', modalidade: 'Prática' },
  { date: '2026-05-18', type: 'normal', tematica: 'Espiritismo e Inteligência Artificial', modalidade: 'Especial' },
  { date: '2026-05-25', type: 'normal', tematica: 'Parte II, Capítulo VI (Da Vida Espírita) - Espíritos Errantes', modalidade: 'O Livro dos Espíritos' },
  { date: '2026-06-01', type: 'normal', tematica: 'Levantamento de Ações e Necessidades do Centro Espírita Emmanuel', modalidade: 'Reforma Íntima' },
  { date: '2026-06-08', type: 'normal', tematica: 'Parte II, Capítulo VI (Da Vida Espírita) - Mundos Transitórios', modalidade: 'O Livro dos Espíritos' },
  { date: '2026-06-15', type: 'normal', tematica: 'QUALIDADE DE VIDA NOS TEMPOS ATUAIS', modalidade: 'Reforma Íntima' },
  { date: '2026-06-22', type: 'normal', tematica: 'EXCESSOS E DESEQUILIBRIOS DO ESTILO DE VIDA', modalidade: 'Especial' },
  { date: '2026-06-29', type: 'normal', tematica: 'Atividades no Centro', modalidade: 'Prática' },
  { date: '2026-07-06', type: 'normal', tematica: 'Atividades no Centro', modalidade: 'Prática' },
  { date: '2026-07-13', type: 'normal', tematica: 'Parte II, Capítulo VI (Da Vida Espírita) - Percepções, Sensações e Sofrimentos dos Espíritos', modalidade: 'O Livro dos Espíritos' },
  { date: '2026-07-20', type: 'normal', tematica: 'A DEFINIR', modalidade: 'Reforma Íntima' },
  { date: '2026-07-27', type: 'normal', tematica: 'A DEFINIR', modalidade: 'Especial' },
  { date: '2026-08-03', type: 'normal', tematica: 'Atividades no Centro', modalidade: 'Prática' },
  { date: '2026-08-10', type: 'normal', tematica: 'Parte II, Capítulo VI (Da Vida Espírita) - Ensaio Teórico da Sensação nos Espíritos', modalidade: 'O Livro dos Espíritos' },
  { date: '2026-08-17', type: 'normal', tematica: 'PRIORIDADES E DECISÕES', modalidade: 'Reforma Íntima' },
  { date: '2026-08-24', type: 'normal', tematica: 'A DEFINIR', modalidade: 'Especial' },
  { date: '2026-08-31', type: 'normal', tematica: 'Atividades no Centro', modalidade: 'Prática' },
  { date: '2026-09-07', type: 'feriado', tematica: 'DIA DA INDEPENDÊNCIA DO BRASIL', modalidade: 'Feriado' },
  { date: '2026-09-14', type: 'normal', tematica: 'ATIVIDADES NO CENTRO', modalidade: 'Prática' },
  { date: '2026-09-21', type: 'normal', tematica: 'PARTE II, CAPÍTULO VI (DA VIDA ESPÍRITA) - ESCOLHA DAS PROVAS', modalidade: 'O Livro dos Espíritos' },
  { date: '2026-09-28', type: 'normal', tematica: 'A DEFINIR', modalidade: 'Reforma Íntima' },
  { date: '2026-10-05', type: 'normal', tematica: 'A DEFINIR', modalidade: 'Especial' },
  { date: '2026-10-12', type: 'feriado', tematica: 'DIA DAS CRIANÇAS | NOSSA SENHORA APARECIDA', modalidade: 'Feriado' },
  { date: '2026-10-19', type: 'normal', tematica: 'ATIVIDADES NO CENTRO', modalidade: 'Prática' },
  { date: '2026-10-26', type: 'normal', tematica: 'PARTE II, CAPÍTULO VI (DA VIDA ESPÍRITA) - AS RELAÇÕES NO ALÉM-TÚMULO', modalidade: 'O Livro dos Espíritos' },
  { date: '2026-11-02', type: 'feriado', tematica: 'FINADOS', modalidade: 'Feriado' },
  { date: '2026-11-09', type: 'normal', tematica: 'A DEFINIR', modalidade: 'Especial' },
  { date: '2026-11-16', type: 'normal', tematica: 'ATIVIDADES NO CENTRO', modalidade: 'Prática' },
  { date: '2026-11-23', type: 'normal', tematica: 'PARTE II, CAPÍTULO VI (DA VIDA ESPÍRITA) - RELAÇÕES DE SIMPATIA E DE ANTIPATIA ENTRE OS ESPÍRITOS', modalidade: 'O Livro dos Espíritos' },
  { date: '2026-11-30', type: 'normal', tematica: 'Cerimônia do Oscar Semeadores 2026', modalidade: 'Encerramento' }
]);

document.addEventListener('DOMContentLoaded', () => {
  renderCalendar('calendar-body-light');
  renderCalendar('calendar-body-dark');
});

/**
 * Render Calendar rows in the specified tbody element
 * @param {string} tbodyId 
 */
function renderCalendar(tbodyId) {
  const tbody = document.getElementById(tbodyId);
  if (!tbody) return;

  const fragment = document.createDocumentFragment();

  MONDAYS_DATA.forEach(row => {
    const tr = document.createElement('tr');
    
    if (row.type === 'feriado') {
      tr.className = 'row-feriado';
    } else if (row.type === 'facultativo') {
      tr.className = 'row-facultativo';
    }

    const [, month, day] = row.date.split('-');
    const formattedDate = `${day}/${month}`;

    tr.innerHTML = `
      <td>
        <div class="date-cell">
          <span class="date-text">${escapeHtml(formattedDate)}</span>
        </div>
      </td>
      <td>
        <div class="cell-text tematica-cell">${escapeHtml(row.tematica) || '&nbsp;'}</div>
      </td>
      <td>
        <div class="cell-text modalidade-cell">${escapeHtml(row.modalidade) || '&nbsp;'}</div>
      </td>
    `;

    fragment.appendChild(tr);
  });

  tbody.replaceChildren(fragment);
}

/**
 * Helper to escape HTML special characters
 * @param {string} text 
 * @returns {string}
 */
function escapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
