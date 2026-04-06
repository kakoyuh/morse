document.addEventListener('DOMContentLoaded', () => {
    let boardData = [];
    let moveCount = 0;
    let isPlaying = false; 
    const size = 6;     
    const shuffleSteps = { 1: 5, 2: 20, 3: 50, 4: 100, 5: 200 };

    const btnToIntro = document.getElementById('btn-to-intro');
    const btnBackTop = document.getElementById('btn-back-top');
    if (btnToIntro) btnToIntro.onclick = () => document.getElementById('intro-section').scrollIntoView({ behavior: 'smooth' });
    if (btnBackTop) btnBackTop.onclick = () => window.scrollTo({ top: 0, behavior: 'smooth' });

    const lvBtns = document.querySelectorAll('.lv-btn');
    lvBtns.forEach(btn => {
        btn.onclick = () => {
            lvBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        };
    });

    document.getElementById('start-btn').onclick = startGame;

    function startGame() {
        const lv = document.querySelector('.lv-btn.active').dataset.lv;
        moveCount = 0;
        document.getElementById('move-count').innerText = "0";
        
        const boardEl = document.getElementById('board');
        if(boardEl) boardEl.classList.remove('win-glow');

        // 1. 初始化十字棋盤佈局
        boardData = [];
        for(let r=0; r<size; r++) {
            boardData[r] = [];
            for(let c=0; c<size; c++) {
                if ((r < 2 || r > 3) && (c < 2 || c > 3)) {
                    boardData[r][c] = 0; // 角落灰塊
                } else if (r < 2) boardData[r][c] = 1; 
                else if (r > 3) boardData[r][c] = 2; 
                else if (c < 2) boardData[r][c] = 3; 
                else if (c > 3) boardData[r][c] = 4; 
                else boardData[r][c] = 5;            
            }
        }

        // 2. 隨機打亂
        for(let i=0; i<shuffleSteps[lv]; i++) {
            const isRow = Math.random() > 0.5;
            const idx = Math.random() > 0.5 ? 2 : 3; 
            const dir = Math.random() > 0.5;
            if(isRow) doShiftRow(idx, dir ? 'left' : 'right');
            else doShiftCol(idx, dir ? 'up' : 'down');
        }
        
        renderBoard();
        document.getElementById('main-menu').style.display = 'none';
        document.getElementById('game-container').style.display = 'block';
        
        // 呼叫倒數
        startCountdown();
    }

    // 🌟 強化版：防呆倒數邏輯
    function startCountdown() {
        const overlay = document.getElementById('countdown-overlay');
        const text = document.getElementById('countdown-text');
        
        // 【關鍵修復】如果 HTML 裡沒有倒數標籤，就直接解鎖遊戲，避免當機！
        if (!overlay || !text) {
            isPlaying = true;
            return;
        }

        isPlaying = false; // 鎖住操作
        overlay.style.display = 'flex';
        
        let count = 3;
        text.innerText = count;

        let timer = setInterval(() => {
            count--;
            if (count > 0) {
                text.innerText = count;
            } else if (count === 0) {
                text.innerText = "START";
            } else {
                clearInterval(timer);
                overlay.style.display = 'none';
                isPlaying = true; // 解鎖操作
            }
        }, 1000);
    }

    function renderBoard() {
        const board = document.getElementById('board');
        board.innerHTML = '';
        
        boardData.forEach((row, r) => {
            row.forEach((color, c) => {
                const cell = document.createElement('div');
                cell.className = `cell c-${color}`;

                if (r === 0 && (c === 2 || c === 3)) {
                    cell.classList.add('clickable', 'arrow-up');
                    cell.onclick = () => handleMove(() => doShiftCol(c, 'up'));
                } else if (r === 5 && (c === 2 || c === 3)) {
                    cell.classList.add('clickable', 'arrow-down');
                    cell.onclick = () => handleMove(() => doShiftCol(c, 'down'));
                } else if (c === 0 && (r === 2 || r === 3)) {
                    cell.classList.add('clickable', 'arrow-left');
                    cell.onclick = () => handleMove(() => doShiftRow(r, 'left'));
                } else if (c === 5 && (r === 2 || r === 3)) {
                    cell.classList.add('clickable', 'arrow-right');
                    cell.onclick = () => handleMove(() => doShiftRow(r, 'right'));
                }

                board.appendChild(cell);
            });
        });
    }

    function handleMove(shiftLogic) {
        if (!isPlaying) return; // 防偷跑
        
        shiftLogic();
        moveCount++;
        document.getElementById('move-count').innerText = moveCount;
        renderBoard();
        checkWin();
    }

    function doShiftRow(r, dir) {
        if(dir === 'right') boardData[r].unshift(boardData[r].pop());
        else boardData[r].push(boardData[r].shift());
    }

    function doShiftCol(c, dir) {
        let col = boardData.map(row => row[c]);
        if(dir === 'down') col.unshift(col.pop());
        else col.push(col.shift());
        boardData.forEach((row, i) => row[c] = col[i]);
    }

    function checkWin() {
        for(let r=0; r<=4; r+=2) {
            for(let c=0; c<=4; c+=2) {
                let val = boardData[r][c];
                if(boardData[r][c+1] !== val || 
                   boardData[r+1][c] !== val || 
                   boardData[r+1][c+1] !== val) return;
            }
        }
        
        isPlaying = false; // 鎖住棋盤
        const boardEl = document.getElementById('board');
        if(boardEl) boardEl.classList.add('win-glow'); 
        
        setTimeout(() => {
            const winModal = document.getElementById('win-modal');
            const winMoves = document.getElementById('win-moves');
            
            // 防呆：如果有結算畫面就顯示，沒有就用原本的 Alert
            if (winModal && winMoves) {
                winMoves.innerText = moveCount;
                winModal.style.display = 'flex';
            } else {
                alert(`BINGO! 完美的推演！\n總移動次數: ${moveCount}`);
            }
        }, 1000); 
    }
});