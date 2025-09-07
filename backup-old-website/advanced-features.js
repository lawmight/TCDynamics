// Advanced Features for TCDynamics
// Gamification, Dark Mode, Progress Tracking, and More

class TCDynamicsAdvanced {
    constructor() {
        this.userProgress = this.loadProgress();
        this.achievements = this.loadAchievements();
        this.gamification = new GamificationEngine();
        this.darkMode = new DarkModeManager();
        this.progressTracker = new ProgressTracker();
        this.codePlayground = new CodePlayground();
        this.realtime = new RealtimeManager();
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.initializeUI();
        this.startProgressTracking();
        this.setupAccessibility();
    }
    
    setupEventListeners() {
        // Dark mode toggle
        document.addEventListener('click', (e) => {
            if (e.target.closest('.dark-mode-toggle')) {
                this.darkMode.toggle();
            }
        });
        
        // Day completion tracking
        document.addEventListener('click', (e) => {
            if (e.target.closest('.toggle-content')) {
                this.trackDayInteraction(e.target);
            }
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'd') {
                e.preventDefault();
                this.darkMode.toggle();
            }
        });
    }
    
    initializeUI() {
        this.createDarkModeToggle();
        this.createGamificationPanel();
        this.createProgressIndicator();
        this.updateDayCards();
    }
    
    createDarkModeToggle() {
        const toggle = document.createElement('div');
        toggle.className = 'dark-mode-toggle';
        toggle.innerHTML = '<span class="icon">🌙</span>';
        toggle.setAttribute('aria-label', 'Toggle dark mode');
        document.body.appendChild(toggle);
    }
    
    createGamificationPanel() {
        const panel = document.createElement('div');
        panel.className = 'gamification-panel';
        panel.innerHTML = `
            <div class="level">Level ${this.gamification.getLevel()}</div>
            <div class="points">${this.gamification.getPoints()} points</div>
            <div class="streak">${this.gamification.getStreak()} day streak</div>
        `;
        document.body.appendChild(panel);
    }
    
    createProgressIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'progress-saved';
        indicator.textContent = 'Progress saved!';
        document.body.appendChild(indicator);
    }
    
    updateDayCards() {
        const dayCards = document.querySelectorAll('.day-card');
        dayCards.forEach((card, index) => {
            const dayNumber = index + 1;
            if (this.userProgress.completedDays.includes(dayNumber)) {
                card.classList.add('completed');
            }
            
            // Add animation class
            card.classList.add('animate-on-scroll');
        });
    }
    
    trackDayInteraction(button) {
        const dayCard = button.closest('.day-card');
        const dayNumber = parseInt(dayCard.dataset.day);
        
        if (!this.userProgress.completedDays.includes(dayNumber)) {
            this.userProgress.completedDays.push(dayNumber);
            this.saveProgress();
            this.updateGamification(dayNumber);
            this.showProgressSaved();
        }
    }
    
    updateGamification(dayNumber) {
        const newAchievements = this.gamification.checkAchievements(dayNumber);
        if (newAchievements.length > 0) {
            newAchievements.forEach(achievement => {
                this.showAchievement(achievement);
            });
        }
        
        this.updateGamificationPanel();
    }
    
    showAchievement(achievement) {
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.innerHTML = `
            <div class="icon">${achievement.icon}</div>
            <div class="text">
                <h4>${achievement.name}</h4>
                <p>${achievement.description}</p>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }
    
    updateGamificationPanel() {
        const panel = document.querySelector('.gamification-panel');
        if (panel) {
            panel.innerHTML = `
                <div class="level">Level ${this.gamification.getLevel()}</div>
                <div class="points">${this.gamification.getPoints()} points</div>
                <div class="streak">${this.gamification.getStreak()} day streak</div>
            `;
        }
    }
    
    showProgressSaved() {
        const indicator = document.querySelector('.progress-saved');
        if (indicator) {
            indicator.classList.add('show');
            setTimeout(() => {
                indicator.classList.remove('show');
            }, 2000);
        }
    }
    
    loadProgress() {
        const saved = localStorage.getItem('tcdynamics-progress');
        return saved ? JSON.parse(saved) : {
            completedDays: [1], // Day 1 is completed by default
            totalPoints: 10,
            streak: 1,
            achievements: []
        };
    }
    
    saveProgress() {
        localStorage.setItem('tcdynamics-progress', JSON.stringify(this.userProgress));
    }
    
    loadAchievements() {
        return [
            {
                id: 'first_day',
                name: 'Getting Started',
                description: 'Completed your first day!',
                icon: '🎉',
                condition: (day) => day === 1,
                points: 10
            },
            {
                id: 'week_one',
                name: 'Week Warrior',
                description: 'Completed 7 days!',
                icon: '🏆',
                condition: (day) => day === 7,
                points: 50
            },
            {
                id: 'two_weeks',
                name: 'Halfway Hero',
                description: 'Completed 15 days!',
                icon: '⭐',
                condition: (day) => day === 15,
                points: 100
            },
            {
                id: 'month_complete',
                name: 'Python Master',
                description: 'Completed all 30 days!',
                icon: '👑',
                condition: (day) => day === 30,
                points: 500
            }
        ];
    }
    
    startProgressTracking() {
        // Track time spent on site
        this.startTime = Date.now();
        
        // Update progress every minute
        setInterval(() => {
            this.updateProgressStats();
        }, 60000);
    }
    
    updateProgressStats() {
        const timeSpent = Date.now() - this.startTime;
        this.userProgress.timeSpent = (this.userProgress.timeSpent || 0) + timeSpent;
        this.saveProgress();
    }
    
    setupAccessibility() {
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                document.body.classList.add('keyboard-navigation');
            }
        });
        
        document.addEventListener('mousedown', () => {
            document.body.classList.remove('keyboard-navigation');
        });
        
        // Screen reader announcements
        this.announceToScreenReader = (message) => {
            const announcement = document.createElement('div');
            announcement.setAttribute('aria-live', 'polite');
            announcement.setAttribute('aria-atomic', 'true');
            announcement.className = 'sr-only';
            announcement.textContent = message;
            document.body.appendChild(announcement);
            
            setTimeout(() => announcement.remove(), 1000);
        };
    }
}

// Gamification Engine
class GamificationEngine {
    constructor() {
        this.points = 0;
        this.level = 1;
        this.streak = 1;
        this.achievements = [];
    }
    
    checkAchievements(dayNumber) {
        const newAchievements = [];
        
        // Check for new achievements
        if (dayNumber === 1 && !this.achievements.includes('first_day')) {
            newAchievements.push({
                name: 'Getting Started',
                description: 'Completed your first day!',
                icon: '🎉'
            });
            this.achievements.push('first_day');
            this.points += 10;
        }
        
        if (dayNumber === 7 && !this.achievements.includes('week_one')) {
            newAchievements.push({
                name: 'Week Warrior',
                description: 'Completed 7 days!',
                icon: '🏆'
            });
            this.achievements.push('week_one');
            this.points += 50;
        }
        
        if (dayNumber === 15 && !this.achievements.includes('two_weeks')) {
            newAchievements.push({
                name: 'Halfway Hero',
                description: 'Completed 15 days!',
                icon: '⭐'
            });
            this.achievements.push('two_weeks');
            this.points += 100;
        }
        
        if (dayNumber === 30 && !this.achievements.includes('month_complete')) {
            newAchievements.push({
                name: 'Python Master',
                description: 'Completed all 30 days!',
                icon: '👑'
            });
            this.achievements.push('month_complete');
            this.points += 500;
        }
        
        // Update level based on points
        this.level = Math.floor(this.points / 100) + 1;
        
        return newAchievements;
    }
    
    getLevel() {
        return this.level;
    }
    
    getPoints() {
        return this.points;
    }
    
    getStreak() {
        return this.streak;
    }
}

// Dark Mode Manager
class DarkModeManager {
    constructor() {
        this.isDark = localStorage.getItem('darkMode') === 'true' || 
                     window.matchMedia('(prefers-color-scheme: dark)').matches;
        this.init();
    }
    
    init() {
        if (this.isDark) {
            this.enableDarkMode();
        }
    }
    
    toggle() {
        this.isDark = !this.isDark;
        if (this.isDark) {
            this.enableDarkMode();
        } else {
            this.disableDarkMode();
        }
        localStorage.setItem('darkMode', this.isDark);
    }
    
    enableDarkMode() {
        document.documentElement.setAttribute('data-theme', 'dark');
        const toggle = document.querySelector('.dark-mode-toggle .icon');
        if (toggle) {
            toggle.textContent = '☀️';
        }
    }
    
    disableDarkMode() {
        document.documentElement.removeAttribute('data-theme');
        const toggle = document.querySelector('.dark-mode-toggle .icon');
        if (toggle) {
            toggle.textContent = '🌙';
        }
    }
}

// Progress Tracker
class ProgressTracker {
    constructor() {
        this.progress = this.loadProgress();
    }
    
    loadProgress() {
        return JSON.parse(localStorage.getItem('tcdynamics-progress') || '{}');
    }
    
    saveProgress() {
        localStorage.setItem('tcdynamics-progress', JSON.stringify(this.progress));
    }
    
    markDayComplete(dayNumber) {
        if (!this.progress.completedDays) {
            this.progress.completedDays = [];
        }
        
        if (!this.progress.completedDays.includes(dayNumber)) {
            this.progress.completedDays.push(dayNumber);
            this.saveProgress();
            return true;
        }
        return false;
    }
    
    getCompletedDays() {
        return this.progress.completedDays || [];
    }
    
    getProgressPercentage() {
        const completed = this.getCompletedDays().length;
        return (completed / 30) * 100;
    }
}

// Code Playground
class CodePlayground {
    constructor() {
        this.editor = null;
        this.output = null;
        this.init();
    }
    
    init() {
        this.createPlayground();
        this.setupEditor();
    }
    
    createPlayground() {
        const playground = document.createElement('div');
        playground.className = 'code-playground';
        playground.innerHTML = `
            <h3>Python Code Playground</h3>
            <textarea id="code-editor" class="code-editor" placeholder="Write your Python code here..."></textarea>
            <div class="playground-controls">
                <button id="run-code" class="submit-btn">Run Code</button>
                <button id="clear-code" class="submit-btn">Clear</button>
            </div>
            <div id="code-output" class="code-output"></div>
        `;
        
        // Insert after the first day card
        const firstDayCard = document.querySelector('.day-card');
        if (firstDayCard) {
            firstDayCard.parentNode.insertBefore(playground, firstDayCard.nextSibling);
        }
    }
    
    setupEditor() {
        const editor = document.getElementById('code-editor');
        const runButton = document.getElementById('run-code');
        const clearButton = document.getElementById('clear-code');
        const output = document.getElementById('code-output');
        
        if (runButton) {
            runButton.addEventListener('click', () => this.runCode());
        }
        
        if (clearButton) {
            clearButton.addEventListener('click', () => this.clearCode());
        }
        
        // Add keyboard shortcut
        editor.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'Enter') {
                e.preventDefault();
                this.runCode();
            }
        });
    }
    
    async runCode() {
        const editor = document.getElementById('code-editor');
        const output = document.getElementById('code-output');
        const code = editor.value;
        
        if (!code.trim()) {
            output.innerHTML = '<div class="error">Please enter some code to run.</div>';
            return;
        }
        
        output.innerHTML = '<div class="loading">Executing code...</div>';
        
        try {
            // Simulate code execution (in a real implementation, this would call your backend)
            const result = await this.executeCode(code);
            this.displayResult(result);
        } catch (error) {
            output.innerHTML = `<div class="error">Error: ${error.message}</div>`;
        }
    }
    
    async executeCode(code) {
        // Simulate code execution
        return new Promise((resolve) => {
            setTimeout(() => {
                // Simple simulation - in reality, this would call your Python execution endpoint
                if (code.includes('print(')) {
                    resolve({
                        success: true,
                        output: 'Hello, World!\nCode executed successfully!',
                        executionTime: 0.1
                    });
                } else {
                    resolve({
                        success: true,
                        output: 'Code executed successfully!',
                        executionTime: 0.05
                    });
                }
            }, 1000);
        });
    }
    
    displayResult(result) {
        const output = document.getElementById('code-output');
        
        if (result.success) {
            output.innerHTML = `
                <div class="success">
                    <h4>Output:</h4>
                    <pre>${result.output}</pre>
                    <small>Execution time: ${result.executionTime}s</small>
                </div>
            `;
        } else {
            output.innerHTML = `
                <div class="error">
                    <h4>Error:</h4>
                    <pre>${result.error}</pre>
                </div>
            `;
        }
    }
    
    clearCode() {
        const editor = document.getElementById('code-editor');
        const output = document.getElementById('code-output');
        
        if (editor) editor.value = '';
        if (output) output.innerHTML = '';
    }
}

// Realtime Manager
class RealtimeManager {
    constructor() {
        this.ws = null;
        this.connected = false;
        this.init();
    }
    
    init() {
        // In a real implementation, this would connect to your WebSocket server
        // For now, we'll simulate real-time updates
        this.simulateRealtimeUpdates();
    }
    
    simulateRealtimeUpdates() {
        // Simulate real-time progress updates
        setInterval(() => {
            this.broadcastProgressUpdate();
        }, 30000); // Every 30 seconds
    }
    
    broadcastProgressUpdate() {
        // Simulate receiving progress updates from other users
        const updates = [
            { user: 'Alice', action: 'completed day 5', time: Date.now() },
            { user: 'Bob', action: 'earned achievement', time: Date.now() },
            { user: 'Charlie', action: 'reached level 3', time: Date.now() }
        ];
        
        // Randomly show updates
        if (Math.random() < 0.3) {
            const update = updates[Math.floor(Math.random() * updates.length)];
            this.showRealtimeUpdate(update);
        }
    }
    
    showRealtimeUpdate(update) {
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.style.background = 'linear-gradient(135deg, #007bff, #0056b3)';
        notification.innerHTML = `
            <div class="icon">👥</div>
            <div class="text">
                <h4>Community Update</h4>
                <p>${update.user} ${update.action}!</p>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 3000);
    }
}

// Initialize advanced features when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.tcdynamicsAdvanced = new TCDynamicsAdvanced();
});

// Export for potential external use
window.TCDynamicsAdvanced = TCDynamicsAdvanced;
