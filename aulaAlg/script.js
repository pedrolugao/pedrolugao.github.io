const INITIAL_STATE = ['black', 'black', 'black', null, 'white', 'white', 'white'];
const SOLVED_STATE = ['white', 'white', 'white', null, 'black', 'black', 'black'];

const boardElement = document.getElementById('board');
const stepsListElement = document.getElementById('steps-list');
const statusMessageElement = document.getElementById('status-message');
const restartButton = document.getElementById('restart-button');
const undoButton = document.getElementById('undo-button');

let currentState = [...INITIAL_STATE];
let moveHistory = [];
let draggedIndex = null;
let solvedAnnounced = false;

function pieceName(piece) {
  return piece === 'black' ? 'preta' : 'branca';
}

function pieceSymbol(piece) {
  if (piece === 'black') {
    return 'P';
  }

  if (piece === 'white') {
    return 'B';
  }

  return '_';
}

function stateSummary(state) {
  return state
    .map((piece, index) => {
      const label = piece === null ? 'vazio' : pieceName(piece);
      return `${index}:${label}`;
    })
    .join(' | ');
}

function formatBoard(state) {
  return state
    .map((piece, index) => `[${index}:${pieceSymbol(piece)}]`)
    .join(' ');
}

function formatBoardAscii(state) {
  const indexLine = state.map((_, index) => ` ${index} `).join(' ');
  const separatorLine = state.map(() => '---').join('+');
  const pieceLine = state.map((piece) => ` ${pieceSymbol(piece)} `).join('|');

  return [
    `  ${indexLine}`,
    `+-${separatorLine}-+`,
    `| ${pieceLine} |`,
    `+-${separatorLine}-+`,
    'Legenda: P=preta, B=branca, _=vazio',
  ].join('\n');
}

function isSolved(state) {
  return state.every((piece, index) => piece === SOLVED_STATE[index]);
}

function getMoveType(fromIndex, toIndex) {
  return Math.abs(fromIndex - toIndex) === 1 ? 'deslizou' : 'pulou';
}

function describeMove(piece, fromIndex, toIndex) {
  return `Peça ${pieceName(piece)} ${getMoveType(fromIndex, toIndex)} da casa ${fromIndex} para a casa ${toIndex}.`;
}

function isValidMove(state, fromIndex, toIndex) {
  if (fromIndex === null || toIndex === null) {
    return false;
  }

  if (fromIndex === toIndex || state[fromIndex] === null || state[toIndex] !== null) {
    return false;
  }

  const distance = Math.abs(fromIndex - toIndex);
  if (distance === 1) {
    return true;
  }

  if (distance === 2) {
    const middleIndex = (fromIndex + toIndex) / 2;
    return state[middleIndex] !== null;
  }

  return false;
}

function getValidTargets(state, fromIndex) {
  return state
    .map((_, toIndex) => (isValidMove(state, fromIndex, toIndex) ? toIndex : null))
    .filter((index) => index !== null);
}

function getAllValidMoves(state) {
  return state.flatMap((piece, fromIndex) => {
    if (piece === null) {
      return [];
    }

    return getValidTargets(state, fromIndex).map((toIndex) => ({
      piece,
      from: fromIndex,
      to: toIndex,
      type: getMoveType(fromIndex, toIndex),
    }));
  });
}

function updateStatusMessage(message, solved = false) {
  statusMessageElement.textContent = message;
  statusMessageElement.classList.toggle('solved', solved);
}

function clearHighlights() {
  document.querySelectorAll('.slot.valid-target').forEach((slot) => {
    slot.classList.remove('valid-target');
  });
}

function highlightValidTargets(fromIndex) {
  clearHighlights();

  getValidTargets(currentState, fromIndex).forEach((targetIndex) => {
    const slot = boardElement.querySelector(`[data-index="${targetIndex}"]`);
    if (slot) {
      slot.classList.add('valid-target');
    }
  });
}

function handleSolvedState() {
  if (isSolved(currentState)) {
    updateStatusMessage('Parabéns! Você resolveu o desafio e a configuração final foi mantida no tabuleiro.', true);

    if (!solvedAnnounced) {
      solvedAnnounced = true;
      window.alert('Parabéns! Você conseguiu trocar as peças de lugar.');
    }

    return true;
  }

  solvedAnnounced = false;
  return false;
}

