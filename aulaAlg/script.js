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

function stateSummary(state) {
  return state
    .map((piece, index) => {
      const label = piece === null ? 'vazio' : pieceName(piece);
      return `${index}:${label}`;
    })
    .join(' | ');
}

function isSolved(state) {
  return state.every((piece, index) => piece === SOLVED_STATE[index]);
}

function getMoveType(fromIndex, toIndex) {
  return Math.abs(fromIndex - toIndex) === 1 ? 'deslizou' : 'pulou';
}

function isValidMove(fromIndex, toIndex) {
  if (fromIndex === null || toIndex === null) {
    return false;
  }

  if (fromIndex === toIndex || currentState[fromIndex] === null || currentState[toIndex] !== null) {
    return false;
  }

  const distance = Math.abs(fromIndex - toIndex);
  if (distance === 1) {
    return true;
  }

  if (distance === 2) {
    const middleIndex = (fromIndex + toIndex) / 2;
    return currentState[middleIndex] !== null;
  }

  return false;
}

function getValidTargets(fromIndex) {
  return currentState
    .map((_, toIndex) => (isValidMove(fromIndex, toIndex) ? toIndex : null))
    .filter((index) => index !== null);
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

  getValidTargets(fromIndex).forEach((targetIndex) => {
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

    return;
  }

  solvedAnnounced = false;
}

function renderSteps() {
  const steps = moveHistory.length === 0
    ? ['Nenhum passo executado ainda.']
    : moveHistory.map((move, index) => {
      const actionNumber = index + 1;
      return `Peça ${pieceName(move.piece)} ${move.type} da casa ${move.from} para a casa ${move.to}.`;
    });

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
      //removed && isValidMove(draggedIndex, index) from this
      if (draggedIndex !== null ) {
        event.preventDefault();
      }
    });

    slot.addEventListener('drop', (event) => {
      event.preventDefault();
      if (draggedIndex !== null) {
        movePiece(draggedIndex, index);
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

  undoButton.disabled = moveHistory.length === 0;
}

function movePiece(fromIndex, toIndex) {
  if (!isValidMove(fromIndex, toIndex)) {
    updateStatusMessage('Movimento inválido. Use apenas casas vizinhas vazias ou pule uma única peça.');
    clearHighlights();
    renderBoard();
    return;
  }

  const nextState = [...currentState];
  const piece = nextState[fromIndex];
  nextState[toIndex] = piece;
  nextState[fromIndex] = null;

  const type = getMoveType(fromIndex, toIndex);
  moveHistory.push({
    piece,
    from: fromIndex,
    to: toIndex,
    type,
    resultingState: [...nextState],
  });

  currentState = nextState;
  updateStatusMessage(`Peça ${pieceName(piece)} ${type} da casa ${fromIndex} para a casa ${toIndex}.`);
  renderBoard();
  renderSteps();
  handleSolvedState();
}

function restartGame() {
  currentState = [...INITIAL_STATE];
  moveHistory = [];
  draggedIndex = null;
  solvedAnnounced = false;
  updateStatusMessage('Jogo reiniciado. Faça uma jogada válida para começar.');
  clearHighlights();
  renderBoard();
  renderSteps();
}

function undoMove() {
  if (moveHistory.length === 0) {
    updateStatusMessage('Ainda não há passos para desfazer.');
    return;
  }

  moveHistory.pop();
  currentState = moveHistory.length === 0
    ? [...INITIAL_STATE]
    : [...moveHistory[moveHistory.length - 1].resultingState];

  solvedAnnounced = false;
  updateStatusMessage('Última jogada desfeita.');
  clearHighlights();
  renderBoard();
  renderSteps();
  handleSolvedState();
}

restartButton.addEventListener('click', restartGame);
undoButton.addEventListener('click', undoMove);

renderBoard();
renderSteps();