function renderSteps() {
  const steps = moveHistory.length === 0
    ? ['Nenhum passo executado ainda.']
    : moveHistory.map((move) => describeMove(move.piece, move.from, move.to));

  stepsListElement.innerHTML = '';

  steps.forEach((description) => {
    const item = document.createElement('li');
    item.textContent = description;
    stepsListElement.appendChild(item);
  });
}

function renderBoard() {
  boardElement.innerHTML = '';

  currentState.forEach((piece, index) => {
    const slot = document.createElement('div');
    slot.className = `slot${piece === null ? ' empty' : ''}`;
    slot.dataset.index = index;

    const slotIndex = document.createElement('span');
    slotIndex.className = 'slot-index';
    slotIndex.textContent = String(index);
    slot.appendChild(slotIndex);

    slot.addEventListener('dragover', (event) => {
      if (draggedIndex !== null) {
        event.preventDefault();
      }
    });

    slot.addEventListener('drop', (event) => {
      event.preventDefault();
      if (draggedIndex !== null) {
        movePiece(draggedIndex, index, 'interface');
      }
    });

    if (piece !== null) {
      const pieceElement = document.createElement('div');
      pieceElement.className = `piece ${piece}`;
      pieceElement.draggable = true;
      pieceElement.setAttribute('aria-label', `Peça ${pieceName(piece)} na posição ${index}`);

      pieceElement.addEventListener('dragstart', (event) => {
        draggedIndex = index;
        pieceElement.classList.add('dragging');
        highlightValidTargets(index);
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', String(index));
      });

      pieceElement.addEventListener('dragend', () => {
        draggedIndex = null;
        pieceElement.classList.remove('dragging');
        clearHighlights();
      });

      slot.appendChild(pieceElement);
    }

    boardElement.appendChild(slot);
  });

  console.log(`\n${formatBoardAscii(currentState)}`);
  undoButton.disabled = moveHistory.length === 0;
}

function getGameSnapshot() {
  return {
    state: [...currentState],
    solved: isSolved(currentState),
    statusMessage: statusMessageElement.textContent,
    moveCount: moveHistory.length,
    moveHistory: moveHistory.map((move) => ({
      ...move,
      resultingState: [...move.resultingState],
    })),
    validMoves: getAllValidMoves(currentState),
  };
}

function getOriginLabel(origin) {
  if (origin === 'console') {
    return 'console';
  }

  if (origin === 'interface') {
    return 'interface';
  }

  return 'sistema';
}

function logConsoleState(reason, details = {}) {
  const snapshot = getGameSnapshot();
  const titleStyle = 'background:#2d6c68;color:#ffffff;padding:2px 8px;border-radius:999px;font-weight:700;';
  const textStyle = 'color:#2d6c68;font-weight:700;';
  const tableRows = snapshot.state.map((piece, index) => ({
    casa: index,
    peca: piece === null ? 'vazio' : pieceName(piece),
    simbolo: pieceSymbol(piece),
  }));
  const validMovesTable = snapshot.validMoves.map((move) => ({
    peca: pieceName(move.piece),
    de: move.from,
    para: move.to,
    tipo: move.type,
  }));
  const logMethod = details.level === 'warn' ? 'warn' : 'info';

  console.groupCollapsed(`%cTroca de Peças%c ${reason}`, titleStyle, textStyle);

  if (details.actionMessage) {
    console[logMethod](details.actionMessage);
  }

  console.log(`Origem: ${getOriginLabel(details.origin)}`);
  console.log(`Tabuleiro: ${formatBoard(snapshot.state)}`);
  console.log(`Resumo: ${stateSummary(snapshot.state)}`);
  console.log(`Status: ${snapshot.statusMessage}`);
  console.log(`Resolvido: ${snapshot.solved ? 'sim' : 'não'}`);
  console.log(`Quantidade de jogadas: ${snapshot.moveCount}`);
  console.table(tableRows);

  if (validMovesTable.length > 0) {
    console.log('Movimentos válidos disponíveis:');
    console.table(validMovesTable);
  }

  if (snapshot.moveHistory.length > 0) {
    const lastMove = snapshot.moveHistory[snapshot.moveHistory.length - 1];
    console.log(`Último movimento: ${describeMove(lastMove.piece, lastMove.from, lastMove.to)}`);
  }

  console.groupEnd();
}

function renderGame(reason, details = {}) {
  renderBoard();
  renderSteps();
  handleSolvedState();
  logConsoleState(reason, details);
}

function parseConsoleMoveInput(fromIndex, toIndex) {
  if (!Number.isInteger(fromIndex) || !Number.isInteger(toIndex)) {
    return {
      error: 'Entrada inválida. Use dois inteiros. Exemplo: jogar(2, 3).',
    };
  }
  const outOfBounds = [fromIndex, toIndex].some((index) => index < 0 || index >= currentState.length);

  if (outOfBounds) {
    return {
      error: `Casas fora do tabuleiro: ${fromIndex}, ${toIndex}. Use valores entre 0 e ${currentState.length - 1}.`,
    };
  }

  return { fromIndex, toIndex };
}

function movePiece(fromIndex, toIndex, origin = 'interface') {
  if (!isValidMove(currentState, fromIndex, toIndex)) {
    const message = 'Movimento inválido. Use apenas casas vizinhas vazias ou pule uma única peça.';
    updateStatusMessage(message);
    draggedIndex = null;
    clearHighlights();
    renderGame('Tentativa de movimento inválida', {
      origin,
      level: 'warn',
      actionMessage: `${getOriginLabel(origin)} tentou mover da casa ${fromIndex} para a casa ${toIndex}, mas a jogada é inválida.`,
    });
    return false;
  }

  const nextState = [...currentState];
  const piece = nextState[fromIndex];
  nextState[toIndex] = piece;
  nextState[fromIndex] = null;

  moveHistory.push({
    piece,
    from: fromIndex,
    to: toIndex,
    type: getMoveType(fromIndex, toIndex),
    resultingState: [...nextState],
  });

  currentState = nextState;
  draggedIndex = null;
  clearHighlights();

  const description = describeMove(piece, fromIndex, toIndex);
  updateStatusMessage(description);
  renderGame('Movimento executado', {
    origin,
    actionMessage: `${getOriginLabel(origin)} executou: ${description}`,
  });
  return true;
}

function restartGame(origin = 'interface') {
  currentState = [...INITIAL_STATE];
  moveHistory = [];
  draggedIndex = null;
  solvedAnnounced = false;
  clearHighlights();
  updateStatusMessage('Jogo reiniciado. Faça uma jogada válida para começar.');
  renderGame('Jogo reiniciado', {
    origin,
    actionMessage: `${getOriginLabel(origin)} reiniciou o jogo.`,
  });
}

function undoMove(origin = 'interface') {
  if (moveHistory.length === 0) {
    updateStatusMessage('Ainda não há passos para desfazer.');
    renderGame('Desfazer indisponível', {
      origin,
      level: 'warn',
      actionMessage: `${getOriginLabel(origin)} tentou desfazer, mas não há jogadas registradas.`,
    });
    return false;
  }

  moveHistory.pop();
  currentState = moveHistory.length === 0
    ? [...INITIAL_STATE]
    : [...moveHistory[moveHistory.length - 1].resultingState];

  draggedIndex = null;
  solvedAnnounced = false;
  clearHighlights();
  updateStatusMessage('Última jogada desfeita.');
  renderGame('Jogada desfeita', {
    origin,
    actionMessage: `${getOriginLabel(origin)} desfez a última jogada.`,
  });
  return true;
}

function playFromConsole(fromIndex, toIndex) {
  const parsed = parseConsoleMoveInput(fromIndex, toIndex);

  if (parsed.error) {
    updateStatusMessage(parsed.error);
    renderGame('Comando de console inválido', {
      origin: 'console',
      level: 'warn',
      actionMessage: parsed.error,
    });
    return false;
  }

  return movePiece(parsed.fromIndex, parsed.toIndex, 'console');
}

function printConsoleHelp() {
  console.info('Troca de Peças no console pronta.');
  console.info('Use jogar(2, 3) ou consoleGame.move(2, 3) para fazer uma jogada.');
  console.info('Também estão disponíveis consoleGame.state() e consoleGame.restart().');
}

window.consoleGame = {
  move: playFromConsole,
  moveByIndices(fromIndex, toIndex) {
    return movePiece(fromIndex, toIndex, 'console');
  },
  restart() {
    restartGame('console');
  },
  state() {
    logConsoleState('Consulta manual do estado', {
      origin: 'console',
      actionMessage: 'Estado consultado manualmente no console.',
    });
    return getGameSnapshot();
  },
  help: printConsoleHelp,
};

window.jogar = playFromConsole;

restartButton.addEventListener('click', () => restartGame('interface'));
undoButton.addEventListener('click', () => undoMove('interface'));

renderGame('Estado inicial carregado', {
  origin: 'sistema',
  actionMessage: 'Jogo carregado com sincronização entre interface e console.',
});
printConsoleHelp();
